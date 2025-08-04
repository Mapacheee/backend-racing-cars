export class TokenPayloadDto {
  sub: string; // Subject (player ID)
  username: string; // Username of the player
  aiGeneration: number; // AI generation level for the player
}

export class TokenPayloadResponseDto {
  id: string; // Player ID
  username: string; // Username of the player
  aiGeneration: number; // AI generation level for the player
}
