import { useQuery } from "@tanstack/react-query"
import api from "../api";

interface UseEliteMembershipOptions {
    enabled?: boolean;
}

export const useEliteMembership = (options: UseEliteMembershipOptions = {}) => {
    const { enabled = true } = options;
    
    return useQuery({
        queryKey: ['elite-membership'],
        queryFn: async () => {
            const response = await api.get('/user/elite-membership/details');
            return response.data;
        },
        enabled,
    })
}
