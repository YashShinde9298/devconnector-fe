import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, MapPin, Briefcase, GraduationCap, Award, Mail, Calendar, Building, Target, ChevronRight, Send, ThumbsUp, Copy, Lightbulb, Edit, TrendingUp, Link2 } from "lucide-react";
import profileIcon from '../../assets/complete-profile-illustration.svg';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import { NavbarAvatar } from "@/components/navbar-avatar/NavbarAvatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@radix-ui/react-progress";
import { Textarea } from "@/components/ui/textarea";
import { FloatingProfileCoach } from "@/components/floating-profile-coach/FloatingProfileCoach";
import { Layout } from "@/components/layout/Layout"

export default function ViewProfile() {
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        title: "",
        bio: "",
        location: "",
        linkedInUrl: "",
        avatar: "",
        completenessScore: 0,
        connections: 0,
        skills: [],
        experiences: [
            {
                id: "",
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                description: "",
                present: false
            }
        ],
        educations: [
            {
                id: "",
                instituteName: "",
                degree: "",
                startDate: "",
                endDate: "",
            }
        ],
        certifications: [
            {
                id: "",
                name: "",
                issuingOrganization: "",
                issueDate: "",
            }
        ],
    })

    const [currentUser, setCurrentUser] = useState({
        name: "",
        email: "",
        avatar: ""
    })

    const [coachExpanded, setCoachExpanded] = useState(false)
    const [coachMessages, setCoachMessages] = useState<any[]>([])
    const [coachInput, setCoachInput] = useState("")
    const [coachLoading, setCoachLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const navigate = useNavigate();

    const fetchProfileDetails = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/users/profile-details');
            const data = response?.data?.data;
            console.log(data);
            setProfileData((prevData) => ({
                ...prevData,
                name: data?.name || "",
                email: data?.email || "",
                completenessScore: data?.completenessScore,
                connections: data?.connections,
                title: data?.profileDetails[0]?.headline || "",
                bio: data?.profileDetails[0]?.bio || "",
                location: data?.profileDetails[0]?.location || "",
                linkedInUrl: data?.profileDetails[0]?.linkedInUrl || "",
                avatar: data?.profileDetails[0]?.avatar?.url?.replace("http://", "https://") || "",
                skills: data?.profileDetails[0]?.skills || [],
                experiences: data?.profileDetails[0]?.experience || [],
                educations: data?.profileDetails[0]?.education || [],
                certifications: data?.profileDetails[0]?.certifications || [],
            }));
        } catch (error) {
            console.error("Error fetching profile details : ", error);
            toast.error("Something went wrong while fetching profile details");
        }
    }

    useEffect(() => {
        setCurrentUser({
            name: localStorage.getItem('userName') || "",
            email: localStorage.getItem('userEmail') || "",
            avatar: localStorage.getItem('userAvatar') || ""
        })
        fetchProfileDetails();
    }, [])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
        if (remainingMonths === 0) return `${years} year${years !== 1 ? "s" : ""}`;
        return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const sendCoachMessage = async (promptType?: string, customPrompt?: string) => {
        const finalPrompt = customPrompt || coachInput;
        if (!finalPrompt.trim()) return

        try {
            setCoachLoading(true);
            const response = await axiosInstance.post("/api/v1/ai/profile-improvement", {
                promptType: promptType || "custom",
                customPrompt: finalPrompt
            });

            const aiReply = response.data?.data?.reply;
            setCoachMessages((prev) => [
                ...prev,
                { role: "user", content: finalPrompt },
                { role: "assistant", content: aiReply }
            ]);

            setCoachInput("");
        } catch (err) {
            console.error("AI Coach error:", err);
            toast.error("Something went wrong while fetching AI response");
        } finally {
            setCoachInput("");
            setCoachLoading(false);
        }
    }

    useEffect(() => {
        if (coachExpanded) {
            scrollToBottom()
        }
    }, [coachMessages, coachExpanded])

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card className="relative border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardContent className="p-8">
                            <div className="absolute top-4 right-4 space-x-4">
                                <Button
                                    onClick={() => navigate("/edit-profile")}
                                    className="px-4 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow"
                                >
                                    Edit Profile
                                </Button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                                <div className="relative">
                                    <img
                                        src={profileData.avatar || profileIcon}
                                        alt={profileData.name}
                                        className="w-32 h-32 rounded-full border-4 border-slate-600 object-cover"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800"></div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-3xl font-bold text-white mb-2">{profileData.name}</h1>
                                    <p className="text-xl text-blue-400 mb-4">{profileData.title}</p>
                                    <p className="text-slate-300 mb-4 leading-relaxed">{profileData.bio}</p>
                                    <div className="flex items-center space-x-2 text-slate-400 text-sm mb-4">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{profileData.connections || 0} Connections</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-slate-400">
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{profileData.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{profileData.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Link to={profileData.linkedInUrl} target="_blank" className="flex items-center space-x-2">
                                                <Link2 className="w-4 h-4" />
                                                <span>LinkedIn</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <Code2 className="w-5 h-5" />
                                    <span>Skills & Technologies</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    {profileData.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="bg-blue-600 text-white px-3 py-1 text-sm">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <Briefcase className="w-5 h-5" />
                                    <span>Work Experience</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {profileData.experiences && profileData.experiences.length > 0 ? (
                                    profileData.experiences.map((exp, index) => (
                                        <div key={exp.id} className="relative">
                                            {index !== profileData.experiences.length - 1 && (
                                                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-600"></div>
                                            )}
                                            <div className="flex space-x-4">
                                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Building className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                                        <h3 className="text-xl font-semibold text-white">{exp.position}</h3>
                                                        <div className="flex items-center space-x-2 text-slate-400 text-sm">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>
                                                                {formatDate(exp.startDate)} - {exp.present ? "Present" : formatDate(exp.endDate)}
                                                            </span>
                                                            <span className="text-slate-500">
                                                                ({calculateDuration(exp.startDate, exp.present ? new Date(Date.now()).toISOString().split("T")[0] : exp.endDate)})
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-blue-400 font-medium mb-3">{exp.company}</p>
                                                    <p className="text-slate-300 leading-relaxed">{exp.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 flex flex-col items-center justify-center text-slate-400">
                                        <Briefcase className="w-10 h-10 mb-3 text-slate-500" />
                                        <p className="text-lg font-semibold text-white">No Work Experience</p>
                                        <p className="text-sm text-slate-400">
                                            You haven’t added any work experience yet. Showcase your roles and achievements to strengthen your profile.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <GraduationCap className="w-5 h-5" />
                                    <span>Education</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {profileData.educations && profileData.educations.length > 0 ? (
                                    profileData.educations.map((edu, index) => (
                                        <div key={edu.id} className="relative">
                                            {index !== profileData.educations.length - 1 && (
                                                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-600"></div>
                                            )}
                                            <div className="flex space-x-4">
                                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <GraduationCap className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                                        <h3 className="text-xl font-semibold text-white">{edu.degree}</h3>
                                                        <div className="flex items-center space-x-2 text-slate-400 text-sm">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>
                                                                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-purple-400 font-medium">{edu.instituteName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 flex flex-col items-center justify-center text-slate-400">
                                        <GraduationCap className="w-10 h-10 mb-3 text-slate-500" />
                                        <p className="text-lg font-semibold text-white">No Education History</p>
                                        <p className="text-sm text-slate-400">Your educational background hasn't been added yet. Add your degrees or certifications to strengthen your profile.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <Award className="w-5 h-5" />
                                    <span>Certifications</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {profileData.certifications && profileData.certifications.length > 0 ? (
                                    profileData.certifications.map((cert) => (
                                        <div key={cert.id} className="flex items-center space-x-4 p-4 border border-slate-600 rounded-lg">
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
                                    ))
                                ) : (
                                    <div className="text-center py-10 flex flex-col items-center justify-center text-slate-400">
                                        <Award className="w-10 h-10 mb-3 text-slate-500" />
                                        <p className="text-lg font-semibold text-white">No Certifications Added</p>
                                        <p className="text-sm text-slate-400">You haven’t added any certifications yet. Start by adding one to showcase your accomplishments.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-400">{profileData.skills.length}</div>
                                        <div className="text-slate-400 text-sm">Skills</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-400">{profileData.experiences.length}</div>
                                        <div className="text-slate-400 text-sm">Experience</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-400">{profileData.certifications.length}</div>
                                        <div className="text-slate-400 text-sm">Certifications</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-yellow-400">{profileData.completenessScore}%</div>
                                        <div className="text-slate-400 text-sm">Complete</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <FloatingProfileCoach />
                </div>
            </div>
        </Layout>
    )
}
