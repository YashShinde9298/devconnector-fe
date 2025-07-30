export const getTimeAgo = (timestamp: string | Date): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 12) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const isToday =
        time.getDate() === now.getDate() &&
        time.getMonth() === now.getMonth() &&
        time.getFullYear() === now.getFullYear();
    if (isToday) return "Today";

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        time.getDate() === yesterday.getDate() &&
        time.getMonth() === yesterday.getMonth() &&
        time.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "Yesterday";

    return time.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};