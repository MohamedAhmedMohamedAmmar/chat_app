import axios from "axios";

interface LoginResponse {
    token: string;
    user: {
        _id: string;
        username: string;
        email: string;
    };
    message: string;
}

interface RegisterResponse {
    token: string;
    user: {
        _id: string;
        username: string;
        email: string;
    };
    message: string;
}

class Auth {
    static baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

    static async register(username: string, email: string, password: string): Promise<RegisterResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/users/register`, 
                { username, email, password },
                { withCredentials: true }
            );
            
            if (response.status !== 201 && response.status !== 200) {
                throw new Error(response.data.message || 'Registration failed');
            }
            
            if (!response.data.token) {
                throw new Error('No token received');
            }
            
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    }

    static async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/users/login`, 
                { email, password },
                { withCredentials: true }
            );
            
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Login failed');
            }
            
            if (!response.data.token) {
                throw new Error('No token received');
            }
            
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    }

    static saveToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    static setToken(token: string): void {
        this.saveToken(token);
    }

    static getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    static clearToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }

    static isAuthenticated(): boolean {
        return this.getToken() !== null;
    }
}

export function getAuth() {
    return Auth;
}

export default Auth;