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

const updateProfile = async (updateData: User) => {
    const {data} = await api.put('/user/update', updateData)
    return data.data
}

const queryClient = useQueryClient()

export const useUpdateProfile = () => {
    return useMutation<User, Error, User>({
        mutationFn: updateProfile,
        onSuccess: () => {
            SuccessMessage('Profile updated successfully')
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
        onError: (error) => {
            ErrorMessage(error)
        }
    })
}
