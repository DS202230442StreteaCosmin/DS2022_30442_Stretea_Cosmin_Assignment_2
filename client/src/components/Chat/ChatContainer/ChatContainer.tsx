import {
    Avatar,
    Box,
    Button,
    ClickAwayListener,
    IconButton,
    TextField,
} from '@mui/material';
import React from 'react';
import FloatingChatButton from '../FloatingChatButton/FloatingChatButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import './Style.css';

const messages = [
    {
        text: 'abcdasdadsfgsdfgsdfgsdfgsdfgsdfgsdfgsdfgdsfgsdfgsdfgsdfgsdfgsdfgsdfgsdfgsdfgsdfsdas',
        id: 1,
    },
    {
        text: 'pmpomrgpomweorgm',
        id: 2,
    },
    {
        text: 'dutenplma',
        id: 3,
    },
    {
        text: 'hai la pepeeeenoi',
        id: 4,
    },
    {
        text: 'vind audi',
        id: 5,
    },
    {
        text: 'dutenplma',
        id: 6,
    },
    {
        text: 'hai la pepeeeenoi',
        id: 7,
    },
    {
        text: 'vind audi',
        id: 8,
    },
];

const ChatContainer = () => {
    const [showChat, setShowChat] = React.useState(false);
    const [showConvo, setShowConvo] = React.useState(false);

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
                                    onClick={() =>
                                        setShowConvo((prev) => !prev)
                                    }
                                >
                                    <ArrowBackIcon />
                                </IconButton>

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
                                    {messages.map((msg) => (
                                        // <Box sx={{ width: '360px' }}>
                                        <Box
                                            sx={{
                                                alignSelf:
                                                    msg.id % 2
                                                        ? 'start'
                                                        : 'end',

                                                backgroundColor:
                                                    msg.id % 2
                                                        ? '#6699cc'
                                                        : '#bdbdbd',
                                                padding: '12px',
                                                borderRadius: 4,
                                                color: '#ffff',
                                                maxWidth: '50%',
                                                overflowWrap: 'break-word',
                                            }}
                                        >
                                            {msg.text}
                                        </Box>
                                        // </Box>
                                    ))}
                                </Box>

                                <TextField
                                    fullWidth
                                    sx={{
                                        // position: 'absolute',
                                        // bottom: '8px',
                                        // margin: '0 auto',
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
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                sx={{ color: '#6699cc' }}
                                            >
                                                <SendIcon />
                                            </IconButton>
                                        ),
                                    }}
                                />
                            </>
                        )}

                        {!showConvo && (
                            <Box
                                onClick={() => setShowConvo((prev) => !prev)}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    '&:hover': {
                                        backgroundColor: '#E0E0E0',
                                        cursor: 'pointer',
                                    },
                                }}
                            >
                                <Avatar />
                                <Box>
                                    <Box sx={{ fontWeight: '700' }}>
                                        Nume Complet
                                    </Box>
                                    <Box>mesaje bla bla bla</Box>
                                </Box>
                                <Box
                                    sx={{
                                        backgroundColor: 'red',
                                        color: '#fff',
                                        fontSize: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                    }}
                                >
                                    12
                                </Box>
                            </Box>
                        )}
                    </Box>
                </ClickAwayListener>
            ) : (
                <FloatingChatButton onClick={() => setShowChat(true)} />
            )}
        </Box>
    );
};

export default ChatContainer;
