import { Box, Snackbar, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { Bar, BarChart, Cell, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useLazyDeviceConsumptionsQuery } from '../../services/device/device';
import { Consumption, Device } from '../../services/device/model';
import { useUserDevicesQuery } from '../../services/user/user';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../../store/user/userSlice';
import Alert from '../../components/Alert/Alert';
// import { websocket as W3CWebSocket } from 'websocket';

// const client = new W3CWebSocket('ws://127.0.0.1:8111');

const CustomerDashboard = () => {
    const currentUser = useAppSelector((state) => state.userState.user);
    const clientRef = React.useRef<WebSocket | null>(null);
    const [showAlert, setShowAlert] = React.useState(false);
    const currentAlertDevice = React.useRef<any>(null);
    const devicesAlertIds = React.useRef<string[]>([]);
    console.log(
        '🚀 ~ file: CustomerDashboard.tsx ~ line 26 ~ CustomerDashboard ~ devicesAlertIds',
        devicesAlertIds
    );

    const [dateInterval, setDateInterval] = React.useState<
        { start: string; end: string } | undefined
    >(undefined);
    const [currentDevice, setCurrentDevice] = React.useState<
        Device | undefined
    >(undefined);
    const { data: userDevices, isFetching: areDevicesFetching } =
        useUserDevicesQuery(currentUser?.id ?? '');
    const [
        triggerDeviceConsumptions,
        { data: deviceConsumptions, isFetching: areConsumptionsFetching },
    ] = useLazyDeviceConsumptionsQuery({ pollingInterval: 5000 });

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [date, setDate] = React.useState<Dayjs | null>(null);

    React.useEffect(() => {
        if (!date) {
            return;
        }

        const interval = {
            start: new Date(dayjs(date).format('YYYY-MM-DD')).toISOString(),
            end: new Date(
                dayjs(date).add(1, 'day').format('YYYY-MM-DD')
            ).toISOString(),
        };
        setDateInterval(interval);
    }, [date]);

    React.useEffect(() => {
        if (!currentDevice || !dateInterval) {
            return;
        }

        triggerDeviceConsumptions({
            id: currentDevice.id,
            startDate: dateInterval.start,
            endDate: dateInterval.end,
        });

        getChartDataFromConsumptions([]);
    }, [currentDevice, dateInterval]);

    React.useEffect(() => {
        if (!currentDevice) {
            return;
        }

        clientRef.current = new WebSocket(
            'ws://localhost:8111/' + currentDevice.id
        );

        clientRef.current.onopen = () => {
            console.log('WebSocket Client Connected');
        };

        clientRef.current.onmessage = (message: any) => {
            console.log(message);
            const data = JSON.parse(message.data);

            if (devicesAlertIds.current.indexOf(data.deviceId) < 0) {
                devicesAlertIds.current.push(data.deviceId);
                currentAlertDevice.current = data;
                setShowAlert(true);
            }
        };
    }, [currentDevice]);

    const getChartDataFromConsumptions = (consumptions: Consumption[]) => {
        let hourDataMapping = new Map<string, number>();
        let chartDataArr: { consumption: number; hour: string }[] = [];

        const chartXKeys = Array.from(Array(24).keys()).map(
            (hour) => `${hour.toString().padStart(2, '0')}:00`
        );
        chartXKeys.forEach((key) => hourDataMapping.set(key, 0));

        consumptions.forEach((consumption) => {
            const parsedTimeKey =
                new Date(consumption.timestamp)
                    .toLocaleTimeString('en', {
                        timeStyle: 'short',
                        hour12: false,
                        timeZone: 'UTC',
                    })
                    .slice(0, -2) + '00';
            hourDataMapping.set(parsedTimeKey, consumption.value);
        });

        hourDataMapping.forEach((value, key) =>
            chartDataArr.push({ consumption: value, hour: key })
        );

        return chartDataArr;
    };

    return (
        <>
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <Box
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 2,
                    }}
                >
                    <Autocomplete
                        disabled={areDevicesFetching || !!!userDevices}
                        disablePortal
                        id='combo-box-demo'
                        options={userDevices ?? []}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                            <TextField {...params} label={'Device'} />
                        )}
                        value={currentDevice}
                        getOptionLabel={(option) => option.name}
                        onChange={(_event: any, newValue: Device | null) => {
                            setCurrentDevice(newValue ?? undefined);
                        }}
                    />

                    <DatePicker
                        label='Pick a date'
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <button onClick={() => dispatch(logout())}>logout</button>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        paddingTop: 4,
                    }}
                >
                    {deviceConsumptions === undefined ? (
                        <Box> Select a device and pick a date</Box>
                    ) : deviceConsumptions.length === 0 ? (
                        <Box>No data available for this date</Box>
                    ) : (
                        <BarChart
                            width={1000}
                            height={600}
                            data={getChartDataFromConsumptions(
                                deviceConsumptions
                            )}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <XAxis dataKey='hour' />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey='consumption' fill='#8884d8'>
                                {getChartDataFromConsumptions(
                                    deviceConsumptions
                                ).map((e) => (
                                    <Cell
                                        key={e.hour}
                                        fill={
                                            currentDevice &&
                                            e.consumption >
                                                currentDevice.maxHourlyConsumption
                                                ? '#ff0000'
                                                : '#8884d8'
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </Box>
            </Box>
            <Snackbar
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'top',
                }}
                open={showAlert}
                onClose={() => setShowAlert(false)}
            >
                <Alert
                    onClose={() => setShowAlert(false)}
                    severity='error'
                    sx={{ width: '100%' }}
                >
                    {`Device ${currentAlertDevice.current?.deviceName} has exceeded the maximum hourly consumption! Current consumption: ${currentAlertDevice.current?.currentConsumptionValue} kW`}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CustomerDashboard;
