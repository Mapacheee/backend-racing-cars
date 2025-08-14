import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RoomService } from './services/room.service';
import { RacePackageService } from './services/race-package.service';
import { CreateRoomDto, JoinRoomDto, ConfigureRaceDto, StartRaceDto, PositionUpdateDto, RaceEventDto, CloseRoomDto, RemoveParticipantDto } from './dto/racing-stream.dto';
export declare class RaceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly roomService;
    private readonly racePackageService;
    private readonly jwtService;
    private readonly configService;
    server: Server;
    private readonly logger;
    private readonly ADMIN_USERNAME;
    constructor(roomService: RoomService, racePackageService: RacePackageService, jwtService: JwtService, configService: ConfigService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): Promise<void>;
    handleCreateRoom(data: CreateRoomDto, client: Socket): Promise<void>;
    handleJoinRoom(data: JoinRoomDto, client: Socket): Promise<void>;
    handleLeaveRoom(data: {
        roomId: string;
        userId: string;
    }, client: Socket): Promise<void>;
    handleConfigureRace(data: ConfigureRaceDto, client: Socket): Promise<void>;
    handleStartRace(data: StartRaceDto, client: Socket): void;
    handlePositionUpdate(data: PositionUpdateDto, client: Socket): void;
    handleRaceEvent(data: RaceEventDto, client: Socket): void;
    handleGetRoomStatus(data: {
        roomId: string;
    }, client: Socket): void;
    handleCloseRoom(data: CloseRoomDto, client: Socket): void;
    handleRemoveParticipant(data: RemoveParticipantDto, client: Socket): void;
    private handleClientDisconnect;
    private getUserFromSocket;
    private getUserIdFromSocket;
    private verifyAdminToken;
    private getAdminFromToken;
}
