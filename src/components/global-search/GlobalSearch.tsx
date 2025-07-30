import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Dummy user data for search suggestions
const allUsers = [
    {
        id: "u1",
        name: "John Doe",
        title: "Full Stack Developer",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["React", "Node.js", "TypeScript"],
    },
    {
        id: "u2",
        name: "Jane Smith",
        title: "Frontend Engineer",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["Vue.js", "CSS", "JavaScript"],
    },
    {
        id: "u3",
        name: "Alex Johnson",
        title: "DevOps Specialist",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["Kubernetes", "Docker", "AWS"],
    },
    {
        id: "u4",
        name: "Sarah Lee",
        title: "Data Scientist",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["Python", "Machine Learning", "SQL"],
    },
    {
        id: "u5",
        name: "Michael Brown",
        title: "Mobile Developer",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["React Native", "Swift", "Kotlin"],
    },
    {
        id: "u6",
        name: "Emily White",
        title: "Backend Developer",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["Java", "Spring Boot", "SQL"],
    },
    {
        id: "u7",
        name: "David Green",
        title: "UI/UX Designer",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["Figma", "Sketch", "User Research"],
    },
    {
        id: "u8",
        name: "Olivia Black",
        title: "Cloud Architect",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["Azure", "GCP", "Terraform"],
    },
]

export function GlobalSearchBar() {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<typeof allUsers>([])
    const [isFocused, setIsFocused] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const searchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (isFocused && searchRef.current) {
            const rect = searchRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            })
        }
    }, [isFocused, searchTerm])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        if (value.length > 0) {
            const filtered = allUsers.filter(
                (user) =>
                    user.name.toLowerCase().includes(value.toLowerCase()) ||
                    user.title.toLowerCase().includes(value.toLowerCase()) ||
                    user.skills.some((skill) => skill.toLowerCase().includes(value.toLowerCase())),
            )
            setSearchResults(filtered)
        } else {
            setSearchResults([])
        }
    }

    const handleUserClick = (userId: string) => {
        console.log(`Navigating to user profile: ${userId}`)
        setSearchTerm("")
        setSearchResults([])
        setIsFocused(false)
    }

    return (
        <>
            <div className="relative flex-1 max-w-md mx-auto md:mx-8" ref={searchRef}>
                <Input
                    type="search"
                    placeholder="Search developers, posts, skills..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsFocused(true)}
                    className="w-full bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                />
                <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => console.log("Search submitted:", searchTerm)}
                >
                    <Search className="h-4 w-4 text-slate-400" />
                </Button>
            </div>

            {isFocused && searchTerm.length > 0 && (
                <div
                    className="fixed z-[99999] bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`
                    }}
                >
                    {searchResults.length > 0 ? (
                        searchResults.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
                                onClick={() => handleUserClick(user.id)}
                            >
                                <Avatar className="w-9 h-9 border border-slate-600">
                                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                    <AvatarFallback>
                                        {user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium text-white text-sm">{user.name}</p>
                                    <p className="text-xs text-slate-400">{user.title}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {user.skills.map((skill, index) => (
                                            <Badge key={index} variant="outline" className="border-slate-600 text-slate-300 text-xs px-1 py-0">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-3 text-center text-slate-400 text-sm">
                            No users found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
