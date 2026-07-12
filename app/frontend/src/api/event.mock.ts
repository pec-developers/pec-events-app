import type {
  CreateEventRequest,
  EventResponse,
  RegisterEventResponse,
  RegistrationResponse
} from './event.types';

// Seed initial mock events if localStorage is empty
const initializeMockEvents = (): EventResponse[] => {
  const defaultEvents: EventResponse[] = [
    {
      id: 'evt_ai_workshop_01',
      title: 'Workshop on Generative AI',
      description: 'An interactive hands-on workshop on Large Language Models, prompting techniques, and retrieval augmented generation.',
      capacity: 3,
      active: true,
      date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      creatorId: 'usr_coord_456',
      registrationsCount: 0,
      price: 0,
      departmentScope: 'ALL_DEPTS',
      department: 'CSE',
      status: 'PUBLISHED',
      bannerImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=60',
      posterImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&auto=format&fit=crop&q=60'
    },
    {
      id: 'evt_symposium_02',
      title: 'PEC Technical Symposium 2026',
      description: 'Annual inter-college symposium featuring paper presentation, debugging, web design, and gaming competitions.',
      capacity: 100,
      active: true,
      date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
      creatorId: 'usr_coord_456',
      registrationsCount: 0,
      price: 150,
      departmentScope: 'ONLY_DEPT',
      department: 'CSE',
      status: 'PUBLISHED',
      bannerImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60',
      posterImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop&q=60'
    }
  ];

  try {
    const data = localStorage.getItem('pec_mock_events');
    if (!data) {
      localStorage.setItem('pec_mock_events', JSON.stringify(defaultEvents));
      return defaultEvents;
    }
    return JSON.parse(data);
  } catch (e) {
    return defaultEvents;
  }
};

const getMockEvents = (): EventResponse[] => {
  try {
    const data = localStorage.getItem('pec_mock_events');
    const events: EventResponse[] = data ? JSON.parse(data) : initializeMockEvents();
    
    // Recalculate registrationsCount from registrations store to ensure integrity
    const registrations = getMockRegistrationsList();
    return events.map(evt => ({
      ...evt,
      registrationsCount: registrations.filter(r => r.eventId === evt.id && r.status === 'CONFIRMED').length
    }));
  } catch (e) {
    return initializeMockEvents();
  }
};

const saveMockEvents = (events: EventResponse[]) => {
  localStorage.setItem('pec_mock_events', JSON.stringify(events));
};

interface MockRegistrationEntry {
  id: string;
  eventId: string;
  studentId: string;
  status: 'CONFIRMED' | 'WAITING_LIST';
  createdAt: string;
}

const getMockRegistrationsList = (): MockRegistrationEntry[] => {
  try {
    const data = localStorage.getItem('pec_mock_registrations');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveMockRegistrationsList = (regs: MockRegistrationEntry[]) => {
  localStorage.setItem('pec_mock_registrations', JSON.stringify(regs));
};

const getActiveUser = () => {
  try {
    const session = sessionStorage.getItem('pec_mock_session');
    return session ? JSON.parse(session) : null;
  } catch (e) {
    return null;
  }
};

export const createEvent = async (payload: CreateEventRequest): Promise<EventResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error('Unauthorized: No active session');
  }

  const events = getMockEvents();
  
  const newEvent: EventResponse = {
    id: `evt_${Math.random().toString(36).substring(2, 11)}`,
    title: payload.title,
    description: payload.description,
    capacity: payload.capacity,
    active: !payload.isDraft,
    date: payload.date,
    creatorId: activeUser.userId,
    registrationsCount: 0,
    price: payload.price || 0,
    departmentScope: payload.departmentScope || 'ALL_DEPTS',
    department: activeUser.department || 'CSE',
    status: payload.isDraft ? 'DRAFT' : 'PUBLISHED',
    bannerImageUrl: payload.bannerImageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop&q=60',
    posterImageUrl: payload.posterImageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&auto=format&fit=crop&q=60',
    eventPhotosUrls: payload.eventPhotosUrls || []
  };

  events.push(newEvent);
  saveMockEvents(events);

  return newEvent;
};

export const getEvents = async (): Promise<EventResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const activeUser = getActiveUser();
  const allEvents = getMockEvents();

  if (!activeUser) {
    // Public/unauth users see only published events
    return allEvents.filter(e => e.status === 'PUBLISHED');
  }

  const role = activeUser.role.toUpperCase();
  const userDept = activeUser.department?.toUpperCase();

  // Admin can see everything
  if (role === 'ADMIN') {
    return allEvents;
  }

  // SPOC can see everything (especially for their department CRUDing events)
  if (role === 'SPOC') {
    return allEvents;
  }

  // Coordinators can see all published events + drafts from their own department
  if (role === 'STUDENT_COORDINATOR' || role === 'FACULTY_COORDINATOR') {
    return allEvents.filter(e => {
      if (e.status === 'PUBLISHED') return true;
      // It's a draft: show only if creator matches or in the same department
      return e.creatorId === activeUser.userId || e.department?.toUpperCase() === userDept;
    });
  }

  // Students & Faculty (Non-coordinators) can ONLY see PUBLISHED events
  // AND they can only see events which are for ALL departments OR match their department.
  return allEvents.filter(e => {
    if (e.status !== 'PUBLISHED') return false;
    return e.departmentScope === 'ALL_DEPTS' || e.department?.toUpperCase() === userDept;
  });
};

export const publishEvent = async (eventId: string): Promise<EventResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error('Unauthorized: No active session');
  }

  const role = activeUser.role.toUpperCase();
  if (role !== 'ADMIN' && role !== 'SPOC' && role !== 'FACULTY_COORDINATOR' && role !== 'STUDENT_COORDINATOR') {
    throw new Error('Only Coordinators, SPOCs, or Admins can publish events.');
  }

  const events = getMockEvents();
  const eventIdx = events.findIndex(e => e.id === eventId);
  if (eventIdx === -1) {
    throw new Error('Event not found.');
  }

  events[eventIdx].status = 'PUBLISHED';
  events[eventIdx].active = true;
  saveMockEvents(events);

  return events[eventIdx];
};

export const updateEvent = async (eventId: string, payload: CreateEventRequest): Promise<EventResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error('Unauthorized: No active session');
  }

  const events = getMockEvents();
  const eventIdx = events.findIndex(e => e.id === eventId);
  if (eventIdx === -1) {
    throw new Error('Event not found.');
  }

  // Validate permission (Admin, SPOC of dept, or the creator itself)
  const role = activeUser.role.toUpperCase();
  const isCreator = events[eventIdx].creatorId === activeUser.userId;
  const isSameDeptSPOC = role === 'SPOC' && events[eventIdx].department?.toUpperCase() === activeUser.department?.toUpperCase();
  const isAdmin = role === 'ADMIN';

  if (!isAdmin && !isSameDeptSPOC && !isCreator) {
    throw new Error('You do not have permission to edit this event.');
  }

  events[eventIdx].title = payload.title;
  events[eventIdx].description = payload.description;
  events[eventIdx].capacity = payload.capacity;
  events[eventIdx].date = payload.date;
  if (payload.price !== undefined) events[eventIdx].price = payload.price;
  if (payload.departmentScope !== undefined) events[eventIdx].departmentScope = payload.departmentScope;
  if (payload.bannerImageUrl !== undefined) events[eventIdx].bannerImageUrl = payload.bannerImageUrl;
  if (payload.posterImageUrl !== undefined) events[eventIdx].posterImageUrl = payload.posterImageUrl;
  if (payload.isDraft !== undefined) {
    events[eventIdx].status = payload.isDraft ? 'DRAFT' : 'PUBLISHED';
    events[eventIdx].active = !payload.isDraft;
  }

  saveMockEvents(events);
  return events[eventIdx];
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error('Unauthorized: No active session');
  }

  let events = getMockEvents();
  const targetEvent = events.find(e => e.id === eventId);
  if (!targetEvent) {
    throw new Error('Event not found.');
  }

  // Validate permission (Admin can delete any event, SPOC can delete dept events, creator can delete)
  const role = activeUser.role.toUpperCase();
  const isCreator = targetEvent.creatorId === activeUser.userId;
  const isSameDeptSPOC = role === 'SPOC' && targetEvent.department?.toUpperCase() === activeUser.department?.toUpperCase();
  const isAdmin = role === 'ADMIN';

  if (!isAdmin && !isSameDeptSPOC && !isCreator) {
    throw new Error('You do not have permission to delete this event.');
  }

  events = events.filter(e => e.id !== eventId);
  saveMockEvents(events);
};

export const registerForEvent = async (eventId: string): Promise<RegisterEventResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error('Unauthorized: No active session');
  }

  const events = getMockEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.status !== 'PUBLISHED') {
    throw new Error('Cannot register for a draft event.');
  }

  const registrations = getMockRegistrationsList();
  
  // Prevent double registration
  const alreadyRegistered = registrations.find(r => r.eventId === eventId && r.studentId === activeUser.userId);
  if (alreadyRegistered) {
    throw new Error('You are already registered for this event.');
  }

  // Count current confirmed registrations for this event
  const activeConfirmedCount = registrations.filter(r => r.eventId === eventId && r.status === 'CONFIRMED').length;

  let status: 'CONFIRMED' | 'WAITING_LIST' = 'CONFIRMED';
  if (activeConfirmedCount >= event.capacity) {
    status = 'WAITING_LIST';
  }

  const newReg: MockRegistrationEntry = {
    id: `reg_${Math.random().toString(36).substring(2, 11)}`,
    eventId,
    studentId: activeUser.userId,
    status,
    createdAt: new Date().toISOString()
  };

  registrations.push(newReg);
  saveMockRegistrationsList(registrations);

  return {
    registrationId: newReg.id,
    status: newReg.status
  };
};

export const getRegistrations = async (): Promise<RegistrationResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error('Unauthorized: No active session');
  }

  const registrations = getMockRegistrationsList();
  const events = getMockEvents();

  const userRegs = registrations.filter(r => r.studentId === activeUser.userId);
  
  return userRegs.map(reg => {
    const event = events.find(e => e.id === reg.eventId);
    return {
      id: reg.id,
      eventId: reg.eventId,
      studentId: reg.studentId,
      status: reg.status,
      createdAt: reg.createdAt,
      eventTitle: event ? event.title : 'Unknown Event'
    };
  });
};

export const cancelRegistration = async (registrationId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error('Unauthorized: No active session');
  }

  let registrations = getMockRegistrationsList();
  const regToCancel = registrations.find(r => r.id === registrationId);
  if (!regToCancel) {
    throw new Error('Registration not found');
  }

  // Double check authorization (student owner)
  if (regToCancel.studentId !== activeUser.userId) {
    throw new Error('Unauthorized: You can only cancel your own registrations.');
  }

  const eventId = regToCancel.eventId;
  const events = getMockEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Remove the registration
  registrations = registrations.filter(r => r.id !== registrationId);

  // If the cancelled registration was 'CONFIRMED', we promote the oldest 'WAITING_LIST' registration
  if (regToCancel.status === 'CONFIRMED') {
    const oldestWaiting = registrations
      .filter(r => r.eventId === eventId && r.status === 'WAITING_LIST')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

    if (oldestWaiting) {
      oldestWaiting.status = 'CONFIRMED';
    }
  }

  saveMockRegistrationsList(registrations);
};
