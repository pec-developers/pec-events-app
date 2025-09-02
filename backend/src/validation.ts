import { z } from 'zod';

export const uuidSchema = z.string().uuid({ message: 'Invalid UUID' });

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  eventType: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  venue: z.string().min(1),
  mode: z.string().min(1),
  eligibility: z.string().min(1),
  fee: z.string().min(1),
  registrationLink: z.string().url().optional().or(z.literal('')),
  organizers: z.any(),
  contacts: z.any(),
});

export const updateEventSchema = createEventSchema.partial();
