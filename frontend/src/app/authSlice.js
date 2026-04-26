import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  token: localStorage.getItem('token') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    setCredentials: (state, action) => {
      const { user, token } = action.payload;

      state.userInfo = user;
      state.token = token;

      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('token', token);
    },

    logout: (state) => {
      state.userInfo = null;
      state.token = null;

      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    },

  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;