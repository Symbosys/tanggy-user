import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { GetAllOrdersResponse, Order, PlaceOrderInput, PlaceOrderResponse } from "../../types/order.type";
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
                // Invalidate relevant queries like cart, order list, profile, and wallet transactions
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                queryClient.invalidateQueries({ queryKey: ['cart'] });
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
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
            return data.data as GetAllOrdersResponse;
        },
    });
};

/**
 * Fetch a single order's full details by ID or Order Number
 */
export const useOrderDetails = (params: { id?: string; orderNumber?: string }) => {
    return useQuery({
        queryKey: ['order-details', params],
        queryFn: async () => {
            const { data } = await api.get('/order/details', { params });
            return data.data as Order;
        },
        enabled: !!(params.id || params.orderNumber),
    });
};
