import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Code2, Home, MessageSquare, Users, User, Settings, LogOut, Menu, X } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/api/axios"
import { removeAuthToken } from "../../utils/tokenUtils";
import { getSocket } from "@/utils/useSocket"

interface SidebarProps {
    currentUser: {
        name: string
        email: string
        avatar: string
        id: string
    }
}

export function Sidebar({ currentUser }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const navigationItems = [
        {
            icon: Home,
            label: "Feed",
            path: "/feed",
            active: location.pathname === "/feed"
        },
        {
            icon: User,
            label: "My Feed",
            path: `/user-dashboard?userId=${currentUser.id}`,
            active: location.pathname === "/user-dashboard"
        },
        {
            icon: MessageSquare,
            label: "Messages",
            path: "/chat",
            active: location.pathname === "/chat"
        },
        {
            icon: Users,
            label: "All Users",
            path: "/users",
            active: location.pathname === "/users"
        },
        {
            icon: User,
            label: "My Profile",
            path: "/view-profile",
            active: location.pathname === "/view-profile"
        },
        {
            icon: Settings,
            label: "Change Password",
            path: "/change-password",
            active: location.pathname === "/change-password"
        }
    ]

    const handleLogout = async () => {
        try {
            const socket = getSocket();
            socket?.disconnect();
            const response = await axiosInstance.post('/api/v1/users/logout')
            toast.success(response?.data?.message)
            removeAuthToken()
            localStorage.clear()
            navigate('/login')
        } catch (error) {
            console.error("Logout error:", error)
            toast.error("Something went wrong during logout")
        }
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-slate-800/80 backdrop-blur border border-slate-700"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </Button>

            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur border-r border-slate-700 z-40 transition-transform duration-300
                ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
                ${isCollapsed ? 'md:w-16' : 'w-64'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Code2 className="w-5 h-5 text-white" />
                            </div>
                            {!isCollapsed && (
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    DevConnector
                                </h1>
                            )}
                        </div>
                    </div>

                    {/* User Profile Section */}
                    {!isCollapsed && (
                        <div className="p-4 border-b border-slate-700">
                            <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10 border-2 border-slate-600">
                                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                                    <AvatarFallback>
                                        {currentUser.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Button
                                        key={item.path}
                                        variant={item.active ? "secondary" : "ghost"}
                                        className={`
                                            w-full justify-start h-10 px-3
                                            ${item.active
                                                ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                                                : "text-slate-300 hover:text-white hover:bg-slate-800"
                                            }
                                            ${isCollapsed ? "px-2" : ""}
                                        `}
                                        onClick={() => {
                                            navigate(item.path)
                                            if (window.innerWidth < 768) {
                                                setIsCollapsed(true)
                                            }
                                        }}
                                    >
                                        <Icon className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Button>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700">
                        <Button
                            variant="ghost"
                            className={`
                                w-full justify-start h-10 px-3 text-red-400 hover:text-red-300 hover:bg-red-900/20
                                ${isCollapsed ? "px-2" : ""}
                            `}
                            onClick={handleLogout}
                        >
                            <LogOut className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
                            {!isCollapsed && <span>Logout</span>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
        </>
    )
}
