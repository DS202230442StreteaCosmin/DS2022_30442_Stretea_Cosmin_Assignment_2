import dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import 'reflect-metadata';
import amqp from 'amqplib/callback_api';
import { myDataSource } from './src/app-data-source';
import { Consumption } from './src/entities/consumption.entity';
import { Device } from './src/entities/device.entity';
import express from 'express';
import { Between } from 'typeorm';
import ws from 'ws';

const wss = new ws.Server({ port: 8111 });

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

wss.on('connection', function connection(ws) {
    // ws.on('message', function message(data, isBinary) {
    //   wss.clients.forEach(function each(client) {
    //     if (client !== ws && client.readyState === WebSocket.OPEN) {
    //       client.send(data, { binary: isBinary });
    //     }
    //   });
    // });

    console.log('[!] WebSocket connection established');
});

myDataSource
    .initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
        dbInitialized = true;
    })
    .catch((err: any) => {
        console.error('Error during Data Source initialization:', err);
        dbInitialized = false;

        process.exit(0);
    });

const ConsumptionRepository = myDataSource.getRepository(Consumption);
const DeviceRepository = myDataSource.getRepository(Device);

const handleOnMessage = async (msg: amqp.Message) => {
    const response = JSON.parse(msg.content.toString());

    if (!dbInitialized) {
        console.log('DB not initialized yet, skipping message');
        return;
    }

    const currentDevice = await DeviceRepository.findOne({
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

    const availableConsumption = await ConsumptionRepository.findOne({
        where: {
            device: { id: response.device_id },
            timestamp: Between(new Date(startHourDate), new Date(endHourDate)),
        },
    });

    if (availableConsumption) {
        currentConsumptionValue =
            availableConsumption.value + response.measurement_value;
        await ConsumptionRepository.update(
            { id: availableConsumption.id },
            {
                ...availableConsumption,
                value: availableConsumption.value + response.measurement_value,
            }
        );
    } else {
        currentConsumptionValue = response.measurement_value;

        const createdConsumption = ConsumptionRepository.create({
            timestamp: startHourDate,
            value: response.measurement_value,
            device: currentDevice,
        });
        await ConsumptionRepository.save(createdConsumption);
    }
    console.log(
        '🚀 ~ file: app.ts ~ line 70 ~ handleOnMessage ~ availableConsumption',
        availableConsumption
    );

    if (currentConsumptionValue > maxHourlyConsumption) {
        console.log('[!] Sending alert to client');

        wss.clients.forEach((client) =>
            client.send(
                JSON.stringify({
                    deviceId: currentDevice.id,
                    deviceName: currentDevice.name,
                    currentConsumptionValue,
                })
            )
        );
    }
    // if (device) {
    //     console.log(
    //         '🚀 ~ file: app.ts ~ line 61 ~ handleOnMessage ~ device',
    //         device
    //     );
    // }
    console.log(' [x] Received %s', response);
};

amqp.connect('amqp://localhost', function (error0, connection) {
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

        console.log(
            ' [*] Waiting for messages in %s. To exit press CTRL+C',
            queue
        );
        channel.consume(queue, handleOnMessage, {
            noAck: true,
        });
    });
});
