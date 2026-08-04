import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobile: false,
  menuOpen: false,
  orientation: 'portrait',
};

const mobileSlice = createSlice({
  name: 'mobile',
  initialState,
  reducers: {
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    toggleMenu: (state) => {
      state.menuOpen = !state.menuOpen;
    },
    setMenuOpen: (state, action) => {
      state.menuOpen = action.payload;
    },
    setOrientation: (state, action) => {
      state.orientation = action.payload;
    },
  },
});

export const { setIsMobile, toggleMenu, setMenuOpen, setOrientation } = mobileSlice.actions;
export default mobileSlice.reducer;
