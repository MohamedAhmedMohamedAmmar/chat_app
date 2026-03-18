export interface ISocket {
    userId: string;
    userName: string;
    soketId: string;
    isOnline?: boolean;
    lastSeen?: Date;
}

class StorageSocket {
    static storage: Map<string, ISocket> = new Map();

    static setItem(key: string, value: ISocket): void {
        this.storage.set(key, value);
    }   
    static getItem(key: string): ISocket | null {
        return this.storage.get(key) || null;
    }
    static removeItem(key: string): void {
        this.storage.delete(key);
    }
    static getAllOnlineUsers(): ISocket[] {
        return Array.from(this.storage.values()).filter(user => user.isOnline);
    }
    static getAllUsers(): ISocket[] {
        return Array.from(this.storage.values());
    }
}

export default StorageSocket;