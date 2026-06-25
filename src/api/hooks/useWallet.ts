import { useQuery } from "@tanstack/react-query";
import api from "../api";

export interface WalletTransaction {
    id: string;
    amount: string;
    type: "CREDIT" | "DEBIT" | "REFUND" | "PAYOUT";
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
    description: string | null;
    referenceId: string | null;
    orderId: string | null;
    initiatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface WalletTransactionsResponse {
    walletId: string;
    balance: string;
    currency: string;
    isLocked: boolean;
    transactions: WalletTransaction[];
    totalTransactions: number;
    totalPages: number;
    currentPage: number;
    count: number;
}

export interface FetchWalletTransactionsParams {
    page?: number;
    limit?: number;
    type?: "CREDIT" | "DEBIT" | "REFUND" | "PAYOUT";
    status?: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
}

const fetchUserWalletTransactions = async (params: FetchWalletTransactionsParams = {}): Promise<WalletTransactionsResponse> => {
    const { data } = await api.get("/user/wallet/transactions", { params });
    return data.data;
};

export const useUserWalletTransactions = (params: FetchWalletTransactionsParams = {}) => {
    return useQuery<WalletTransactionsResponse, Error>({
        queryKey: ["wallet-transactions", params],
        queryFn: () => fetchUserWalletTransactions(params),
    });
};
