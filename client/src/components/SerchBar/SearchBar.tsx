import { IconButton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setSearch } from '../../store/search/searchSlice';

const SearchBar = () => {
    const dispatch = useAppDispatch();
    const searchValue = useAppSelector(
        (state) => state.searchState.searchCriteria
    );
    return (
        <>
            <TextField
                id='search-bar'
                className='text'
                value={searchValue}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                variant='standard'
                placeholder='Search...'
                size='small'
            />
        </>
    );
};

export default SearchBar;
