export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    completenessScore: number;
    createdAt: string;
    updatedAt: string;
    userProfile: string;
    connections: number;
    profileDetails: ProfileDetail[];
    isFollowing: boolean;
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

