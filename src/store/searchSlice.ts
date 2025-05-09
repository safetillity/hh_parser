import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchState } from '../types';

const initialState: SearchState = {
  query: '',
  numVacancies: 20,
  region: '1',
  loading: false,
  error: null,
  results: null
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
    setResults: (state, action: PayloadAction<any>) => {
      state.results = action.payload;
    }
  }
});

export const {
  setQuery,
  setNumVacancies,
  setRegion,
  setLoading,
  setError,
  setResults
} = searchSlice.actions;

export default searchSlice.reducer; 