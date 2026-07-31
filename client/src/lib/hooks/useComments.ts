import { useEffect } from 'react';
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useLocalObservable } from "mobx-react-lite";
import { runInAction } from 'mobx';

export const useComments = (activityId?: string) => {
    const commentStore = useLocalObservable(() => ({
        comments: [] as ChatComment[],
        hubConnection: null as HubConnection | null,

        createHubConnection(activityId: string) {
            if (!activityId) return;

            this.hubConnection = new HubConnectionBuilder()
                .withUrl(`${import.meta.env.VITE_COMMENTS_URL}?activityId=${activityId}`, {
                    withCredentials: true
                })
                .withAutomaticReconnect()
                .build();

            // Handlers must be registered before start() so the LoadComments
            // message sent from OnConnectedAsync is not missed.
            this.hubConnection.on('LoadComments', comments => {
                runInAction(() => {
                    this.comments = comments
                })
            });

            this.hubConnection.on('ReceiveComment', comment => {
                runInAction(() => {
                    this.comments.unshift(comment)
                })
            });

            this.hubConnection.start().catch(error => console.log('Error establishing connection: ', error));
        },

        stopHubConnection() {
            if (!this.hubConnection) return;

            this.hubConnection.stop().catch(error => console.log('Error stopping connection: ', error));
            this.hubConnection = null;
        },
    }));

    useEffect(() => {
        if (!activityId) return;

        commentStore.createHubConnection(activityId);

        return () => {
            commentStore.stopHubConnection();
            runInAction(() => {
                commentStore.comments = [];
            });
        };
    }, [activityId, commentStore]);

    return {
        commentStore
    };
};