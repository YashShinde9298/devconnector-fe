import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Code2, User, Camera, MapPin, Briefcase, GraduationCap, Award, Plus, X, Save } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/api/axios"
import { useNavigate } from "react-router-dom"
import { NavbarAvatar } from "@/components/navbar-avatar/NavbarAvatar"
import type { Certification, Education, Experience } from "./edit-profile.types"
import { FloatingProfileCoach } from "@/components/floating-profile-coach/FloatingProfileCoach"
import { Layout } from "@/components/layout/Layout"

export default function EditProfile() {
    const [avatar, setAvatar] = useState<File | string | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>("")
    const [skillsInput, setSkillsInput] = useState("")
    const [skills, setSkills] = useState<string[]>([]);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        title: "",
        bio: "",
        location: "",
        linkedInUrl: "",
        completenessScore: 0
    })
    const [experiences, setExperiences] = useState<Experience[]>([
        {
            id: Date.now().toString(),
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            description: "",
            present: false,
        },
    ])
    const [educations, setEducations] = useState<Education[]>([
        {
            id: Date.now().toString(),
            instituteName: "",
            degree: "",
            startDate: "",
            endDate: "",
        },
    ])
    const [certifications, setCertifications] = useState<Certification[]>([
        {
            id: Date.now().toString(),
            name: "",
            issuingOrganization: "",
            issueDate: "",
        },
    ])

    const [currentUser, setCurrentUser] = useState({
        name: "",
        email: "",
        avatar: ""
    })

    const navigate = useNavigate();

    const formatToMonthInput = (date: string | number | null | undefined): string => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const fetchProfileDetails = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/users/profile-details');
            const data = response?.data?.data;
            const profile = data?.profileDetails?.[0];
            console.log(profile);
            setProfileData((prev) => ({
                ...prev,
                name: data?.name || "",
                email: data?.email || "",
                completenessScore: data?.completenessScore || 0,
                title: profile?.headline || "",
                bio: profile?.bio || "",
                location: profile?.location || "",
                linkedInUrl: profile?.linkedInUrl || "",
            }));
            setSkills(profile?.skills || []);
            setAvatar(profile?.avatar?.url || "");
            setAvatarPreview(profile?.avatar?.url || "");
            const formattedExperiences = profile?.experience?.length
                ? profile.experience.map((exp: any) => ({
                    id: Date.now().toString() + Math.random(),
                    company: exp.company || "",
                    position: exp.position || "",
                    startDate: formatToMonthInput(exp.startDate),
                    endDate: exp.present ? "" : formatToMonthInput(exp.endDate),
                    description: exp.description || "",
                    present: exp.present || false,
                }))
                : [
                    {
                        id: Date.now().toString(),
                        company: "",
                        position: "",
                        startDate: "",
                        endDate: "",
                        description: "",
                        present: false
                    }
                ];
            setExperiences(formattedExperiences);
            setEducations(
                (profile?.education?.length
                    ? profile.education.map((edu: any) => ({
                        id: crypto.randomUUID(),
                        instituteName: edu.instituteName || "",
                        degree: edu.degree || "",
                        startDate: formatToMonthInput(edu.startDate),
                        endDate: formatToMonthInput(edu.endDate),
                    }))
                    : [
                        {
                            id: Date.now().toString(),
                            institution: "",
                            degree: "",
                            startDate: "",
                            endDate: "",
                        }
                    ]
                ) as Education[]);
            setCertifications(
                (profile?.certifications?.length
                    ? profile.certifications.map((cert: any) => ({
                        id: crypto.randomUUID(),
                        name: cert.name || "",
                        issuingOrganization: cert.issuingOrganization || "",
                        issueDate: formatToMonthInput(cert.issueDate),
                    })) : [
                        {
                            id: Date.now().toString(),
                            name: "",
                            issuingOrganization: "",
                            issueDate: "",
                        }
                    ]) as Certification[]
            );
        } catch (error) {
            console.log("Error fetching profile details : ", error);
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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatar(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSkillsKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            const newSkill = skillsInput.trim()
            if (newSkill && !skills.includes(newSkill)) {
                setSkills([...skills, newSkill])
                setSkillsInput("")
            }
        }
    }

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((skill) => skill !== skillToRemove))
    }

    const addExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            description: "",
            present: false,
        }
        setExperiences([...experiences, newExp])
    }

    const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
        setExperiences(experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
    }

    const removeExperience = (id: string) => {
        setExperiences(experiences.filter((exp) => exp.id !== id))
    }

    const addEducation = () => {
        const newEdu: Education = {
            id: Date.now().toString(),
            instituteName: "",
            degree: "",
            startDate: "",
            endDate: "",
        }
        setEducations([...educations, newEdu])
    }

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setEducations(educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))
    }

    const removeEducation = (id: string) => {
        setEducations(educations.filter((edu) => edu.id !== id))
    }

    const addCertification = () => {
        const newCert: Certification = {
            id: Date.now().toString(),
            name: "",
            issuingOrganization: "",
            issueDate: "",
        }
        setCertifications([...certifications, newCert])
    }

    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        setCertifications(certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)))
    }

    const removeCertification = (id: string) => {
        setCertifications(certifications.filter((cert) => cert.id !== id))
    }

    const isFormvalid = () => {
        const { name, email, title, bio, linkedInUrl, location } = profileData;
        return name?.trim() !== "" && email?.trim() !== "" && title?.trim() !== "" && bio?.trim() !== "" && linkedInUrl?.trim() !== "" && location?.trim() !== "" && (avatar instanceof File || typeof avatar === "string");
    }

    const handleSave = async () => {
        const formData = new FormData();
        const getValueOrNull = (value: string) => value?.trim() === "" ? null : value;
        formData.append("linkedInUrl", profileData.linkedInUrl);
        formData.append("location", profileData.location);
        formData.append("headline", profileData.title);
        formData.append("bio", profileData.bio);
        const filteredSkills = skills.filter(skill => skill.trim() !== "");
        formData.append("skills", filteredSkills.length ? JSON.stringify(filteredSkills) : "[]");

        const filteredExperiences = experiences
            .filter(exp =>
                exp?.company?.trim() || exp?.position?.trim() || exp?.startDate || exp?.endDate || exp?.description?.trim()
            )
            .map(exp => ({
                company: getValueOrNull(exp?.company),
                position: getValueOrNull(exp?.position),
                startDate: exp?.startDate ? new Date(exp?.startDate) : null,
                endDate: exp?.present ? null : (exp?.endDate ? new Date(exp?.endDate) : null),
                description: getValueOrNull(exp?.description),
                present: exp?.present
            }));
        formData.append("experience", JSON.stringify(filteredExperiences));

        const filteredEducations = educations
            .filter(edu =>
                edu?.instituteName?.trim() || edu?.degree?.trim() || edu?.startDate || edu?.endDate
            )
            .map(edu => ({
                instituteName: getValueOrNull(edu?.instituteName),
                degree: getValueOrNull(edu?.degree),
                startDate: edu?.startDate ? new Date(edu?.startDate) : null,
                endDate: edu?.endDate ? new Date(edu?.endDate) : null,
            }));
        formData.append("education", JSON.stringify(filteredEducations));

        const filteredCertifications = certifications
            .filter(cert =>
                cert?.name?.trim() || cert?.issuingOrganization?.trim() || cert?.issueDate
            )
            .map(cert => ({
                name: getValueOrNull(cert?.name),
                issuingOrganization: getValueOrNull(cert?.issuingOrganization),
                issueDate: cert?.issueDate ? new Date(cert?.issueDate) : null,
            }));
        formData.append("certifications", JSON.stringify(filteredCertifications));

        if (avatar) {
            formData.append("avatar", avatar);
        }

        try {
            const response = await axiosInstance.put("/api/v1/users/profile-details",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            if (response?.data?.success) {
                toast.success(response?.data?.message);
                localStorage.setItem('userAvatar', response?.data?.data[0]?.profileDetails[0]?.avatar?.url)
                navigate('/view-profile');
            }
        } catch (error) {
            toast.error("Something went wrong while saving profile details");
            console.error("Error while saving porfile details : ", error);
        }
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center space-x-2">
                                <User className="w-5 h-5" />
                                <span>Basic Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview || "/placeholder.svg"}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Camera className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Profile Picture<span className="text-red-500">*</span></h3>
                                    <p className="text-slate-400 text-sm">Click to upload a new avatar</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-300">
                                        Full Name<span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">
                                        Email<span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        value={profileData.email}
                                        disabled
                                        className="bg-slate-600 border-slate-500 text-slate-300 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-slate-300">
                                    Professional Title<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={profileData.title}
                                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="e.g., Full Stack Developer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-slate-300">
                                    Bio<span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="bio"
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-slate-300">
                                    LinkedIn Profile<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="location"
                                    value={profileData.linkedInUrl}
                                    onChange={(e) => setProfileData({ ...profileData, linkedInUrl: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="https://www.linkedin.com/in/xyz"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-slate-300">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Location<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="location"
                                    value={profileData.location}
                                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="e.g., San Francisco, CA"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center space-x-2">
                                <Code2 className="w-5 h-5" />
                                <span>Skills & Technologies</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="skills" className="text-slate-300">
                                    Add Skills (press Enter or comma to add)
                                </Label>
                                <Input
                                    id="skills"
                                    value={skillsInput}
                                    onChange={(e) => setSkillsInput(e.target.value)}
                                    onKeyDown={handleSkillsKeyPress}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="Type a skill and press Enter"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-600 text-white">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-300">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <Briefcase className="w-5 h-5" />
                                    <span>Work Experience</span>
                                </CardTitle>
                                <Button
                                    onClick={addExperience}
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 bg-transparent"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Experience
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {experiences.map((exp, index) => (
                                <div key={exp.id} className="space-y-4 p-4 border border-slate-600 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-medium">Experience {index + 1}</h4>
                                        <Button
                                            onClick={() => removeExperience(exp.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Company</Label>
                                            <Input
                                                value={exp.company}
                                                onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                                placeholder="Company name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Position</Label>
                                            <Input
                                                value={exp.position}
                                                onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                                placeholder="Job title"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Start Date</Label>
                                            <Input
                                                type="month"
                                                value={exp.startDate}
                                                onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">End Date</Label>
                                            <div className="space-y-3">
                                                <Input
                                                    type="month"
                                                    value={exp.endDate}
                                                    onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                                                    className="bg-slate-700 border-slate-600 text-white"
                                                    disabled={exp.present}
                                                    placeholder={exp.present ? "Present" : ""}
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`present-${exp.id}`}
                                                        checked={exp.present}
                                                        onCheckedChange={(checked) => updateExperience(exp.id, "present", checked as boolean)}
                                                        className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                    <Label htmlFor={`present-${exp.id}`} className="text-slate-300 text-sm cursor-pointer">
                                                        I currently work here
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Description</Label>
                                        <Textarea
                                            value={exp.description}
                                            onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                                            className="bg-slate-700 border-slate-600 text-white"
                                            placeholder="Describe your role and achievements..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <GraduationCap className="w-5 h-5" />
                                    <span>Education</span>
                                </CardTitle>
                                <Button
                                    onClick={addEducation}
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 bg-transparent"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Education
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {educations.map((edu, index) => (
                                <div key={edu.id} className="space-y-4 p-4 border border-slate-600 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-medium">Education {index + 1}</h4>
                                        <Button
                                            onClick={() => removeEducation(edu.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Institution</Label>
                                            <Input
                                                value={edu.instituteName}
                                                onChange={(e) => updateEducation(edu.id, "instituteName", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                                placeholder="University/School name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Degree</Label>
                                            <Input
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                                placeholder="Degree/Certificate"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Start Date</Label>
                                            <Input
                                                type="month"
                                                value={edu.startDate}
                                                onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">End Date</Label>
                                            <Input
                                                type="month"
                                                value={edu.endDate}
                                                onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <Award className="w-5 h-5" />
                                    <span>Certifications</span>
                                </CardTitle>
                                <Button
                                    onClick={addCertification}
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 bg-transparent"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Certification
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {certifications.map((cert, index) => (
                                <div key={cert.id} className="space-y-4 p-4 border border-slate-600 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-medium">Certification {index + 1}</h4>
                                        <Button
                                            onClick={() => removeCertification(cert.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Certification Name</Label>
                                            <Input
                                                value={cert.name}
                                                onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                                placeholder="Certification title"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Issuing Organization</Label>
                                            <Input
                                                value={cert.issuingOrganization}
                                                onChange={(e) => updateCertification(cert.id, "issuingOrganization", e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white"
                                                placeholder="Organization name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Issue Date</Label>
                                        <Input
                                            type="month"
                                            value={cert.issueDate}
                                            onChange={(e) => updateCertification(cert.id, "issueDate", e.target.value)}
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <Button
                            onClick={handleSave}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            disabled={!isFormvalid()}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Save Profile
                        </Button>
                    </div>
                </div>
                <FloatingProfileCoach />
            </div>
        </Layout>
    )
}
