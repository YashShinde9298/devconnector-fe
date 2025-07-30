import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Code2, Users, Zap, Eye, EyeOff, CheckCircle, Mail } from "lucide-react"
// import axiosInstance from "@/api/axios"
// import { setAuthToken } from "@/utils/tokenUtils"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import ForgotPasswordModal from "@/components/forgot-password-modal/ForgotPasswordModal"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { initializeSocket, loginUser, registerUser } from "@/slices/authSlice"

export default function AuthPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
    })
    const [signupForm, setSignupForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // const response = await axiosInstance.post('/api/v1/users/login', loginForm);
            // if (response?.data?.success) {
            //     setAuthToken(response?.data?.data?.accessToken)
            //     toast.success(response?.data?.message);
            //     localStorage.setItem('userName', response?.data?.data?.user?.name);
            //     localStorage.setItem('userEmail', response?.data?.data?.user?.email);
            //     localStorage.setItem('userAvatar', response?.data?.data?.profile?.avatar?.url);
            //     localStorage.setItem('userId', response?.data?.data?.user?._id);
            //     response?.data?.data?.user?.completenessScore < 100 ? navigate('/profile-completion', {
            //         state: {
            //             completenessScore: response?.data?.data?.user?.completenessScore
            //         }
            //     }) : navigate('/feed');
            // }
            const resultAction = await dispatch(loginUser(loginForm));
            if (loginUser.fulfilled.match(resultAction)) {
                const userId = resultAction.payload.user._id;
                dispatch(initializeSocket(userId));
                const score = resultAction.payload.user.completenessScore;
                navigate(score < 100 ? '/profile-completion' : '/feed', {
                    state: { completenessScore: score },
                });
            }
        } catch (error) {
            toast.error("Invalid Credentials!")
            console.log(error)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        // try {
        //     const response = await axiosInstance.post('/api/v1/users/register', {
        //         email: signupForm.email,
        //         name: signupForm.name,
        //         password: signupForm.password
        //     })

        //     if (response?.data?.success) {
        //         setAuthToken(response?.data?.data?.accessToken)
        //         localStorage.setItem('userName', response?.data?.data?.user?.name);
        //         localStorage.setItem('userEmail', response?.data?.data?.user?.email);
        //         localStorage.setItem('userId', response?.data?.data?.user?._id);
        //         toast.success(response?.data?.message)
        //         navigate('/profile-completion', {
        //             state: {
        //                 completenessScore: response?.data?.data?.user?.completenessScore
        //             }
        //         })
        //     }

        const { name, email, password } = signupForm;

        try {
            const resultAction = await dispatch(registerUser({ name, email, password }));
            if (registerUser.fulfilled.match(resultAction)) {
                const userId = resultAction.payload.user._id;
                dispatch(initializeSocket(userId));

                const score = resultAction.payload.user.completenessScore;
                navigate('/profile-completion', {
                    state: { completenessScore: score },
                });
            }
        } catch (error) {
            toast.error("Something went wrong!")
            console.log(error);
        }
    }

    const features = [
        { icon: Code2, text: "Showcase your coding skills" },
        { icon: Users, text: "Connect with developers globally" },
        { icon: Zap, text: "AI-powered skill matching" },
    ]

    const isSignUpFormValid = () => {
        const { email, name, password, confirmPassword } = signupForm;
        return (email?.trim() !== "" && name?.trim() !== "" && password?.trim() !== "" && confirmPassword?.trim() !== "" && password === confirmPassword)
    }

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URI}/api/v1/auth/google`;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
                <div className="hidden lg:block space-y-8 text-white">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Code2 className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                DevConnector
                            </h1>
                        </div>
                        <p className="text-xl text-slate-300">The ultimate social network for developers</p>
                    </div>

                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-slate-300">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <p className="text-slate-400">Join thousands of developers already connected</p>
                        <div className="flex space-x-4">
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                AI-Powered Matching
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Real-time Chat
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
                                    <CardDescription className="text-slate-400">Sign in to your DevConnector account</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleLogin}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="login-email" className="text-slate-300">
                                                Email
                                            </Label>
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="developer@example.com"
                                                value={loginForm.email}
                                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="login-password" className="text-slate-300">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="login-password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    value={loginForm.password}
                                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-slate-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="link"
                                                className="px-0 text-blue-400 hover:text-blue-300"
                                                onClick={() => setShowForgotPassword(true)}
                                            >
                                                Forgot password?
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            Sign In
                                        </Button>
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-slate-600" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
                                            </div>
                                        </div>
                                    </CardFooter>
                                </form>
                                <div className="flex items-center justify-center">
                                    <Button variant="outline" className="border-slate-600 bg-slate-700 hover:bg-slate-600" onClick={() => handleGoogleLogin()}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Google
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="signup">
                            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-2xl text-white">Create account</CardTitle>
                                    <CardDescription className="text-slate-400">Join the developer community today</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleSignup}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-name" className="text-slate-300">
                                                Full Name
                                            </Label>
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="John Doe"
                                                value={signupForm.name}
                                                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email" className="text-slate-300">
                                                Email
                                            </Label>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="developer@example.com"
                                                value={signupForm.email}
                                                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-password" className="text-slate-300">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="signup-password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a strong password"
                                                    value={signupForm.password}
                                                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-slate-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-confirm-password" className="text-slate-300">
                                                Confirm Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="signup-confirm-password"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm your password"
                                                    value={signupForm.confirmPassword}
                                                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 text-slate-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col space-y-4 mt-4">
                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            disabled={!isSignUpFormValid()}
                                        >
                                            Create Account
                                        </Button>
                                        <p className="text-xs text-slate-400 text-center">
                                            By creating an account, you agree to our{" "}
                                            <Button variant="link" className="px-0 h-auto text-blue-400 hover:text-blue-300">
                                                Terms of Service
                                            </Button>{" "}
                                            and{" "}
                                            <Button variant="link" className="px-0 h-auto text-blue-400 hover:text-blue-300">
                                                Privacy Policy
                                            </Button>
                                        </p>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="lg:hidden mt-8 text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Code2 className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                DevConnector
                            </h1>
                        </div>
                        <p className="text-slate-400">Connect. Code. Collaborate.</p>
                    </div>
                </div>
            </div>
            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
            />
        </div>
    )
}
