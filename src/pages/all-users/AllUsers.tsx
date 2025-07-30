"use client"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, MapPin, Briefcase, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import type { UserProfile } from "./allusers.types"
import axiosInstance from "@/api/axios"
import { Layout } from "@/components/layout/Layout"
import { chatApi } from "@/api/chatApi"

export default function AllUsers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<UserProfile[]>([])

    const navigate = useNavigate();

    useEffect(() => {
        fetchAllUsers();
    }, [])

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.profileDetails[0]?.headline?.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
            user?.profileDetails[0]?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.profileDetails[0]?.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    const fetchAllUsers = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/users/all-users');
            setUsers(response?.data?.data);
        } catch (error) {
            console.error("Error fetching all users : ", error);
        }
    }

    const handleConnectUser = async (userId: string) => {
        try {
            const response = await axiosInstance.post('/api/v1/users/connect-user', {
                userId: userId
            });

            const { isFollowing } = response.data.data;

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === userId
                        ? { ...user, isFollowing: isFollowing }
                        : user
                )
            );
            fetchAllUsers();
        } catch (error) {
            console.error("Error following/unfollowing user:", error);
        }
    }

    const handleMessageUser = async (userId: string) => {
        try {
            await chatApi.getOrCreateChat(userId);
            navigate(`/chat?userId=${userId}`);
        } catch (error) {
            console.error("Error creating/getting chat:", error);
        }
    }


    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Search Bar */}
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardContent>
                            <div className="relative">
                                <Input
                                    type="search"
                                    placeholder="Search users by name, title, skill, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                >
                                    <Search className="h-4 w-4 text-slate-400" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Grid */}
                    {filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user) => (
                                <Card
                                    key={user._id}
                                    className="border-slate-700 bg-slate-800/50 backdrop-blur transition-all hover:bg-slate-800/70 cursor-pointer"
                                >
                                    <CardContent className="p-6 flex flex-col items-center text-center">
                                        <Avatar className="w-20 h-20 border-2 border-slate-600 mb-4">
                                            <AvatarImage src={user.profileDetails[0]?.avatar?.url || "/placeholder.svg"} alt={user.name} />
                                            <AvatarFallback>
                                                {user.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h3 className="text-xl font-semibold text-white mb-1">{user.name}</h3>
                                        <p className="text-blue-400 text-sm mb-2">{user?.profileDetails[0]?.headline}</p>
                                        <div className="flex items-center space-x-1 text-slate-400 text-xs mb-3">
                                            <MapPin className="w-3 h-3" />
                                            <span>{user.profileDetails[0]?.location}</span>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                                            {user.profileDetails[0]?.skills.slice(0, 3).map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="bg-purple-600 text-white px-2 py-0.5 text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {user.profileDetails[0]?.skills.length > 3 && (
                                                <Badge variant="secondary" className="bg-purple-600 text-white px-2 py-0.5 text-xs">
                                                    +{user.profileDetails[0]?.skills.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 text-slate-400 text-sm mb-4">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{user.connections || 0} Connections</span>
                                        </div>
                                        <div className="flex space-x-3">
                                            <Button
                                                onClick={() => handleConnectUser(user._id)}
                                                size="sm"
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            >
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                {!user.isFollowing ? "Connect" : "Disconnect"}
                                            </Button>
                                            <Button
                                                onClick={() => handleMessageUser(user._id)}
                                                size="sm"
                                                variant="outline"
                                                className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Message
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                            <CardContent className="p-8 text-center text-slate-400">
                                <p className="text-lg">No users found matching your search criteria.</p>
                                <p className="text-sm mt-2">Try adjusting your search term or explore other profiles.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    )
}
