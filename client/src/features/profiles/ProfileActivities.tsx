import { type SyntheticEvent, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import ProfileEvent from './ProfileEvent';

export default function ProfileActivities() {
    const [value, setValue] = useState('future');

    const handleChange = (_: SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const tabs = [
        { value: 'future', label: 'Future Events', component: <ProfileEvent filter={value}/>},
        { value: 'past', label: 'Past Events', component: <ProfileEvent filter={value}/>},
        { value: 'hosting', label: 'Hosting', component: <ProfileEvent filter={value}/> }
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="secondary"
                indicatorColor="secondary"
            >
                {tabs.map(tab => (
                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                ))}
            </Tabs>

            <Box sx={{ mt: 2 }}>
                {tabs.find(tab => tab.value === value)?.component}
            </Box>
        </Box>
    );
}