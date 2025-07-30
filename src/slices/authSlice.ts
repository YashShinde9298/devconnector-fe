import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { removeAuthToken, setAuthToken } from "@/utils/tokenUtils";
import { getSocket } from "@/utils/useSocket";

interface User {
    _id: string;
    name: string;
    email: string;
    completenessScore?: number;
    // Add more fields as needed
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    socket: Socket | null;
    onlineUsers: string[];
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    socket: null,
    onlineUsers: [],
};

export const loadUserFromStorage = createAsyncThunk(
    "auth/loadUserFromStorage",
    async (_, { rejectWithValue }) => {
        try {
            const _id = localStorage.getItem("userId");
            const name = localStorage.getItem("userName");
            const email = localStorage.getItem("userEmail");

            if (_id && name && email) {
                return { _id, name, email };
            } else {
                return rejectWithValue("No user in localStorage");
            }
        } catch (err) {
            return rejectWithValue("Failed to load user");
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (
        formData: { name: string; email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.post("/api/v1/users/register", formData);
            const data = res.data?.data;

            setAuthToken(data?.accessToken);
            localStorage.setItem("userName", data?.user?.name);
            localStorage.setItem("userEmail", data?.user?.email);
            localStorage.setItem("userId", data?.user?._id);

            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Signup failed");
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (
        formData: { email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.post("/api/v1/users/login", formData);
            const data = res.data?.data;
            setAuthToken(data?.accessToken);
            localStorage.setItem("userName", data?.user?.name);
            localStorage.setItem("userEmail", data?.user?.email);
            localStorage.setItem("userId", data?.user?._id);
            localStorage.setItem("userAvatar", data?.profile?.avatar?.url);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Login failed");
        }
    }
);

export const googleLogin = createAsyncThunk(
    "auth/googleLogin",
    async (token: string, { rejectWithValue }) => {
        try {
            setAuthToken(token); // store token in axios headers

            const response = await axiosInstance.get("/api/v1/users/profile-details");
            const user = response.data.data;

            // Save in localStorage
            localStorage.setItem("userId", user._id);
            localStorage.setItem("userName", user.name);
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userAvatar", user.profileDetails[0]?.avatar?.url);

            // Emit to socket
            const socket = getSocket();
            if (socket && socket.connected) {
                socket.emit("addUser", user._id);
            }

            return user;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Google login failed");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logoutUser: (state) => {
            state.user = null;
            state.onlineUsers = [];
            localStorage.clear();
            removeAuthToken();
            if (state.socket?.connected) state.socket.disconnect();
            state.socket = null;
            toast.success("Logged out successfully");
        },
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUsers = action.payload;
        },
        initializeSocket: (state, action: PayloadAction<string>) => {
            if (state.socket?.connected) return;

            const socket = io(import.meta.env.VITE_BACKEND_URI, {
                query: { userId: action.payload },
            });

            socket.connect();
            state.socket = socket as any;
        },
        disconnectSocket: (state) => {
            if (state.socket?.connected) state.socket.disconnect();
            state.socket = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.loading = false;
                toast.success("Account created successfully");
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string);
            })

            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.loading = false;
                toast.success("Logged in successfully");
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string);
            })
            .addCase(loadUserFromStorage.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(googleLogin.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const {
    logoutUser,
    setOnlineUsers,
    initializeSocket,
    disconnectSocket,
} = authSlice.actions;

export default authSlice.reducer;
