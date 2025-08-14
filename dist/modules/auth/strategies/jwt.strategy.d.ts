import { Strategy } from 'passport-jwt';
import { JwtPlayerPayload, PlayerFromJwt } from '../player/interfaces/player-jwt.interface';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPlayerPayload): Promise<PlayerFromJwt>;
}
export {};
