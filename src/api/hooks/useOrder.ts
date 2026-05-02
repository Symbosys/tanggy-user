import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { PlaceOrderInput, PlaceOrderResponse } from "../../types/order.type";
import { ErrorMessage, SuccessMessage } from "../../utils/utils";

/**
 * Hook to place a new order.
 * Currently optimized for Cash on Delivery (COD).
 */
export const usePlaceOrder = () => {
    const queryClient = useQueryClient();

    return useMutation<PlaceOrderResponse, Error, PlaceOrderInput>({
        mutationFn: async (orderData: PlaceOrderInput): Promise<PlaceOrderResponse> => {
            const { data } = await api.post<PlaceOrderResponse>('/order/place-order', orderData);
            return data;
        },
        onSuccess: (data) => {
            if (data.success) {
                SuccessMessage(data.message || 'Order placed successfully');
                // Invalidate relevant queries like cart or order list
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                queryClient.invalidateQueries({ queryKey: ['cart'] });
            }
        },
        onError: (error: any) => {
            ErrorMessage(error);
        }
    });
};

/**
 * Hook to fetch all orders with pagination and filters.
 */
export const useOrders = (params: { 
    page?: number; 
    limit?: number; 
    statusType?: 'ongoing' | 'past'; 
    status?: string;
    startDate?: string;
    endDate?: string;
}) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: async () => {
            const { data } = await api.get('/order/all', { params });
            return data.data;
        },
    });
};
