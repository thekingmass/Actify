import { Box, Divider, Typography } from "@mui/material";
import ProfileCard from "./ProfileCard";
import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile.ts";
import type { Dispatch, SetStateAction } from "react";

type Props = {
    activeTab: number
    setTab: Dispatch<SetStateAction<number>>
}

export default function ProfileFollowings({ activeTab, setTab }: Props) {
    const { id } = useParams();
    const predicate = activeTab === 3 ? 'followers' : 'followings';
    const { profile, followings, loadingFollowings } = useProfile(id, predicate);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5">
                    {activeTab === 3 ? `People following ${profile?.displayName}` : `People ${profile?.displayName} is following`}
                </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            {followings?.length === 0
                ? <Typography>No {predicate} Found</Typography>
                : (loadingFollowings
                    ? <Typography>Loading...</Typography>
                    : <Box sx={{ display: 'flex', flexWrap: 'wrap', marginTop: 3, gap: 1, paddingBottom:1 }}>
                        {followings?.map(profile => (
                            <ProfileCard profile={profile} key={profile.id} setTab={setTab}/>
                        ))}
                    </Box>
                )
            }
        </Box >
    )
}