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
const dotenv_1 = __importDefault(require("dotenv")); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv_1.default.config();
require("reflect-metadata");
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const app_data_source_1 = require("./src/app-data-source");
const consumption_entity_1 = require("./src/entities/consumption.entity");
const device_entity_1 = require("./src/entities/device.entity");
const typeorm_1 = require("typeorm");
const ws_1 = __importDefault(require("ws"));
const wss = new ws_1.default.Server({ port: 8111 });
// wss.on('connection', (ws, r) => {
//     ws.send('This is a message to client');
// });
let dbInitialized = false;
// const app = express();
// const PORT = 1234;
// const sleep = (ms: number) => {
//     return new Promise((resolve) => {
//         setTimeout(resolve, ms);
//     });
// };
// const handleDataRow = async (readable: Parser) => {
//     for await (const chunk of readable) {
//         console.log(chunk);
//         await sleep(1000);
//     }
// };
// app.listen(PORT, () => {
//     // if (!error)
//     console.debug(
//         'Server is Successfully Running, and App is listening on port ' + PORT
//     );
//     // else console.debug("Error occurred, server can't start", error);
//     const readStream = fs
//         .createReadStream('./sensor.csv')
//         .pipe(parse({ delimiter: ',' }));
//     readStream.on('data', async (row) => {
//         await sleep(8000);
//         console.log(row);
//         // setTimeout(() => {
//         //     // console.log(row);
//         // }, 1000);
//     });
//     handleDataRow(readStream);
// });
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
    // console.log(
    //     '🚀 ~ file: app.ts ~ line 63 ~ handleOnMessage ~ response',
    //     response
    // );
    // const device = await DeviceRepository.findOneOrFail({
    //     where: { id: response.device_id },
    // });
    // const newConsumptionDate = new Date(response.measurement_time);
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
        currentConsumptionValue = availableConsumption.value;
        const createdConsumption = ConsumptionRepository.create({
            timestamp: startHourDate,
            value: response.measurement_value,
            device: currentDevice,
        });
        yield ConsumptionRepository.save(createdConsumption);
    }
    console.log('🚀 ~ file: app.ts ~ line 70 ~ handleOnMessage ~ availableConsumption', availableConsumption);
    if (currentConsumptionValue > maxHourlyConsumption) {
        // wss.emit('event', {
        //     deviceId: currentDevice.id,
        //     deviceName: currentDevice.name,
        //     currentConsumptionValue: currentConsumptionValue,
        // });
        wss.clients.forEach((client) => client.send(JSON.stringify({
            deviceId: currentDevice.id,
            deviceName: currentDevice.name,
            currentConsumptionValue,
        })));
    }
    // if (device) {
    //     console.log(
    //         '🚀 ~ file: app.ts ~ line 61 ~ handleOnMessage ~ device',
    //         device
    //     );
    // }
    console.log(' [x] Received %s', response);
});
callback_api_1.default.connect('amqp://localhost', function (error0, connection) {
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