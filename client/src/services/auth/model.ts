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

export interface IRegisterUser extends ILoginUser {
    name: string;
}
