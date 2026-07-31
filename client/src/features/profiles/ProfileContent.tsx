import { Box, Paper, Tab, Tabs } from "@mui/material";
import { type SyntheticEvent, useState } from "react";
import ProfilePhoto from "./ProfilePhotos";
import ProfileAbout from "./ProfileAbout";
import ProfileFollowings from "./ProfileFollowings";
import ProfileActivities from "./ProfileActivities";
export default function ProfileContent() {
    const [value, setValue] = useState(0);

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const tabContent = [
        { label: 'About', content: <ProfileAbout /> },
        { label: 'Photos', content: <ProfilePhoto /> },
        { label: 'Events', content: <ProfileActivities /> },
        { label: 'Followers', content: <ProfileFollowings activeTab={value}/> },
        { label: 'Following', content: <ProfileFollowings activeTab={value}/> }
    ];

    return (
        <Box
            component={Paper}
            sx={{
                mt: 2,
                p: 3,
                elevation: 3,
                height: 500,
                display: 'flex',
                alignItems: 'stretch',
                borderRadius: 3
            }}
        >
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                sx={{ borderRight: 1, minWidth: 200 }}
            >
                {tabContent.map((tab, index) => (
                    <Tab key={index} label={tab.label} sx={{mr: 3}} />
                ))}
            </Tabs>
            <Box sx={{ flexGrow: 1, p: 3, pt: 0, minHeight: 0, overflowY: 'auto' }}>
                {tabContent[value].content}
            </Box>
        </Box>
    )
}