import { RacePackageService } from './services/race-package.service';
import { RoomService } from './services/room.service';
import { RaceConfigurationDto, ValidationResponseDto, RacePackageResponseDto, RoomResponseDto, CreateRoomDto, CloseRoomDto, AdminStatsResponseDto } from './dto/racing-stream.dto';
export declare class RacingController {
    private readonly racePackageService;
    private readonly roomService;
    constructor(racePackageService: RacePackageService, roomService: RoomService);
    createRoom(createRoomDto: CreateRoomDto): RoomResponseDto;
    closeRoom(roomId: string, closeRoomDto: CloseRoomDto): {
        success: boolean;
    };
    getAdminStats(): AdminStatsResponseDto;
    getAvailableRooms(): RoomResponseDto[];
    getRacePackage(raceConfig: RaceConfigurationDto): Promise<RacePackageResponseDto>;
    validateRaceConfiguration(raceConfig: RaceConfigurationDto): Promise<ValidationResponseDto>;
    getAllRooms(): RoomResponseDto[];
    getRoom(id: string): RoomResponseDto;
    private mapRacePackageToDto;
    private mapRoomToDto;
}
