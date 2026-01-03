import { useQuery } from "@tanstack/react-query"
import api from "../api";

export const useEliteMembership = () => {
    return useQuery({
        queryKey: ['elite-membership'],
        queryFn: async () => {
            const response = await api.get('/user/elite-membership/details');
            return response.data;
        }
    })
}