import { useQuery } from "@tanstack/react-query";
import api from "../api";

export interface RefundRequest {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: string;
  referenceId?: string;
  processedAt?: string;
  description?: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
  };
}

export interface RefundsResponse {
  refunds: RefundRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchRefundsParams {
  page?: number;
  limit?: number;
  status?: string;
  reason?: string;
}

const fetchUserRefunds = async (params: FetchRefundsParams = {}): Promise<RefundsResponse> => {
  const { data } = await api.get("/payout/refund/my", { params });
  return data.data;
};

export const useUserRefunds = (params: FetchRefundsParams = {}) => {
  return useQuery<RefundsResponse, Error>({
    queryKey: ["user-refunds", params],
    queryFn: () => fetchUserRefunds(params),
  });
};
