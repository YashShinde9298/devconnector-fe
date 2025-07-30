import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge, Bell } from "lucide-react"

export default function NotificationsDropdown() {
    const notifications = [
        { id: "1", message: "John Doe liked your post.", time: "2 hours ago" },
        { id: "2", message: "Jane Smith commented on your photo.", time: "1 day ago" },
        { id: "3", message: "New message from Alex.", time: "3 days ago" },
    ];

    const unreadNotifications = notifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer">
                    <Bell className="h-6 w-6 text-white" />
                    {unreadNotifications > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                            {unreadNotifications}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-56 bg-slate-800 border-slate-700 text-white"
                align="end"
                forceMount
                sideOffset={8}
                avoidCollisions={true}
                collisionPadding={16}
            >
                <DropdownMenuLabel className="font-normal">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 py-2 focus:bg-slate-700">
                            <p className="text-sm font-medium leading-none">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem className="text-center text-muted-foreground">
                        No new notifications
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
