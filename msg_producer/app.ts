import amqp from 'amqplib/callback_api.js';
import { parse } from 'csv-parse';
import fs from 'fs';
import { normalize } from 'path';

let csvConsumptions: number[] = [];
let currentConnection: any = null;
const myArgs = process.argv.slice(2);

if (myArgs.length !== 1) {
    console.log('[!] Please provide a device id.');
    process.exit(0);
}
const deviceId = myArgs[0];

const sleep = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const getMessageObject = (
    _deviceId: string,
    timestamp: number,
    consumption: number
) => {
    return {
        timestamp,
        device_id: _deviceId,
        measurement_value: Math.round(consumption),
    };
};

const normalizeCsvData = (_csvConsumptions: number[]) => {
    return _csvConsumptions.map((currentElement, index) =>
        index === 0
            ? currentElement
            : currentElement - _csvConsumptions[index - 1]
    );
};

const handleCloseConnection = () => {
    if (currentConnection) {
        currentConnection.close();
    }
    process.exit(0);
};

const handleDataSend = async (consumptions: any[]) => {
    amqp.connect(process.env.QUEUE_URL, async (error0, connection) => {
        if (error0) {
            throw error0;
        }

        currentConnection = connection;

        connection.createChannel(async (error1, channel) => {
            if (error1) {
                throw error1;
            }
            const queue = 'consumptions';

            channel.assertQueue(queue, {
                durable: false,
            });

            for await (const consumption of consumptions) {
                const responseObjet = getMessageObject(
                    deviceId,
                    new Date().getTime(),
                    consumption
                );
                channel.sendToQueue(
                    queue,
                    Buffer.from(JSON.stringify(responseObjet))
                );
                console.log(' [x] Sent %s', responseObjet);
                await sleep(10000);
            }
        });
    });
};

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
