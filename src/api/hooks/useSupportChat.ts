import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";

export interface ChatMessage {
    id: string;
    sessionId: string;
    senderType: 'USER' | 'VENDOR' | 'DELIVERY_PARTNER' | 'ADMIN' | 'SYSTEM_BOT';
    messageText: string;
    cardType?: string;
    cardData?: any;
    createdAt: string;
}

export interface SupportChatSession {
    id: string;
    sessionId: string;
    chatType: string;
    status: string;
    escalationCount: number;
    isEscalated: boolean;
    orderId?: string;
    messages: ChatMessage[];
    order?: any;
}

/**
 * Hook to initialize or retrieve support chat session for an order
 */
export const useInitSupportChatSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { orderId?: string; chatType?: string }) => {
            const { data } = await api.post('/support/chat/session/init', params);
            return data.data as SupportChatSession;
        },
        onSuccess: (session) => {
            queryClient.invalidateQueries({ queryKey: ['support-chat-history', session.orderId] });
            queryClient.invalidateQueries({ queryKey: ['support-chat-history', session.sessionId] });
        },
    });
};

/**
 * Hook to fetch support chat history for an order or session
 */
export const useSupportChatHistory = (orderId?: string, sessionId?: string) => {
    const identifier = sessionId || orderId;

    return useQuery({
        queryKey: ['support-chat-history', identifier],
        queryFn: async () => {
            if (!identifier) return null;
            const { data } = await api.get('/support/chat/history', {
                params: { orderId, sessionId },
            });
            return data.data as SupportChatSession;
        },
        enabled: !!identifier,
        refetchInterval: 5000, // Poll for agent messages when escalated
    });
};

/**
 * Hook to send a message in support chat
 */
export const useSendSupportChatMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            sessionId: string;
            messageText: string;
            cardType?: string;
            cardData?: any;
        }) => {
            const { data } = await api.post('/support/chat/message/send', params);
            return data.data as SupportChatSession;
        },
        onSuccess: (session) => {
            queryClient.setQueryData(['support-chat-history', session.sessionId], session);
            if (session.orderId) {
                queryClient.setQueryData(['support-chat-history', session.orderId], session);
            }
        },
    });
};

/**
 * Hook to resolve a support chat session
 */
export const useResolveSupportChatSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { sessionId: string; feedbackRating?: number; feedbackComment?: string }) => {
            const { data } = await api.post('/support/chat/session/resolve', params);
            return data.data as SupportChatSession;
        },
        onSuccess: (session) => {
            queryClient.invalidateQueries({ queryKey: ['support-chat-history'] });
        },
    });
};
