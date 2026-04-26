import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";

type Props = {
    activity: Activity;
    cancelSelect: () => void
    openForm: (id: string) => void
}

export default function ActivityDetails({ activity, cancelSelect, openForm }: Props) {
    const categoryImage = `${import.meta.env.BASE_URL}images/categoryImages/${activity.category.toLowerCase()}.jpg`

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
                <Button onClick={() => openForm(activity.id)}  color="primary">Edit</Button>
                <Button onClick={cancelSelect} color='inherit'>Cancel</Button>
            </CardActions>
        </Card>
    )
}