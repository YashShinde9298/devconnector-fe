import type { RootState, AppDispatch } from "../store/store";
import { setOnlineUsers } from "@/slices/authSlice";

export const attachSocketListeners = (dispatch: AppDispatch, getState: () => RootState) => {
    const socket = getState().auth.socket;
    if (!socket) return;

    socket.on("getOnlineUsers", (userIds: string[]) => {
        console.log("✅ Received online users:", userIds);
        dispatch(setOnlineUsers(userIds)); // ✅ Legal Redux mutation
    });

    // Add more socket event listeners here if needed
};
