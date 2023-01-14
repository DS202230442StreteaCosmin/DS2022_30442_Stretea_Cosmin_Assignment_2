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
    resetGeneralState,
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
    const currentUser = useAppSelector((state) => state.userState.user);

    const [isMessageEmpty, setIsMessageEmpty] = React.useState(true);

    const [isTyping, setIsTyping] = React.useState<string[]>([]);

    const shouldEnableTypingNotification = isTyping.find(
        (item) =>
            item ===
            (props.receiverRole === UserRoles.ADMIN
                ? currentChatUser?.id
                : currentUser?.id)
    );

    const msgContainerRef = React.useRef<HTMLDivElement>(null);

    const currentAdminClients = useAppSelector(
        (state) => state.generalState.adminClients
    );

    const dispatch = useAppDispatch();

    const chatMessages = useAppSelector(
        (state) => state.generalState.chatMessages
    );

    const currentMessage = useAppSelector(
        (state) => state.generalState.currentMessage
    );

    const ws = React.useRef<WebSocket | null>(null);

    const toggleTyping = (isTyping: boolean) => {
        if (ws.current) {
            const data =
                props.receiverRole === UserRoles.ADMIN
                    ? {
                          from: currentUser?.id,
                          to: currentChatUser?.id,
                      }
                    : {
                          from: currentUser?.id,
                          to: undefined,
                      };
            ws.current.send(
                parseData(
                    isTyping
                        ? WSMessageType.START_TYPING
                        : WSMessageType.END_TYPING,
                    data
                )
            );
        }
    };

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
            setIsMessageEmpty(true);
        }
    };

    const handleScrollTo = () => {
        if (msgContainerRef && msgContainerRef.current) {
            msgContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    React.useEffect(() => {
        if (!currentUser) return;
    }, [isTyping, currentUser]);

    React.useEffect(() => {
        if (!isMessageEmpty) {
            toggleTyping(true);
        } else {
            toggleTyping(false);
        }
    }, [isMessageEmpty]);

    React.useEffect(() => {
        if (shouldEnableTypingNotification) {
            handleScrollTo();
        }
    }, [shouldEnableTypingNotification]);

    React.useEffect(() => {
        console.log(currentUser);
        ws.current = new WebSocket(
            `ws://localhost:8080/${currentUser?.id ?? ''}/${
                currentUser?.email ?? ''
            }/${currentUser?.role ?? ''}`
        );

        ws.current.onopen = () => {
            console.log('Connection opened');
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
                    // setIsTyping(prev => prev.filter())
                    break;

                case WSMessageType.CLIENT_DISCONNECTED_FROM_ADMIN:
                    // setShowChat(false);
                    // setChatDisabled(true);
                    setShowConvo(false);

                    dispatch(removeFromAdminClient(parsed.data));
                    setIsTyping((prev) =>
                        prev.filter((item) => item !== parsed.data)
                    );
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

                    handleScrollTo();
                    break;

                case WSMessageType.START_TYPING:
                    const newData = parsed.data;

                    setIsTyping((prev) => [...prev, newData.id]);

                    break;
                case WSMessageType.END_TYPING:
                    const typeData = parsed.data;

                    setIsTyping((prev) =>
                        prev.filter((item) => item !== typeData.id)
                    );

                    break;

                default:
                    break;
            }
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
                dispatch(resetGeneralState());
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
                                        padding: '4px',
                                        position: 'relative',
                                    }}
                                >
                                    {(props.receiverRole === UserRoles.CLIENT
                                        ? chatMessages
                                        : currentAdminChat ?? []
                                    ).map((msg) => (
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
                                    ))}
                                    {shouldEnableTypingNotification && (
                                        <Box
                                            sx={{
                                                alignSelf: 'start',
                                                backgroundColor: '#bdbdbd',
                                                padding: '12px',
                                                borderRadius: 4,
                                                color: '#ffff',
                                                maxWidth: '50%',
                                                overflowWrap: 'break-word',
                                                fontWeight: '700',
                                            }}
                                        >
                                            typing...
                                        </Box>
                                    )}

                                    <Box ref={msgContainerRef} />
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
                                    onChange={(e) => {
                                        setIsMessageEmpty(
                                            e.target.value.length === 0
                                        );
                                        dispatch(
                                            setCurrentMessage(e.target.value)
                                        );
                                    }}
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
                                                    justifyContent: 'start',
                                                    gap: '12px',
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
                                                <Box
                                                    sx={{
                                                        fontWeight: '700',
                                                    }}
                                                >
                                                    {item.email}
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
