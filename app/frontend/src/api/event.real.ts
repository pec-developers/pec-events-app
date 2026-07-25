import client from './client';
import type {
  CreateEventRequest,
  EventResponse,
  RegisterEventResponse,
  RegistrationResponse,
  RegistrationDetailResponse
} from './event.types';

export const createEvent = async (payload: CreateEventRequest): Promise<EventResponse> => {
  const { data } = await client.post<EventResponse>('/api/events', payload);
  return data;
};

export const getEvents = async (): Promise<EventResponse[]> => {
  const { data } = await client.get<EventResponse[]>('/api/events');
  return data;
};

export const registerForEvent = async (eventId: string): Promise<RegisterEventResponse> => {
  const { data } = await client.post<RegisterEventResponse>(`/api/events/${eventId}/register`);
  return data;
};

export const getRegistrations = async (): Promise<RegistrationResponse[]> => {
  const { data } = await client.get<RegistrationResponse[]>('/api/registrations/me');
  return data;
};

export const cancelRegistration = async (registrationId: string): Promise<void> => {
  await client.post(`/api/registrations/${registrationId}/cancel`);
};

export const publishEvent = async (eventId: string): Promise<EventResponse> => {
  const { data } = await client.post<EventResponse>(`/api/events/${eventId}/publish`);
  return data;
};

export const updateEvent = async (eventId: string, payload: CreateEventRequest): Promise<EventResponse> => {
  const { data } = await client.put<EventResponse>(`/api/events/${eventId}`, payload);
  return data;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await client.delete(`/api/events/${eventId}`);
};

export const getEventRegistrations = async (eventId: string): Promise<RegistrationDetailResponse[]> => {
  const { data } = await client.get<RegistrationDetailResponse[]>(`/api/events/${eventId}/registrations`);
  return data;
};
