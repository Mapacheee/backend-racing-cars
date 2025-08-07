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

  /**
   * Create a new room - ONLY the admin can create rooms
   * @param adminUsername - Must match the admin username from .env
   * @param maxParticipants - Maximum number of players that can join
   */
  createRoom(adminUsername: string, maxParticipants = 10): RaceRoom {
    // Verify this is the admin creating the room
    if (adminUsername !== this.ADMIN_USERNAME) {
      throw new Error('Only the admin can create racing rooms');
    }

    const roomId = this.generateRoomId();

    const room: RaceRoom = {
      id: roomId,
      participants: [], // Admin doesn't participate as a player
      status: RoomStatus.WAITING,
      createdAt: new Date(),
      maxParticipants,
      adminId: this.ADMIN_USERNAME, // Track who created this room
    };

    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Players join rooms created by the admin
   * @param roomId - The room ID to join
   * @param userId - The player's user ID
   * @param username - The player's username
   * @param socketId - The player's socket ID for real-time communication
   */
  joinRoom(
    roomId: string,
    userId: string,
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

    // Check if player is already in room
    const existingParticipant = room.participants.find(
      (p) => p.userId === userId,
    );
    if (existingParticipant) {
      // Update socket ID for reconnection
      existingParticipant.socketId = socketId;
      return room;
    }

    const participant: RoomParticipant = {
      userId,
      username,
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

    // If no participants left, delete room
    if (room.participants.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

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

  /**
   * Configure race settings - ONLY the admin can configure races
   * @param roomId - The room ID to configure
   * @param adminUsername - Must match the admin username from .env
   * @param raceConfig - The race configuration settings
   */
  configureRace(
    roomId: string,
    adminUsername: string,
    raceConfig: RaceConfiguration,
  ): RaceRoom | null {
    // Verify this is the admin configuring the race
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

  /**
   * Start the race - ONLY the admin can start races
   * @param roomId - The room ID to start the race in
   * @param adminUsername - Must match the admin username from .env
   */
  startRace(roomId: string, adminUsername: string): RaceRoom | null {
    // Verify this is the admin starting the race
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

  /**
   * Finish the race - can be called by admin or automatically by the system
   * @param roomId - The room ID to finish the race in
   */
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

  /**
   * Close a room - ONLY the admin can close rooms
   * @param roomId - The room ID to close
   * @param adminUsername - Must match the admin username from .env
   */
  closeRoom(roomId: string, adminUsername: string): boolean {
    // Verify this is the admin closing the room
    if (adminUsername !== this.ADMIN_USERNAME) {
      throw new Error('Only the admin can close rooms');
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    room.status = RoomStatus.CLOSED;

    // Remove room after a short delay to allow clients to receive the close message
    setTimeout(() => {
      this.rooms.delete(roomId);
    }, 5000);

    return true;
  }

  /**
   * Check if a username is the admin
   * @param username - Username to check
   */
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
    // Generate a 4-digit room code (1000-9999)
    const min = 1000;
    const max = 9999;
    const roomId = Math.floor(Math.random() * (max - min + 1)) + min;
    const result = roomId.toString();

    // Ensure uniqueness
    if (this.rooms.has(result)) {
      return this.generateRoomId();
    }

    return result;
  }

  /**
   * Cleanup expired or finished rooms
   * Can be called by admin or as a background task
   * @param maxAgeHours - Maximum age in hours before cleanup
   */
  cleanupExpiredRooms(maxAgeHours = 24): number {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      const shouldCleanup =
        room.createdAt < cutoff &&
        (room.status === RoomStatus.FINISHED ||
          room.status === RoomStatus.CLOSED ||
          room.participants.length === 0);

      if (shouldCleanup) {
        this.rooms.delete(roomId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get admin-specific room statistics
   */
  getAdminStats(): {
    totalRooms: number;
    roomsByStatus: Record<RoomStatus, number>;
    totalParticipants: number;
  } {
    const rooms = Array.from(this.rooms.values());
    const roomsByStatus = {} as Record<RoomStatus, number>;

    // Initialize counts
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

  /**
   * Get available rooms that players can join
   */
  getAvailableRooms(): RaceRoom[] {
    return Array.from(this.rooms.values()).filter(
      (room) =>
        room.status === RoomStatus.WAITING &&
        room.participants.length < room.maxParticipants,
    );
  }

  /**
   * Get room with participant details (for admin view)
   */
  getRoomDetails(roomId: string): RaceRoom | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Remove a participant from a room (admin action or disconnect)
   * @param roomId - The room ID
   * @param userId - The user ID to remove
   * @param _isAdminAction - Whether this is an admin-initiated removal (for future use)
   */
  removeParticipant(
    roomId: string,
    userId: string,
    _isAdminAction = false,
  ): RaceRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const initialCount = room.participants.length;
    room.participants = room.participants.filter((p) => p.userId !== userId);

    // If no participants left and room is not actively racing, mark as closed
    if (room.participants.length === 0 && room.status !== RoomStatus.RACING) {
      room.status = RoomStatus.CLOSED;
    }

    // Return room only if a participant was actually removed
    return room.participants.length < initialCount ? room : null;
  }
}
