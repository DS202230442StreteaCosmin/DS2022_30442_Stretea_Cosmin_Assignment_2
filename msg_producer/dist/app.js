var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import amqp from 'amqplib/callback_api.js';
import { parse } from 'csv-parse';
import fs from 'fs';
let csvConsumptions = [];
let currentConnection = null;
const myArgs = process.argv.slice(2);
if (myArgs.length !== 1) {
    console.log('[!] Please provide a device id.');
    process.exit(0);
}
const deviceId = myArgs[0];
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
const getMessageObject = (_deviceId, timestamp, consumption) => {
    return {
        timestamp,
        device_id: _deviceId,
        measurement_value: consumption,
    };
};
const normalizeCsvData = (_csvConsumptions) => {
    return _csvConsumptions.map((currentElement, index) => index === 0
        ? currentElement
        : currentElement - _csvConsumptions[index - 1]);
};
const handleCloseConnection = () => {
    if (currentConnection) {
        currentConnection.close();
    }
    process.exit(0);
};
const handleDataSend = (consumptions) => __awaiter(void 0, void 0, void 0, function* () {
    amqp.connect('amqp://localhost', (error0, connection) => __awaiter(void 0, void 0, void 0, function* () {
        if (error0) {
            throw error0;
        }
        currentConnection = connection;
        connection.createChannel((error1, channel) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            if (error1) {
                throw error1;
            }
            const queue = 'consumptions';
            channel.assertQueue(queue, {
                durable: false,
            });
            try {
                for (var _d = true, consumptions_1 = __asyncValues(consumptions), consumptions_1_1; consumptions_1_1 = yield consumptions_1.next(), _a = consumptions_1_1.done, !_a;) {
                    _c = consumptions_1_1.value;
                    _d = false;
                    try {
                        const consumption = _c;
                        const responseObjet = getMessageObject(deviceId, new Date().getTime(), consumption);
                        channel.sendToQueue(queue, Buffer.from(JSON.stringify(responseObjet)));
                        console.log(' [x] Sent %s', responseObjet);
                        yield sleep(1000);
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = consumptions_1.return)) yield _b.call(consumptions_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }));
    }));
});
const readStream = fs
    .createReadStream('./sensor.csv')
    .pipe(parse({ delimiter: ',', cast: true }));
readStream.on('data', (row) => {
    const parsedRowValue = row[0];
    csvConsumptions.push(parsedRowValue);
});
readStream.on('end', () => {
    csvConsumptions = normalizeCsvData(csvConsumptions);
    handleDataSend(csvConsumptions);
});
process.on('SIGINT', () => {
    handleCloseConnection();
}); // CTRL+C
process.on('SIGQUIT', () => {
    handleCloseConnection();
}); // Keyboard quit
process.on('SIGTERM', () => {
    handleCloseConnection();
}); // `kill` command
//# sourceMappingURL=app.js.map