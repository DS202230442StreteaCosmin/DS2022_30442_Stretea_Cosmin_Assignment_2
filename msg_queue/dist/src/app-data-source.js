"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myDataSource = void 0;
const typeorm_1 = require("typeorm");
require("reflect-metadata");
exports.myDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    entities: [`${__dirname}/entities/*.js`],
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    synchronize: !!process.env.DB_SYNCHRONIZE,
    logging: !!process.env.DB_LOGGING,
});
//# sourceMappingURL=app-data-source.js.map