import {z} from 'zod';

const requiredString = (fieldName: string) =>
    z
        .string({error: `${fieldName} is required`})
        .trim()
        .min(1, {message: `${fieldName} is required`});

export const activitySchema = z.object({
    title: requiredString('Title'),
    description: requiredString('Description'),
    category: requiredString('Category'),
    date: z
        .coerce
        .date({error: 'Date is required'})
        .refine((date) => date > new Date(), {
            message: 'Date must be in the future'
        }),
    location: z.object({
        venue: requiredString('Venue'),
        city: requiredString('City'),
        latitude: z
            .coerce
            .number({error: 'Latitude is required'})
            .min(-90, {message: 'Latitude must be between -90 and 90'})
            .max(90, {message: 'Latitude must be between -90 and 90'}),
        longitude: z
            .coerce
            .number({error: 'Longitude is required'})
            .min(-180, {message: 'Longitude must be between -180 and 180'})
            .max(180, {message: 'Longitude must be between -180 and 180'})
    })
})

export type ActivitySchema = z.input<typeof activitySchema>;
