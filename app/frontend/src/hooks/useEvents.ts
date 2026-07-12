import { useEventStore } from '../stores/eventStore';

export const useEvents = () => {
  const events = useEventStore((state) => state.events);
  const registrations = useEventStore((state) => state.registrations);
  const isLoading = useEventStore((state) => state.isLoading);
  const error = useEventStore((state) => state.error);

  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const createEvent = useEventStore((state) => state.createEvent);
  const registerForEvent = useEventStore((state) => state.registerForEvent);
  const fetchUserRegistrations = useEventStore((state) => state.fetchUserRegistrations);
  const cancelRegistration = useEventStore((state) => state.cancelRegistration);
  const publishEvent = useEventStore((state) => state.publishEvent);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const deleteEvent = useEventStore((state) => state.deleteEvent);

  return {
    events,
    registrations,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    registerForEvent,
    fetchUserRegistrations,
    cancelRegistration,
    publishEvent,
    updateEvent,
    deleteEvent
  };
};
