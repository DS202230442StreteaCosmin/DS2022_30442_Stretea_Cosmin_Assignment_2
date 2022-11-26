import React from 'react';
import { Navigate, Route, RouteProps } from 'react-router-dom';
import { useAppSelector } from '../store/store';
import { AppRoutes } from './AppRoutes';

type Props = {
    children: JSX.Element;
    redirectTo?: string;
};

const ProtectedRoute: React.FC<Props> = (props) => {
    const isLoggedIn = useAppSelector((state) => state.userState.isLoggedIn);

    return isLoggedIn ? (
        props.children
    ) : (
        <Navigate to={props.redirectTo ?? AppRoutes.LOGIN} />
    );
};

export default ProtectedRoute;
