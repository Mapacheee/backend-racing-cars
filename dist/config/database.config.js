"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const path_1 = require("path");
const getDatabaseConfig = () => ({
    type: 'better-sqlite3',
    database: 'racing_ai.db',
    entities: [(0, path_1.join)(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: true,
    logging: true,
});
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map