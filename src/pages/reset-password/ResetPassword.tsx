import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Save, Code2 } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/api/axios"

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [token, setToken] = useState("")
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    })
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const resetToken = searchParams.get('token')
        if (!resetToken) {
            toast.error("Invalid reset link")
            navigate('/login')
            return
        }
        setToken(resetToken)
    }, [searchParams, navigate])

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const togglePasswordVisibility = (field: 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const isFormValid = () => {
        return formData.newPassword.length >= 6 &&
               formData.confirmPassword.length >= 6 &&
               formData.newPassword === formData.confirmPassword
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!isFormValid()) {
            toast.error("Please fill all fields correctly")
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords don't match")
            return
        }

        setIsLoading(true)
        try {
            const response = await axiosInstance.post('/api/v1/users/reset-password', {
                token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            })

            if (response?.data?.success) {
                toast.success("Password reset successfully! Please login with your new password.")
                navigate('/login')
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to reset password"
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Code2 className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            DevConnector
                        </h1>
                    </div>
                </div>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                            <Lock className="w-5 h-5" />
                            <span>Reset Password</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-slate-300">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPasswords.new ? "text" : "password"}
                                        placeholder="Enter your new password"
                                        value={formData.newPassword}
                                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                        required
                                        minLength={6}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => togglePasswordVisibility('new')}
                                    >
                                        {showPasswords.new ? (
                                            <EyeOff className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-400" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Password must be at least 6 characters long
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-slate-300">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showPasswords.confirm ? "text" : "password"}
                                        placeholder="Confirm your new password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                        required
                                        minLength={6}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                    >
                                        {showPasswords.confirm ? (
                                            <EyeOff className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-400" />
                                        )}
                                    </Button>
                                </div>
                                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                    <p className="text-xs text-red-400">
                                        Passwords don't match
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={!isFormValid() || isLoading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? "Resetting Password..." : "Reset Password"}
                            </Button>

                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-blue-400 hover:text-blue-300"
                                    onClick={() => navigate('/login')}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}