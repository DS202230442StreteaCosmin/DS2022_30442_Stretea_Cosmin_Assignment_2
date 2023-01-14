import { TabContext, TabPanel } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import { Box, Tab } from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatContainer from '../../components/Chat/ChatContainer/ChatContainer';
import FloatingChatButton from '../../components/Chat/FloatingChatButton/FloatingChatButton';
import SearchBar from '../../components/SerchBar/SearchBar';
import { AppRoutes } from '../../router/AppRoutes';
import { UserRoles } from '../../services/user/model';
import {
    addChatMessage,
    ChatMessage,
    setChatMessages,
    setCurrentMessage,
    setWSConnection,
} from '../../store/general/generalSlice';
import { clearSearch } from '../../store/search/searchSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../../store/user/userSlice';

import Devices from './Devices/Devices';
import Mappings from './Mappings/Mappings';
import Users from './Users/Users';

const AdminDashboard = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const ws = useAppSelector((state) => state.generalState.wsConnection);
    const currentUser = useAppSelector((state) => state.userState.user);

    const currentMessage = useAppSelector(
        (state) => state.generalState.currentMessage
    );

    const [currentRoute, setCurrentRoute] = React.useState(
        '/admin-dashboard/users'
    );
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setCurrentRoute(newValue);
        navigate(newValue);
    };

    React.useEffect(() => {
        navigate('/admin-dashboard/users');
    }, []);
    React.useEffect(() => {
        if (Object.values(AppRoutes).indexOf(location.pathname) == -1) {
            setCurrentRoute('/admin-dashboard/users');
        }
    }, [location.pathname]);

    React.useEffect(() => {
        dispatch(clearSearch());
    }, [currentRoute]);

    // sending message function

    // const scrollTarget = useRef(null);

    // React.useEffect(() => {
    //     if (scrollTarget.current) {
    //         scrollTarget.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [messages.length]);

    return (
        <Box sx={{ position: 'relative', height: '100vh' }}>
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={currentRoute}>
                    <Box
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <TabList
                            onChange={handleChange}
                            aria-label='lab API tabs example'
                        >
                            <Tab label='Users' value='/admin-dashboard/users' />
                            <Tab
                                label='Devices'
                                value='/admin-dashboard/devices'
                            />
                            <Tab
                                label='Mappings'
                                value='/admin-dashboard/mappings'
                            />
                        </TabList>
                        <Box display='flex' alignItems='center'>
                            <SearchBar />
                        </Box>
                        <button onClick={() => dispatch(logout())}>
                            logout
                        </button>
                    </Box>
                    <TabPanel value='/admin-dashboard/users'>
                        <Users />
                    </TabPanel>
                    <TabPanel value='/admin-dashboard/devices'>
                        <Devices />
                    </TabPanel>
                    <TabPanel value='/admin-dashboard/mappings'>
                        <Mappings />
                    </TabPanel>
                </TabContext>
            </Box>
            <ChatContainer receiverRole={UserRoles.ADMIN} />
        </Box>
    );
};

export default AdminDashboard;
