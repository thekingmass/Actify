import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import agent from "../api/agent.ts";
import { useMemo } from "react";

export const useProfile = (id?: string) => {
    const queryClient = useQueryClient();

    const { data: profile, isLoading: loadingProfile } = useQuery<Profile>({
        queryKey: ['profile', id],
        queryFn: async () => {
            const response = await agent.get<Profile>(`/profiles/${id}`);
            return response.data
        },
        enabled: !!id
        // Single negation converts the value to a boolean and negates it
        // double negation converts the value to a boolean and negates it twice, effectively returning the original boolean value.
        // so if no Id is provided, the query will not run.
    });

    const { data: photos, isLoading: loadingPhotos } = useQuery<Photo[]>({
        queryKey: ['photos', id],
        queryFn: async () => {
            const response = await agent.get<Photo[]>(`/profiles/${id}/photos`);
            return response.data
        },
        enabled: !!id
    });

    const uploadPhoto = useMutation({
        mutationFn: async (file: Blob) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await agent.post('/profiles/add-photo', formData, {
                headers: { 'Content-type': 'multipart/form-data' }
            });
            return response.data;
        },
        
        onSuccess: async (photo: Photo) => {

            // Invalidating the photos query to ensure that the list of photos is updated after a new photo is uploaded.
            await queryClient.invalidateQueries({
                queryKey: ['photos', id]
            });

            // Updating the user to ensure that the user's profile image is updated after a new photo is uploaded and the imageUrl is not set.
            queryClient.setQueryData(['user'], (data: User) => {
                if (!data) return data;
                return {
                    ...data,
                    imageUrl: data.imageUrl ?? photo.url // if the user does not have an imageUrl, set it to the new photo's url
                }
            });

            // Updating the profile to ensure that the profile's image is updated after a new photo is uploaded.
            queryClient.setQueryData(['profile', id], (data: Profile) => {
                if (!data) return data;
                return {
                    ...data,
                    imageUrl: data.imageUrl ?? photo.url
                }
            });
        }
    });

    const setMainPhoto = useMutation({
        mutationFn: async (photo: Photo) => {
            await agent.put(`/profiles/${photo.id}/setMain`, {});
        },
        onSuccess: (_, photo) => {
            queryClient.setQueryData(['user'], (userData: User) => {
                if (!userData) return userData;
                return {
                    ...userData,
                    imageUrl: photo.url
                }
            });
            queryClient.setQueryData(['profile', id], (profile: Profile) => {
                if (!profile) return profile;
                return {
                    ...profile,
                    imageUrl: photo.url
                }
            });
        }
    });

    const deletePhoto = useMutation({
        mutationFn: async (photoId: string) => {
            await agent.delete(`/profiles/${photoId}/photos`);
        },
        onSuccess: (_, photoId) => {
            queryClient.setQueryData(['photos', id], (photos: Photo[]) => {
                return photos?.filter(p => p.id !== photoId);
            });
        }
    });

    const isCurrentUser = useMemo(() => {
        return id === queryClient.getQueryData<User>(['user'])?.id
    }, [id, queryClient])

    return {
        profile,
        loadingProfile,
        photos,
        loadingPhotos,
        isCurrentUser,
        uploadPhoto,
        setMainPhoto,
        deletePhoto
    }
}