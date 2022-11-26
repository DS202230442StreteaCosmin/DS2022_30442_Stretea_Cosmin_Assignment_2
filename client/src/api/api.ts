// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import type { Pokemon } from './types';

// Define a service using a base URL and expected endpoints

const customBaseQuery = fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers: Headers) => {
        const token = window.localStorage.getItem('access_token') || '';

        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');

        return headers;
    },
});

export const api = createApi({
    reducerPath: 'api',
    baseQuery: customBaseQuery,
    tagTypes: ['Devices', 'Users', 'Auth', 'UserDevices'],
    endpoints: () => ({}),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
