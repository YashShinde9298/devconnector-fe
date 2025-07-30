import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, Send } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/api/axios"

interface ForgotPasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email.trim()) {
            toast.error("Please enter your email address")
            return
        }

        setIsLoading(true)
        try {
            const response = await axiosInstance.post('/api/v1/users/forgot-password', {
                email: email.trim()
            })

            if (response?.data?.success) {
                setEmailSent(true)
                toast.success("Password reset email sent successfully!")
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to send reset email"
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setEmail("")
        setEmailSent(false)
        setIsLoading(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md border-slate-700 bg-slate-800/95 backdrop-blur">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center space-x-2">
                        <Mail className="w-5 h-5" />
                        <span>Forgot Password</span>
                    </DialogTitle>
                </DialogHeader>

                {!emailSent ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reset-email" className="text-slate-300">
                                Email Address
                            </Label>
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                required
                            />
                            <p className="text-xs text-slate-400">
                                We'll send you a link to reset your password
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-8 h-8 text-green-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">Email Sent!</h3>
                            <p className="text-slate-300 text-sm">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <p className="text-slate-400 text-xs">
                                Check your inbox and click the link to reset your password. 
                                The link will expire in 10 minutes.
                            </p>
                        </div>
                        <Button
                            onClick={handleClose}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}