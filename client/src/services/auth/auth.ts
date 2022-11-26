import { api } from '../../api/api';
import { setUser } from '../../store/user/userSlice';
import { IAuthTokenResponse, ILoginUser, IRegisterUser, IUser } from './model';

export const authSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<IAuthTokenResponse, ILoginUser>({
            query: (body) => ({
                url: `auth/login`,
                method: 'POST',
                body,
            }),
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { access_token } = (await queryFulfilled).data;
                    window.localStorage.setItem('access_token', access_token);
                    await dispatch(
                        authSlice.endpoints.getProfile.initiate(undefined, {
                            forceRefetch: true,
                        })
                    );
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        signup: builder.mutation<IAuthTokenResponse, IRegisterUser>({
            query: (body) => ({
                url: `auth/signup`,
                method: 'POST',
                body,
            }),
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { access_token } = (await queryFulfilled).data;
                    window.localStorage.setItem('access_token', access_token);
                    await dispatch(
                        authSlice.endpoints.getProfile.initiate(undefined, {
                            forceRefetch: true,
                        })
                    );
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        getProfile: builder.query<IUser, undefined>({
            query: () => ({
                url: 'auth/profile',
            }),
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
    }),
});

export const { useGetProfileQuery, useLoginMutation, useSignupMutation } =
    authSlice;
