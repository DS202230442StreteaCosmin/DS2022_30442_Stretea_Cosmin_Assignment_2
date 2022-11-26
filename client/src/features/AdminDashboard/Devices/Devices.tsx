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
import EditIcon from '@mui/icons-material/Edit';
import {
    useDeleteDeviceMutation,
    useGetAllDevicesQuery,
} from '../../../services/device/device';
import { Device } from '../../../services/device/model';
import DeviceModal from './DeviceModal/DeviceModal';
import { useAppSelector } from '../../../store/store';

const Devices = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [selectedDevice, setSelectedDevice] = React.useState<
        Device | undefined
    >(undefined);

    const { data: devices, isFetching: areDevicesLoading } =
        useGetAllDevicesQuery(undefined);

    const [deleteDevice] = useDeleteDeviceMutation();

    const [filteredData, setFilteredData] = React.useState<Device[]>([]);

    const searchCriteria = useAppSelector(
        (state) => state.searchState.searchCriteria
    );

    React.useEffect(() => {
        if (!searchCriteria || !devices) {
            setFilteredData([]);
            return;
        }

        setFilteredData(getFilteredData());
    }, [searchCriteria, devices]);

    const getFilteredData = () => {
        return devices!.filter(
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
                <Button
                    size='large'
                    sx={{ marginBottom: 2, border: '1px solid grey' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    Add new device
                </Button>
            </Box>
            {devices && (
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
                            {(searchCriteria ? filteredData : devices).map(
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
                                            <>
                                                <IconButton
                                                    aria-label='delete'
                                                    onClick={() => {
                                                        setSelectedDevice(row);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    aria-label='delete'
                                                    onClick={async () => {
                                                        await deleteDevice(
                                                            row.id
                                                        );
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <DeviceModal
                key={selectedDevice?.id}
                device={selectedDevice}
                isOpen={isModalOpen}
                onClose={() => {
                    setSelectedDevice(undefined);
                    setIsModalOpen(false);
                }}
            />
        </>
    );
};

export default Devices;
