import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useLocation } from "react-router";


export const useActivities = (id?:string) => {

    const location = useLocation();

    const queryClient = useQueryClient();

    // Fetch activities
    const { data: activities, isPending } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await agent.get<Activity[]>('/activities');
            return response.data;
        },
        enabled: !id && location.pathname === '/activities',
    });

    // Activities/id
    const { isLoading: isLoadingActivity, data: activity } = useQuery<Activity>({
        queryKey: ['activities', id],
        queryFn: async () => {
            const response = await agent.get<Activity>(`/activities/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    //activities mutation : update activity
    const updateActivity = useMutation({
        mutationFn: async (activity: Activity) => {
            await agent.put('/activities', activity);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['activities']
            })
        }
    });

    //activities mutation : create activity
    const createActivity = useMutation({
        mutationFn: async (activity: Activity) => {
            const response = await agent.post('/activities', activity);
            return response.data;
        }
    });

    //activities mutation : delete activity
    const deleteActivity = useMutation({
        mutationFn: async (id: string) => {
            await agent.delete(`/activities/${id}`);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['activities']
            })
        }
    });

    return {
        activities,
        isPending,
        activity,
        isLoadingActivity,
        updateActivity,
        createActivity,
        deleteActivity
    };
}