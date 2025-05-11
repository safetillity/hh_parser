import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './searchSlice';
import { RootState } from '../types';

export const store = configureStore({
  reducer: {
    search: searchReducer,
  },
});

export type AppDispatch = typeof store.dispatch; 