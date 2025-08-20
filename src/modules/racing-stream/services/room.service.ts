import { Injectable } from '@nestjs/common';
import {
  RaceRoom,
  RoomParticipant,
  RoomStatus,
  RaceConfiguration,
} from '../interfaces/racing-stream.interface';

@Injectable()
export class RoomService {
  private rooms = new Map<string, RaceRoom>();
  private readonly ADMIN_USERNAME = process.env.ADMIN_USERNAME;

  createRoom(adminUsername: string, maxParticipants = 10): RaceRoom {
    if (adminUsername !== this.ADMIN_USERNAME) {
      throw new Error('Only the admin can create racing rooms');
    }

    const roomId = this.generateRoomId();

    const room: RaceRoom = {
      id: roomId,
      participants: [],
      status: RoomStatus.WAITING,
      createdAt: new Date(),
      maxParticipants,
      adminId: this.ADMIN_USERNAME,
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(
    roomId: string,
    userId: string,
    aiGeneration: number,
    username: string,
    socketId: string,
  ): RaceRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.participants.length >= room.maxParticipants) {
      throw new Error('Room is full');
    }

    if (room.status !== RoomStatus.WAITING) {
      throw new Error('Cannot join room that is not waiting for players');
    }

    const existingParticipant = room.participants.find(
      (p) => p.userId === userId,
    );
    if (existingParticipant) {
      existingParticipant.socketId = socketId;
      return room;
    }

    const participant: RoomParticipant = {
      userId,
      username,
      aiGeneration,
      connectedAt: new Date(),
      socketId,
    };

    room.participants.push(participant);
    return room;
  }

  leaveRoom(roomId: string, userId: string): RaceRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.participants = room.participants.filter((p) => p.userId !== userId);

    return room;
  }

  updateSocketId(roomId: string, userId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find((p) => p.userId === userId);
    if (participant) {
      participant.socketId = socketId;
    }
  }

  configureRace(
    roomId: string,
    adminUsername: string,
    raceConfig: RaceConfiguration,
  ): RaceRoom | null {
    if (adminUsername !== this.ADMIN_USERNAME) {
      throw new Error('Only the admin can configure races');
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== RoomStatus.WAITING) {
      throw new Error('Cannot configure race that is not in waiting state');
    }

    room.raceConfig = raceConfig;
    room.status = RoomStatus.PREPARING;
    return room;
  }

  startRace(roomId: string, adminUsername: string): RaceRoom | null {
    if (adminUsername !== this.ADMIN_USERNAME) {
      throw new Error('Only the admin can start races');
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== RoomStatus.PREPARING) {
      throw new Error('Room must be in preparing state to start race');
    }

    if (!room.raceConfig) {
      throw new Error('Race configuration is required to start race');
    }

    if (room.participants.length === 0) {
      throw new Error('Cannot start race with no participants');
    }

    room.status = RoomStatus.RACING;
    return room;
  }

  finishRace(roomId: string): RaceRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== RoomStatus.RACING) {
      throw new Error('Cannot finish race that is not currently racing');
    }

    room.status = RoomStatus.FINISHED;
    return room;
  }

  closeRoom(roomId: string, adminUsername: string): boolean {
    if (adminUsername !== this.ADMIN_USERNAME) {
      throw new Error('Only the admin can close rooms');
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    room.status = RoomStatus.CLOSED;

    setTimeout(() => {
      this.rooms.delete(roomId);
    }, 5000);

    return true;
  }

  isAdmin(username: string): boolean {
    return username === this.ADMIN_USERNAME;
  }

  getRoom(roomId: string): RaceRoom | null {
    return this.rooms.get(roomId) || null;
  }

  getAllRooms(): RaceRoom[] {
    return Array.from(this.rooms.values());
  }

  getRoomsByStatus(status: RoomStatus): RaceRoom[] {
    return Array.from(this.rooms.values()).filter(
      (room) => room.status === status,
    );
  }

  getParticipantSocketIds(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.participants.filter((p) => p.socketId).map((p) => p.socketId);
  }

  private generateRoomId(): string {
    const min = 1000;
    const max = 9999;
    const roomId = Math.floor(Math.random() * (max - min + 1)) + min;
    const result = roomId.toString();

    if (this.rooms.has(result)) {
      return this.generateRoomId();
    }

    return result;
  }

  cleanupExpiredRooms(maxAgeHours = 24): number {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      const shouldCleanup =
        room.createdAt < cutoff &&
        (room.status === RoomStatus.FINISHED ||
          room.status === RoomStatus.CLOSED);

      if (shouldCleanup) {
        this.rooms.delete(roomId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  getAdminStats(): {
    totalRooms: number;
    roomsByStatus: Record<RoomStatus, number>;
    totalParticipants: number;
  } {
    const rooms = Array.from(this.rooms.values());
    const roomsByStatus = {} as Record<RoomStatus, number>;

    Object.values(RoomStatus).forEach((status) => {
      roomsByStatus[status] = 0;
    });

    let totalParticipants = 0;

    rooms.forEach((room) => {
      roomsByStatus[room.status]++;
      totalParticipants += room.participants.length;
    });

    return {
      totalRooms: rooms.length,
      roomsByStatus,
      totalParticipants,
    };
  }

  getAvailableRooms(): RaceRoom[] {
    return Array.from(this.rooms.values()).filter(
      (room) =>
        room.status === RoomStatus.WAITING &&
        room.participants.length < room.maxParticipants,
    );
  }

  getRoomDetails(roomId: string): RaceRoom | null {
    return this.rooms.get(roomId) || null;
  }

  removeParticipant(
    roomId: string,
    userId: string,
    _isAdminAction = false,
  ): RaceRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const initialCount = room.participants.length;
    room.participants = room.participants.filter((p) => p.userId !== userId);

    return room.participants.length < initialCount ? room : null;
  }

  updateTrackSeed(roomId: string, seed: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.trackSeed = seed;
    return true;
  }
}
