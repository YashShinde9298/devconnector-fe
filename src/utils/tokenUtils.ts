import Cookies from 'js-cookie';

export const setAuthToken = (token: string) => {
    Cookies.set('token', token, { expires: 2 })
}

export const getAuthToken = (): string | undefined => {
    return Cookies.get('token');
}

export const removeAuthToken = () => {
    Cookies.remove('token');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
}