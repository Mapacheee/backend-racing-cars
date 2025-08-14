import { RaceRoom, RoomStatus, RaceConfiguration } from '../interfaces/racing-stream.interface';
export declare class RoomService {
    private rooms;
    private readonly ADMIN_USERNAME;
    createRoom(adminUsername: string, maxParticipants?: number): RaceRoom;
    joinRoom(roomId: string, userId: string, aiGeneration: number, username: string, socketId: string): RaceRoom | null;
    leaveRoom(roomId: string, userId: string): RaceRoom | null;
    updateSocketId(roomId: string, userId: string, socketId: string): void;
    configureRace(roomId: string, adminUsername: string, raceConfig: RaceConfiguration): RaceRoom | null;
    startRace(roomId: string, adminUsername: string): RaceRoom | null;
    finishRace(roomId: string): RaceRoom | null;
    closeRoom(roomId: string, adminUsername: string): boolean;
    isAdmin(username: string): boolean;
    getRoom(roomId: string): RaceRoom | null;
    getAllRooms(): RaceRoom[];
    getRoomsByStatus(status: RoomStatus): RaceRoom[];
    getParticipantSocketIds(roomId: string): string[];
    private generateRoomId;
    cleanupExpiredRooms(maxAgeHours?: number): number;
    getAdminStats(): {
        totalRooms: number;
        roomsByStatus: Record<RoomStatus, number>;
        totalParticipants: number;
    };
    getAvailableRooms(): RaceRoom[];
    getRoomDetails(roomId: string): RaceRoom | null;
    removeParticipant(roomId: string, userId: string, _isAdminAction?: boolean): RaceRoom | null;
}
