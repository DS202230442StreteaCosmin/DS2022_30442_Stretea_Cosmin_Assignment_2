import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { Box, Button } from '@mui/material';

interface Props {
    onClick: () => void;
    disabled?: boolean;
}

const FloatingChatButton = (props: Props) => {
    return (
        <Button
            disabled={props.disabled}
            sx={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                boxShadow: '0 0 50px rgba(0,0,0,0.4)',
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 60,
                height: 60,
                borderRadius: 8,
            }}
            onClick={props.onClick}
        >
            <QuestionAnswerIcon />
            {/* <Box
                sx={{
                    backgroundColor: 'red',
                    color: '#fff',
                    fontSize: 12,
                    position: 'absolute',
                    right: 4,
                    top: 0,
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                }}
            >
                12
            </Box> */}
        </Button>
    );
};

export default FloatingChatButton;
