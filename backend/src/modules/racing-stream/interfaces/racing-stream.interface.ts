// Core room and race interfaces
export interface RaceRoom {
  id: string;
  participants: RoomParticipant[];
  status: RoomStatus;
  raceConfig?: RaceConfiguration;
  createdAt: Date;
  maxParticipants: number;
  adminId: string; // Only admin can create rooms
}

export interface RoomParticipant {
  userId: string;
  username: string;
  connectedAt: Date;
  socketId: string;
}

export interface RaceConfiguration {
  trackId: string;
  aiModelIds: string[];
  raceSettings: RaceSettings;
}

export interface RaceSettings {
  timeLimit: number;
}

export interface RacePackage {
  trackData: TrackData;
  aiModels: AIModelData[];
  raceConfig: RaceConfiguration;
}

export interface TrackData {
  id: string;
  name: string;
  layout: TrackPoint[];
  metadata: TrackMetadata;
}

export interface TrackPoint {
  x: number;
  y: number;
  z: number;
  type: 'track' | 'checkpoint' | 'start' | 'finish';
}

export interface TrackMetadata {
  length: number;
  width: number;
  checkpoints: number;
  description?: string;
}

export interface AIModelData {
  id: string;
  name: string;
  generation: number;
  weights: number[][];
  architecture: AIArchitecture;
}

export interface AIArchitecture {
  inputs: number;
  hiddenLayers: number[];
  outputs: number;
}

export interface CarPosition {
  carId: string;
  position: Position3D;
  velocity: Velocity;
  racePosition: number;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
  rotation: number;
}

export interface Velocity {
  x: number;
  y: number;
  speed: number;
}

export interface RaceEvent {
  type: RaceEventType;
  timestamp: number;
  carId?: string;
  data?: RaceEventData;
}

export interface RaceEventData {
  lapTime?: number;
  position?: number;
  checkpoint?: number;
  collision?: CollisionData;
  [key: string]: any;
}

export interface CollisionData {
  collisionType: 'wall' | 'car' | 'obstacle';
  severity: 'light' | 'medium' | 'heavy';
  otherCarId?: string;
}

// WebSocket message interfaces
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: number;
}

export interface RoomMessage extends WebSocketMessage {
  roomId: string;
}

export interface PositionMessage extends RoomMessage {
  data: {
    positions: CarPosition[];
    raceTime: number;
  };
}

export interface EventMessage extends RoomMessage {
  data: RaceEvent;
}

// Service interfaces
export interface RoomServiceInterface {
  createRoom(adminUsername: string, maxParticipants?: number): RaceRoom;
  joinRoom(
    roomId: string,
    userId: string,
    username: string,
    socketId: string,
  ): RaceRoom | null;
  leaveRoom(roomId: string, userId: string): RaceRoom | null;
  updateSocketId(roomId: string, userId: string, socketId: string): void;
  configureRace(
    roomId: string,
    adminUsername: string,
    raceConfig: RaceConfiguration,
  ): RaceRoom | null;
  startRace(roomId: string, adminUsername: string): RaceRoom | null;
  finishRace(roomId: string): RaceRoom | null;
  closeRoom(roomId: string, adminUsername: string): boolean;
  getRoom(roomId: string): RaceRoom | null;
  getAllRooms(): RaceRoom[];
  getRoomsByStatus(status: RoomStatus): RaceRoom[];
  getParticipantSocketIds(roomId: string): string[];
  cleanupExpiredRooms(maxAgeHours?: number): number;
  isAdmin(username: string): boolean;
  getAvailableRooms(): RaceRoom[];
  getRoomDetails(roomId: string): RaceRoom | null;
  removeParticipant(
    roomId: string,
    userId: string,
    isAdminAction?: boolean,
  ): RaceRoom | null;
  getAdminStats(): {
    totalRooms: number;
    roomsByStatus: Record<RoomStatus, number>;
    totalParticipants: number;
  };
}

export interface RacePackageServiceInterface {
  buildRacePackage(raceConfig: RaceConfiguration): Promise<RacePackage>;
  validateRaceConfiguration(raceConfig: RaceConfiguration): Promise<boolean>;
}

// Race simulation interfaces
export interface RaceState {
  raceId: string;
  status: RaceStatus;
  cars: CarState[];
  currentLap: number;
  totalLaps: number;
  raceTime: number;
}

export interface CarState {
  carId: string;
  aiModelId: string;
  position: Position3D;
  velocity: Velocity;
  lapProgress: number;
  currentLap: number;
  racePosition: number;
  isActive: boolean;
  lapTimes: number[];
  bestLapTime?: number;
  totalDistance: number;
  collisions: number;
}

// Statistics and results interfaces
export interface RaceResult {
  raceId: string;
  trackId: string;
  participants: ParticipantResult[];
  raceTime: number;
  createdAt: Date;
}

export interface ParticipantResult {
  carId: string;
  aiModelId: string;
  finalPosition: number;
  lapTimes: number[];
  bestLapTime: number;
  totalDistance: number;
  averageSpeed: number;
  collisions: number;
  didFinish: boolean;
}

// Error and validation interfaces
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
}

// Enums
export enum RoomStatus {
  WAITING = 'waiting',
  PREPARING = 'preparing',
  RACING = 'racing',
  PAUSED = 'paused',
  FINISHED = 'finished',
  CLOSED = 'closed',
}

export enum RaceEventType {
  RACE_START = 'race_start',
  RACE_FINISH = 'race_finish',
  LAP_COMPLETE = 'lap_complete',
  POSITION_CHANGE = 'position_change',
  COLLISION = 'collision',
  CHECKPOINT = 'checkpoint',
  CAR_ELIMINATED = 'car_eliminated',
  WEATHER_CHANGE = 'weather_change',
}

export enum RaceStatus {
  WAITING = 'waiting',
  STARTING = 'starting',
  ACTIVE = 'active',
  PAUSED = 'paused',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

// Type aliases for better readability
export type RoomId = string;
export type UserId = string;
export type CarId = string;
export type AIModelId = string;
export type TrackId = string;
export type SocketId = string;
