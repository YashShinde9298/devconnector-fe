import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ImageIcon, Send, Heart, MessageSquare, Globe, ChevronUp, ChevronDown, X, Sparkles, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import axiosInstance from "@/api/axios"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@radix-ui/react-label"
import { type LearningTopic, type PostType, type UserProfile } from "./feed.types"
import { getTimeAgo } from "@/utils/getTimeAgo"
import { FloatingChatButton } from "@/components/floating-chat-btn/FloatingChatButton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Layout } from "@/components/layout/Layout"

export default function Feed() {
    const [newPostContent, setNewPostContent] = useState("");
    const [currentUser, setCurrentUser] = useState({
        name: "",
        email: "",
        avatar: ""
    })
    const [posts, setPosts] = useState<PostType[]>([]);
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
    const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({})
    const [newPostTags, setNewPostTags] = useState("")
    const [postTags, setPostTags] = useState<string[]>([])
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [aiSuggestions, setAiSuggestions] = useState<LearningTopic[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(true);
    const [aiSuggestionsError, setAiSuggestionsError] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentUser({
            name: localStorage.getItem('userName') || "",
            email: localStorage.getItem('userEmail') || "",
            avatar: localStorage.getItem('userAvatar') || ""
        })
        fetchPosts();
        fetchAiSuggestions();
        fetchUsers();
    }, [])


    const fetchPosts = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/posts/posts');
            setPosts(response?.data?.data);
        } catch (error) {
            console.error("Error while fetching posts : ", error);
            toast.error("Something went wrong while fetching posts. Please refresh page.")
        }
    }

    const fetchAiSuggestions = async () => {
        try {
            setAiSuggestionsLoading(true);
            setAiSuggestionsError(false);
            const response = await axiosInstance.post('/api/v1/ai/post-suggestion', {
                count: 5
            })
            setAiSuggestions(response?.data?.data?.suggestions);
        } catch (error) {
            console.error("Something went wrong while fetching AI suggestions : ", error);
            setAiSuggestionsError(true);
        } finally {
            setAiSuggestionsLoading(false);
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/users/all-users');
            setUsers(response?.data?.data.splice(0, 3));
        } catch (error) {
            console.error("Error fetching users :", error);
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.info("File size must be less than 5MB")
                return
            }

            if (!file.type.startsWith("image/")) {
                toast.info("Please select an image file")
                return
            }

            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        const fileInput = document.getElementById("image-upload") as HTMLInputElement
        if (fileInput) {
            fileInput.value = ""
        }
    }

    const handleTagsKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            const newTag = newPostTags.trim()
            if (newTag && !postTags.includes(newTag)) {
                setPostTags([...postTags, newTag])
                setNewPostTags("")
            }
        }
    }

    const removeTag = (tagToRemove: string) => {
        setPostTags(postTags.filter((tag) => tag !== tagToRemove))
    }

    const handleCreatePost = async () => {
        if (newPostContent.trim()) {
            const newPost = {
                content: newPostContent,
                media: selectedImage,
                tags: postTags,
            }

            try {
                const response = await axiosInstance.post('/api/v1/posts/post',
                    newPost,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    });
                toast.success(response?.data?.message);
                fetchPosts();
            } catch (error) {
                console.error("Something went wrong while creating a post : ", error);
                toast.error("Something went wrong while creating a post")
            }
            setNewPostContent("")
            setPostTags([])
            setNewPostTags("")
            setSelectedImage(null)
            setImagePreview(null)

            const fileInput = document.getElementById("image-upload") as HTMLInputElement
            if (fileInput) {
                fileInput.value = ""
            }
        }
    }

    const handleLikeToggle = async (postId: string) => {
        try {
            await axiosInstance.post(`api/v1/posts/like-unlike-post?id=${postId}`);
            setPosts((prevPosts) =>
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

                setPosts((prevPosts) =>
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

    const handleConnectUser = (userId: string) => {
        console.log("Connecting to user:", userId)
        toast.success("Connection request sent!");
    }

    const handleNavigateToDashboard = (userId: string) => {
        navigate(`/user-dashboard?userId=${userId}`)
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 shadow-lg">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                                <Plus className="w-5 h-5" />
                                <span>Create New Post</span>
                            </h2>
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="What's on your mind, developer?"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white min-h-[100px] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                {imagePreview && (
                                    <div className="relative">
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="Preview"
                                            className="w-full max-h-64 object-cover rounded-lg border border-slate-600"
                                        />
                                        <Button
                                            onClick={removeImage}
                                            size="sm"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-8 w-8 p-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="tags" className="text-slate-300 text-sm mb-1">
                                        Add Tags (press Enter or comma to add)
                                    </Label>
                                    <Input
                                        id="tags"
                                        value={newPostTags}
                                        onChange={(e) => setNewPostTags(e.target.value)}
                                        onKeyDown={handleTagsKeyPress}
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Type a tag and press Enter"
                                    />
                                    {postTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {postTags.map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="bg-blue-600 text-white">
                                                    #{tag}
                                                    <button onClick={() => removeTag(tag)} className="ml-2 hover:text-red-300">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <div className="relative">
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white px-3">
                                                <ImageIcon className="w-4 h-4 mr-2" />
                                                <span>Image</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {selectedImage && (
                                            <span className="text-xs text-slate-400">
                                                {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        )}
                                        <Button
                                            onClick={handleCreatePost}
                                            disabled={!newPostContent.trim()}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {posts.map((post) => {
                                const author = post.authorName
                                const isCommentsExpanded = expandedComments[post._id]
                                return (
                                    <Card
                                        key={post._id}
                                        className="border-slate-700 bg-slate-800/50 backdrop-blur transition-all hover:bg-slate-800/60 gap-0 py-0"
                                    >
                                        <CardHeader className="flex flex-row items-center space-x-4 p-6 pb-4">
                                            <Avatar className="w-12 h-12 border-2 border-slate-600">
                                                <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={author} />
                                                <AvatarFallback>
                                                    {author
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 flex flex-col">
                                                <h3 className="font-semibold text-white text-lg cursor-pointer" onClick={() => handleNavigateToDashboard(post.authorId)}>{author}</h3>
                                                <p className="text-sm text-slate-400">{post.authorHeadline}</p>
                                                <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                                                    <Globe className="w-3 h-3" />
                                                    <span>{getTimeAgo(post.createdAt)}</span>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                            <p className="whitespace-pre-wrap text-slate-300 leading-relaxed text-base">{post.content}</p>
                                            {post.media && (
                                                <img
                                                    src={post.media?.url || "/placeholder.svg"}
                                                    alt="Post image"
                                                    className="w-full h-full h-64 object-cover rounded-lg border border-slate-700"
                                                />
                                            )}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {post.tags.map((tag, index) => (
                                                        <Badge key={index} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>
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
                                                            const commentAuthor = comment?.user?.name
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
                                                        <p className="text-slate-400 text-center text-sm">
                                                            No comments yet. Be the first to comment!
                                                        </p>
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
                                                                className="self-end bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                            >
                                                                Post Comment
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-6">

                        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur top-4">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <UserPlus className="w-5 h-5" />
                                    <span>People You May Know</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                                    >
                                        <Avatar className="w-10 h-10 border-2 border-slate-600">
                                            <AvatarImage src={user?.profileDetails[0]?.avatar?.url || "/placeholder.svg"} alt={user.name} />
                                            <AvatarFallback>
                                                {user.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-white text-sm truncate">{user.name}</h4>
                                            <p className="text-xs text-slate-400 truncate">{user.profileDetails[0].headline}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {user.profileDetails[0]?.skills.slice(0, 2).map((skill, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="border-slate-600 text-slate-300 text-xs px-1 py-0"
                                                    >
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                {/* <span className="text-xs text-slate-500">{user.mutualConnections} mutual</span> */}
                                                <Button
                                                    onClick={() => handleConnectUser(user._id)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white text-xs h-6 px-2"
                                                >
                                                    Connect
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300 text-sm cursor-pointer" onClick={() => navigate('/users')}>
                                    View All Users
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    <span>AI Learning Suggestions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {aiSuggestionsLoading ? (
                                    // Loading state
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 animate-pulse">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="h-4 bg-slate-600 rounded w-24"></div>
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="h-3 bg-slate-600 rounded w-16"></div>
                                                        <div className="h-3 bg-slate-600 rounded w-12"></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mb-3">
                                                    <div className="h-3 bg-slate-600 rounded w-full"></div>
                                                    <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <div className="h-6 bg-slate-600 rounded w-20"></div>
                                                    <div className="h-6 bg-slate-600 rounded w-16"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : aiSuggestionsError ? (
                                    // Error fallback
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <X className="w-6 h-6 text-red-400" />
                                        </div>
                                        <h4 className="font-semibold text-white mb-2">Unable to Load Suggestions</h4>
                                        <p className="text-slate-400 text-sm mb-4">
                                            We couldn't fetch AI learning suggestions at the moment.
                                        </p>
                                        <Button
                                            onClick={fetchAiSuggestions}
                                            size="sm"
                                            variant="outline"
                                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                ) : aiSuggestions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <Sparkles className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <h4 className="font-semibold text-white mb-2">No Suggestions Available</h4>
                                        <p className="text-slate-400 text-sm mb-4">
                                            Complete your profile to get personalized learning suggestions.
                                        </p>
                                        <Button
                                            onClick={() => navigate('/profile')}
                                            size="sm"
                                            variant="outline"
                                            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                                        >
                                            Complete Profile
                                        </Button>
                                    </div>
                                ) : (
                                    // Success state
                                    <>
                                        {(showAllSuggestions ? aiSuggestions : aiSuggestions.slice(0, 3)).map((suggestion, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors border border-slate-600/50"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-semibold text-white text-sm">{suggestion.topic}</h4>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-1">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${suggestion.difficulty === "Beginner"
                                                                ? "border-green-600 text-green-400"
                                                                : suggestion.difficulty === "Intermediate"
                                                                    ? "border-yellow-600 text-yellow-400"
                                                                    : "border-red-600 text-red-400"
                                                                }`}
                                                        >
                                                            {suggestion.difficulty}
                                                        </Badge>
                                                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                                                            {suggestion.category}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{suggestion.reason}</p>

                                                <div className="flex items-center justify-between">
                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-blue-400 hover:text-blue-300 text-xs h-6 px-2"
                                                            >
                                                                📖 Resources ({suggestion.resources?.length || 0})
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            className="w-64 bg-slate-800 border-slate-700 text-white z-50 shadow-xl"
                                                            align="start"
                                                            side="bottom"
                                                            sideOffset={8}
                                                            avoidCollisions={true}
                                                            collisionPadding={16}
                                                        >
                                                            <DropdownMenuLabel className="font-normal">
                                                                <div className="flex flex-col space-y-1">
                                                                    <p className="text-sm font-medium leading-none">{suggestion.topic} Resources</p>
                                                                    <p className="text-xs leading-none text-slate-400">Click to open in new tab</p>
                                                                </div>
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {suggestion.resources?.map((resource, index) => (
                                                                <DropdownMenuItem
                                                                    key={index}
                                                                    className="focus:bg-slate-700 cursor-pointer"
                                                                    onClick={() => window.open(resource.url, "_blank")}
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm">{resource.name}</span>
                                                                        <span className="text-xs text-slate-400 truncate">{resource.url}</span>
                                                                    </div>
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <span className="text-xs text-slate-500">📚 {suggestion.resources?.length || 0} resources</span>
                                                </div>
                                            </div>
                                        ))}
                                        {aiSuggestions.length > 3 && (
                                            <Button
                                                variant="ghost"
                                                className="w-full text-purple-400 hover:text-purple-300 text-sm"
                                                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                                            >
                                                {showAllSuggestions
                                                    ? `Show Less`
                                                    : `View All Suggestions (${aiSuggestions.length})`
                                                }
                                            </Button>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <FloatingChatButton />
        </Layout>
    )
}
