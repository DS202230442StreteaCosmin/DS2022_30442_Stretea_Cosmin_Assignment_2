export const AppRoutes = {
    BASE: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ADMIN_DASHBOARD: '/admin-dashboard',
    ADMIN_DASHBOARD_USERS: '/admin-dashboard/users',
    ADMIN_DASHBOARD_DEVICES: '/admin-dashboard/devices',
    ADMIN_DASHBOARD_MAPPINGS: '/admin-dashboard/mappings',

    DASHBOARD: '/dashboard',
    NOT_FOUND: '/not-found',
};

export const AdminNestedRoutes = [
    AppRoutes.ADMIN_DASHBOARD_USERS.split('/')[2],
    AppRoutes.ADMIN_DASHBOARD_DEVICES.split('/')[2],
    AppRoutes.ADMIN_DASHBOARD_MAPPINGS.split('/')[2],
];
