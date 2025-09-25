export type EventItem = {
  id: string
  type: 'Workshop' | 'Seminar' | 'Guest Lecture' | 'Industrial Visit' | 'Cultural' | 'Sports'
  title: string
  date?: string
  time?: string
  endTime?: string
  description: string
  venue?: string
  eligibility?: string
  fee?: string
  mode?: 'Online' | 'Offline' | 'Hybrid'
  image?: { uri: string }
  // Additional rich details for edit-event page
  registrationLink?: string
  organizers?: { name: string; subtitle: string; icon: string }[]
  creator?: { name: string; subtitle: string; icon: string }
  contacts?: { name: string; role: string; phone: string; icon: string }[]
}

// Source of truth for Student Home events
export const homeEvents: EventItem[] = [
  {
    id: '1',
    type: 'Workshop',
    title: 'AI & Machine Learning',
    date: 'Aug 05, 2024',
    time: '9:00 AM',
    venue: 'Microsoft Lab',
    eligibility: 'All',
    fee: 'Free',
    description:
      'Hands-on workshop on the fundamentals of AI and Machine Learning. Register now!',
    image: { uri: 'https://aiml.events/media/CACHE/images/image/d5/dc/d5dc86c7ec324d1c94f38e2b23673ca0/f9ad0ca478d0e37368318bf638c155d9.jpg' },
    registrationLink: 'https://example.com/register/aiml',
    organizers: [
      { name: 'Prathyusha Engineering College', subtitle: 'Department of CSE', icon: 'business' },
      { name: 'IIC Cell', subtitle: 'Innovation Council', icon: 'people' },
    ],
    creator: { name: 'Publisher Team', subtitle: 'CSE Department', icon: 'person' },
    contacts: [
      { name: 'Rohit Sharma', role: 'Student Coordinator', phone: '+91 98765 43210', icon: 'person' },
      { name: 'Priya Raquel Singh', role: 'Faculty Coordinator', phone: '+91 98765 43211', icon: 'person' },
    ],
  },
  {
    id: '2',
    type: 'Seminar',
    title: 'Future of Blockchain',
    date: 'Aug 12, 2024',
    time: '2:00 PM',
    venue: 'Seminar Hall',
    eligibility: 'CyberSecurity',
    fee: 'Free',
    description:
      'An insightful seminar on the impact and future of blockchain technology across industries.',
    image: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn_AL1vlSWkCOi__gJWjaR5QOUKVcvYCXqh3cLMYRDIUfqpTE_6ALXnf7YvAW-Wihb7V4&usqp=CAU' },
    registrationLink: 'https://example.com/register/blockchain',
    organizers: [
      { name: 'Dept of CyberSecurity', subtitle: 'CyberSecurity', icon: 'shield' },
      { name: 'Blockchain Club', subtitle: 'Student Community', icon: 'people' },
    ],
    creator: { name: 'Blockchain Club Lead', subtitle: 'CyberSecurity', icon: 'person' },
    contacts: [
      { name: 'Arun Kumar', role: 'Student Coordinator', phone: '+91 90000 11111', icon: 'person' },
      { name: 'Dr. Nandhini', role: 'Faculty Coordinator', phone: '+91 90000 22222', icon: 'person' },
    ],
  },
  {
    id: '3',
    type: 'Guest Lecture',
    title: 'Entrepreneurship Talk',
    date: 'Aug 20, 2024',
    time: '11:00 AM',
    venue: 'Seminar Hall',
    eligibility: 'All',
    fee: 'Free',
    description:
      'Listen to the journey of a successful entrepreneur and get inspired. Q&A session included.',
    image: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMSwJRS_XHaPYH9TaQOAvE58qH6UK_3hsDyg&s' },
    registrationLink: 'https://example.com/register/entrepreneurship',
    organizers: [
      { name: 'Entrepreneurship Cell', subtitle: 'PEC', icon: 'briefcase' },
    ],
    creator: { name: 'E-Cell', subtitle: 'PEC', icon: 'person' },
    contacts: [
      { name: 'Meera', role: 'Student Coordinator', phone: '+91 90000 33333', icon: 'person' },
    ],
  },
  {
    id: '4',
    type: 'Industrial Visit',
    title: 'Visit to Tech Park',
    date: 'Aug 28, 2024',
    time: '10:00 AM',
    venue: 'Ground',
    eligibility: 'Computer Science',
    fee: '2000',
    description:
      'An exciting industrial visit to a leading tech park to witness innovation in action.',
    image: { uri : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjvZqYTVAjPzmJrgLSsJAb8mI8vny87DqpoQ&s'},
    registrationLink: 'https://example.com/register/techpark',
    organizers: [
      { name: 'Placement Cell', subtitle: 'Industry Relations', icon: 'construct' },
    ],
    creator: { name: 'Placement Office', subtitle: 'PEC', icon: 'person' },
    contacts: [
      { name: 'Vijay', role: 'Student Coordinator', phone: '+91 90000 44444', icon: 'person' },
    ],
  },
]

export type SearchEvent = {
  id: string
  title: string
  description: string
  category: EventItem['type']
  department: 'CSE' | 'ECE' | 'MECH' | 'CIVIL' | 'EEE'
  image?: { uri: string }
  // Optional details for eventDetail page
  date?: string
  time?: string
  venue?: string
  eligibility?: string
  fee?: string
  mode?: 'Online' | 'Offline' | 'Hybrid'
  registrationLink?: string
  organizers?: { name: string; subtitle: string; icon: string }[]
  creator?: { name: string; subtitle: string; icon: string }
  contacts?: { name: string; role: string; phone: string; icon: string }[]
}

// Existing search-only events
const extraSearchEvents: SearchEvent[] = [
  {
    id: 'e1',
    title: 'AI & Machine Learning Workshop',
    description: 'Learn the basics of AI and machine learning in this hands-on session.',
    category: 'Workshop',
    department: 'CSE',
    image: { uri: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop' },
    registrationLink: 'https://example.com/register/e1',
    organizers: [
      { name: 'CSE Association', subtitle: 'Technical', icon: 'school' },
    ],
    creator: { name: 'AI Club', subtitle: 'CSE', icon: 'person' },
    contacts: [
      { name: 'Hari', role: 'Student Coordinator', phone: '+91 91111 11111', icon: 'person' },
    ],
  },
  {
    id: 'e2',
    title: 'Photography Exhibition',
    description: 'Showcase your best shots and view stunning photography from peers.',
    category: 'Cultural',
    department: 'CIVIL',
    image: { uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop' },
    registrationLink: 'https://example.com/register/e2',
    organizers: [
      { name: 'Cultural Club', subtitle: 'PEC', icon: 'podium' },
    ],
    creator: { name: 'Cultural Team', subtitle: 'PEC', icon: 'person' },
    contacts: [
      { name: 'Asha', role: 'Student Coordinator', phone: '+91 92222 22222', icon: 'person' },
    ],
  },
  {
    id: 'e3',
    title: 'Inter–College Basketball Tournament',
    description: 'Cheer on your team or participate in this exciting basketball tournament.',
    category: 'Sports',
    department: 'MECH',
    image: { uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop' },
    registrationLink: 'https://example.com/register/e3',
    organizers: [
      { name: 'Sports Committee', subtitle: 'PEC', icon: 'basketball' },
    ],
    creator: { name: 'Sports Office', subtitle: 'PEC', icon: 'person' },
    contacts: [
      { name: 'Ravi', role: 'Student Coordinator', phone: '+91 93333 33333', icon: 'person' },
    ],
  },
]

// Convert home events into SearchEvent entries so Student Home events appear in Search
const mappedHomeToSearch: SearchEvent[] = homeEvents.map((e, idx) => ({
  id: `h${e.id}`,
  title: e.title,
  description: e.description,
  category: e.type,
  department: inferDepartmentFromEvent(e),
  image: e.image,
  date: e.date,
  time: e.time,
  venue: e.venue,
  eligibility: e.eligibility,
  fee: e.fee,
  registrationLink: e.registrationLink,
  organizers: e.organizers,
  creator: e.creator,
  contacts: e.contacts,
}))

// Helper function to infer department from event content
function inferDepartmentFromEvent(event: EventItem): SearchEvent['department'] {
  const eligibility = event.eligibility?.toLowerCase() || ''
  const organizers = event.organizers?.map(o => o.subtitle.toLowerCase()).join(' ') || ''
  
  if (eligibility.includes('cybersecurity') || organizers.includes('cybersecurity')) {
    return 'CSE' // or return 'CYBER' if you define a separate cybersecurity department
  }
  if (eligibility.includes('computer') || organizers.includes('cse')) {
    return 'CSE'
  }
  // Add more mappings as needed based on `event.type`, `event.title`, etc.
  return 'CSE' // default fallback
}

export const searchEvents: SearchEvent[] = [...mappedHomeToSearch, ...extraSearchEvents]

// Backend-ready async facades. Replace implementations to integrate with API/MongoDB later.
export async function listHomeEvents(): Promise<EventItem[]> {
  // TODO (backend): replace with API call, e.g., await api.get('/events/home')
  return Promise.resolve(homeEvents)
}

export async function listSearchEvents(): Promise<SearchEvent[]> {
  // TODO (backend): replace with API call, e.g., await api.get('/events/search')
  return Promise.resolve(searchEvents)
}

export async function getEventById(id: string): Promise<(EventItem | SearchEvent) | null> {
  // Prefer searchEvents for details if present
  const fromSearch = searchEvents.find((e) => e.id === id)
  if (fromSearch) return Promise.resolve(fromSearch)

  // If an "h"-prefixed id was used for home-mapped entries, normalize
  const normalized = id.startsWith('h') ? id.slice(1) : id
  const fromHome = homeEvents.find((e) => e.id === normalized)
  if (fromHome) return Promise.resolve(fromHome)

  return Promise.resolve(null)
}


