import axiosInstance from "@/api/axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removeAuthToken } from "@/utils/tokenUtils"
import { User, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface NavbarAvatarProps {
    user: {
        name: string
        email: string
        avatar?: string
    }
}

export function NavbarAvatar({ user }: NavbarAvatarProps) {

    const navigate = useNavigate();
    const handleLogout = async () => {
        const response = await axiosInstance.post('/api/v1/users/logout');
        toast.success(response?.data?.message);
        removeAuthToken();
        localStorage.clear();
        navigate('/login')
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-slate-600">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                            {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className="w-56 bg-slate-800 border-slate-700 text-white" 
                align="end" 
                forceMount
                sideOffset={8}
                avoidCollisions={true}
                collisionPadding={16}
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-slate-400">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                    className="focus:bg-slate-700 cursor-pointer"
                    onClick={() => (navigate('/view-profile'))}
                >
                    <User className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

