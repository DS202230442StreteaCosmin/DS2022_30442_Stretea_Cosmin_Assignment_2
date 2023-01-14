export enum WSMessageType {
    CONNECT = 'CONNECT',
    MESSAGE = 'MESSAGE',
    DISCONNECT = 'DISCONNECT',
    ADMINS_NOT_AVAILABLE = 'ADMINS_NOT_AVAILABLE',
    NEW_CLIENT_ASSIGNED = 'NEW_CLIENT_ASSIGNED',
    ADMIN_DISCONNECTED_FROM_CLIENT = 'ADMIN_DISCONNECTED_FROM_CLIENT',
    CLIENT_DISCONNECTED_FROM_ADMIN = 'CLIENT_DISCONNECTED_FROM_ADMIN',
    START_TYPING = 'START_TYPING',
    END_TYPING = 'END_TYPING',
}

export interface WSData<T> {
    type: WSMessageType;
    data?: T;
}

export const parseData: <T>(type: WSMessageType, data?: T) => string = (
    type,
    data
) => {
    return JSON.stringify({ type: type, data: data });
};
