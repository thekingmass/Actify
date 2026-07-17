import { DeleteOutlined, Delete } from "@mui/icons-material";
import { Box, Button } from "@mui/material";

export default function DeleteButton() {
    return (
        <Box sx={{position: 'relative'}}>
            <Button
                sx={{
                    opacity: 0.8,
                    transition: 'opacity 0.3s',
                    position: 'relative',
                    cursor: 'pointer'
                }}
            >
                <DeleteOutlined
                    sx={{
                        fontSize: 32,
                        color: 'white',
                        position: 'absolute'
                    }}
                />
                <Delete
                    sx={{
                        fontSize: 28,
                        color: 'red'
                    }}
                />
            </Button>
        </Box>
    )
}