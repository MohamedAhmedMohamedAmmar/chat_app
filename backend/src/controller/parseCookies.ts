import jwt from "jsonwebtoken";
export default function parseCookies(cookieHeader: string ): Payload | null  {
    try {
        jwt.verify(cookieHeader, process.env.JWT_SECRET_KEY as string);
        const cookie = jwt.decode(cookieHeader, { complete: true, json: true });
        if (!cookie || typeof cookie === 'string') {
            console.error("Invalid token format");
            return null;
        }
        const payload = cookie.payload as Payload;
        return payload;
    } catch (error: any) {
        console.error("Token verification failed:", error.message);
        return null;
    }
}
interface Payload {
    userId: string;
    username: string;
    iat: number;
    exp: number;
}