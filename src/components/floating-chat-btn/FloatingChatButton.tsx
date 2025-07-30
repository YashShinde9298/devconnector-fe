import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Bot, Send, Copy, ThumbsUp, ThumbsDown, Eraser } from "lucide-react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import axiosInstance from "@/api/axios"
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
}

export function FloatingChatButton() {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // const generateAIResponse = (userInput: string): string => {
    //     const input = userInput.toLowerCase()

    //     if (input.includes("react")) {
    //         return "React is a powerful JavaScript library for building user interfaces. Here are some key concepts:\n\n• **Components**: Reusable UI building blocks\n• **State Management**: Using useState and useReducer\n• **Effects**: Side effects with useEffect\n• **Context**: Sharing data across components\n\nWhat specific aspect of React would you like to explore further?"
    //     }

    //     if (input.includes("javascript") || input.includes("js")) {
    //         return "JavaScript is the backbone of modern web development. Here are some important topics:\n\n• **ES6+ Features**: Arrow functions, destructuring, modules\n• **Async Programming**: Promises, async/await\n• **DOM Manipulation**: Selecting and modifying elements\n• **Event Handling**: User interactions\n\nWould you like me to dive deeper into any of these areas?"
    //     }

    //     if (input.includes("node") || input.includes("backend")) {
    //         return "Node.js enables server-side JavaScript development. Key areas include:\n\n• **Express.js**: Web application framework\n• **Database Integration**: MongoDB, PostgreSQL\n• **Authentication**: JWT, OAuth\n• **API Development**: RESTful and GraphQL APIs\n• **Deployment**: Docker, AWS, Heroku\n\nWhat backend topic interests you most?"
    //     }

    //     if (input.includes("profile") || input.includes("devconnector")) {
    //         return "I can help you with DevConnector features:\n\n• **Profile Optimization**: Tips to improve your developer profile\n• **Networking**: How to connect with other developers\n• **Skills Showcase**: Best practices for highlighting your abilities\n• **Career Growth**: Advice for advancing your development career\n\nWhat aspect of your developer journey would you like to discuss?"
    //     }

    //     return "I'm here to help with your development questions! I can assist with:\n\n• **Frontend**: React, Vue, Angular, HTML/CSS\n• **Backend**: Node.js, Python, databases\n• **DevOps**: Docker, CI/CD, cloud platforms\n• **Best Practices**: Code quality, testing, architecture\n• **DevConnector**: Profile tips and networking advice\n\nWhat would you like to learn about?"
    // }

    const sendMessage = async () => {
        if (!inputMessage.trim()) return
        setIsLoading(true);
        setInputMessage('');
        try {
            const response = await axiosInstance.post('/api/v1/ai/career', {
                prompt: inputMessage
            })
            let aiReply = response?.data?.data?.reply;

            const userMessage: Message = {
                id: uuidv4(),
                content: inputMessage,
                role: "user"
            };

            const aiMessage: Message = {
                id: uuidv4(),
                content: aiReply,
                role: "assistant"
            };

            setMessages((prev) => [...prev, userMessage, aiMessage])
        } catch (error) {
            console.log("Something went worng while sending message : ", error);
        } finally {
            setIsLoading(false);
        }
    }

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content)
        toast.success("Message copied to clipboard!")
    }

    const clearChat = () => {
        setMessages([])
        toast.success("Chat cleared!")
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
            {isChatOpen && (
                <div className="mb-4 w-96 h-[500px] bg-slate-800/95 backdrop-blur border border-slate-700 rounded-lg shadow-2xl flex flex-col pointer-events-auto">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-700">
                        <div className="flex items-center space-x-2">
                            <Bot className="w-5 h-5 text-purple-400" />
                            <CardTitle className="text-white text-sm">DevBot Assistant</CardTitle>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Button
                                onClick={clearChat}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                                title="Clear chat"
                            >
                                <Eraser className="w-3 h-3" />
                            </Button>
                            <Button
                                onClick={() => setIsChatOpen(false)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                                title="Close chat"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    </CardHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center py-8">
                                <Bot className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                                <h3 className="text-sm font-semibold text-white mb-2">Welcome to DevBot!</h3>
                                <p className="text-xs text-slate-400 mb-4">
                                    I'm here to help you with coding questions, best practices, and technical guidance.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        onClick={() => setInputMessage("How can I improve my React skills?")}
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white bg-transparent"
                                    >
                                        React Tips
                                    </Button>
                                    <Button
                                        onClick={() => setInputMessage("What are the latest JavaScript best practices?")}
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent"
                                    >
                                        JavaScript Tips
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}
                                >
                                    <div
                                        className={`max-w-[80%] ${message.role === "user"
                                            ? "bg-purple-600 text-white"
                                            : "bg-slate-700/50 text-slate-100 border border-slate-600"
                                            } rounded-lg p-3 relative`}
                                    >
                                        <div className="flex items-start space-x-2">
                                            {message.role === "assistant" && <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />}
                                            <div className="flex-1">
                                                <div className="text-xs leading-relaxed prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                                            em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
                                                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                                            li: ({ children }) => <li className="text-slate-200">{children}</li>,
                                                            h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
                                                            h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
                                                            code: ({ children }) => <code className="bg-slate-600 px-1 py-0.5 rounded text-xs text-purple-300">{children}</code>,
                                                            blockquote: ({ children }) => <blockquote className="border-l-2 border-purple-400 pl-3 italic text-slate-300">{children}</blockquote>
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                                <div className="flex items-center justify-end mt-2">
                                                    {message.role === "assistant" && (
                                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0 hover:bg-slate-600"
                                                                onClick={() => copyMessage(message.content)}
                                                                title="Copy message"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0 hover:bg-slate-600"
                                                                title="Like message"
                                                            >
                                                                <ThumbsUp className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0 hover:bg-slate-600"
                                                                title="Dislike message"
                                                            >
                                                                <ThumbsDown className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 max-w-[80%]">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                                        <div className="flex space-x-1">
                                            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.1s" }}
                                            ></div>
                                            <div
                                                className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.2s" }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-slate-300">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-slate-700">
                        <div className="flex items-end space-x-2">
                            <div className="flex-1">
                                <Textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Ask me anything about coding..."
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none min-h-[40px] max-h-20 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            sendMessage()
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 h-[40px] px-3"
                            >
                                <Send className="w-3 h-3" />
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 text-center">Press Enter to send</p>
                    </div>
                </div>
            )}

            <div
                className="pointer-events-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`${isHovered && !isChatOpen ? "w-auto px-4 pr-6" : "w-14"
                        } h-14 rounded-full shadow-lg transition-all duration-600 ${isChatOpen
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-110"
                        } flex items-center justify-center space-x-2`}
                >
                    {isChatOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <>
                            <div className="flex items-center space-x-2">
                                <Bot className="w-6 h-6" />
                                {isHovered && (
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-semibold whitespace-nowrap">DevBot</span>
                                        <span className="text-xs opacity-90 whitespace-nowrap">Full chat experience</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </div>

            {!isChatOpen && !isHovered && (
                <div className="absolute inset-0 w-14 h-14 rounded-full bg-purple-600 animate-ping opacity-20 pointer-events-none"></div>
            )}
        </div>
    )
}
