import React from 'react';
import { Route } from 'react-router-dom';
import { UserRoles } from '../services/auth/model';
import { useAppSelector } from '../store/store';
import { AppRoutes } from './AppRoutes';
import ProtectedRoute from './ProtectedRoute';

type Props = {
    children: JSX.Element;
};

const AdminRoute: React.FC<Props> = (props) => {
    const isAdmin = useAppSelector(
        (state) => state.userState.user?.role === UserRoles.ADMIN
    );

    return isAdmin ? (
        props.children
    ) : (
        <ProtectedRoute
            children={props.children}
            redirectTo={AppRoutes.DASHBOARD}
        />
    );
};

export default AdminRoute;
