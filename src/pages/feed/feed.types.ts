export interface PostType {
    _id: string;
    content: string;
    media?: {
        url: string;
        public_id: string;
    };
    tags: string[];
    likesCount: number;
    commentsCount: number;
    authorId: string;
    authorName: string;
    authorHeadline: string;
    authorAvatar: string;
    createdAt: string;
    updatedAt: string;
    isLikedByCurrentUser: boolean;
    comments: CommentType[];
}

export interface CommentType {
    _id: string;
    content: string;
    postId: string;
    createdAt: string;
    updatedAt: string;
    user: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        headline: string;
    };
}

export type Resource = {
    name: string;
    url: string;
};

export type LearningTopic = {
    topic: string;
    reason: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    category: string;
    resources: Resource[];
};

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    completenessScore: number;
    createdAt: string;
    updatedAt: string;
    userProfile: string;
    profileDetails: ProfileDetail[];
}


export interface ProfileDetail {
    _id: string;
    headline: string;
    skills: string[];
    avatar: {
        url: string;
        public_id: string;
    };
    bio: string;
    location: string;
    linkedInUrl: string;
    experience: Experience[];
    education: Education[];
    certifications: Certification[];
    user: string;
    createdAt: string;
    updatedAt: string;
}

export interface Experience {
    _id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    present: boolean;
    description: string;
}

export interface Education {
    _id: string;
    instituteName: string;
    degree: string;
    startDate: string;
    endDate: string;
}

export interface Certification {
    _id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
}

