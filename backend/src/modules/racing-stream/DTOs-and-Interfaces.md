# Racing Stream DTOs and Interfaces Documentation

This document describes all the Data Transfer Objects (DTOs) and interfaces used in the racing stream module.

## 📋 Table of Contents

1. [Request DTOs](#request-dtos)
2. [Response DTOs](#response-dtos)
3. [Core Interfaces](#core-interfaces)
4. [Service Interfaces](#service-interfaces)
5. [WebSocket Message Types](#websocket-message-types)
6. [Enums](#enums)

## 🔄 Request DTOs

These DTOs are used for incoming requests (WebSocket messages and HTTP requests).

### Room Management

#### `CreateRoomDto`

```typescript
{
  hostId: string;
  username: string;
  maxParticipants?: number; // Default: 10
}
```

#### `JoinRoomDto`

```typescript
{
  roomId: string;
  userId: string;
  username: string;
}
```

#### `LeaveRoomDto`

```typescript
{
  roomId: string;
  userId: string;
}
```

### Race Configuration

#### `ConfigureRaceDto`

```typescript
{
  roomId: string;
  raceConfig: RaceConfigurationDto;
}
```

#### `RaceConfigurationDto`

```typescript
{
  trackId: string;
  aiModelIds: string[];
  raceSettings: RaceSettingsDto;
}
```

#### `RaceSettingsDto`

```typescript
{
  laps: number;
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### Race Control

#### `StartRaceDto`

```typescript
{
  roomId: string;
}
```

#### `GetRoomStatusDto`

```typescript
{
  roomId: string;
}
```

### Real-time Updates

#### `PositionUpdateDto`

```typescript
{
  roomId: string;
  positions: CarPositionDto[];
  timestamp: number;
}
```

#### `CarPositionDto`

```typescript
{
  carId: string;
  position: PositionDto;
  velocity: VelocityDto;
  lapProgress: number;
  currentLap: number;
  racePosition: number;
}
```

#### `PositionDto`

```typescript
{
  x: number;
  y: number;
  z: number;
  rotation: number;
}
```

#### `VelocityDto`

```typescript
{
  x: number;
  y: number;
  speed: number;
}
```

#### `RaceEventDto`

```typescript
{
  roomId: string;
  event: RaceEventDataDto;
}
```

#### `RaceEventDataDto`

```typescript
{
  type: string;
  timestamp: number;
  carId?: string;
  data?: any;
}
```

## 📤 Response DTOs

These DTOs are used for outgoing responses (WebSocket events and HTTP responses).

### Room Responses

#### `RoomCreatedResponseDto`

```typescript
{
  room: RoomResponseDto;
  message: string;
}
```

#### `RoomJoinedResponseDto`

```typescript
{
  room: RoomResponseDto;
}
```

#### `PlayerJoinedResponseDto`

```typescript
{
  participant: ParticipantResponseDto;
  room: RoomResponseDto;
}
```

#### `PlayerLeftResponseDto`

```typescript
{
  userId: string;
  room: RoomResponseDto;
}
```

#### `RoomClosedResponseDto`

```typescript
{
  message: string;
}
```

#### `RaceConfiguredResponseDto`

```typescript
{
  room: RoomResponseDto;
  config: RaceConfigurationDto;
}
```

#### `RaceStartedResponseDto`

```typescript
{
  room: RoomResponseDto;
  timestamp: number;
}
```

### Data Responses

#### `RoomResponseDto`

```typescript
{
  id: string;
  hostId: string;
  participants: ParticipantResponseDto[];
  status: string; // RoomStatus enum as string
  raceConfig?: RaceConfigurationDto;
  createdAt: Date;
  maxParticipants: number;
}
```

#### `ParticipantResponseDto`

```typescript
{
  userId: string;
  username: string;
  role: string; // ParticipantRole enum as string
  connectedAt: Date;
  socketId: string;
}
```

#### `RacePackageResponseDto`

```typescript
{
  trackData: TrackDataResponseDto;
  aiModels: AIModelDataResponseDto[];
  raceConfig: RaceConfigurationDto;
}
```

#### `TrackDataResponseDto`

```typescript
{
  id: string;
  name: string;
  layout: TrackPointResponseDto[];
  metadata: TrackMetadataResponseDto;
}
```

#### `TrackPointResponseDto`

```typescript
{
  x: number;
  y: number;
  z: number;
  type: string; // 'track' | 'checkpoint' | 'start' | 'finish'
}
```

#### `TrackMetadataResponseDto`

```typescript
{
  length: number;
  width: number;
  checkpoints: number;
  description?: string;
}
```

#### `AIModelDataResponseDto`

```typescript
{
  id: string;
  name: string;
  generation: number;
  weights: number[][];
  architecture: AIArchitectureResponseDto;
}
```

#### `AIArchitectureResponseDto`

```typescript
{
  inputs: number;
  hiddenLayers: number[];
  outputs: number;
}
```

### Utility Responses

#### `ValidationResponseDto`

```typescript
{
  valid: boolean;
}
```

#### `ErrorResponseDto`

```typescript
{
  message: string;
  error?: string;
}
```

## 🏗️ Core Interfaces

These interfaces define the core data structures used throughout the system.

### Room and Race Management

#### `RaceRoom`

Core room entity containing all room state and participants.

#### `RoomParticipant`

Individual participant in a race room with connection details.

#### `RaceConfiguration`

Complete race setup including track, AI models, and settings.

#### `RacePackage`

Complete data package sent to host for local simulation.

### Track and AI Data

#### `TrackData`

Track information including layout points and metadata.

#### `TrackPoint`

Individual point in track layout with position and type.

#### `AIModelData`

AI model information including weights and architecture.

#### `AIArchitecture`

Neural network architecture specification.

### Race Runtime Data

#### `CarPosition`

Real-time car position and velocity data.

#### `RaceEvent`

Race event information (lap completion, collisions, etc.).

#### `RaceState`

Complete race state for simulation tracking.

#### `CarState`

Individual car state with detailed metrics.

## 🔧 Service Interfaces

Interfaces that define service contracts.

#### `RoomServiceInterface`

Defines all room management operations.

#### `RacePackageServiceInterface`

Defines race package building and validation operations.

## 📡 WebSocket Message Types

### Message Categories

1. **Room Management**: Create, join, leave rooms
2. **Race Configuration**: Setup race parameters
3. **Race Control**: Start, pause, finish races
4. **Real-time Updates**: Position streaming, events
5. **Status Queries**: Room status, participant lists

### Message Flow

#### Host Flow

1. `createRoom` → `roomCreated`
2. `configureRace` → `raceConfigured` + `racePackage`
3. `startRace` → `raceStarted`
4. `positionUpdate` → broadcast to spectators
5. `raceEvent` → broadcast to all

#### Spectator Flow

1. `joinRoom` → `roomJoined` + `playerJoined` broadcast
2. Receive `positionUpdate` messages
3. Receive `raceEvent` messages
4. `leaveRoom` → `roomLeft` + `playerLeft` broadcast

## 📊 Enums

### `RoomStatus`

- `WAITING`: Room created, waiting for configuration
- `PREPARING`: Race configured, downloading data
- `RACING`: Race in progress
- `PAUSED`: Race temporarily paused
- `FINISHED`: Race completed
- `CLOSED`: Room closed/deleted

### `ParticipantRole`

- `HOST`: Room creator who runs simulation
- `SPECTATOR`: Viewer who receives updates

### `RaceEventType`

- `RACE_START`: Race began
- `RACE_FINISH`: Race completed
- `LAP_COMPLETE`: Car completed a lap
- `POSITION_CHANGE`: Car changed position
- `COLLISION`: Car collision occurred
- `CHECKPOINT`: Car passed checkpoint
- `CAR_ELIMINATED`: Car eliminated from race
- `WEATHER_CHANGE`: Weather conditions changed

### `RaceStatus`

- `WAITING`: Before race start
- `STARTING`: Countdown phase
- `ACTIVE`: Race in progress
- `PAUSED`: Temporarily stopped
- `FINISHED`: Race completed
- `CANCELLED`: Race cancelled

## 🎯 Usage Examples

### Creating a Room

```typescript
const createRoomData: CreateRoomDto = {
  hostId: 'user-123',
  username: 'RaceHost',
  maxParticipants: 8,
};

socket.emit('createRoom', createRoomData);
```

### Configuring a Race

```typescript
const configureData: ConfigureRaceDto = {
  roomId: 'ROOM123',
  raceConfig: {
    trackId: 'track-uuid',
    aiModelIds: ['ai1', 'ai2', 'ai3'],
    raceSettings: {
      laps: 5,
      timeLimit: 300000, // 5 minutes
      difficulty: 'medium',
    },
  },
};

socket.emit('configureRace', configureData);
```

### Streaming Positions

```typescript
const positionData: PositionUpdateDto = {
  roomId: 'ROOM123',
  timestamp: Date.now(),
  positions: [
    {
      carId: 'car-1',
      position: { x: 100, y: 200, z: 0, rotation: 45 },
      velocity: { x: 10, y: 5, speed: 25 },
      lapProgress: 0.75,
      currentLap: 2,
      racePosition: 1,
    },
    // ... more cars
  ],
};

socket.emit('positionUpdate', positionData);
```

## 🔒 Validation

All DTOs include comprehensive validation using `class-validator` decorators:

- **Required fields**: `@IsString()`, `@IsNumber()`, etc.
- **Optional fields**: `@IsOptional()`
- **Arrays**: `@IsArray()` with element validation
- **Nested objects**: `@ValidateNested()` with `@Type()`
- **Enums**: `@IsEnum()` for strict value checking
- **Custom validation**: Additional business logic validation in services

This comprehensive type system ensures type safety and data integrity throughout the racing stream system.
