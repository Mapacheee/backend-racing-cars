import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { RacePackageService } from './services/race-package.service';
import { RoomService } from './services/room.service';
import { RacePackage, RaceRoom } from './interfaces/racing-stream.interface';
import {
  RaceConfigurationDto,
  ValidationResponseDto,
  RacePackageResponseDto,
  RoomResponseDto,
  CreateRoomDto,
  CloseRoomDto,
  AdminStatsResponseDto,
} from './dto/racing-stream.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('racing-stream')
@UseGuards(JwtAuthGuard)
export class RacingController {
  constructor(
    private readonly racePackageService: RacePackageService,
    private readonly roomService: RoomService,
  ) {}

  @Post('admin/room')
  createRoom(@Body() createRoomDto: CreateRoomDto): RoomResponseDto {
    const room = this.roomService.createRoom(
      createRoomDto.adminUsername,
      createRoomDto.maxParticipants,
    );
    return this.mapRoomToDto(room);
  }

  @Post('admin/room/:id/close')
  closeRoom(
    @Param('id') roomId: string,
    @Body() closeRoomDto: CloseRoomDto,
  ): { success: boolean } {
    const success = this.roomService.closeRoom(
      roomId,
      closeRoomDto.adminUsername,
    );
    return { success };
  }

  @Get('admin/stats')
  getAdminStats(): AdminStatsResponseDto {
    return this.roomService.getAdminStats();
  }

  @Get('rooms/available')
  getAvailableRooms(): RoomResponseDto[] {
    const rooms = this.roomService.getAvailableRooms();
    return rooms.map((room) => this.mapRoomToDto(room));
  }

  @Post('package')
  async getRacePackage(
    @Body() raceConfig: RaceConfigurationDto,
  ): Promise<RacePackageResponseDto> {
    const racePackage =
      await this.racePackageService.buildRacePackage(raceConfig);
    return this.mapRacePackageToDto(racePackage);
  }

  @Post('package/validate')
  async validateRaceConfiguration(
    @Body() raceConfig: RaceConfigurationDto,
  ): Promise<ValidationResponseDto> {
    const valid =
      await this.racePackageService.validateRaceConfiguration(raceConfig);
    return { valid };
  }

  @Get('rooms')
  getAllRooms(): RoomResponseDto[] {
    const rooms = this.roomService.getAllRooms();
    return rooms.map((room) => this.mapRoomToDto(room));
  }

  @Get('rooms/:id')
  getRoom(@Param('id') id: string): RoomResponseDto {
    const room = this.roomService.getRoom(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return this.mapRoomToDto(room);
  }

  private mapRacePackageToDto(
    racePackage: RacePackage,
  ): RacePackageResponseDto {
    return {
      trackData: {
        id: racePackage.trackData.id,
        name: racePackage.trackData.name,
        layout: racePackage.trackData.layout.map((point) => ({
          x: point.x,
          y: point.y,
          z: point.z,
          type: point.type,
        })),
        metadata: {
          length: racePackage.trackData.metadata.length,
          width: racePackage.trackData.metadata.width,
          checkpoints: racePackage.trackData.metadata.checkpoints,
          description: racePackage.trackData.metadata.description,
        },
      },
      aiModels: racePackage.aiModels.map((model) => ({
        id: model.id,
        name: model.name,
        generation: model.generation,
        weights: model.weights,
        architecture: {
          inputs: model.architecture.inputs,
          hiddenLayers: model.architecture.hiddenLayers,
          outputs: model.architecture.outputs,
        },
      })),
      raceConfig: {
        trackId: racePackage.raceConfig.trackId,
        aiModelIds: racePackage.raceConfig.aiModelIds,
        raceSettings: {
          timeLimit: racePackage.raceConfig.raceSettings.timeLimit,
        },
      },
    };
  }

  private mapRoomToDto(room: RaceRoom): RoomResponseDto {
    return {
      id: room.id,
      adminId: room.adminId,
      participants: room.participants.map((participant) => ({
        userId: participant.userId,
        username: participant.username,
        connectedAt: participant.connectedAt,
        socketId: participant.socketId,
      })),
      status: room.status.toString(),
      raceConfig: room.raceConfig
        ? {
            trackId: room.raceConfig.trackId,
            aiModelIds: room.raceConfig.aiModelIds,
            raceSettings: {
              timeLimit: room.raceConfig.raceSettings.timeLimit,
            },
          }
        : undefined,
      createdAt: room.createdAt,
      maxParticipants: room.maxParticipants,
    };
  }
}
