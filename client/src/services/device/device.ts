import { api } from '../../api/api';
import { Consumption, CreateDevice, Device } from './model';

export const deviceSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        deviceConsumptions: builder.query<
            Consumption[],
            { id: string; startDate: string; endDate: string }
        >({
            query: ({ id, startDate, endDate }) => ({
                url: `devices/consumption/${id}?startDate=${startDate}&endDate=${endDate}`,
                method: 'GET',
            }),
        }),
        getAllDevices: builder.query<Device[], undefined>({
            query: () => ({
                url: `/devices`,
            }),
            providesTags: ['Devices'],
        }),
        createDevice: builder.mutation<Device, CreateDevice>({
            query: (body) => ({
                url: `/devices`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Devices'],
        }),
        updateDevice: builder.mutation<Device, CreateDevice>({
            query: (args) => ({
                url: `/devices/${args.id}`,
                method: 'PUT',
                body: Object.assign({}, { ...args }, { id: undefined }),
            }),
            invalidatesTags: ['Devices'],
        }),
        deleteDevice: builder.mutation<Device, string>({
            query: (id) => ({
                url: `/devices/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Devices'],
        }),
    }),
});

export const {
    useDeviceConsumptionsQuery,
    useLazyDeviceConsumptionsQuery,
    useGetAllDevicesQuery,
    useUpdateDeviceMutation,
    useCreateDeviceMutation,
    useDeleteDeviceMutation,
} = deviceSlice;
