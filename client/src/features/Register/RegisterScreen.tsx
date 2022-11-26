import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
    Avatar,
    Box,
    Button,
    CssBaseline,
    Grid,
    Link,
    TextField,
    Typography,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import React from 'react';
import { Link as RouteLink, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../router/AppRoutes';
import {
    useGetProfileQuery,
    useSignupMutation,
} from '../../services/auth/auth';
import { IRegisterUser, UserRoles } from '../../services/auth/model';
import { useAppSelector } from '../../store/store';
import Snackbar from '@mui/material/Snackbar';
import Alert from '../../components/Alert/Alert';

const RegisterScreen = () => {
    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorAlert, setErrorAlert] = React.useState(false);

    const navigate = useNavigate();

    const currentUser = useAppSelector((state) => state.userState.user);
    const { data: profile, isFetching } = useGetProfileQuery(undefined);

    const [signup, { isLoading, isError }] = useSignupMutation();

    const handleSignUp = async () => {
        try {
            const bodyData: IRegisterUser = {
                name: name,
                email: email,
                password: password,
            };

            await signup(bodyData).unwrap();
        } catch (error) {}
    };

    React.useEffect(() => {
        if (!currentUser) {
            return;
        }

        if (currentUser.role === UserRoles.ADMIN) {
            navigate(AppRoutes.ADMIN_DASHBOARD);
        } else {
            navigate(AppRoutes.DASHBOARD);
        }
    }, [currentUser, profile]);

    return (
        <Grid container component='main' sx={{ height: '100vh' }}>
            <Snackbar
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'top',
                }}
                open={errorAlert}
                autoHideDuration={6000}
                onClose={() => setErrorAlert(false)}
            >
                <Alert
                    onClose={() => setErrorAlert(false)}
                    severity='error'
                    sx={{ width: '100%' }}
                >
                    Invalid inputs!
                </Alert>
            </Snackbar>
            <CssBaseline />
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#ec43ec',
                    filter: 'grayscale(80%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <Grid
                item
                xs={12}
                sm={8}
                md={5}
                component={Paper}
                elevation={6}
                square
            >
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component='h1' variant='h5'>
                        Register
                    </Typography>
                    <Box
                        component='form'
                        noValidate
                        onSubmit={() => {}}
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            margin='normal'
                            required
                            fullWidth
                            id='name'
                            label='Name'
                            name='name'
                            autoComplete='name'
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            margin='normal'
                            required
                            fullWidth
                            id='email'
                            label='Email Address'
                            name='email'
                            autoComplete='email'
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <TextField
                            margin='normal'
                            required
                            fullWidth
                            name='password'
                            label='Password'
                            type='password'
                            id='password'
                            autoComplete='current-password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            type='submit'
                            fullWidth
                            variant='contained'
                            sx={{ mt: 3, mb: 2 }}
                            onClick={(e) => {
                                e.preventDefault();
                                handleSignUp();
                            }}
                        >
                            Register
                        </Button>

                        <Grid container>
                            <Grid item>
                                <RouteLink to='/login'>
                                    {'Already have an account? Log in!'}
                                </RouteLink>
                            </Grid>
                        </Grid>
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            align='center'
                        >
                            {'Copyright © '}
                            <Link color='inherit' href='https://mui.com/'>
                                Your Website
                            </Link>{' '}
                            {new Date().getFullYear()}
                            {'.'}
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default RegisterScreen;
