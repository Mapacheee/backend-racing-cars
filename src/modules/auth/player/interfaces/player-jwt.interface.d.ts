export type JwtPlayerPayload = {
  sub: string;
  username: string;
  aiGeneration: number;
};

export type PlayerFromJwt = {
  id: string;
  username: string;
  aiGeneration: number;
};
