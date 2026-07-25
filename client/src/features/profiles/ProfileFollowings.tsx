import { Box, Divider, Typography } from "@mui/material";
import ProfileCard from "./ProfileCard";
import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile.ts";

type Props = {
    activeTab: number
}

export default function ProfileFollowings({ activeTab }: Props) {
    const { id } = useParams();
    const predicate = activeTab === 3 ? 'followers' : 'followings';
    const { profile, followings, loadingFollowings } = useProfile(id, predicate);

    return (
        <Box>
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
                    : <Box sx={{ display: 'flex', marginTop: 3 }}>
                        {followings?.map(profile => (
                            <ProfileCard profile={profile} key={profile.id} />
                        ))}
                    </Box>
                )
            }
        </Box >
    )
}