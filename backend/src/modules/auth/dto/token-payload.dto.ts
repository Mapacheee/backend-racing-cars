export class TokenPayloadDto {
  sub: string; // Subject (user ID)
  username: string; // Username of the user
}

export class TokenPayloadResponseDto {
  id: string; // User ID
  username: string; // Username of the user
  token: string; // JWT token
}
