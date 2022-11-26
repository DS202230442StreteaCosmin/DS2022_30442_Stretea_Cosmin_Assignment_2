import React from 'react';

import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    Typography,
} from '@mui/material';
import { useGetAllDevicesQuery } from '../../../../services/device/device';
import { Device } from '../../../../services/device/model';
import { useAddDeviceToUserMutation } from '../../../../services/user/user';

type Props = {
    isOpen: boolean;
    userId: string;
    userDevices?: Device[];
    onClose: () => void;
};

const getDifference = (array1: Device[], array2: Device[]) => {
    return array1.filter((object1) => {
        return !array2.some((object2) => {
            return object1.id === object2.id;
        });
    });
};

const MappingModal = (props: Props) => {
    const { data: devices, isFetching: areDevicesLoading } =
        useGetAllDevicesQuery(undefined);

    const availableDevices = getDifference(
        devices ?? [],
        props.userDevices ?? []
    );

    const [selectedDevice, setSelectedDevice] = React.useState<
        string | undefined
    >(undefined);

    const [addDeviceToUser] = useAddDeviceToUserMutation();

    const handleClose = () => {
        setSelectedDevice(undefined);
        props.onClose();
    };

    const handleSubmit = async () => {
        try {
            await addDeviceToUser({
                userId: props.userId,
                deviceId: selectedDevice!,
            });
            handleClose();
        } catch (error) {
            console.log(
                '🚀 ~ file: MappingModal.tsx ~ line 60 ~ handleSubmit ~ error',
                error
            );
        }
    };

    return (
        <Modal
            style={{
                display: 'flex',
                flexFlow: 'column wrap',
                justifyContent: 'center',
                alignContent: 'center',
            }}
            open={props.isOpen}
            onClose={handleClose}
        >
            <Box
                sx={{
                    maxWidth: '50%',
                    bgcolor: 'background.paper',
                    borderRadius: 2 / 1,
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Typography
                    sx={{ marginBottom: 2, width: '45vw' }}
                    variant='h3'
                    component='h2'
                >
                    Device
                </Typography>
                <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
                    <InputLabel id='demo-simple-select-label'>
                        Device
                    </InputLabel>
                    {!availableDevices ? (
                        <Box>Loading...</Box>
                    ) : (
                        <Select
                            labelId='demo-simple-select-label'
                            id='demo-simple-select'
                            value={selectedDevice}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                        >
                            {availableDevices.map((e) => (
                                <MenuItem value={e.id}>{e.name}</MenuItem>
                            ))}
                        </Select>
                    )}
                    <Button
                        disabled={!selectedDevice}
                        sx={{ marginTop: 2, textTransform: 'none' }}
                        variant='contained'
                        color='primary'
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </FormControl>
            </Box>
        </Modal>
    );
};

export default MappingModal;
