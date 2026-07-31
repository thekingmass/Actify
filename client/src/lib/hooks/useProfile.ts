import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import agent from "../api/agent.ts";
import { useMemo } from "react";
import type { EditProfileSchema } from "../schemas/editProfileSchema.ts";

export const useProfile = (id?: string, predicate?: string, filter?: string) => {
    const queryClient = useQueryClient();

    const { data: profile, isLoading: loadingProfile } = useQuery<Profile>({
        queryKey: ['profile', id],
        queryFn: async () => {
            const response = await agent.get<Profile>(`/profiles/${id}`);
            return response.data
        },
        enabled: !!id && !predicate
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
        enabled: !!id && !predicate
    });

    const { data: followings, isLoading: loadingFollowings } = useQuery<Profile[]>({
        queryKey: ['followings', id, predicate],
        queryFn: async () => {
            const response = await agent.get<Profile[]>(`/profiles/${id}/follow-list?predicate=${predicate}`);
            return response.data
        },
        enabled: !!id && !!predicate
    });

    const {data: userActivities, isLoading: loadingUserActivities} = useQuery<UserActivity[]>({
        queryKey: ['userActivity', id, filter],
        queryFn: async () => {
            const response = await agent.get<UserActivity[]>(`profiles/${id}/activities?filter=${filter}`);
            return response.data;
        },
        enabled: !!id && !!filter
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

            // Avatars are also rendered from the activities and followings caches
            // (host avatar, attendee lists, popovers), so those must be refetched too.
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
            await queryClient.invalidateQueries({ queryKey: ['followings'] });
        }
    });

    const setMainPhoto = useMutation({
        mutationFn: async (photo: Photo) => {
            await agent.put(`/profiles/${photo.id}/setMain`, {});
        },
        onSuccess: async (_, photo) => {
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

            // Refresh the caches that embed a copy of the user's avatar.
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
            await queryClient.invalidateQueries({ queryKey: ['followings'] });
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

    const updateProfile = useMutation({
        mutationFn: async (profile: EditProfileSchema) => {
            await agent.put(`/profiles`, profile);

        },
        onSuccess: (_, profile) => {

            queryClient.setQueryData(['profile', id], (data: Profile) => {
                if (!data) return data;
                return {
                    ...data,
                    displayName: profile.displayName,
                    bio: profile.bio
                }
            });

            queryClient.setQueryData(['user'], (userData: User) => {
                if (!userData) return userData;
                return {
                    ...userData,
                    displayName: profile.displayName
                }
            });
        }
    });

    const updateFollowing = useMutation({
        mutationFn: async () => {
            await agent.post(`/profiles/${id}/follow`);
        },
        onSuccess: () => {
            queryClient.setQueryData(["profile", id], (profile: Profile) => {
                queryClient.invalidateQueries({ queryKey: ['followings', id, 'followers'] });
                if (!profile || profile.followersCount == undefined) return profile;

                return {
                    ...profile,
                    amIFollowing: !profile.amIFollowing,
                    followersCount: profile.amIFollowing
                        ? profile.followersCount - 1
                        : profile.followersCount + 1
                }
            })
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
        deletePhoto,
        updateProfile,
        updateFollowing,
        followings,
        loadingFollowings,
        userActivities,
        loadingUserActivities

    }
}