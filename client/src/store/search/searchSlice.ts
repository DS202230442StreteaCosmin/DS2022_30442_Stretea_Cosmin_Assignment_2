import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
    searchCriteria: string;
}

const initialState: SearchState = {
    searchCriteria: '',
};

export const searchSlice = createSlice({
    initialState,
    name: 'searchSlice',
    reducers: {
        setSearch: (state, action: PayloadAction<string>) => {
            state.searchCriteria = action.payload;
        },

        clearSearch: (state) => {
            state.searchCriteria = '';
        },
    },
});

export const searchReducer = searchSlice.reducer;

export const { setSearch, clearSearch } = searchSlice.actions;
