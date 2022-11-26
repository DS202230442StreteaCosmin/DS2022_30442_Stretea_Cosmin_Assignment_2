import { Box, Button } from '@mui/material';
import React from 'react';

import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import DeleteIcon from '@mui/icons-material/Delete';
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { IUser } from '../../../services/auth/model';
import {
    useGetAllUsersQuery,
    useRemoveDeviceFromUserMutation,
    useUserDevicesQuery,
} from '../../../services/user/user';
import MappingModal from './MappingModal/MappingModal';
import { useAppSelector } from '../../../store/store';
import { Device } from '../../../services/device/model';

const Mappings = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState<IUser | undefined>(
        undefined
    );
    const { data: users, isFetching: areUsersLoading } =
        useGetAllUsersQuery(undefined);

    const { data: userDevices, isFetching: areUserDevicesLoading } =
        useUserDevicesQuery(currentUser?.id ?? '');

    const [removeDeviceFromUser] = useRemoveDeviceFromUserMutation();

    const [filteredData, setFilteredData] = React.useState<Device[]>([]);

    const searchCriteria = useAppSelector(
        (state) => state.searchState.searchCriteria
    );

    React.useEffect(() => {
        if (!searchCriteria || !userDevices) {
            setFilteredData([]);
            return;
        }

        setFilteredData(getFilteredData());
    }, [searchCriteria, userDevices]);

    const getFilteredData = () => {
        return userDevices!.filter(
            (e) =>
                e.name.indexOf(searchCriteria) >= 0 ||
                e.description.indexOf(searchCriteria) >= 0 ||
                e.id.indexOf(searchCriteria) >= 0 ||
                e.maxHourlyConsumption.toString().indexOf(searchCriteria) >=
                    0 ||
                e.address.indexOf(searchCriteria) >= 0
        );
    };

    return (
        <>
            <Box>
                <Autocomplete
                    disabled={!users}
                    disablePortal
                    id='combo-box-demo'
                    options={users ?? []}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField {...params} label={'User'} />
                    )}
                    value={currentUser}
                    getOptionLabel={(option) => option.name}
                    onChange={(_event: any, newValue: IUser | null) => {
                        setCurrentUser(newValue ?? undefined);
                    }}
                />
                <Button
                    disabled={!currentUser}
                    size='large'
                    sx={{ marginBottom: 2, border: '1px solid grey' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    Add device to selected user
                </Button>
            </Box>

            {!userDevices || !currentUser?.id ? (
                <Box>Please select an user</Box>
            ) : !userDevices.length ? (
                <Box>No devices available</Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Id</TableCell>
                                <TableCell align='right'>Name</TableCell>
                                <TableCell align='right'>Descritpion</TableCell>
                                <TableCell align='right'>Address</TableCell>
                                <TableCell align='right'>
                                    Max Hourly Consumption
                                </TableCell>
                                <TableCell align='right'>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(searchCriteria ? filteredData : userDevices).map(
                                (row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{
                                            '&:last-child td, &:last-child th':
                                                {
                                                    border: 0,
                                                },
                                        }}
                                    >
                                        <TableCell component='th' scope='row'>
                                            {row.id}
                                        </TableCell>
                                        <TableCell align='right'>
                                            {row.name}
                                        </TableCell>
                                        <TableCell align='right'>
                                            {row.description}
                                        </TableCell>
                                        <TableCell align='right'>
                                            {row.address}
                                        </TableCell>
                                        <TableCell align='right'>
                                            {row.maxHourlyConsumption}
                                        </TableCell>
                                        <TableCell align='right'>
                                            <IconButton
                                                disabled={!currentUser}
                                                aria-label='delete'
                                                onClick={async () =>
                                                    await removeDeviceFromUser({
                                                        userId: currentUser.id,
                                                        deviceId: row.id,
                                                    })
                                                }
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <MappingModal
                key={JSON.stringify(userDevices)}
                isOpen={isModalOpen}
                userId={currentUser?.id ?? ''}
                userDevices={userDevices}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default Mappings;
