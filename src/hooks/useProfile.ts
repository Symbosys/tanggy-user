import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import { User } from "../types/user";

export const useProfile = () => {
    return useQuery<User, Error>({
        queryKey: ['profile'],
        queryFn: userProfile
    })
}


const userProfile = async (): Promise<User> => {
    const {data} = await api.get('/user/profile')
    return data.data
}