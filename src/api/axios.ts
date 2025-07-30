import { getAuthToken } from '@/utils/tokenUtils';
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
    baseURL: "http://localhost:3003",
    timeout: 80000,
    headers: {
        "Content-Type": "application/json"
    }
})

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError): Promise<never> => {
        console.error('Request Error : ', error);
        return Promise.reject(error)
    }
)

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        return response;
    },
    (error: AxiosError): Promise<never> => {
        // Handle errors globally
        if (error.response) {
            // Server responded with a status code outside 2xx range
            // Example: If unauthorized, you might want to redirect to login
            if (error.response.status === 401) {
                // You can add a redirect logic here.

            }
        } else if (error.request) {
            // No response received from server
            console.error('No response received:', error.request);
        } else {
            // An error occurred while setting up the request
            console.error('Axios setup error:', error.message);
        }

        return Promise.reject(error);
    }
);


export default axiosInstance;