import * as mockEvent from './event.mock';
import * as realEvent from './event.real';

// Toggle mock events based on execution environment.
// Forces real API calls during test runs so MSW can intercept network requests.
const USE_MOCK = import.meta.env.MODE !== 'test';

export const createEvent = USE_MOCK ? mockEvent.createEvent : realEvent.createEvent;
export const getEvents = USE_MOCK ? mockEvent.getEvents : realEvent.getEvents;
export const registerForEvent = USE_MOCK ? mockEvent.registerForEvent : realEvent.registerForEvent;
export const getRegistrations = USE_MOCK ? mockEvent.getRegistrations : realEvent.getRegistrations;
export const cancelRegistration = USE_MOCK ? mockEvent.cancelRegistration : realEvent.cancelRegistration;
export const publishEvent = USE_MOCK ? mockEvent.publishEvent : realEvent.publishEvent;
export const updateEvent = USE_MOCK ? mockEvent.updateEvent : realEvent.updateEvent;
export const deleteEvent = USE_MOCK ? mockEvent.deleteEvent : realEvent.deleteEvent;

export type {
  CreateEventRequest,
  EventResponse,
  RegisterEventResponse,
  RegistrationResponse
} from './event.types';
