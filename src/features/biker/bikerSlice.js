import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedBiker: null,
};

const bikerSlice = createSlice({
  name: "biker",
  initialState,
  reducers: {
    selectBiker: (state, action) => {
      state.selectedBiker = action.payload;
    },
    clearSelectedBiker: (state) => {
      state.selectedBiker = null;
    },
  },
});

export const { selectBiker, clearSelectedBiker } = bikerSlice.actions;
export default bikerSlice.reducer;
