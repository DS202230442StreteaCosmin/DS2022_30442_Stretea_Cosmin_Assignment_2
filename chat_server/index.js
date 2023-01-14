const WebSocket = require('ws');

const WSMessageType = {
    MESSAGE: 'MESSAGE',
    CONNECT: 'CONNECT',
    DISCONNECT: 'DISCONNECT',
    ADMINS_NOT_AVAILABLE: 'ADMINS_NOT_AVAILABLE',
    NEW_CLIENT_ASSIGNED: 'NEW_CLIENT_ASSIGNED',
    ADMIN_DISCONNECTED_FROM_CLIENT: 'ADMIN_DISCONNECTED_FROM_CLIENT',
    CLIENT_DISCONNECTED_FROM_ADMIN: 'CLIENT_DISCONNECTED_FROM_ADMIN',
    START_TYPING: 'START_TYPING',
    END_TYPING: 'END_TYPING',
};

const parseData = (type, data) => {
    return JSON.stringify({ type: type, data: data });
};

const UserRoles = {
    ADMIN: 'admin',
    CLIENT: 'client',
};

const server = new WebSocket.Server(
    {
        port: 8080,
    },
    () => {
        console.log('Server started on port 8080');
    }
);

let clients = [];
let admins = [];
let clientsToAdmin = [];

let newConnection;

// function sendMessage(message) {
//     users.forEach((user) => {
//         user.ws.send(JSON.stringify(message));
//     });
// }

server.on('connection', (ws, req) => {
    const newConnectionRef = {
        ws,
    };

    // console.log('🚀 ~ file: index.js:26 ~ server.on ~ ws', req.url);

    const userId = req.url.split('/')[1];
    const userEmail = req.url.split('/')[2];
    const userRole = req.url.split('/')[3];

    if (userRole === UserRoles.ADMIN) {
        if (!admins.find((item) => item.id === userId)) {
            admins.push({
                connection: newConnectionRef,
                id: userId,
                email: userEmail,
                role: userRole,
            });
        }

        // let userNotAssigned = false;

        // users.forEach((user) => {
        //     const result = usersToAdmin.find(
        //         (userToAdmin) => userToAdmin.userId == user.id
        //     );

        //     if (!result) {
        //         userToAdmin.push({
        //             adminId: userId,
        //             userId: user.id,
        //         });
        //     }
        // });
    } else {
        // if (clients.find((item) => item.id === userId)) {
        //     if (clientsToAdmin.find((item) => item.clientId === userId)) {
        //         return;
        //     }
        // }

        if (!clients.find((item) => item.id === userId)) {
            clients.push({
                connection: newConnectionRef,
                id: userId,
                email: userEmail,
                role: userRole,
            });
        }

        if (!admins.length) {
            newConnectionRef.ws.send(
                parseData(WSMessageType.ADMINS_NOT_AVAILABLE, undefined)
            );
        } else {
            if (!clientsToAdmin.find((item) => item.clientId === userId)) {
                const randInt = Math.floor(Math.random() * admins.length);
                // console.log(
                //     '🚀 ~ file: index.js:95 ~ server.on ~ randInt',
                //     randInt
                // );
                const admin = admins[randInt];
                // console.log('🚀 ~ file: index.js:96 ~ server.on ~ admins', admins);
                // console.log('🚀 ~ file: index.js:96 ~ server.on ~ admin', admin);

                clientsToAdmin.push({
                    adminId: admin.id,
                    clientId: userId,
                });

                admin.connection.ws.send(
                    parseData(WSMessageType.NEW_CLIENT_ASSIGNED, {
                        id: userId,
                        email: userEmail,
                    })
                );
            }
        }
    }

    console.log(
        '[!] aici sunt listele ------>',
        admins,
        clients,
        clientsToAdmin
    );

    // conso

    // users.add(userRef);

    ws.on('message', (message) => {
        try {
            // Parsing the message
            const parsedMessage = JSON.parse(message);
            console.log('[!] AICI E MESAJU ->', parsedMessage);
            console.log(
                '[!] aici sunt listele ------>',
                admins,
                clients,
                clientsToAdmin
            );
            let info;

            switch (parsedMessage.type) {
                // case WSMessageType.CONNECT:
                //     const info = parsedMessage.data;
                //     break;

                case WSMessageType.DISCONNECT:
                    if (parsedMessage.data.role === UserRoles.ADMIN) {
                        const chatUsersIds = clientsToAdmin
                            .filter(
                                (item) => parsedMessage.data.id === item.adminId
                            )
                            .map((item) => item.clientId);

                        chatUsersIds.forEach((id) => {
                            const result = clients.find(
                                (client) => client.id === id
                            );

                            result.connection.ws.send(
                                parseData(
                                    WSMessageType.ADMIN_DISCONNECTED_FROM_CLIENT,
                                    undefined
                                )
                            );
                        });

                        clientsToAdmin = clientsToAdmin.filter(
                            (relation) =>
                                chatUsersIds.indexOf(relation.clientId) <= 0
                        );

                        admins = admins.filter(
                            (item) => item.id !== parsedMessage.data.id
                        );
                    } else {
                        const mapAssocAdmin = clientsToAdmin.find(
                            (item) => item.clientId === parsedMessage.data.id
                        );

                        console.log('mapAssocAdmin ', mapAssocAdmin);

                        if (mapAssocAdmin) {
                            const assocAdmin = admins.find(
                                (item) => item.id === mapAssocAdmin.adminId
                            );

                            if (assocAdmin) {
                                assocAdmin.connection.ws.send(
                                    parseData(
                                        WSMessageType.CLIENT_DISCONNECTED_FROM_ADMIN,
                                        parsedMessage.data.id
                                    )
                                );
                            }
                        }

                        clientsToAdmin = clientsToAdmin.filter(
                            (item) => item.clientId !== parsedMessage.data.id
                        );
                        clients = clients.filter(
                            (item) => item.id !== parsedMessage.data.id
                        );
                    }

                    console.log(
                        '[!] aici sunt listele din disconnect ------>',
                        admins,
                        clients,
                        clientsToAdmin
                    );

                    break;

                case WSMessageType.MESSAGE:
                    const dataMsg = parsedMessage.data;

                    if (dataMsg.role === UserRoles.ADMIN) {
                        const adminConnection = admins.find(
                            (item) => item.id === dataMsg.id
                        ).connection;
                        const clientConnection = clients.find(
                            (item) => item.id === dataMsg.clientId
                        ).connection;

                        adminConnection.ws.send(
                            parseData(WSMessageType.MESSAGE, dataMsg)
                        );

                        clientConnection.ws.send(
                            parseData(WSMessageType.MESSAGE, dataMsg)
                        );
                    } else {
                        const clientConnection = clients.find(
                            (item) => item.id === dataMsg.id
                        ).connection;

                        const adminConnection = admins.find(
                            (item) =>
                                item.id ===
                                clientsToAdmin.find(
                                    (item) => item.clientId === dataMsg.id
                                ).adminId
                        ).connection;

                        const newMsg = {
                            id: dataMsg.id,
                            role: dataMsg.role,
                            message: dataMsg.message,
                        };

                        adminConnection.ws.send(
                            parseData(WSMessageType.MESSAGE, newMsg)
                        );

                        clientConnection.ws.send(
                            parseData(WSMessageType.MESSAGE, newMsg)
                        );
                    }

                    break;

                case WSMessageType.START_TYPING:
                    const { from, to } = parsedMessage.data;

                    if (to === undefined) {
                        const mapObj = clientsToAdmin.find(
                            (item) => item.clientId === from
                        );

                        const adminObj = admins.find(
                            (item) => item.id === mapObj.adminId
                        );

                        adminObj.connection.ws.send(
                            parseData(WSMessageType.START_TYPING, {
                                id: from,
                                type: UserRoles.ADMIN,
                            })
                        );

                        console.log(
                            '🚀 ~ file: index.js:288 ~ ws.on ~ from',
                            from
                        );
                    } else {
                        const clientConnection = clients.find(
                            (item) => item.id === to
                        ).connection;
                        //

                        clientConnection.ws.send(
                            parseData(WSMessageType.START_TYPING, {
                                id: to,
                                type: UserRoles.CLIENT,
                            })
                        );
                    }

                    break;

                case WSMessageType.END_TYPING:
                    const parsedType = parsedMessage.data;

                    if (parsedType.to === undefined) {
                        const mapObj = clientsToAdmin.find(
                            (item) => item.clientId === parsedType.from
                        );

                        const adminObj = admins.find(
                            (item) => item.id === mapObj.adminId
                        );

                        adminObj.connection.ws.send(
                            parseData(WSMessageType.END_TYPING, {
                                id: parsedType.from,
                                type: UserRoles.ADMIN,
                            })
                        );
                    } else {
                        const clientConnection = clients.find(
                            (item) => item.id === parsedType.to
                        ).connection;
                        //

                        clientConnection.ws.send(
                            parseData(WSMessageType.END_TYPING, {
                                id: parsedType.to,
                                type: UserRoles.CLIENT,
                            })
                        );
                    }

                    break;

                default:
                    break;
            }

            // Checking if the message is a valid one

            // if (
            //     typeof data.id !== 'string' ||
            //     typeof data.role !== 'string' ||
            //     typeof data.message !== 'string'
            // ) {
            //     console.error('Invalid message');
            //     return;
            // }

            //"parsed" message
            // const parsedMessage = data;

            // Sending the message

            // const messageToSend = {
            //     sender: data.id,
            //     body: data.body,
            //     sentAt: Date.now(),
            // };

            // sendMessage(parsedMessage);
        } catch (e) {
            console.error('Error passing message!', e);
        }
    });

    ws.on('close', (code, reason) => {
        // users.delete(userRef);
        console.log(`Connection closed: ${code} ${reason}!`);
    });
});
