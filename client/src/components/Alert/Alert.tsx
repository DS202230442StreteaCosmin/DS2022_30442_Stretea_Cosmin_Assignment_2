import React from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert: React.ForwardRefRenderFunction<HTMLDivElement, AlertProps> = (
    props,
    ref
) => {
    return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
};

export default React.forwardRef(Alert);
