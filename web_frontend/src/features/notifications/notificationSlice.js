import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await api.get('/notifications?limit=30');
  return data;
});

export const markNotificationRead = createAsyncThunk('notifications/read', async (id) => {
  await api.patch(`/notifications/${id}/read`);
  return id;
});

export const markAllRead = createAsyncThunk('notifications/readAll', async () => {
  await api.patch('/notifications/read-all');
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false, open: false },
  reducers: {
    togglePanel: (state) => { state.open = !state.open; },
    setOpen: (state, action) => { state.open = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i.id === action.payload);
        if (n) n.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach((i) => { i.is_read = true; });
        state.unreadCount = 0;
      })
      .addCase(markAllRead.rejected, (state) => { /* noop */ });
  },
});

export const { togglePanel, setOpen } = notificationSlice.actions;
export default notificationSlice.reducer;
