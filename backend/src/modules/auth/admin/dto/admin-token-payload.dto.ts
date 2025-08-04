export class AdminTokenPayloadDto {
  sub: string;
  iat: number;
  jti: string;
}

export class AdminTokenPayloadResponseDto {
  username: string;
}
