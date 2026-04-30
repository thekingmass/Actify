import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router";
import { useActivities } from "../../../lib/hooks/useActivities";


export default function ActivityDetails() {

    const navigate = useNavigate();

    const {id} = useParams();
    // the above id should be named same as the one in the route path : 'activities/:id'
    const {activity, isLoadingActivity} = useActivities(id);

    if (isLoadingActivity) return <Typography>Loading...</Typography>

    if (!activity) return <Typography>Activity Not Found</Typography>

    const categoryImage = `${import.meta.env.BASE_URL}images/categoryImages/${activity.category.toUpperCase().toLowerCase()}.jpg`

    return (
        <Card sx={{ borderRadius: 3 }}>
            <CardMedia
                component='img'
                image={categoryImage}
            />
            <CardContent>
                <Typography variant="h5">{activity.title}</Typography>
                <Typography variant="subtitle1" sx={{fontWeight: 'light'}}>{activity.date}</Typography>
                <Typography variant="body1">{activity.description}</Typography>
            </CardContent>
            <CardActions>
                <Button component={Link} to={`/editActivity/${activity.id}`} color="primary">Edit</Button>
                <Button onClick={() => navigate('/activities')} color='inherit'>Cancel</Button>
            </CardActions>
        </Card>
    )
}