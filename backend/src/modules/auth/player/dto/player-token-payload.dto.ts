export class PlayerTokenPayloadDto {
  sub: string; // Subject (player ID)
  username: string; // Username of the player
  aiGeneration: number; // AI generation level for the player
}
