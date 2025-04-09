import { createSlice } from '@reduxjs/toolkit';
import { logoutFn } from './logoutSlice';

const initialState = {
  wallet: "",
  balance: 0,
  provider: "",
};

const profileSlice = createSlice({
  name: "Profile",
  initialState,
  reducers: {
    profileFn: (state, action) => {
      state = action.payload;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutFn, () => {
      return { ...initialState };
    });
  },
});

const profileReducer = profileSlice.reducer;
const profileState = (state) => state.profile;
const { profileFn } = profileSlice.actions;

export { profileReducer, profileState, profileFn };
