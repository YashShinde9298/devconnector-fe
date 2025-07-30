export interface CommentType {
    _id: string
    content: string
    postId: string
    createdAt: string
    updatedAt: string
    user: {
        _id: string
        name: string
        email: string
        avatar?: string
        headline: string
    }
}

export interface PostType {
    _id: string
    content: string
    likesCount: number
    commentsCount: number
    createdAt: string
    updatedAt: string
    media?: {
        url: string
        public_id: string
    }
    tags?: string[]
    comments: CommentType[]
    isLikedByCurrentUser: boolean
    authorId: string
    authorName: string
    authorHeadline?: string
    authorAvatar?: string
}

export interface ProfileData {
    name: string
    email: string
    title: string
    bio: string
    location: string
    avatar: string
    connections: number
    skills: string[]
    experiences: any[]
    educations: any[]
    certifications: any[]
}
