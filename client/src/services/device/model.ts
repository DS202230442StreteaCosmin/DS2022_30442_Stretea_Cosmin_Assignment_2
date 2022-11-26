export enum UserRoles {
    ADMIN = 'admin',
    CLIENT = 'client',
}

export interface IAuthTokenResponse {
    access_token: string;
}

export interface IUser {
    name: string;
    email: string;
    role: UserRoles;
    id: string;
}

export interface ILoginUser {
    email: string;
    password: string;
}

export interface Device {
    id: string;
    description: string;
    name: string;
    address: string;
    maxHourlyConsumption: number;
    consumptions?: Consumption[];
}

export interface CreateDevice {
    id?: string;
    description: string;
    name: string;
    address: string;
    maxHourlyConsumption: number;
}

export interface IRegisterUser extends ILoginUser {
    name: string;
}

export interface Consumption {
    id: string;
    timestamp: Date;
    value: number;
    device: Device;
}
