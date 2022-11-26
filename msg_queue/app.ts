import amqp from 'amqplib/callback_api.js';

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
        channel.consume(
            queue,
            function (msg) {
                const response = JSON.parse(msg.content.toString());
                console.log(' [x] Received %s', response);
            },
            {
                noAck: true,
            }
        );
    });
});
