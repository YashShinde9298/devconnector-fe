export interface UserProfile {
    id: string
    name: string
    avatar: string
    status: "online" | "offline" | "away"
    lastMessage?: string
    lastMessageTime?: string
}

export interface Message {
    id: string
    senderId: string
    text: string
    timestamp?: Date
    createdAt?: Date
}

export interface ChatUsersProps {
    id: string
    name: string
    avatar: string
    isFollowing?: boolean
    status?: "online" | "offline"
    unreadCount?: number
}

export interface Chat {
    _id: string;
    name: string;
    avatar: string;
    status: "online" | "offline" | "away";
    lastMessage?: string;
    lastMessageTime?: string;
    messages: Message[];
    participants: any[];
}

export interface ChatData {
    id: string;
    participants: (ChatUsersProps | undefined)[];
    messages: any[];
    name?: string;
    avatar?: string;
}
