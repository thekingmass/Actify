import {
    Grid,
    Box,
    Avatar,
    Typography,
    Stack,
    Divider,
    Button,
    Paper,
    Chip
} from '@mui/material';
import { useParams } from 'react-router';
import { useProfile } from '../../lib/hooks/useProfile';

export default function ProfileHeader() {

    const { id } = useParams();
    const { isCurrentUser, profile, updateFollowing } = useProfile(id);

    if (!profile) return null;

    return (
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
            <Grid container spacing={2}>
                <Grid size={8}>
                    <Stack sx={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                        <Avatar
                            src={profile?.imageUrl}
                            alt="User Image"
                            sx={{ width: 150, height: 150 }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h4">{profile.displayName}</Typography>
                            {profile.amIFollowing &&
                                <Chip variant='outlined' color='secondary' label='Following' sx={{ borderRadius: 1 }} />}
                        </Box>

                    </Stack>
                </Grid>
                <Grid size={4}>
                    <Stack sx={{ gap: 2, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6">Followers</Typography>
                                <Typography variant="h3">{profile.followersCount}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6">Following</Typography>
                                <Typography variant="h3">{profile.followingCount}</Typography>
                            </Box>
                        </Box>
                        {!isCurrentUser &&
                            <>
                                <Divider sx={{ width: '100%' }} />
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color={profile.amIFollowing ? 'error' : 'success'}
                                    onClick={ () => updateFollowing.mutate()}
                                    disabled={updateFollowing.isPending}
                                >
                                    {profile.amIFollowing ? 'Unfollow' : 'Follow'}
                                </Button>
                            </>
                        }
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
}