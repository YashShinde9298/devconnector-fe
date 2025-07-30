import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Save } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/api/axios"
import { useNavigate } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    })
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    })
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const isFormValid = () => {
        return formData.oldPassword.length >= 6 &&
               formData.newPassword.length >= 6 &&
               formData.confirmNewPassword.length >= 6 &&
               formData.newPassword === formData.confirmNewPassword
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!isFormValid()) {
            toast.error("Please fill all fields correctly")
            return
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error("New password and confirm password don't match")
            return
        }

        setIsLoading(true)
        try {
            const response = await axiosInstance.put('/api/v1/users/change-password', {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmNewPassword
            })

            if (response?.data?.success) {
                toast.success(response?.data?.message || "Password changed successfully")
                setFormData({
                    oldPassword: "",
                    newPassword: "",
                    confirmNewPassword: ""
                })
                navigate('/view-profile')
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to change password"
            toast.error(errorMessage)
            console.error("Change password error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center space-x-2">
                                <Lock className="w-5 h-5" />
                                <span>Change Password</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Old Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="oldPassword" className="text-slate-300">
                                        Current Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="oldPassword"
                                            type={showPasswords.old ? "text" : "password"}
                                            placeholder="Enter your current password"
                                            value={formData.oldPassword}
                                            onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                            required
                                            minLength={6}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('old')}
                                        >
                                            {showPasswords.old ? (
                                                <EyeOff className="h-4 w-4 text-slate-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-slate-400" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

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

                                {/* Confirm New Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmNewPassword" className="text-slate-300">
                                        Confirm New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmNewPassword"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            placeholder="Confirm your new password"
                                            value={formData.confirmNewPassword}
                                            onChange={(e) => handleInputChange("confirmNewPassword", e.target.value)}
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
                                    {formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword && (
                                        <p className="text-xs text-red-400">
                                            Passwords don't match
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center pt-4">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        disabled={!isFormValid() || isLoading}
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        {isLoading ? "Changing Password..." : "Change Password"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}