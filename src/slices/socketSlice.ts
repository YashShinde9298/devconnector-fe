import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client'

interface SocketState {
  onlineUsers: string[]
  isConnected: boolean
  socketInstance: Socket | null
}

const initialState: SocketState = {
  onlineUsers: [],
  isConnected: false,
  socketInstance: null
}

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setSocketInstance: (state, action: PayloadAction<Socket>) => {
      // @ts-expect-error – Socket instance contains readonly props that Redux Toolkit (Immer) can't draft
      state.socketInstance = action.payload;
    },
    addOnlineUser: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload)
      }
    },
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload)
    },
    getOnlineUsers: (state) => {
      state.socketInstance?.emit('getOnlineUsers')
    },
    clearSocketInstance: (state) => {
      state.socketInstance = null
    }
  }
})

export const { setOnlineUsers, setConnectionStatus, addOnlineUser, removeOnlineUser, getOnlineUsers, clearSocketInstance } = socketSlice.actions
export default socketSlice.reducer
