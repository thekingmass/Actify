import { Box } from "@mui/material";
import ActivityCard from "./ActivityCard";
import { useActivities } from "../../../lib/hooks/useActivities";


export default function ActivityList() {

    const { activities, isLoading } = useActivities();

    if (isLoading) return <Box>Loading...</Box>;

    if (!activities) return <Box>No activities found</Box>;
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {activities.map(activity => (
                <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                />
            ))}
        </Box>
    )
}