"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RaceGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const room_service_1 = require("./services/room.service");
const race_package_service_1 = require("./services/race-package.service");
const racing_stream_dto_1 = require("./dto/racing-stream.dto");
const racing_stream_interface_1 = require("./interfaces/racing-stream.interface");
const ws_jwt_auth_guard_1 = require("../auth/guards/ws-jwt-auth.guard");
let RaceGateway = RaceGateway_1 = class RaceGateway {
    roomService;
    racePackageService;
    jwtService;
    configService;
    server;
    logger = new common_1.Logger(RaceGateway_1.name);
    ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    constructor(roomService, racePackageService, jwtService, configService) {
        this.roomService = roomService;
        this.racePackageService = racePackageService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        await this.handleClientDisconnect(client);
    }
    async handleCreateRoom(data, client) {
        try {
            const adminUsername = this.getAdminFromToken(client);
            if (!adminUsername || adminUsername !== data.adminUsername) {
                client.emit('error', {
                    message: 'Unauthorized: Only authenticated admin can create rooms',
                });
                return;
            }
            const room = this.roomService.createRoom(data.adminUsername, data.maxParticipants);
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
        }
        catch (error) {
            client.emit('error', {
                message: 'Failed to create room',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async handleJoinRoom(data, client) {
        try {
            const room = this.roomService.joinRoom(data.roomId, data.userId, data.aiGeneration, data.username, client.id);
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
        }
        catch (error) {
            client.emit('error', {
                message: 'Failed to join room',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async handleLeaveRoom(data, client) {
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
        }
        catch (error) {
            client.emit('error', {
                message: 'Failed to leave room',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async handleConfigureRace(data, client) {
        try {
            const adminUsername = this.getAdminFromToken(client);
            if (!adminUsername || adminUsername !== data.adminUsername) {
                client.emit('error', {
                    message: 'Unauthorized: Only authenticated admin can configure races',
                });
                return;
            }
            const isValid = await this.racePackageService.validateRaceConfiguration(data.raceConfig);
            if (!isValid) {
                client.emit('error', { message: 'Invalid race configuration' });
                return;
            }
            const room = this.roomService.configureRace(data.roomId, data.adminUsername, data.raceConfig);
            if (!room) {
                client.emit('error', { message: 'Failed to configure race' });
                return;
            }
            const racePackage = await this.racePackageService.buildRacePackage(data.raceConfig);
            client.emit('racePackage', racePackage);
            this.server.to(data.roomId).emit('raceConfigured', {
                room,
                config: data.raceConfig,
            });
            this.logger.log(`Race configured for room ${data.roomId} by admin`);
        }
        catch (error) {
            client.emit('error', {
                message: 'Failed to configure race',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    handleStartRace(data, client) {
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
        }
        catch (error) {
            client.emit('error', {
                message: 'Failed to start race',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    handlePositionUpdate(data, client) {
        const room = this.roomService.getRoom(data.roomId);
        if (!room || room.status !== racing_stream_interface_1.RoomStatus.RACING) {
            return;
        }
        const isAdmin = this.verifyAdminToken(client);
        if (!isAdmin) {
            return;
        }
        client.to(data.roomId).emit('positionUpdate', data);
    }
    handleRaceEvent(data, client) {
        const room = this.roomService.getRoom(data.roomId);
        if (!room || room.status !== racing_stream_interface_1.RoomStatus.RACING) {
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
    handleGetRoomStatus(data, client) {
        const room = this.roomService.getRoom(data.roomId);
        if (room) {
            client.emit('roomStatus', room);
        }
        else {
            client.emit('error', { message: 'Room not found' });
        }
    }
    handleCloseRoom(data, client) {
        try {
            const adminUsername = this.getAdminFromToken(client);
            if (!adminUsername || adminUsername !== data.adminUsername) {
                client.emit('error', {
                    message: 'Unauthorized: Only authenticated admin can close rooms',
                });
                return;
            }
            const success = this.roomService.closeRoom(data.roomId, data.adminUsername);
            if (success) {
                this.server.to(data.roomId).emit('roomClosed', {
                    message: 'Room closed by admin',
                });
                client.emit('roomClosedSuccess', {
                    roomId: data.roomId,
                    message: 'Room closed successfully',
                });
                this.logger.log(`Room ${data.roomId} closed by admin`);
            }
            else {
                client.emit('error', { message: 'Failed to close room' });
            }
        }
        catch (error) {
            client.emit('error', {
                message: 'Failed to close room',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    handleRemoveParticipant(data, client) {
        try {
            const adminUsername = this.getAdminFromToken(client);
            if (!adminUsername || adminUsername !== data.adminUsername) {
                client.emit('error', {
                    message: 'Unauthorized: Only authenticated admin can remove participants',
                });
                return;
            }
            const room = this.roomService.removeParticipant(data.roomId, data.userId, true);
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
                this.logger.log(`Participant ${data.userId} removed from room ${data.roomId} by admin`);
            }
            else {
                client.emit('error', { message: 'Failed to remove participant' });
            }
        }
        catch (error) {
            client.emit('error', {
                message: 'Failed to remove participant',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async handleClientDisconnect(client) {
        const rooms = this.roomService.getAllRooms();
        for (const room of rooms) {
            const participant = room.participants.find((p) => p.socketId === client.id);
            if (participant) {
                await this.handleLeaveRoom({ roomId: room.id, userId: participant.userId }, client);
            }
        }
    }
    getUserFromSocket(client) {
        const user = client.data?.user;
        return user;
    }
    getUserIdFromSocket(client) {
        return client.handshake.auth?.userId || '';
    }
    verifyAdminToken(client) {
        try {
            const token = client.handshake.auth?.token;
            if (!token) {
                return false;
            }
            const jwtSecret = this.configService.get('JWT_SECRET');
            const payload = this.jwtService.verify(token, {
                secret: jwtSecret,
            });
            return payload.sub === this.ADMIN_USERNAME;
        }
        catch {
            return false;
        }
    }
    getAdminFromToken(client) {
        try {
            const token = client.handshake.auth?.token;
            if (!token) {
                return null;
            }
            const jwtSecret = this.configService.get('JWT_SECRET');
            const payload = this.jwtService.verify(token, {
                secret: jwtSecret,
            });
            if (payload?.sub === this.ADMIN_USERNAME) {
                return this.ADMIN_USERNAME;
            }
            return null;
        }
        catch {
            return null;
        }
    }
};
exports.RaceGateway = RaceGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RaceGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('createRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.CreateRoomDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RaceGateway.prototype, "handleCreateRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.JoinRoomDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RaceGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RaceGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('configureRace'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.ConfigureRaceDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RaceGateway.prototype, "handleConfigureRace", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('startRace'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.StartRaceDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RaceGateway.prototype, "handleStartRace", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('positionUpdate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.PositionUpdateDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RaceGateway.prototype, "handlePositionUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('raceEvent'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.RaceEventDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RaceGateway.prototype, "handleRaceEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getRoomStatus'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RaceGateway.prototype, "handleGetRoomStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('closeRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.CloseRoomDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RaceGateway.prototype, "handleCloseRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('removeParticipant'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.RemoveParticipantDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RaceGateway.prototype, "handleRemoveParticipant", null);
exports.RaceGateway = RaceGateway = RaceGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/racing-stream',
    }),
    (0, common_1.UseGuards)(ws_jwt_auth_guard_1.WsJwtAuthGuard),
    __metadata("design:paramtypes", [room_service_1.RoomService,
        race_package_service_1.RacePackageService,
        jwt_1.JwtService,
        config_1.ConfigService])
], RaceGateway);
//# sourceMappingURL=racing-stream.gateway.js.map