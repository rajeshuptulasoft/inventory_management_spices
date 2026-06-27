import { createSlice } from '@reduxjs/toolkit';

const applyTheme = (mode) => {
  const isDark = mode === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.body.classList.toggle('dark', isDark);
};

const saved = localStorage.getItem('theme') || 'dark';
applyTheme(saved);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: saved },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
      applyTheme(state.mode);
    },
    initTheme: (state) => {
      applyTheme(state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('theme', state.mode);
      applyTheme(state.mode);
    },
  },
});

export const { toggleTheme, initTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
