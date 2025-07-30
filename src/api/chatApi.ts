import axiosInstance from './axios';

export const chatApi = {
    getUserChats: () => axiosInstance.get('/api/v1/chat'),
    
    getOrCreateChat: (participantId: string) => 
        axiosInstance.post('/api/v1/chat/create', { participantId }),
    
    sendMessage: (chatId: string, content: string) =>
        axiosInstance.post('/api/v1/chat/send', { chatId, content })
};