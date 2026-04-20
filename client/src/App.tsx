import { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

function App() {

  const [activities, setActivities] = useState<Activity[]>([]);
  // The Type Acitivity is defined in src/lib/types/index.d.ts which is the default place for type definitions in a TypeScript project. It is automatically included in the project, so you can use the Activity type without needing to import it explicitly.

  useEffect(() => {
    axios.get<Activity[]>('https://localhost:5001/api/activities')
      .then(response => setActivities(response.data))
      .catch(error => console.error('Error fetching activities:', error));

    return () => {};
  }, []);

  return (
    <>
      <Typography variant="h3" component="h1">Welcome to Reactivities</Typography>
      <List>
        {activities.map((activity) => (
          <ListItem key={activity.id}>
            <ListItemText primary={activity.title} />
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default App
