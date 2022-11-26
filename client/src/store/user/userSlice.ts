import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../services/auth/model';

interface IUserState {
    user: IUser | undefined;
    isLoggedIn: boolean;
}

const initialState: IUserState = {
    user: undefined,
    isLoggedIn: false,
};

export const userSlice = createSlice({
    initialState,
    name: 'userSlice',
    reducers: {
        logout: () => {
            window.localStorage.removeItem('access_token');
            return initialState;
        },
        setUser: (state, action: PayloadAction<IUser>) => {
            state.user = action.payload;
            state.isLoggedIn = true;
        },
    },
});

export const userReducer = userSlice.reducer;

export const { logout, setUser } = userSlice.actions;
