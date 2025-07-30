import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Code2, User, Briefcase, CheckCircle, ArrowRight } from "lucide-react"
import profileCompleteIcon from '../../assets/complete-profile-illustration.svg';
import { useLocation, useNavigate } from "react-router-dom"

export default function CompleteProfilePage() {
    const location = useLocation();
    const completenessScore = location?.state?.completenessScore;

    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Code2 className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                DevConnector
                            </h1>
                        </div>
                        <Button variant="outline" className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white" onClick={() => navigate('/feed')}>
                            Skip for now
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Welcome Section */}
                    <div className="text-center mb-8">
                        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-slate-600">
                            <img
                                src={profileCompleteIcon}
                                alt="Complete Profile Illustration"
                                className="w-20 h-20 opacity-80"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Welcome to DevConnector! 👋</h2>
                        <p className="text-xl text-slate-300 mb-2">Let's complete your developer profile</p>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            A complete profile helps other developers discover you, increases your visibility, and unlocks AI-powered
                            features like skill matching and personalized recommendations.
                        </p>
                    </div>

                    {/* Progress Overview */}
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur mb-8">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Profile Completion</span>
                                </CardTitle>
                                <Badge variant="secondary" className="bg-blue-600 text-white">
                                    {completenessScore}% Complete
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Progress value={completenessScore} className="h-3 bg-slate-700" />
                                <div className="flex justify-end text-sm text-slate-400">
                                    <span>{100 - completenessScore}% remaining</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Benefits Section */}
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur mb-8">
                        <CardHeader>
                            <CardTitle className="text-white">Why complete your profile?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <User className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Get Discovered</h4>
                                    <p className="text-slate-400 text-sm">
                                        Other developers can find and connect with you based on your skills and experience.
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Code2 className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">AI Matching</h4>
                                    <p className="text-slate-400 text-sm">
                                        Get personalized recommendations for collaborators and projects.
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Briefcase className="w-6 h-6 text-green-400" />
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Opportunities</h4>
                                    <p className="text-slate-400 text-sm">
                                        Showcase your work and attract potential collaborators and employers.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            onClick={() => navigate('/edit-profile')}
                        >
                            Complete Profile Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button size="lg" variant="outline" className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white" onClick={() => navigate('/feed')}>
                            Explore Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
