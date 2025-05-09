import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchState, SearchResponse } from '../types';

const initialState: SearchState = {
  query: '',
  numVacancies: 10,
  region: '113',
  loading: false,
  error: null,
  results: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setNumVacancies: (state, action: PayloadAction<number>) => {
      state.numVacancies = action.payload;
    },
    setRegion: (state, action: PayloadAction<string>) => {
      state.region = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setResults: (state, action: PayloadAction<SearchResponse | null>) => {
      state.results = action.payload;
    },
    resetSearch: (state) => {
      state.query = '';
      state.numVacancies = 10;
      state.region = '113';
      state.loading = false;
      state.error = null;
      state.results = null;
    },
  },
});

export const {
  setQuery,
  setNumVacancies,
  setRegion,
  setLoading,
  setError,
  setResults,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer; 