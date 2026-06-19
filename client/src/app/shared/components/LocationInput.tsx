import {Box, debounce, List, ListItemButton, TextField, Typography} from "@mui/material";
import { type FieldValues, useController, type UseControllerProps } from "react-hook-form";
import { useEffect, useMemo, useState} from "react";
import axios from "axios";

type Props<T extends FieldValues> = {
    label: string
} & UseControllerProps<T>;

export default function LocationInput<T extends FieldValues>(props: Props<T>) {
    const { fieldState, field } = useController({ ...props });
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<LocationIQSuggestion[]>([]);
    const [inputValue, setInputValue] = useState(field.value || '');

    useEffect(() => {
        if (field.value && typeof field.value === 'object') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInputValue(field.value.venue || '');
        } else {
            setInputValue(field.value || '');
        }
    }, [field.value]);


    const locationUrl = 'https://api.locationiq.com/v1/autocomplete?key=pk.0907841e624874992e1e11f07a5026a8&limit=5&dedupe=1&';

    const fetchSuggestions = useMemo(
        () => debounce(async (query: string) => {
            if (!query || query.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);

            try {
                const res = await axios.get<LocationIQSuggestion[]>(`${locationUrl}q=${query}`);
                setSuggestions(res.data);
                console.log('Fetched suggestions:', res.data);
            } catch (e) {
                console.error('Error fetching suggestions:', e);
            } finally {
                setLoading(false);
            }
        }, 500),
        [locationUrl]
    );

    const handleChange = async (value: string) => {
        setInputValue(value);
        await fetchSuggestions(value);
    }

    const handleSelect = (location: LocationIQSuggestion) => {
        const city =
            location.address?.city ||
            location.address?.village ||
            location.address?.town ||
            location.address?.county ||
            location.address?.state ||
            '';
        const venue = location.display_name;
        const latitude = Number(location.lat);
        const longitude = Number(location.lon);
        
        setInputValue(venue);
        field.onChange({ city, venue, latitude, longitude });
        setSuggestions([]);
    }

    return (
        <Box>
            <TextField
                {...props}
                value={inputValue}
                onChange={e => handleChange(e.target.value)}
                fullWidth
                variant="outlined"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
            />
            {loading && <Typography>Loading...</Typography>}
            {suggestions.length > 0 && (
                <List sx={{border: 1}}>
                    {suggestions.map(suggestion => (
                        <ListItemButton
                            divider
                            key={suggestion.place_id}
                            onClick={() => handleSelect(suggestion)}
                        >
                            {suggestion.display_name}
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Box>
    );
}