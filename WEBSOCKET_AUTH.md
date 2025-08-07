# WebSocket Authentication Quick Reference

## 🔐 JWT Authentication Required

**ALL WebSocket endpoints in this project are protected with JWT authentication.**

### Connection Format

```typescript
// Required connection format
{
    auth: {
        token: 'your-jwt-token-here'
    }
}
```

### Frontend Usage

```typescript
import { racingWebSocketService } from './lib/services/racing-websocket'

// Get token from AuthContext
const { auth } = useAuth()

// Connect with JWT token (REQUIRED)
racingWebSocketService.connect(auth.token)
```

### Backend Implementation

-   Uses `WsJwtAuthGuard` on all WebSocket endpoints
-   Token extracted from `socket.handshake.auth.token`
-   Invalid/missing tokens result in connection rejection

### Error Handling

```typescript
socket.on('connect_error', error => {
    if (error.message.includes('Authentication')) {
        // Token is invalid/expired - redirect to login
    }
})
```

### Permission Levels

-   **Admin JWT**: Can create rooms, start races, manage participants
-   **Player JWT**: Can join rooms, participate in races
-   **No token**: Connection rejected

For detailed documentation, see: `frontend/src/lib/services/README.md`
