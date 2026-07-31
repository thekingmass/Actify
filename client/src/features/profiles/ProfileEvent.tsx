import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material"
import { useProfile } from "../../lib/hooks/useProfile"
import { useParams } from "react-router"
import { formatDate } from "../../lib/util/util"

type Prop = {
    filter: string
}

export default function ProfileEvent({ filter }: Prop) {
    const { id } = useParams();
    const { userActivities } = useProfile(id, undefined, filter);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
            {userActivities?.length == 0 ?
                <Typography> No Events found</Typography>
                : userActivities?.map(item => (
                    <Card key={item.id} sx={{ maxWidth: 200 }}>
                        <CardMedia
                            component="img"
                            alt={`${item.category} image`}
                            height="100"
                            image={`/images/categoryImages/${item.category.toLocaleLowerCase()}.jpg`}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h6" component="div">
                                {item.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {formatDate(item.date)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            }
        </Box>
    );
}
