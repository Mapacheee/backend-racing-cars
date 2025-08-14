"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceStatus = exports.RaceEventType = exports.RoomStatus = void 0;
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["WAITING"] = "waiting";
    RoomStatus["PREPARING"] = "preparing";
    RoomStatus["RACING"] = "racing";
    RoomStatus["PAUSED"] = "paused";
    RoomStatus["FINISHED"] = "finished";
    RoomStatus["CLOSED"] = "closed";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
var RaceEventType;
(function (RaceEventType) {
    RaceEventType["RACE_START"] = "race_start";
    RaceEventType["RACE_FINISH"] = "race_finish";
    RaceEventType["LAP_COMPLETE"] = "lap_complete";
    RaceEventType["POSITION_CHANGE"] = "position_change";
    RaceEventType["COLLISION"] = "collision";
    RaceEventType["CHECKPOINT"] = "checkpoint";
    RaceEventType["CAR_ELIMINATED"] = "car_eliminated";
    RaceEventType["WEATHER_CHANGE"] = "weather_change";
})(RaceEventType || (exports.RaceEventType = RaceEventType = {}));
var RaceStatus;
(function (RaceStatus) {
    RaceStatus["WAITING"] = "waiting";
    RaceStatus["STARTING"] = "starting";
    RaceStatus["ACTIVE"] = "active";
    RaceStatus["PAUSED"] = "paused";
    RaceStatus["FINISHED"] = "finished";
    RaceStatus["CANCELLED"] = "cancelled";
})(RaceStatus || (exports.RaceStatus = RaceStatus = {}));
//# sourceMappingURL=racing-stream.interface.js.map