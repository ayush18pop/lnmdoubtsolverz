import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  doubts: [],
  loading: false,
};

const doubtsSlice = createSlice({
  name: "doubts",
  initialState,
  reducers: {
    setDoubts: (state, action) => {
      state.doubts = action.payload;
    },
    addDoubt: (state, action) => {
      state.doubts.push(action.payload);
    },
  },
});

export const { setDoubts, addDoubt } = doubtsSlice.actions;
export default doubtsSlice.reducer;
