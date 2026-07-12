import { create } from 'zustand';
import {
  createEvent,
  getEvents,
  registerForEvent,
  getRegistrations,
  cancelRegistration,
  publishEvent,
  updateEvent,
  deleteEvent,
  type CreateEventRequest,
  type EventResponse,
  type RegistrationResponse
} from '../api/event';

interface EventState {
  events: EventResponse[];
  registrations: RegistrationResponse[];
  isLoading: boolean;
  error: string | null;

  fetchEvents: () => Promise<void>;
  createEvent: (payload: CreateEventRequest) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  fetchUserRegistrations: () => Promise<void>;
  cancelRegistration: (registrationId: string) => Promise<void>;
  publishEvent: (eventId: string) => Promise<void>;
  updateEvent: (eventId: string, payload: CreateEventRequest) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  registrations: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await getEvents();
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch events', isLoading: false });
    }
  },

  createEvent: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await createEvent(payload);
      const events = await getEvents();
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to create event', isLoading: false });
      throw err;
    }
  },

  registerForEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      await registerForEvent(eventId);
      const events = await getEvents();
      const registrations = await getRegistrations();
      set({ events, registrations, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to register for event', isLoading: false });
      throw err;
    }
  },

  fetchUserRegistrations: async () => {
    set({ isLoading: true, error: null });
    try {
      const registrations = await getRegistrations();
      set({ registrations, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch registrations', isLoading: false });
    }
  },

  cancelRegistration: async (registrationId) => {
    set({ isLoading: true, error: null });
    try {
      await cancelRegistration(registrationId);
      const events = await getEvents();
      const registrations = await getRegistrations();
      set({ events, registrations, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to cancel registration', isLoading: false });
      throw err;
    }
  },

  publishEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      await publishEvent(eventId);
      const events = await getEvents();
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to publish event', isLoading: false });
      throw err;
    }
  },

  updateEvent: async (eventId, payload) => {
    set({ isLoading: true, error: null });
    try {
      await updateEvent(eventId, payload);
      const events = await getEvents();
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update event', isLoading: false });
      throw err;
    }
  },

  deleteEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteEvent(eventId);
      const events = await getEvents();
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete event', isLoading: false });
      throw err;
    }
  }
}));
