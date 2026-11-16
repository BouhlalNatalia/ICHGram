export interface IChatParticipant {
  _id: string;
  username: string;
  avatar?: string;
  fullName?: string;
}

export interface IMessage {
  _id: string;
  text: string;
  chat: string | { _id: string };
  sender: string | IChatParticipant;
  createdAt: string;

  senderId?: string;
}

export interface IChat {
  _id: string;
  participants: IChatParticipant[];
  lastMessage?: string | IMessage;
  updatedAt: string;
  unreadCount?: number;
}

export interface ChatDisplayInfo {
  id: string;
  username: string;
  avatarUrl: string;
  lastMessage: string;
  time: string;
}


export interface IChatState {
  chats: IChat[];
  currentChat: IChat | null;
  messages: IMessage[];
  isLoading: boolean;
  error: string | null;
}