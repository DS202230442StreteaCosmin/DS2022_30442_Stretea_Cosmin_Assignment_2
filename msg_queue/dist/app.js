"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("reflect-metadata");
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const app_data_source_1 = require("./src/app-data-source");
const consumption_entity_1 = require("./src/entities/consumption.entity");
const device_entity_1 = require("./src/entities/device.entity");
const typeorm_1 = require("typeorm");
const ws_1 = __importDefault(require("ws"));
const wss = new ws_1.default.Server({ port: 8111 });
let dbInitialized = false;
const clients = new Map();
wss.on('connection', function connection(wsConnection, req) {
    if (req.url) {
        const parsedId = req.url.substring(1);
        clients.set(parsedId, wsConnection);
        console.log('[!] WebSocket connection established with id ' + parsedId);
    }
    else {
        console.log('[!] WebSocket connection established without id');
    }
});
app_data_source_1.myDataSource
    .initialize()
    .then(() => {
    console.log('Data Source has been initialized!');
    dbInitialized = true;
})
    .catch((err) => {
    console.error('Error during Data Source initialization:', err);
    dbInitialized = false;
    process.exit(0);
});
const ConsumptionRepository = app_data_source_1.myDataSource.getRepository(consumption_entity_1.Consumption);
const DeviceRepository = app_data_source_1.myDataSource.getRepository(device_entity_1.Device);
const handleOnMessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const response = JSON.parse(msg.content.toString());
    if (!dbInitialized) {
        console.log('DB not initialized yet, skipping message');
        return;
    }
    const currentDevice = yield DeviceRepository.findOne({
        where: { id: response.device_id },
    });
    let currentConsumptionValue = 0;
    const maxHourlyConsumption = currentDevice.maxHourlyConsumption;
    const startHourNumber = new Date(response.timestamp).setMinutes(0, 0, 0);
    const startHourDate = new Date(startHourNumber);
    const endHourNumber = new Date(response.timestamp).setMinutes(59, 59, 999);
    const endHourDate = new Date(endHourNumber);
    const availableConsumption = yield ConsumptionRepository.findOne({
        where: {
            device: { id: response.device_id },
            timestamp: (0, typeorm_1.Between)(new Date(startHourDate), new Date(endHourDate)),
        },
    });
    if (availableConsumption) {
        currentConsumptionValue =
            availableConsumption.value + response.measurement_value;
        yield ConsumptionRepository.update({ id: availableConsumption.id }, Object.assign(Object.assign({}, availableConsumption), { value: availableConsumption.value + response.measurement_value }));
    }
    else {
        currentConsumptionValue = response.measurement_value;
        const createdConsumption = ConsumptionRepository.create({
            timestamp: startHourDate,
            value: response.measurement_value,
            device: currentDevice,
        });
        yield ConsumptionRepository.save(createdConsumption);
    }
    if (currentConsumptionValue > maxHourlyConsumption) {
        console.log('[!] Sending alert to client ' + currentDevice.id);
        if (clients.has(currentDevice.id)) {
            clients.get(currentDevice.id).send(JSON.stringify({
                deviceId: currentDevice.id,
                deviceName: currentDevice.name,
                currentConsumptionValue,
            }));
        }
        else {
            console.log('[!] Client not found');
            return;
        }
    }
    console.log(' [x] Received %s', response);
});
callback_api_1.default.connect(process.env.QUEUE_URL, function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        const queue = 'consumptions';
        channel.assertQueue(queue, {
            durable: false,
        });
        console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
        channel.consume(queue, handleOnMessage, {
            noAck: true,
        });
    });
});
//# sourceMappingURL=app.js.map