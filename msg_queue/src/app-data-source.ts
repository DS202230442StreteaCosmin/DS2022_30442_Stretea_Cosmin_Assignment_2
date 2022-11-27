import { DataSource } from 'typeorm';
import 'reflect-metadata';
import { Consumption } from './entities/consumption.entity';
import { Device } from './entities/device.entity';
import { User } from './entities/user.entity';

export const myDataSource = new DataSource({
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
