import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import React from 'react';
import { CreateUserByAdmin } from '../../../../services/user/model';
import {
    useCreateUserMutation,
    useUpdateUserMutation,
} from '../../../../services/user/user';

type Props = {
    isOpen: boolean;
    user?: CreateUserByAdmin;
    onClose: () => void;
};

const UserModal = (props: Props) => {
    const [name, setName] = React.useState(props.user?.name ?? '');
    const [email, setEmail] = React.useState(props.user?.email ?? '');
    const [error, setError] = React.useState(false);

    const [createUser, { isLoading: isUserCreateLoading }] =
        useCreateUserMutation();

    const [updateUser, { isLoading: isUserUpdateLoading }] =
        useUpdateUserMutation();

    const handleSubmitAction = async () => {
        try {
            if (props.user) {
                await updateUser({
                    name: name,
                    email: email,
                    id: props.user.id,
                });
            } else {
                await createUser({ name: name, email: email });
            }
            clearInputs();
            props.onClose();
        } catch (error) {}
    };

    const clearInputs = () => {
        setName(props.user?.name ?? '');
        setEmail(props.user?.email ?? '');
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
                    User
                </Typography>

                <TextField
                    sx={{ marginBottom: 2, marginTop: 2 }}
                    label='Email'
                    variant='outlined'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    sx={{ marginBottom: 2, marginTop: 2 }}
                    label='Name'
                    variant='outlined'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

export default UserModal;
