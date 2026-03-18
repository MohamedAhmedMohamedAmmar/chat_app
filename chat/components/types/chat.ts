interface IChat {
    _id: string;
    participantIds: IUser[];
    lastMessage?: string | null;
    createdAt: string;
    updatedAt: string;
    username?: string; // For individual chats, the username of the other participant
}
interface IUser{
    _id: string;
    username: string;
    avatarUrl?: string;
}