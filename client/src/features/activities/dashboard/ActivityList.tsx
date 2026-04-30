import { Box } from "@mui/material";
import ActivityCard from "./ActivityCard";
import { useActivities } from "../../../lib/hooks/useActivities";


export default function ActivityList() {

    const { activities } = useActivities();
    if (!activities) return <Box>Loading...</Box>
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