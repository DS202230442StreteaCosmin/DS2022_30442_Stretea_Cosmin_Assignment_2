import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { string } from 'yargs';
import { IUser, UserRoles } from '../../services/auth/model';

export interface ChatMessage {
    id: string;
    role: UserRoles;
    message: string;
}

export interface ChatUser {
    id: string;
    email: string;
}

export interface AdminClientMapChat {
    messages: ChatMessage[];
    client: ChatUser;
}

interface GeneralState {
    currentMessage: string;
    adminClients: ChatUser[];
    adminChat: AdminClientMapChat[];
    chatMessages: ChatMessage[];
    wsConnection: WebSocket | null;
}

const initialState: GeneralState = {
    currentMessage: '',
    adminClients: [],
    adminChat: [],
    chatMessages: [],
    wsConnection: null,
};

export const generalSlice = createSlice({
    initialState,
    name: 'general',
    reducers: {
        resetGeneralState: (state) => {
            return initialState;
        },

        setCurrentMessage: (state, action: PayloadAction<string>) => {
            state.currentMessage = action.payload;
        },
        setChatMessages: (state, action: PayloadAction<ChatMessage[]>) => {
            state.chatMessages = action.payload;
        },

        addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.chatMessages.push(action.payload);
        },
        setWSConnection: (state, action: PayloadAction<WebSocket | null>) => {
            state.wsConnection = action.payload;
        },

        addAdminClient: (state, action: PayloadAction<ChatUser>) => {
            state.adminClients.push(action.payload);
            state.adminChat.push({ client: action.payload, messages: [] });
        },

        removeFromAdminClient: (state, action: PayloadAction<string>) => {
            state.adminClients = state.adminClients.filter(
                (client) => client.id !== action.payload
            );

            state.adminChat = state.adminChat.filter(
                (chat) => chat.client.id !== action.payload
            );
        },

        addAdminChatMessage: (
            state,
            action: PayloadAction<{ clientId: string; chat: ChatMessage }>
        ) => {
            state.adminChat = state.adminChat.map((item) => {
                if (item.client.id === action.payload.clientId) {
                    return {
                        ...item,
                        messages: [...item.messages, action.payload.chat],
                    };
                }

                return item;
            });
        },
    },
});

export const generalReducer = generalSlice.reducer;

export const {
    setCurrentMessage,
    setChatMessages,
    addChatMessage,
    setWSConnection,
    addAdminChatMessage,
    addAdminClient,
    removeFromAdminClient,
    resetGeneralState,
} = generalSlice.actions;
