"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Code2, MapPin, Briefcase, GraduationCap, Award, Edit, Mail, Calendar, Building, Users, MessageSquare, Heart, Plus, Trash2, Save, X, FileText, BookOpen, Target, UserX, FileX, ChevronUp, ChevronDown, Camera } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { NavbarAvatar } from "@/components/navbar-avatar/NavbarAvatar"
import { toast } from "sonner"
import axiosInstance from "@/api/axios"
import type { PostType, ProfileData } from "./user-dashboard.types"
import { Layout } from "@/components/layout/Layout"

export default function UserDashboard() {
    const [currentUser, setCurrentUser] = useState({
        name: "",
        email: "",
        avatar: "",
        id: ""
    })
    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [userPosts, setUserPosts] = useState<PostType[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingPost, setEditingPost] = useState<PostType | null>(null)
    const [editPostContent, setEditPostContent] = useState("")
    const [editPostImage, setEditPostImage] = useState<File | null>(null)
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
    const [removeExistingImage, setRemoveExistingImage] = useState(false)
    const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({})
    const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({})
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
        isOpen: boolean;
        postId: string | null;
    }>({ isOpen: false, postId: null });

    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const userId = searchParams.get('userId')
    const isOwnProfile = !userId || userId === currentUser.id

    useEffect(() => {
        const loggedInUserId = localStorage.getItem('userId') || ""
        setCurrentUser({
            name: localStorage.getItem('userName') || "",
            email: localStorage.getItem('userEmail') || "",
            avatar: localStorage.getItem('userAvatar') || "",
            id: loggedInUserId
        })

        fetchUserProfile()
        fetchUserPosts()
    }, [userId])

    const fetchUserProfile = async () => {
        try {
            setLoading(true)
            const endpoint = userId
                ? `/api/v1/users/profile?userId=${userId}`
                : '/api/v1/users/profile-details'

            const response = await axiosInstance.get(endpoint)
            const data = response?.data?.data

            if (data) {
                setProfileData({
                    name: data.name || "",
                    email: data.email || "",
                    title: data.profileDetails?.[0]?.headline || "",
                    bio: data.profileDetails?.[0]?.bio || "",
                    location: data.profileDetails?.[0]?.location || "",
                    avatar: data.profileDetails?.[0]?.avatar?.url || "",
                    connections: data.connections || 0,
                    skills: data.profileDetails?.[0]?.skills || [],
                    experiences: data.profileDetails?.[0]?.experience || [],
                    educations: data.profileDetails?.[0]?.education || [],
                    certifications: data.profileDetails?.[0]?.certifications || []
                })
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
            toast.error("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    const fetchUserPosts = async () => {
        try {
            const endpoint = userId
                ? `/api/v1/posts/user-posts?userId=${userId}`
                : '/api/v1/posts/user-posts'

            const response = await axiosInstance.get(endpoint)
            setUserPosts(response?.data?.data || [])
        } catch (error) {
            console.error("Error fetching posts:", error)
        }
    }

    const handleEditPost = (post: PostType) => {
        setEditingPost(post)
        setEditPostContent(post.content)
        setEditPostImage(null)
        setEditImagePreview(post.media?.url || null)
        setRemoveExistingImage(false)
        setIsEditModalOpen(true)
    }

    const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB")
                return
            }

            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file")
                return
            }

            setEditPostImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setEditImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            setRemoveExistingImage(false)
        }
    }

    const removeEditImage = () => {
        setEditPostImage(null)
        setEditImagePreview(null)
        setRemoveExistingImage(true)
        const fileInput = document.getElementById("edit-image-upload") as HTMLInputElement
        if (fileInput) {
            fileInput.value = ""
        }
    }

    const handleUpdatePost = async () => {
        if (!editingPost || !editPostContent.trim()) return

        try {
            const formData = new FormData()
            formData.append('content', editPostContent)

            if (editPostImage) {
                formData.append('media', editPostImage)
            } else if (removeExistingImage) {
                formData.append('removeImage', 'true')
            }

            const response = await axiosInstance.put(`/api/v1/posts/update-post?id=${editingPost._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response?.data?.success) {
                toast.success("Post updated successfully")
                fetchUserPosts()
                setIsEditModalOpen(false)
                setEditingPost(null)
                setEditPostContent("")
                setEditPostImage(null)
                setEditImagePreview(null)
                setRemoveExistingImage(false)
            }
        } catch (error) {
            console.error("Error updating post:", error)
            toast.error("Failed to update post")
        }
    }

    const handleDeletePost = async (postId: string) => {
        setDeleteConfirmModal({ isOpen: true, postId });
    };

    const confirmDeletePost = async () => {
        if (!deleteConfirmModal.postId) return;

        try {
            const response = await axiosInstance.delete(`/api/v1/posts/post?id=${deleteConfirmModal.postId}`);
            if (response?.data?.success) {
                toast.success("Post deleted successfully");
                fetchUserPosts();
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post");
        } finally {
            setDeleteConfirmModal({ isOpen: false, postId: null });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmModal({ isOpen: false, postId: null });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        })
    }

    // const calculateDuration = (startDate: string, endDate: string) => {
    //     const start = new Date(startDate + "-01")
    //     const end = new Date(endDate + "-01")
    //     const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    //     const years = Math.floor(months / 12)
    //     const remainingMonths = months % 12

    //     if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`
    //     if (remainingMonths === 0) return `${years} year${years !== 1 ? "s" : ""}`
    //     return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`
    // }

    const handleCommentInputChange = (postId: string, value: string) => {
        setCommentInputs((prevInputs) => ({ ...prevInputs, [postId]: value }))
    }

    const handleAddComment = async (postId: string) => {
        const commentText = commentInputs[postId]
        if (commentText?.trim()) {
            try {
                const response = await axiosInstance.post(`/api/v1/posts/comment?id=${postId}`, {
                    content: commentText
                });
                const newComment = response?.data?.data;

                setUserPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postId
                            ? {
                                ...post,
                                comments: [...post.comments, newComment],
                                commentsCount: post.commentsCount + 1
                            }
                            : post
                    )
                );
                setCommentInputs((prevInputs) => ({ ...prevInputs, [postId]: "" }))
                toast.success("Comment added successfully")
            } catch (error) {
                console.error("Something went wrong : ", error);
                toast.error("Something went wrong!!");
            }
        }
    }

    const toggleComments = (postId: string) => {
        setExpandedComments((prevExpanded) => ({
            ...prevExpanded,
            [postId]: !prevExpanded[postId],
        }))
    }

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return `${Math.floor(diffInSeconds / 86400)}d ago`
    }

    const handleLikeToggle = async (postId: string) => {
        try {
            await axiosInstance.post(`/api/v1/posts/like-unlike-post?id=${postId}`);
            setUserPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            isLikedByCurrentUser: !post.isLikedByCurrentUser,
                            likesCount: post.isLikedByCurrentUser
                                ? post.likesCount - 1
                                : post.likesCount + 1
                        };
                    }
                    return post;
                })
            );
        } catch (error) {
            console.log("Something went wrong : ", error);
            toast.error("Something went wrong!!");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/feed')}>
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Code2 className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    DevConnector
                                </h1>
                            </div>
                            <NavbarAvatar user={currentUser} />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="w-32 h-32 mx-auto mb-8 bg-slate-700/30 rounded-full flex items-center justify-center">
                        <UserX className="w-16 h-16 text-slate-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
                    <p className="text-slate-400 mb-8">The user profile you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => navigate('/feed')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                        Back to Feed
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    {/* Profile Header */}
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur max-w-4xl mx-auto">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                                <Avatar className="w-32 h-32 border-4 border-slate-600 flex-shrink-0">
                                    <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
                                    <AvatarFallback>
                                        {profileData.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-3xl font-bold text-white mb-2">{profileData.name}</h1>
                                    {profileData.title ? (
                                        <p className="text-xl text-blue-400 mb-2">{profileData.title}</p>
                                    ) : (
                                        <p className="text-xl text-slate-500 mb-2">No title added</p>
                                    )}
                                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-slate-400 mb-4">
                                        {profileData.location ? (
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{profileData.location}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2 text-slate-500">
                                                <MapPin className="w-4 h-4" />
                                                <span>Location not added</span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{profileData.email}</span>
                                        </div>
                                    </div>
                                    {profileData.bio ? (
                                        <p className="text-slate-300 mb-4 leading-relaxed">{profileData.bio}</p>
                                    ) : (
                                        <p className="text-slate-500 mb-4 leading-relaxed">No bio added</p>
                                    )}
                                    <div className="flex items-center justify-center md:justify-start space-x-4">
                                        <Badge variant="secondary" className="bg-purple-600 text-white px-3 py-1 text-sm">
                                            <Users className="w-3 h-3 mr-1" />
                                            {profileData.connections} Connections
                                        </Badge>
                                        {isOwnProfile && (
                                            <Button
                                                onClick={() => navigate('/edit-profile')}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
                        <div className="space-y-8 lg:col-span-1">
                            {/* Work Experience */}
                            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <Briefcase className="w-5 h-5" />
                                        <span>Work Experience</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {profileData.experiences.length > 0 ? (
                                        <div className="space-y-6">
                                            {profileData.experiences.map((exp, index) => (
                                                <div key={index} className="relative">
                                                    {index !== profileData.experiences.length - 1 && (
                                                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-600"></div>
                                                    )}
                                                    <div className="flex space-x-4">
                                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <Building className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-semibold text-white mb-1">{exp.position}</h3>
                                                            <p className="text-blue-400 font-medium mb-2">{exp.company}</p>
                                                            <div className="flex items-center space-x-2 text-slate-400 text-sm mb-3">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>
                                                                    {formatDate(exp.startDate)} - {exp.present ? "Present" : formatDate(exp.endDate)}
                                                                </span>
                                                            </div>
                                                            {exp.description && (
                                                                <p className="text-slate-300 leading-relaxed">{exp.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-500">No work experience added</p>
                                            {isOwnProfile && (
                                                <Button
                                                    onClick={() => navigate('/edit-profile')}
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-4 border-slate-600 text-slate-400"
                                                >
                                                    Add Experience
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Education */}
                            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <GraduationCap className="w-5 h-5" />
                                        <span>Education</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {profileData.educations.length > 0 ? (
                                        <div className="space-y-6">
                                            {profileData.educations.map((edu, index) => (
                                                <div key={index} className="relative">
                                                    {index !== profileData.educations.length - 1 && (
                                                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-600"></div>
                                                    )}
                                                    <div className="flex space-x-4">
                                                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <GraduationCap className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-semibold text-white mb-1">{edu.degree}</h3>
                                                            <p className="text-purple-400 font-medium mb-2">{edu.instituteName}</p>
                                                            <div className="flex items-center space-x-2 text-slate-400 text-sm mb-3">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>
                                                                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-500">No education added</p>
                                            {isOwnProfile && (
                                                <Button
                                                    onClick={() => navigate('/edit-profile')}
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-4 border-slate-600 text-slate-400"
                                                >
                                                    Add Education
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Skills */}
                            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <Code2 className="w-5 h-5" />
                                        <span>Skills & Technologies</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {profileData.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {profileData.skills.map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="bg-blue-600 text-white px-3 py-1 text-sm">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-500">No skills added</p>
                                            {isOwnProfile && (
                                                <Button
                                                    onClick={() => navigate('/edit-profile')}
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-4 border-slate-600 text-slate-400"
                                                >
                                                    Add Skills
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Certifications */}
                            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <Award className="w-5 h-5" />
                                        <span>Certifications</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {profileData.certifications.length > 0 ? (
                                        <div className="space-y-4">
                                            {profileData.certifications.map((cert, index) => (
                                                <div key={index} className="flex items-center space-x-4 p-4 border border-slate-600 rounded-lg">
                                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Award className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-white">{cert.name}</h3>
                                                        <p className="text-green-400 font-medium">{cert.issuingOrganization}</p>
                                                        <div className="flex items-center space-x-2 text-slate-400 text-sm mt-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Issued {formatDate(cert.issueDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-500">No certifications added</p>
                                            {isOwnProfile && (
                                                <Button
                                                    onClick={() => navigate('/edit-profile')}
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-4 border-slate-600 text-slate-400"
                                                >
                                                    Add Certification
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Posts Section */}
                        <div className="space-y-8 lg:col-span-2">
                            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <FileText className="w-5 h-5" />
                                        <span>{isOwnProfile ? 'My Posts' : `${profileData.name}'s Posts`}</span>
                                    </CardTitle>
                                    {isOwnProfile && (
                                        <Button
                                            onClick={() => navigate('/feed')}
                                            size="sm"
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create New Post
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {userPosts.length > 0 ? (
                                        <div className="space-y-6">
                                            {userPosts.map((post) => {
                                                const isCommentsExpanded = expandedComments[post._id]
                                                return (
                                                    <div key={post._id} className="p-4 border border-slate-700 rounded-lg bg-slate-800/30">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <span className="text-xs text-slate-500">{getTimeAgo(post.createdAt)}</span>
                                                                    {post.tags && post.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {post.tags.map((tag, index) => (
                                                                                <span key={index} className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                                                                                    #{tag}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isOwnProfile && (
                                                                <div className="flex space-x-2">
                                                                    <Button
                                                                        onClick={() => handleEditPost(post)}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-blue-400 hover:text-blue-300"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => handleDeletePost(post._id)}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-red-400 hover:text-red-300"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-slate-300 mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                                                        {post.media && (
                                                            <img
                                                                src={post.media.url}
                                                                alt="Post media"
                                                                className="w-full max-h-96 object-cover rounded-lg border border-slate-700 mb-3"
                                                            />
                                                        )}

                                                        <div className="flex items-center space-x-6 text-slate-400 text-sm border-t border-slate-700 pt-4 mt-4">
                                                            <button
                                                                onClick={() => handleLikeToggle(post._id)}
                                                                className={`flex items-center space-x-1 transition-colors ${post.isLikedByCurrentUser ? "text-red-500" : "hover:text-blue-400"
                                                                    }`}
                                                            >
                                                                <Heart className="w-4 h-4 fill-current" />
                                                                <span>{post.likesCount} Likes</span>
                                                            </button>
                                                            <button
                                                                onClick={() => toggleComments(post._id)}
                                                                className="flex items-center space-x-1 hover:text-purple-400 transition-colors"
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                                <span>{post.commentsCount} Comments</span>
                                                                {isCommentsExpanded ? (
                                                                    <ChevronUp className="w-4 h-4 ml-1" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 ml-1" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        {isCommentsExpanded && (
                                                            <div className="mt-4 space-y-4 border-t border-slate-700 pt-4">
                                                                {post.commentsCount > 0 ? (
                                                                    post.comments.map((comment) => {
                                                                        const commentAuthor = comment?.user?.name || "Unknown User"
                                                                        return (
                                                                            <div key={comment._id} className="flex space-x-3">
                                                                                <Avatar className="w-8 h-8">
                                                                                    <AvatarImage
                                                                                        src={comment?.user?.avatar || "/placeholder.svg"}
                                                                                        alt={commentAuthor}
                                                                                    />
                                                                                    <AvatarFallback>
                                                                                        {commentAuthor
                                                                                            .split(" ")
                                                                                            .map((n) => n[0])
                                                                                            .join("")}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="flex-1 bg-slate-700/50 rounded-lg p-3">
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="font-semibold text-white text-sm">{commentAuthor}</span>
                                                                                        <span className="text-xs text-slate-500">{getTimeAgo(comment.createdAt)}</span>
                                                                                    </div>
                                                                                    <p className="text-slate-300 text-sm">{comment.content}</p>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })
                                                                ) : (
                                                                    <p className="text-slate-500 text-sm text-center py-4">No comments yet</p>
                                                                )}

                                                                <div className="flex space-x-3 pt-2">
                                                                    <Avatar className="w-8 h-8">
                                                                        <AvatarImage
                                                                            src={currentUser.avatar || "/placeholder.svg"}
                                                                            alt={currentUser.name}
                                                                        />
                                                                        <AvatarFallback>
                                                                            {currentUser.name
                                                                                .split(" ")
                                                                                .map((n) => n[0])
                                                                                .join("")}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 flex flex-col space-y-2">
                                                                        <Textarea
                                                                            placeholder="Add a comment..."
                                                                            value={commentInputs[post._id] || ""}
                                                                            onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                                                                            className="bg-slate-700 border-slate-600 text-white min-h-[60px] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                        <Button
                                                                            onClick={() => handleAddComment(post._id)}
                                                                            disabled={!commentInputs[post._id]?.trim()}
                                                                            size="sm"
                                                                            className="self-end bg-blue-600 hover:bg-blue-700"
                                                                        >
                                                                            Comment
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 mx-auto mb-6 bg-slate-700/30 rounded-full flex items-center justify-center">
                                                <FileX className="w-12 h-12 text-slate-500" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                {isOwnProfile ? "No posts yet" : `${profileData.name} hasn't posted anything yet`}
                                            </h3>
                                            <p className="text-slate-400 mb-6">
                                                {isOwnProfile
                                                    ? "Share your thoughts, projects, or insights with the community!"
                                                    : "Check back later for updates from this user."
                                                }
                                            </p>
                                            {isOwnProfile && (
                                                <Button
                                                    onClick={() => navigate('/feed')}
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create Your First Post
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Post Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-lg border-slate-700 bg-slate-800/95 backdrop-blur">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center space-x-2">
                            <Edit className="w-5 h-5" />
                            <span>Edit Post</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-content" className="text-slate-300">
                                Content
                            </Label>
                            <Textarea
                                id="edit-content"
                                placeholder="What's on your mind?"
                                value={editPostContent}
                                onChange={(e) => setEditPostContent(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white min-h-[100px] placeholder:text-slate-400"
                            />
                        </div>

                        {editImagePreview && (
                            <div className="relative">
                                <img
                                    src={editImagePreview}
                                    alt="Preview"
                                    className="w-full max-h-64 object-cover rounded-lg border border-slate-600"
                                />
                                <Button
                                    onClick={removeEditImage}
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="edit-image-upload" className="text-slate-300">
                                Update Image
                            </Label>
                            <Input
                                id="edit-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageUpload}
                                className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdatePost}
                                disabled={!editPostContent.trim()}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Update Post
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteConfirmModal.isOpen} onOpenChange={() => setDeleteConfirmModal({ isOpen: false, postId: null })}>
                <DialogContent className="sm:max-w-md border-slate-700 bg-slate-800/95 backdrop-blur">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center space-x-2">
                            <Trash2 className="w-5 h-5 text-red-400" />
                            <span>Delete Post</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-slate-300">
                            Are you sure you want to delete this post? This action cannot be undone.
                        </p>

                        <div className="flex space-x-3">
                            <Button
                                onClick={cancelDelete}
                                variant="outline"
                                className="flex-1 text-black bg-white border-slate-600 hover:bg-slate-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDeletePost}
                                variant="destructive"
                                className="flex-1 bg-red-700 hover:bg-red-700"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Layout>
    )
}
