# Racing WebSocket System

This module provides a real-time racing system where hosts run client-side simulations and stream car positions to spectators via WebSockets.

## Architecture

### Client-Side Simulation Approach

- **Host**: Downloads race package and runs NEAT AI simulation locally
- **Spectators**: Connect via WebSocket to receive real-time position updates
- **Server**: Manages rooms, distributes race packages, routes WebSocket messages

## Installation

Install required WebSocket dependencies:

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

## Usage

### 1. Import the RacingModule

Add to your main `app.module.ts`:

```typescript
import { RacingModule } from './modules/racing/racing.module';

@Module({
  imports: [
    // ... other imports
    RacingModule,
  ],
})
export class AppModule {}
```

### 2. WebSocket Events

#### Host Events (Room Management)

- `createRoom` - Create a new race room
- `configureRace` - Set track and AI models for the race
- `startRace` - Begin the race simulation
- `positionUpdate` - Stream car positions (60 FPS)
- `raceEvent` - Send race events (lap completion, collisions)

#### Spectator Events

- `joinRoom` - Join an existing room as spectator
- `leaveRoom` - Leave the room

#### Server Responses

- `roomCreated` - Room creation confirmation
- `roomJoined` - Join confirmation with room state
- `racePackage` - Complete race data for simulation
- `positionUpdate` - Real-time car positions
- `raceEvent` - Race events (lap times, collisions)

### 3. Frontend Integration

#### Connect to Racing WebSocket

```typescript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000/racing', {
  auth: {
    userId: 'user-id',
    username: 'username',
  },
});
```

#### Host: Create and Run Race

```typescript
// 1. Create room
socket.emit('createRoom', {
  hostId: 'host-user-id',
  username: 'Host Name',
  maxParticipants: 10,
});

// 2. Configure race
socket.emit('configureRace', {
  roomId: 'ROOM123',
  raceConfig: {
    trackId: 'track-uuid',
    aiModelIds: ['ai1-uuid', 'ai2-uuid'],
    raceSettings: {
      laps: 5,
      difficulty: 'medium',
    },
  },
});

// 3. Receive race package and start simulation
socket.on('racePackage', (racePackage) => {
  // Initialize NEAT simulation with track and AI models
  startLocalSimulation(racePackage);
});

// 4. Stream positions during simulation
function streamPositions(positions) {
  socket.emit('positionUpdate', {
    roomId: 'ROOM123',
    positions: positions,
    timestamp: Date.now(),
  });
}
```

#### Spectator: Join and Watch Race

```typescript
// Join room
socket.emit('joinRoom', {
  roomId: 'ROOM123',
  userId: 'spectator-id',
  username: 'Spectator Name',
});

// Receive position updates
socket.on('positionUpdate', (data) => {
  // Update car positions in 3D visualization
  updateCarPositions(data.positions);
});

// Receive race events
socket.on('raceEvent', (event) => {
  // Handle lap completions, collisions, etc.
  handleRaceEvent(event);
});
```

## API Endpoints

### REST API

- `POST /racing/package/validate` - Validate race configuration
- `GET /racing/rooms` - List all active rooms
- `GET /racing/rooms/:id` - Get specific room details

### WebSocket Namespace: `/racing`

## Data Flow

### Race Setup

1. Host creates room → Server creates room instance
2. Spectators join room → Added to participant list
3. Host configures race → Server validates and prepares race package
4. Host receives race package → Downloads track + AI models
5. Host starts race → Server notifies all participants

### During Race

1. Host runs NEAT simulation locally
2. Host calculates car positions (30-60 FPS)
3. Host streams positions via WebSocket
4. Server broadcasts to all room spectators
5. Spectators render real-time race visualization

## Race Package Structure

```typescript
interface RacePackage {
  trackData: {
    id: string;
    name: string;
    layout: TrackPoint[];
    metadata: TrackMetadata;
  };
  aiModels: AIModelData[];
  raceConfig: RaceConfiguration;
}
```

## Benefits

- **Scalable**: Server only routes messages, doesn't run heavy AI
- **Real-time**: No server processing delay for AI decisions
- **Distributed**: Uses client computing power efficiently
- **Cost-effective**: Lower server resource requirements

## Error Handling

- **Room full**: Maximum participants reached
- **Invalid config**: Track or AI models not found
- **Host disconnect**: Room closed or host migration
- **Connection drops**: Automatic reconnection support

## Performance Considerations

- Limit position update frequency (30-60 FPS)
- Compress position data for large races
- Implement efficient serialization
- Handle multiple concurrent races

## Security

- Validate room permissions
- Authenticate WebSocket connections
- Rate limit message frequency
- Sanitize race configuration data
