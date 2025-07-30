import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Search, Video, Phone, Send, MessageSquare, ChevronLeft, MoreVertical, Info, Trash2, VolumeX, Archive } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { Chat, ChatData, ChatUsersProps, Message } from "./chat.types"
import { Layout } from "@/components/layout/Layout"
import axiosInstance from "@/api/axios"
import { useAppSelector } from "@/store/hooks"
import { getSocket } from "@/utils/useSocket"

export default function Chat() {
    const [chatUsers, setChatUsers] = useState<ChatUsersProps[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentUser] = useState({
        id: localStorage.getItem('userId') || "",
        name: localStorage.getItem('userName') || "",
        email: localStorage.getItem('userEmail') || "",
        avatar: localStorage.getItem('userAvatar') || ""
    });
    const { onlineUsers } = useAppSelector((state) => state.auth);
    const socket = getSocket();

    const getUsersForChat = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/api/v1/messages/users');
            const users = response.data.data.map((user: any) => ({
                id: user._id,
                name: user.name,
                avatar: user.avatar || '',
                isFollowing: user.isFollowing,
                status: onlineUsers.includes(user._id) ? 'online' : 'offline',
                unreadCount: user.unreadCount
            }));
            setChatUsers(users);
        } catch (error) {
            console.error("Failed to get users for chat:", error);
        }
    }, [onlineUsers])

    useEffect(() => {
        getUsersForChat();
    }, []);

    useEffect(() => {
        if (onlineUsers.length > 0) {
            getUsersForChat();
        }
    }, [onlineUsers]);

    useEffect(() => {
        if (!socket || !selectedChat) return;

        const participantIds = selectedChat.participants.map(p => p?.id);

        socket.on("newMessage", (message) => {
            if (
                participantIds.includes(message.senderId) ||
                participantIds.includes(message.receiverId)
            ) {
                setSelectedChat((prev) =>
                    prev ? { ...prev, messages: [...prev.messages, message] } : null
                );
            }
        });

        return () => {
            socket.off("newMessage");
        };
    }, [socket, selectedChat?.participants]);

    useEffect(() => {
        if (!socket) return;
        socket.on('unreadCountUpdate', ({ from }) => {
            setChatUsers(prev =>
                prev.map(user =>
                    user.id === from
                        ? { ...user, unreadCount: (user?.unreadCount || 0) + 1 }
                        : user
                )
            )
        })

        return () => {
            socket.off('unreadCountUpdate');
        }
    }, [socket])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChat?.messages]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedChat?.participants[0]?.id) return;

        try {
            const response = await axiosInstance.post(`/api/v1/messages/send-message?id=${selectedChat?.participants[0]?.id}`, {
                text: messageInput
            });

            const newMessage = {
                ...response.data?.data,
                createdAt: new Date(response.data?.data.createdAt),
                read: false
            };

            socket?.emit("send-message", {
                receiverId: selectedChat.participants.find(p => p?.id !== currentUser.id)?.id,
                text: messageInput
            });

            setSelectedChat(prev =>
                prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
            );
            setMessageInput("");
        } catch (error) {
            toast.error("Failed to send message");
            console.error(error);
        }
    };

    const handleUserSelect = async (selectedUserId: string) => {
        try {
            setSelectedUser(selectedUserId);
            const response = await axiosInstance.get(`/api/v1/messages/messages?id=${selectedUserId}`);
            const chatData = response.data.data;
            const selectedUserData = chatUsers.find(user => user.id === selectedUserId);
            const formattedChat = {
                id: chatData._id,
                participants: [selectedUserData, currentUser],
                messages: chatData.map((msg: any) => ({
                    id: msg._id,
                    text: msg.text,
                    senderId: msg.senderId,
                    timestamp: new Date(msg.createdAt),
                    read: msg.read
                })),
                name: selectedUserData?.name,
                avatar: selectedUserData?.avatar
            };
            setSelectedChat(formattedChat);
            await updateMessageReadStatus();
        } catch (error) {
            console.error("Failed to create or fetch chat:", error);
            toast.error("Something went wrong while starting the chat.");
        }
    };

    const updateMessageReadStatus = async () => {
        try {
            await axiosInstance.put('/api/v1/messages/read');
            socket?.emit("messageRead", selectedChat?.participants.find(p => p?.id !== currentUser.id)?.id);
            setChatUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === selectedUser
                        ? { ...user, unreadCount: 0 }
                        : user
                )
            );
        } catch (error) {
            console.error("Failed to update message read status:", error);
        }
    }

    const handleVideoCall = () => {
        if (selectedChat) {
            toast.info(`Initiating video call with ${selectedChat.name}... (Feature coming soon!)`)
        } else {
            toast.error("Please select a user to start a video call.")
        }
    }

    const handleAudioCall = () => {
        if (selectedChat) {
            toast.info(`Initiating audio call with ${selectedChat.name}... (Feature coming soon!)`)
        } else {
            toast.error("Please select a user to start an audio call.")
        }
    }

    const filteredUsers = chatUsers.filter((chat) =>
        chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatTimestamp = (dateInput: Date | string) => {
        const date = new Date(dateInput);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 1 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        } else if (diffDays <= 2 && date.getDate() === now.getDate() - 1) {
            return "Yesterday"
        } else if (diffDays <= 7) {
            return date.toLocaleDateString([], { weekday: "short" })
        } else {
            return date.toLocaleDateString([], { month: "short", day: "numeric" })
        }
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
                {/* Main Chat Layout */}
                <div className="flex flex-1 container mx-auto px-4 py-8 gap-8">
                    {/* Left Sidebar - Contacts List */}
                    <Card className="hidden md:flex flex-col w-80 border-slate-700 bg-slate-800/50 backdrop-blur flex-shrink-0">
                        <CardHeader className="p-4 border-b border-slate-700">
                            <CardTitle className="text-white text-lg flex items-center space-x-2">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                <span>Conversations</span>
                            </CardTitle>
                            <div className="relative mt-3">
                                <Input
                                    type="search"
                                    placeholder="Search contacts..."
                                    className="w-full bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 max-h-[570px] overflow-y-auto p-0">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-3 p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700/70 transition-colors ${selectedUser === user.id ? "bg-slate-700/70" : ""
                                            }`}
                                        onClick={() => handleUserSelect(user.id)}
                                    >
                                        <div className="relative">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                                <AvatarFallback>
                                                    {user.name
                                                        .split(" ")
                                                        .map((n: string) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span
                                                className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-800 ${user.status === "online"
                                                    ? "bg-green-500" : "bg-gray-500"
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-semibold truncate">{user.name}</h3>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            {user.unreadCount && user.unreadCount > 0 && (
                                                <Badge variant="secondary" className="bg-purple-600 text-white px-2 py-0.5 text-xs">
                                                    {user.unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-center p-4">No contacts found.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Main Chat Area */}
                    <Card className="flex flex-col flex-1 border-slate-700 bg-slate-800/50 backdrop-blur">
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <CardHeader className="p-4 border-b border-slate-700 flex flex-row items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="md:hidden text-slate-400 hover:text-white"
                                            onClick={() => setSelectedChat(null)}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={selectedChat.avatar || "/placeholder.svg"} alt={selectedChat.name} />
                                            <AvatarFallback>
                                                {selectedChat?.participants[0]?.name
                                                    .split(" ")
                                                    .map((n: string) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-white text-lg">{selectedChat?.participants[0]?.name}</CardTitle>
                                            <p className="text-slate-400 text-sm capitalize">{selectedChat?.participants[0]?.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-blue-400 hover:bg-blue-900/50"
                                            onClick={handleVideoCall}
                                            title="Video Call"
                                        >
                                            <Video className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-green-400 hover:bg-green-900/50"
                                            onClick={handleAudioCall}
                                            title="Audio Call"
                                        >
                                            <Phone className="w-5 h-5" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                                                <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                                                    <Info className="mr-2 h-4 w-4" />
                                                    <span>View Profile</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                                                    <VolumeX className="mr-2 h-4 w-4" />
                                                    <span>Mute Notifications</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                                                    <Archive className="mr-2 h-4 w-4" />
                                                    <span>Archive Chat</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-700" />
                                                <DropdownMenuItem className="text-red-400 hover:bg-red-900/50 hover:text-red-300 cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete Chat</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>

                                {/* Messages Display Area */}
                                <CardContent className="flex-1 min-h-[570px] max-h-[590px] overflow-y-auto p-4 space-y-4 message-container">
                                    {selectedChat?.messages?.length > 0 ? (
                                        selectedChat.messages.map((message: Message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg p-3 ${message.senderId === currentUser.id
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-slate-700/50 text-slate-100 border border-slate-600"
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed">{message.text}</p>
                                                    <span className="text-xs opacity-70 mt-1 block text-right">
                                                        {formatTimestamp(message?.createdAt || message?.timestamp || new Date())}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col max-h-[570px] items-center justify-center h-full text-slate-400">
                                            <MessageSquare className="w-16 h-16 mb-4" />
                                            <p className="text-lg font-semibold">Start a conversation</p>
                                            <p className="text-sm">Send a message to {selectedChat.name}</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </CardContent>

                                {/* Message Input */}
                                <div className="p-4 border-t border-slate-700">
                                    <div className="flex items-end space-x-2">
                                        <Textarea
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="Type your message here..."
                                            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none min-h-[40px] max-h-20 text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage()
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim()}
                                            size="icon"
                                            className="bg-purple-600 hover:bg-purple-700 h-10 w-10 flex-shrink-0"
                                        >
                                            <Send className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <MessageSquare className="w-24 h-24 mb-6" />
                                <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
                                <p className="text-lg text-center max-w-md">
                                    Choose a contact from the left sidebar to start chatting or search for a new one.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
