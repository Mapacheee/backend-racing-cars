"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const racing_stream_interface_1 = require("../interfaces/racing-stream.interface");
let RoomService = class RoomService {
    rooms = new Map();
    ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    createRoom(adminUsername, maxParticipants = 10) {
        if (adminUsername !== this.ADMIN_USERNAME) {
            throw new Error('Only the admin can create racing rooms');
        }
        const roomId = this.generateRoomId();
        const room = {
            id: roomId,
            participants: [],
            status: racing_stream_interface_1.RoomStatus.WAITING,
            createdAt: new Date(),
            maxParticipants,
            adminId: this.ADMIN_USERNAME,
        };
        this.rooms.set(roomId, room);
        return room;
    }
    joinRoom(roomId, userId, aiGeneration, username, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.participants.length >= room.maxParticipants) {
            throw new Error('Room is full');
        }
        if (room.status !== racing_stream_interface_1.RoomStatus.WAITING) {
            throw new Error('Cannot join room that is not waiting for players');
        }
        const existingParticipant = room.participants.find((p) => p.userId === userId);
        if (existingParticipant) {
            existingParticipant.socketId = socketId;
            return room;
        }
        const participant = {
            userId,
            username,
            aiGeneration,
            connectedAt: new Date(),
            socketId,
        };
        room.participants.push(participant);
        return room;
    }
    leaveRoom(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        room.participants = room.participants.filter((p) => p.userId !== userId);
        return room;
    }
    updateSocketId(roomId, userId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const participant = room.participants.find((p) => p.userId === userId);
        if (participant) {
            participant.socketId = socketId;
        }
    }
    configureRace(roomId, adminUsername, raceConfig) {
        if (adminUsername !== this.ADMIN_USERNAME) {
            throw new Error('Only the admin can configure races');
        }
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.status !== racing_stream_interface_1.RoomStatus.WAITING) {
            throw new Error('Cannot configure race that is not in waiting state');
        }
        room.raceConfig = raceConfig;
        room.status = racing_stream_interface_1.RoomStatus.PREPARING;
        return room;
    }
    startRace(roomId, adminUsername) {
        if (adminUsername !== this.ADMIN_USERNAME) {
            throw new Error('Only the admin can start races');
        }
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.status !== racing_stream_interface_1.RoomStatus.PREPARING) {
            throw new Error('Room must be in preparing state to start race');
        }
        if (!room.raceConfig) {
            throw new Error('Race configuration is required to start race');
        }
        if (room.participants.length === 0) {
            throw new Error('Cannot start race with no participants');
        }
        room.status = racing_stream_interface_1.RoomStatus.RACING;
        return room;
    }
    finishRace(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.status !== racing_stream_interface_1.RoomStatus.RACING) {
            throw new Error('Cannot finish race that is not currently racing');
        }
        room.status = racing_stream_interface_1.RoomStatus.FINISHED;
        return room;
    }
    closeRoom(roomId, adminUsername) {
        if (adminUsername !== this.ADMIN_USERNAME) {
            throw new Error('Only the admin can close rooms');
        }
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }
        room.status = racing_stream_interface_1.RoomStatus.CLOSED;
        setTimeout(() => {
            this.rooms.delete(roomId);
        }, 5000);
        return true;
    }
    isAdmin(username) {
        return username === this.ADMIN_USERNAME;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId) || null;
    }
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    getRoomsByStatus(status) {
        return Array.from(this.rooms.values()).filter((room) => room.status === status);
    }
    getParticipantSocketIds(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return [];
        return room.participants.filter((p) => p.socketId).map((p) => p.socketId);
    }
    generateRoomId() {
        const min = 1000;
        const max = 9999;
        const roomId = Math.floor(Math.random() * (max - min + 1)) + min;
        const result = roomId.toString();
        if (this.rooms.has(result)) {
            return this.generateRoomId();
        }
        return result;
    }
    cleanupExpiredRooms(maxAgeHours = 24) {
        const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
        let cleanedCount = 0;
        for (const [roomId, room] of this.rooms.entries()) {
            const shouldCleanup = room.createdAt < cutoff &&
                (room.status === racing_stream_interface_1.RoomStatus.FINISHED ||
                    room.status === racing_stream_interface_1.RoomStatus.CLOSED);
            if (shouldCleanup) {
                this.rooms.delete(roomId);
                cleanedCount++;
            }
        }
        return cleanedCount;
    }
    getAdminStats() {
        const rooms = Array.from(this.rooms.values());
        const roomsByStatus = {};
        Object.values(racing_stream_interface_1.RoomStatus).forEach((status) => {
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
    getAvailableRooms() {
        return Array.from(this.rooms.values()).filter((room) => room.status === racing_stream_interface_1.RoomStatus.WAITING &&
            room.participants.length < room.maxParticipants);
    }
    getRoomDetails(roomId) {
        return this.rooms.get(roomId) || null;
    }
    removeParticipant(roomId, userId, _isAdminAction = false) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        const initialCount = room.participants.length;
        room.participants = room.participants.filter((p) => p.userId !== userId);
        return room.participants.length < initialCount ? room : null;
    }
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)()
], RoomService);
//# sourceMappingURL=room.service.js.map