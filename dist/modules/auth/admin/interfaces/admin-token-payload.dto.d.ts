export interface AdminTokenPayload {
    sub: string;
    iat: number;
    jti: string;
}
export interface AdminTokenPayloadResponse {
    username: string;
}
