import { Avatar, Box, Button } from '@mui/material';
import React from 'react';
import FloatingChatButton from '../FloatingChatButton/FloatingChatButton';
import CloseIcon from '@mui/icons-material/Close';

const ChatContainer = () => {
    const [showChat, setShowChat] = React.useState(false);

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
                            top: 8,
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

                    <Box
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
                        <Box>mesaj bla bla bla</Box>
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
                </Box>
            ) : (
                <FloatingChatButton onClick={() => setShowChat(true)} />
            )}
        </Box>
    );
};

export default ChatContainer;
