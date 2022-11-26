import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import React from 'react';
import {
    useCreateDeviceMutation,
    useUpdateDeviceMutation,
} from '../../../../services/device/device';
import { Device } from '../../../../services/device/model';

type Props = {
    isOpen: boolean;
    device?: Device;
    onClose: () => void;
};

const DeviceModal = (props: Props) => {
    const [error, setError] = React.useState(false);

    const [name, setName] = React.useState(props.device?.name ?? '');
    const [description, setDescription] = React.useState(
        props.device?.description ?? ''
    );
    const [address, setAddress] = React.useState(props.device?.address ?? '');
    const [maxConsumption, setMaxConsumption] = React.useState(
        props.device?.maxHourlyConsumption ?? 0
    );

    const [createDevice, { isLoading: isUserCreateLoading }] =
        useCreateDeviceMutation();

    const [updateDevice, { isLoading: isUserUpdateLoading }] =
        useUpdateDeviceMutation();

    const handleSubmitAction = async () => {
        try {
            if (props.device) {
                await updateDevice({
                    name: name,
                    address: address,
                    maxHourlyConsumption: maxConsumption,
                    description: description,
                    id: props.device.id,
                });
            } else {
                await createDevice({
                    name: name,
                    address: address,
                    maxHourlyConsumption: maxConsumption,
                    description: description,
                });
            }
            clearInputs();
            props.onClose();
        } catch (error) {}
    };

    const clearInputs = () => {
        setName(props.device?.name ?? '');
        setDescription(props.device?.description ?? '');
        setAddress(props.device?.address ?? '');
        setMaxConsumption(props.device?.maxHourlyConsumption ?? 0);
        setError(false);
    };

    const handleClose = () => {
        props.onClose();
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

                <TextField
                    sx={{ marginBottom: 2, marginTop: 2 }}
                    label='Name'
                    variant='outlined'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    sx={{ marginBottom: 2, marginTop: 2 }}
                    label='Description'
                    variant='outlined'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    sx={{ marginBottom: 2, marginTop: 2 }}
                    label='Address'
                    variant='outlined'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <TextField
                    sx={{ marginBottom: 2, marginTop: 2 }}
                    label='Max hourly consumption'
                    variant='outlined'
                    value={maxConsumption}
                    onChange={(e) => setMaxConsumption(+e.target.value)}
                />

                {error && (
                    <Alert severity='error'>
                        Invalid input data. Please check it again!
                    </Alert>
                )}
                <Button
                    sx={{ marginTop: 2, textTransform: 'none' }}
                    variant='contained'
                    color='primary'
                    onClick={handleSubmitAction}
                >
                    Submit
                </Button>
            </Box>
        </Modal>
    );
};

export default DeviceModal;
