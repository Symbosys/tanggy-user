import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { User } from "../../types/user";
import { ErrorMessage, SuccessMessage } from "../../utils/utils";

export const useProfile = () => {
    return useQuery<User, Error>({
        queryKey: ['profile'],
        queryFn: userProfile,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}


const userProfile = async (): Promise<User> => {
    const {data} = await api.get('/user/profile')
    return data.data
}

type UpdateProfilePayload = Omit<Partial<User>, 'fcmToken'> & { fcmToken?: string | string[] };

const updateProfile = async (updateData: UpdateProfilePayload) => {
    const {data} = await api.put('/user/update', updateData)
    return data.data
}

export const useUpdateProfile = (options?: { silent?: boolean }) => {
    const queryClient = useQueryClient()
    
    return useMutation<User, Error, UpdateProfilePayload>({
        mutationFn: updateProfile,
        onSuccess: () => {
            if (!options?.silent) {
                SuccessMessage('Profile updated successfully')
            }
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
        onError: (error) => {
            if (!options?.silent) {
                ErrorMessage(error)
            }
        }
    })
}

export interface NearbyDeliveryPartnersCountResponse {
    onlineDeliveryPartnersCount: number;
    nearbyVendorsCount: number;
    areasCount: number;
}

export interface GetNearbyDeliveryPartnersCountParams {
    lat?: number | null;
    lng?: number | null;
    rangeKm?: number;
}

const getNearbyDeliveryPartnersCount = async (
    params: GetNearbyDeliveryPartnersCountParams
): Promise<NearbyDeliveryPartnersCountResponse> => {
    const { data } = await api.get('/user/nearby-delivery-partners/count', {
        params: {
            lat: params.lat,
            lng: params.lng,
            rangeKm: params.rangeKm,
        },
    });
    return data.data;
};

export const useNearbyDeliveryPartnersCount = (
    params: GetNearbyDeliveryPartnersCountParams,
    options?: { enabled?: boolean }
) => {
    const hasLocation =
        params.lat !== undefined &&
        params.lat !== null &&
        params.lng !== undefined &&
        params.lng !== null;

    return useQuery<NearbyDeliveryPartnersCountResponse, Error>({
        queryKey: ['nearby-delivery-partners-count', params.lat, params.lng, params.rangeKm],
        queryFn: () => getNearbyDeliveryPartnersCount(params),
        enabled: (options?.enabled ?? true) && hasLocation,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
    });
};
