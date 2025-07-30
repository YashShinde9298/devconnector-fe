import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatButton() {
    const unreadChats = 2;
    const navigate = useNavigate();
    return (<>
        <button onClick={() => navigate('/chat')} className="relative cursor-pointer">
            <div className="relative cursor-pointer">
                <MessageSquare className="h-6 w-6 text-white" />
                {unreadChats > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                        {unreadChats}
                    </span>
                )}
            </div>
        </button>
    </>)
}