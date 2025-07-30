import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, ChevronRight, Send, ThumbsUp, Copy, Lightbulb, Edit, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
}

export function FloatingProfileCoach() {
    const [coachExpanded, setCoachExpanded] = useState(false);
    const [coachMessages, setCoachMessages] = useState<Message[]>([]);
    const [coachInput, setCoachInput] = useState("");
    const [coachLoading, setCoachLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sendCoachMessage = async (promptType?: string, customPrompt?: string) => {
        const finalPrompt = customPrompt || coachInput;
        if (!finalPrompt.trim()) return

        try {
            setCoachLoading(true);
            const payload: any = promptType
                ? { promptType }
                : { customPrompt: finalPrompt };
            const response = await axiosInstance.post("/api/v1/ai/profile-improvement", payload);

            const aiReply = response.data?.data?.reply;

            setCoachMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    content: finalPrompt,
                    role: "user" as const,
                },
                {
                    id: (Date.now() + 1).toString(),
                    content: aiReply,
                    role: "assistant" as const,
                },
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [coachMessages]);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!coachExpanded ? (
                <Button
                    onClick={() => setCoachExpanded(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 w-12 shadow-lg"
                >
                    <Target className="w-5 h-5" />
                </Button>
            ) : (
                <div className="w-[350px] sm:w-[400px] max-h-[85vh] flex flex-col shadow-2xl">
                    <Card className="border-slate-700 bg-slate-800/90 backdrop-blur-lg flex flex-col h-full">
                        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center space-x-2">
                                <Target className="w-5 h-5 text-blue-400" />
                                <CardTitle className="text-white text-lg">Profile Coach</CardTitle>
                            </div>
                            <Button
                                onClick={() => setCoachExpanded(false)}
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] ">
                            {coachMessages.length === 0 ? (
                                // Initial suggestions
                                <div className="text-center py-8">
                                    <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-white mb-2">Profile Coach AI</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Get personalized advice to optimize your profile and boost your career!
                                    </p>
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => sendCoachMessage("analyze", "Can you analyze my profile and suggest improvements?")}
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent"
                                        >
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Analyze Profile
                                        </Button>
                                        <Button
                                            onClick={() => sendCoachMessage("bio", "Can you help me improve my bio section?")}
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white bg-transparent"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Improve Bio
                                        </Button>
                                        <Button
                                            onClick={() => sendCoachMessage("roadmap", "Based on my profile, what skills should I focus on next?")}
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent"
                                        >
                                            <Lightbulb className="w-4 h-4 mr-2" />
                                            Skill Roadmap
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                coachMessages.map((message) => (
                                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}>
                                        <div
                                            className={`max-w-[85%] ${message.role === "user"
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-700/50 text-slate-100 border border-slate-600"
                                                } rounded-lg p-3 relative`}
                                        >
                                            <div className="flex items-start space-x-2">
                                                {message.role === "assistant" && (
                                                    <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                                                )}
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
                                                    {message.role === "assistant" && (
                                                        <div className="flex items-center justify-end mt-2">
                                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-5 w-5 p-0 hover:bg-slate-600"
                                                                    onClick={() => navigator.clipboard.writeText(message.content)}
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-slate-600">
                                                                    <ThumbsUp className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {coachLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 max-w-[85%]">
                                        <div className="flex items-center space-x-2">
                                            <Target className="w-4 h-4 text-blue-400 animate-pulse" />
                                            <div className="flex space-x-1">
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                                            </div>
                                            <span className="text-xs text-slate-300">Analyzing...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input box */}
                        <div className="p-4 border-t border-slate-700">
                            <div className="flex items-end space-x-2">
                                <div className="flex-1">
                                    <Textarea
                                        value={coachInput}
                                        onChange={(e) => setCoachInput(e.target.value)}
                                        placeholder="Ask about profile optimization..."
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none min-h-[40px] max-h-20 text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                sendCoachMessage()
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={() => sendCoachMessage(undefined, coachInput)}
                                    disabled={!coachInput.trim() || coachLoading}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 h-[40px] px-3"
                                >
                                    <Send className="w-3 h-3" />
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 text-center">Press Enter to send</p>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}