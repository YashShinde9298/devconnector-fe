// "use client"

// import { Button } from "@/components/ui/button"
// import { useToast } from "@/hooks/use-toast" // Assuming shadcn/ui useToast hook is installed
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react"

// export default function ToastDemo() {
//     const { toast } = useToast()

//     return (
//         <Card className="border-slate-700 bg-slate-800/50 backdrop-blur w-full max-w-md mx-auto">
//             <CardHeader>
//                 <CardTitle className="text-white">Toast Notifications</CardTitle>
//             </CardHeader>
//             <CardContent className="flex flex-col space-y-4">
//                 <Button
//                     onClick={() => {
//                         toast({
//                             title: "Success!",
//                             description: "Your profile has been updated successfully.",
//                             action: (
//                                 <div className="flex items-center text-green-400">
//                                     <CheckCircle className="h-4 w-4 mr-2" />
//                                     <span>Done</span>
//                                 </div>
//                             ),
//                             className: "bg-green-800 text-white border-green-700",
//                         })
//                     }}
//                     className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
//                 >
//                     Show Success Toast
//                 </Button>
//                 <Button
//                     onClick={() => {
//                         toast({
//                             title: "Uh oh! Something went wrong.",
//                             description: "There was a problem with your request.",
//                             variant: "destructive",
//                             action: (
//                                 <div className="flex items-center text-red-400">
//                                     <XCircle className="h-4 w-4 mr-2" />
//                                     <span>Dismiss</span>
//                                 </div>
//                             ),
//                             className: "bg-red-800 text-white border-red-700",
//                         })
//                     }}
//                     className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
//                 >
//                     Show Error Toast
//                 </Button>
//                 <Button
//                     onClick={() => {
//                         toast({
//                             title: "Heads up!",
//                             description: "You have unread messages in your inbox.",
//                             action: (
//                                 <div className="flex items-center text-blue-400">
//                                     <Info className="h-4 w-4 mr-2" />
//                                     <span>View</span>
//                                 </div>
//                             ),
//                             className: "bg-blue-800 text-white border-blue-700",
//                         })
//                     }}
//                     className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700"
//                 >
//                     Show Info Toast
//                 </Button>
//                 <Button
//                     onClick={() => {
//                         toast({
//                             title: "Warning!",
//                             description: "Your session is about to expire. Please log in again.",
//                             action: (
//                                 <div className="flex items-center text-yellow-400">
//                                     <AlertTriangle className="h-4 w-4 mr-2" />
//                                     <span>Renew</span>
//                                 </div>
//                             ),
//                             className: "bg-yellow-800 text-white border-yellow-700",
//                         })
//                     }}
//                     className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
//                 >
//                     Show Warning Toast
//                 </Button>
//             </CardContent>
//         </Card>
//     )
// }
