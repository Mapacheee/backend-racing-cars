import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RoomService } from './services/room.service';
import { RacePackageService } from './services/race-package.service';
import {
  CreateRoomDto,
  JoinRoomDto,
  ConfigureRaceDto,
  StartRaceDto,
  PositionUpdateDto,
  RaceEventDto,
  CloseRoomDto,
  RemoveParticipantDto,
} from './dto/racing-stream.dto';
import { RoomStatus } from './interfaces/racing-stream.interface';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { PlayerFromJwt } from '../auth/player/interfaces/player-jwt.interface';
import { AdminTokenPayload } from '../auth/admin/interfaces/admin-token-payload.dto';

// ERROR: adminId (admin name) should not be public exposed
// current behavior: { id: "2309", participants: [], status: "waiting", createdAt: "2025-08-07T21:47:47.564Z", maxParticipants: 10, adminId: "monsalves" }

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/racing-stream',
})
@UseGuards(WsJwtAuthGuard)
export class RaceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @SubscribeMessage('setTrackSeed')
  async handleSetTrackSeed(
    @MessageBody() data: { roomId: string; seed: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const room = this.roomService.getRoom(data.roomId);
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }
      const adminUsername = this.getAdminFromToken(client);
      if (!adminUsername || adminUsername !== room.adminId) {
        client.emit('error', { message: 'Unauthorized: Only admin can set track seed' });
        return;
      }
      const success = this.roomService.updateTrackSeed(data.roomId, data.seed);
      if (success) {
        this.server.to(data.roomId).emit('trackSeedUpdated', { seed: data.seed });
        client.emit('trackSeedSet', { message: 'Track seed updated successfully' });
        this.logger.log(`Track seed updated for room ${data.roomId}`);
      } else {
        client.emit('error', { message: 'Failed to update track seed' });
      }
    } catch (error) {
      client.emit('error', {
        message: 'Failed to set track seed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RaceGateway.name);
  private readonly ADMIN_USERNAME = process.env.ADMIN_USERNAME as string;

  constructor(
    private readonly roomService: RoomService,
    private readonly racePackageService: RacePackageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);

    await this.handleClientDisconnect(client);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() data: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const adminUsername = this.getAdminFromToken(client);

      if (!adminUsername || adminUsername !== data.adminUsername) {
        client.emit('error', {
          message: 'Unauthorized: Only authenticated admin can create rooms',
        });
        return;
      }

      const room = this.roomService.createRoom(
        data.adminUsername,
        data.maxParticipants,
      );

      await client.join(room.id);

      client.emit('roomCreated', {
        room,
        message: 'Room created successfully',
      });

      this.server.emit('roomAvailable', {
        roomId: room.id,
        maxParticipants: room.maxParticipants,
      });

      this.logger.log(`Room ${room.id} created by admin ${data.adminUsername}`);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to create room',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const room = this.roomService.joinRoom(
        data.roomId,
        data.userId,
        data.aiGeneration,
        data.username,
        client.id,
      );

      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      await client.join(data.roomId);

      this.server.to(data.roomId).emit('playerJoined', {
        participant: room.participants.find((p) => p.userId === data.userId),
        room,
      });

      client.emit('roomJoined', { room });

      this.logger.log(`${data.username} joined room ${data.roomId}`);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to join room',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const room = this.roomService.leaveRoom(data.roomId, data.userId);

      await client.leave(data.roomId);

      if (room) {
        this.server.to(data.roomId).emit('playerLeft', {
          userId: data.userId,
          room,
        });
      }

      client.emit('roomLeft', { message: 'Successfully left room' });
    } catch (error) {
      client.emit('error', {
        message: 'Failed to leave room',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('configureRace')
  async handleConfigureRace(
    @MessageBody() data: ConfigureRaceDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const adminUsername = this.getAdminFromToken(client);
      if (!adminUsername || adminUsername !== data.adminUsername) {
        client.emit('error', {
          message: 'Unauthorized: Only authenticated admin can configure races',
        });
        return;
      }

      const isValid = await this.racePackageService.validateRaceConfiguration(
        data.raceConfig,
      );

      if (!isValid) {
        client.emit('error', { message: 'Invalid race configuration' });
        return;
      }

      const room = this.roomService.configureRace(
        data.roomId,
        data.adminUsername,
        data.raceConfig,
      );

      if (!room) {
        client.emit('error', { message: 'Failed to configure race' });
        return;
      }

      const racePackage = await this.racePackageService.buildRacePackage(
        data.raceConfig,
      );

      client.emit('racePackage', racePackage);

      this.server.to(data.roomId).emit('raceConfigured', {
        room,
        config: data.raceConfig,
      });

      this.logger.log(`Race configured for room ${data.roomId} by admin`);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to configure race',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('startRace')
  handleStartRace(
    @MessageBody() data: StartRaceDto,
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const adminUsername = this.getAdminFromToken(client);
      if (!adminUsername || adminUsername !== data.adminUsername) {
        client.emit('error', {
          message: 'Unauthorized: Only authenticated admin can start races',
        });
        return;
      }

      const room = this.roomService.startRace(data.roomId, data.adminUsername);

      if (!room) {
        client.emit('error', { message: 'Failed to start race' });
        return;
      }

      this.server.to(data.roomId).emit('raceStarted', {
        room,
        timestamp: Date.now(),
      });

      this.logger.log(`Race started in room ${data.roomId} by admin`);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to start race',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('positionUpdate')
  handlePositionUpdate(
    @MessageBody() data: PositionUpdateDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const room = this.roomService.getRoom(data.roomId);
    if (!room || room.status !== RoomStatus.RACING) {
      return;
    }

    const isAdmin = this.verifyAdminToken(client);
    if (!isAdmin) {
      return;
    }

    client.to(data.roomId).emit('positionUpdate', data);
  }

  @SubscribeMessage('raceEvent')
  handleRaceEvent(
    @MessageBody() data: RaceEventDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const room = this.roomService.getRoom(data.roomId);
    if (!room || room.status !== RoomStatus.RACING) {
      return;
    }

    const isAdmin = this.verifyAdminToken(client);
    if (!isAdmin) {
      return;
    }

    if (data.event.type === 'race_finish') {
      this.roomService.finishRace(data.roomId);
    }

    this.server.to(data.roomId).emit('raceEvent', data.event);
  }

  @SubscribeMessage('getRoomStatus')
  handleGetRoomStatus(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = this.roomService.getRoom(data.roomId);
    if (room) {
      client.emit('roomStatus', room);
    } else {
      client.emit('error', { message: 'Room not found' });
    }
  }

  @SubscribeMessage('closeRoom')
  handleCloseRoom(
    @MessageBody() data: CloseRoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const adminUsername = this.getAdminFromToken(client);
      if (!adminUsername || adminUsername !== data.adminUsername) {
        client.emit('error', {
          message: 'Unauthorized: Only authenticated admin can close rooms',
        });
        return;
      }

      const success = this.roomService.closeRoom(
        data.roomId,
        data.adminUsername,
      );

      if (success) {
        this.server.to(data.roomId).emit('roomClosed', {
          message: 'Room closed by admin',
        });

        client.emit('roomClosedSuccess', {
          roomId: data.roomId,
          message: 'Room closed successfully',
        });

        this.logger.log(`Room ${data.roomId} closed by admin`);
      } else {
        client.emit('error', { message: 'Failed to close room' });
      }
    } catch (error) {
      client.emit('error', {
        message: 'Failed to close room',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('removeParticipant')
  handleRemoveParticipant(
    @MessageBody() data: RemoveParticipantDto,
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const adminUsername = this.getAdminFromToken(client);
      if (!adminUsername || adminUsername !== data.adminUsername) {
        client.emit('error', {
          message:
            'Unauthorized: Only authenticated admin can remove participants',
        });
        return;
      }

      const room = this.roomService.removeParticipant(
        data.roomId,
        data.userId,
        true,
      );

      if (room) {
        this.server.to(data.roomId).emit('participantRemoved', {
          userId: data.userId,
          message: 'You have been removed from the room by admin',
        });

        client.emit('participantRemovedSuccess', {
          roomId: data.roomId,
          userId: data.userId,
          room,
        });

        this.logger.log(
          `Participant ${data.userId} removed from room ${data.roomId} by admin`,
        );
      } else {
        client.emit('error', { message: 'Failed to remove participant' });
      }
    } catch (error) {
      client.emit('error', {
        message: 'Failed to remove participant',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async handleClientDisconnect(client: Socket): Promise<void> {
    const rooms = this.roomService.getAllRooms();

    for (const room of rooms) {
      const participant = room.participants.find(
        (p) => p.socketId === client.id,
      );

      if (participant) {
        await this.handleLeaveRoom(
          { roomId: room.id, userId: participant.userId },
          client,
        );
      }
    }
  }

  private getUserFromSocket(client: Socket): PlayerFromJwt | null {
    const user = client.data?.user;
    return user as PlayerFromJwt | null;
  }

  private getUserIdFromSocket(client: Socket): string {
    return (client.handshake.auth?.userId as string) || '';
  }

  /**
   * Verify if the client is an authenticated admin
   */
  private verifyAdminToken(client: Socket): boolean {
    try {
      const token = client.handshake.auth?.token as string;
      if (!token) {
        return false;
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET') as string;
      const payload = this.jwtService.verify<AdminTokenPayload>(token, {
        secret: jwtSecret,
      });
      return payload.sub === this.ADMIN_USERNAME;
    } catch {
      return false;
    }
  }

  /**
   * Get admin username from verified token
   */
  private getAdminFromToken(client: Socket): string | null {
    try {
      const token = client.handshake.auth?.token as string;
      if (!token) {
        return null;
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify<AdminTokenPayload>(token, {
        secret: jwtSecret,
      });
      if (payload?.sub === this.ADMIN_USERNAME) {
        return this.ADMIN_USERNAME;
      }
      return null;
    } catch {
      return null;
    }
  }
}
