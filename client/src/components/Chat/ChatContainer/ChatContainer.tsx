import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import {
    Avatar,
    Box,
    Button,
    ClickAwayListener,
    IconButton,
    TextField,
} from '@mui/material';
import React from 'react';
import uuid from 'react-uuid';
import { UserRoles } from '../../../services/device/model';
import {
    addAdminChatMessage,
    addAdminClient,
    addChatMessage,
    ChatMessage,
    ChatUser,
    removeFromAdminClient,
    setChatMessages,
    setCurrentMessage,
} from '../../../store/general/generalSlice';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import FloatingChatButton from '../FloatingChatButton/FloatingChatButton';
import { parseData, WSMessageType } from '../utils';
import './Style.css';

export interface ChatProps {
    receiverRole: UserRoles;
}

const ChatContainer = (props: ChatProps) => {
    const [currentChatUser, setCurrentChatUser] =
        React.useState<ChatUser | null>(null);

    const currentAdminChat = useAppSelector(
        (state) =>
            state.generalState.adminChat.find(
                (item) => item.client.id === currentChatUser?.id
            )?.messages
    );
    const [chatDisabled, setChatDisabled] = React.useState(false);
    const [showChat, setShowChat] = React.useState(false);
    const [showConvo, setShowConvo] = React.useState(
        props.receiverRole === UserRoles.ADMIN ? false : true
    );

    const currentAdminClients = useAppSelector(
        (state) => state.generalState.adminClients
    );

    const currentUser = useAppSelector((state) => state.userState.user);

    const dispatch = useAppDispatch();

    const chatMessages = useAppSelector(
        (state) => state.generalState.chatMessages
    );

    const currentMessage = useAppSelector(
        (state) => state.generalState.currentMessage
    );

    const ws = React.useRef<WebSocket | null>(null);

    const sendMessage = () => {
        if (currentMessage && ws.current) {
            const newMessage: ChatMessage = {
                id: currentUser?.id ?? '',
                role: props.receiverRole,
                message: currentMessage,
            };
            ws.current.send(
                parseData(WSMessageType.MESSAGE, {
                    ...newMessage,
                    clientId: currentChatUser?.id,
                })
            );
            dispatch(setCurrentMessage(''));
        }
    };

    React.useEffect(() => {
        console.log(currentUser);
        ws.current = new WebSocket(
            `ws://localhost:8080/${currentUser?.id ?? ''}/${
                currentUser?.email ?? ''
            }/${currentUser?.role ?? ''}`
        );

        ws.current.onopen = () => {
            console.log('Connection opened');

            // ws.current?.send(
            //     parseData(WSMessageType.CONNECT, {
            //         id: currentUser?.id ?? '',
            //         name: currentUser?.name ?? '',
            //         role: currentUser?.role ?? '',
            //     })
            // );
            // setConnectionOpen(true);
        };

        ws.current.onmessage = (event) => {
            const parsed = JSON.parse(event.data);

            switch (parsed.type) {
                case WSMessageType.ADMINS_NOT_AVAILABLE:
                    setShowChat(false);
                    setChatDisabled(true);
                    break;

                case WSMessageType.ADMIN_DISCONNECTED_FROM_CLIENT:
                    setShowChat(false);
                    setChatDisabled(true);
                    dispatch(setChatMessages([]));
                    break;

                case WSMessageType.CLIENT_DISCONNECTED_FROM_ADMIN:
                    // setShowChat(false);
                    // setChatDisabled(true);
                    setShowConvo(false);

                    dispatch(removeFromAdminClient(parsed.data));
                    break;

                case WSMessageType.NEW_CLIENT_ASSIGNED:
                    const data = parsed.data;

                    dispatch(addAdminClient(data));

                    // setChatDisabled(true);
                    break;

                case WSMessageType.MESSAGE:
                    const chatData = parsed.data;

                    if (props.receiverRole === UserRoles.ADMIN) {
                        const { clientId, ...chat } = chatData;
                        console.log(
                            '🚀 ~ file: ChatContainer.tsx:142 ~ React.useEffect ~ chatData',
                            chatData
                        );
                        dispatch(
                            addAdminChatMessage({
                                clientId: clientId ?? chat.id,
                                chat: chat,
                            })
                        );
                    } else {
                        dispatch(addChatMessage(chatData));
                    }
                    break;

                default:
                    break;
            }

            // dispatch(addChatMessage(data));

            // setMessages((_messages) => [..._messages, data]);
        };

        return () => {
            console.log('Cleaning up...');
            if (ws.current) {
                ws.current.send(
                    parseData(WSMessageType.DISCONNECT, {
                        id: currentUser?.id ?? '',
                        role: currentUser?.role ?? '',
                    })
                );
                ws.current.close();
                ws.current = null;
            }
        };
    }, []);

    return (
        <Box
            sx={{
                position: 'absolute',
                right: 64,
                bottom: 64,
                width: 60,
                height: 60,
                borderRadius: 8,
            }}
        >
            {showChat ? (
                <ClickAwayListener onClickAway={() => setShowChat(false)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            backgroundColor: '#fefefe',
                            boxShadow: '0 0 20px rgba(0,0,0,0.4)',
                            width: 360,
                            height: 432,
                            borderRadius: 8,
                            padding: ' 48px 20px 20px 20px',
                        }}
                    >
                        <Button
                            sx={{
                                position: 'absolute',
                                right: 12,
                                top: 12,
                                backgroundColor: '#fefefe',
                                borderRadius: 8,
                                width: '36px',
                                height: '36px',
                                '&.MuiButton-root': {
                                    minWidth: 0,
                                    padding: 0,
                                },
                            }}
                            onClick={() => setShowChat(false)}
                        >
                            <CloseIcon />
                        </Button>

                        {showConvo && (
                            <>
                                {props.receiverRole === UserRoles.ADMIN && (
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            left: 12,
                                            top: 12,
                                            backgroundColor: '#fefefe',
                                            borderRadius: 8,
                                            width: '36px',
                                            height: '36px',
                                            '&.MuiButton-root': {
                                                minWidth: 0,
                                                padding: 0,
                                            },
                                        }}
                                        onClick={() => {
                                            setCurrentChatUser(null);

                                            setShowConvo((prev) => !prev);
                                        }}
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                )}

                                <Box
                                    sx={{
                                        fontWeight: '700',
                                        position: 'absolute',
                                        left: 60,
                                        top: 18,
                                    }}
                                >
                                    {currentChatUser?.email ?? ''}
                                </Box>

                                <Box
                                    sx={{
                                        width: '360px',
                                        height: 'calc(100% - 48px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        overflowY: 'auto',
                                        // overflowX: 'hidden',
                                        padding: '4px',
                                        position: 'relative',
                                    }}
                                >
                                    {(props.receiverRole === UserRoles.CLIENT
                                        ? chatMessages
                                        : currentAdminChat ?? []
                                    ).map((msg) => (
                                        // <Box sx={{ width: '360px' }}>
                                        <Box
                                            key={uuid()}
                                            sx={{
                                                alignSelf:
                                                    props.receiverRole ===
                                                    msg.role
                                                        ? 'end'
                                                        : 'start',

                                                backgroundColor:
                                                    props.receiverRole ===
                                                    msg.role
                                                        ? '#6699cc'
                                                        : '#bdbdbd',
                                                padding: '12px',
                                                borderRadius: 4,
                                                color: '#ffff',
                                                maxWidth: '50%',
                                                overflowWrap: 'break-word',
                                            }}
                                        >
                                            {msg.message}
                                        </Box>
                                        // </Box>
                                    ))}
                                </Box>

                                <TextField
                                    fullWidth
                                    sx={{
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                        width: '100%',
                                        justifySelf: 'center',
                                        alignSelf: 'center',
                                        color: '#6699cc',
                                        '& .MuiInput-root::after': {
                                            borderBottom: '2px solid #6699cc',
                                        },
                                    }}
                                    id='standard-size-normal'
                                    variant='standard'
                                    placeholder='message...'
                                    value={currentMessage}
                                    onChange={(e) =>
                                        dispatch(
                                            setCurrentMessage(e.target.value)
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            sendMessage();
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                onClick={sendMessage}
                                                sx={{ color: '#6699cc' }}
                                            >
                                                <SendIcon />
                                            </IconButton>
                                        ),
                                    }}
                                />
                            </>
                        )}

                        {!showConvo &&
                            props.receiverRole === UserRoles.ADMIN && (
                                <>
                                    {!currentAdminClients.length ? (
                                        <Box>No clients available</Box>
                                    ) : (
                                        currentAdminClients.map((item) => (
                                            <Box
                                                key={item.id}
                                                onClick={() => {
                                                    setCurrentChatUser(item);
                                                    setShowConvo(
                                                        (prev) => !prev
                                                    );
                                                }}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    borderRadius: 8,
                                                    '&:hover': {
                                                        backgroundColor:
                                                            '#E0E0E0',
                                                        cursor: 'pointer',
                                                    },
                                                }}
                                            >
                                                <Avatar />
                                                <Box>
                                                    <Box
                                                        sx={{
                                                            fontWeight: '700',
                                                        }}
                                                    >
                                                        {item.email}
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        backgroundColor: 'red',
                                                        color: '#fff',
                                                        fontSize: 12,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                    }}
                                                >
                                                    12
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </>
                            )}
                    </Box>
                </ClickAwayListener>
            ) : (
                <FloatingChatButton
                    disabled={chatDisabled}
                    onClick={() => setShowChat(true)}
                />
            )}
        </Box>
    );
};

export default ChatContainer;
