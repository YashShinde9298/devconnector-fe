import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar/Sidebar"

interface LayoutProps {
    children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
    const [currentUser, setCurrentUser] = useState({
        name: "",
        email: "",
        avatar: "",
        id: ""
    })

    useEffect(() => {
        setCurrentUser({
            name: localStorage.getItem('userName') || "",
            email: localStorage.getItem('userEmail') || "",
            avatar: localStorage.getItem('userAvatar') || "",
            id: localStorage.getItem('userId') || ""
        })
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Sidebar currentUser={currentUser} />
            <div className="md:ml-64 transition-all duration-300">
                {children}
            </div>
        </div>
    )
}