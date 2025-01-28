import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "./authActions";

const initialState = {
  loading: false,
  userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,
  userToken: localStorage.getItem("userToken") || null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      state.userToken = null;
      state.error = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
    },
    loadUserFromStorage: (state) => {
      state.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      state.userToken = localStorage.getItem("userToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload.userInfo;
        state.userToken = payload.token;
        localStorage.setItem("userInfo", JSON.stringify(payload.userInfo));
        localStorage.setItem("userToken", payload.token);
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
