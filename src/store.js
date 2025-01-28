import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import bikerReducer from "./features/biker/bikerSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    biker: bikerReducer,
  },
});

export default store;
