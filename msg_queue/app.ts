import dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import amqp from 'amqplib/callback_api';
import { myDataSource } from './src/app-data-source';
import { Consumption } from './src/entities/consumption.entity';
import { Device } from './src/entities/device.entity';
import { Between } from 'typeorm';
import ws from 'ws';
import { IncomingMessage } from 'http';

const wss = new ws.Server({ port: 8111 });

let dbInitialized = false;
const clients = new Map<string, ws.WebSocket>();

wss.on('connection', function connection(wsConnection, req: IncomingMessage) {
    if (req.url) {
        const parsedId = req.url.substring(1);
        clients.set(parsedId, wsConnection);
        console.log('[!] WebSocket connection established with id ' + parsedId);
    } else {
        console.log('[!] WebSocket connection established without id');
    }
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

    if (currentConsumptionValue > maxHourlyConsumption) {
        console.log('[!] Sending alert to client ' + currentDevice.id);

        if (clients.has(currentDevice.id)) {
            clients.get(currentDevice.id).send(
                JSON.stringify({
                    deviceId: currentDevice.id,
                    deviceName: currentDevice.name,
                    currentConsumptionValue,
                })
            );
        } else {
            console.log('[!] Client not found');
            return;
        }
    }

    console.log(' [x] Received %s', response);
};

amqp.connect(process.env.QUEUE_URL, function (error0, connection) {
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
