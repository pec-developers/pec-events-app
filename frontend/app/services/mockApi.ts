import { homeEvents, searchEvents, getEventById, type EventItem, type SearchEvent } from '../data/events'
import { withCache, invalidateCacheByPrefix, TWENTY_HOURS_MS } from './cache'
import { getApiBaseUrl } from '../../src/config/api';

// Simple in-memory mock API layer for future backend integration
// Replace these implementations with real HTTP calls when backend is ready.

export type PublisherEvent = {
  id: string
  title: string
  date?: string
  type: EventItem['type']
  imageUrl?: string
  status: 'upcoming' | 'ongoing' | 'past'
  description?: string
  venue?: string
  fee?: string
}

export type UserProfile = {
  name: string
  role: string
  department: string
  email?: string
}

export type UpsertEventPayload = {
  title: string
  description: string
  imageUrl?: string
  eligibility?: string
  date?: string
  startTime?: string
  endTime?: string
  mode?: 'Online' | 'Offline' | 'Hybrid' | ''
  venue?: string
  fee?: string
  organizers?: { parentOrganization: string; eventOrganizer: string }[]
  contacts?: { name: string; role: string; phone: string }[]
  registrationLink?: string
  type: EventItem['type']
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function genId(prefix = 'e'): string {
  const rnd = Math.random().toString(36).slice(2, 8)
  return `${prefix}${Date.now().toString(36)}${rnd}`
}

// Create mutable copies at module level
let mutableSearchEvents = [...searchEvents]
let mutableHomeEvents = [...homeEvents]

// Helper: convert dd-mm-yyyy -> yyyy-mm-dd if needed
function normalizeDate(d?: string): string | undefined {
  if (!d) return undefined
  const m = d.match(/^([0-3]\d)-([0-1]\d)-(\d{4})$/)
  if (m) {
    const [, dd, mm, yyyy] = m
    return `${yyyy}-${mm}-${dd}`
  }
  return d
}

// Helper: transform frontend form payload to backend schema for `data` JSON
function toBackendEventData(dataObj: Record<string, any>): Record<string, any> {
  const mappedOrganizers = Array.isArray(dataObj.organizers)
    ? dataObj.organizers
        .filter((o: any) => o && (o.parentOrganization || o.eventOrganizer))
        .map((o: any) => ({ parentOrgName: o.parentOrganization || '', orgName: o.eventOrganizer || '' }))
    : undefined

  const mappedContacts = Array.isArray(dataObj.contacts)
    ? dataObj.contacts
        .filter((c: any) => c && (c.name || c.role || c.phone || c.contactNumber))
        .map((c: any) => ({ name: c.name || '', role: c.role || '', phone: c.phone || c.contactNumber || '' }))
    : undefined

  const processedData = {
    ...dataObj,
    // normalize and map fields expected by backend
    eventType: dataObj.type,
    date: normalizeDate(dataObj.date),
    startTime: dataObj.startTime,
    endTime: dataObj.endTime,
    organizers: mappedOrganizers,
    contacts: mappedContacts,
    fee: dataObj.fee ?? dataObj.entryFee, // accept either `fee` or `entryFee`
    // remove/ignore frontend-only fields
    type: undefined,
    imageUrl: undefined, // image is sent as multipart file, not URL
    entryFee: undefined,
  }

  // strip undefined
  return Object.fromEntries(Object.entries(processedData).filter(([, v]) => v !== undefined))
}

// Ensure file is in a shape compatible with React Native FormData/multer
function normalizeFileForFormData(file: any): any {
  if (!file) return undefined
  
  // Web: accept File/Blob as-is
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined'
  if (isWeb) {
    if (file instanceof File || file instanceof Blob) {
      return file
    }
  }
  
  // Native RN: ensure we have uri, name, type
  const uri = (file as any).uri
  const name = (file as any).name || `image-${Date.now()}.jpg`
  // Prioritize mimeType over type for better compatibility
  const type = (file as any).mimeType || (file as any).type || 'image/jpeg'
  
  if (!uri) {
    console.warn('File missing uri property:', file)
    return undefined
  }
  
  return { uri, name, type }
}

// Simplified file resolver - only handles local files
async function resolveFileForFormData(input: any): Promise<any | undefined> {
  if (!input) return undefined
  
  // If it's already a File/Blob (web), return as-is
  if (input instanceof File || input instanceof Blob) {
    return input
  }
  
  // For React Native, normalize the file object
  return normalizeFileForFormData(input)
}

function appendFileWithName(form: FormData, field: string, file: any) {
  if (!file) return
  
  try {
    // Web: File/Blob can be appended directly
    if (file instanceof File || file instanceof Blob) {
      form.append(field, file)
      return
    }
    
    // React Native: append with name and type
    const fileName = (file as any)?.name || `image-${Date.now()}.jpg`
    
    // For React Native, we need to ensure the file object has the right structure
    const fileToAppend = {
      uri: file.uri,
      name: fileName,
      type: file.type || 'image/jpeg'
    }
    
    // @ts-ignore - React Native FormData accepts the third parameter
    form.append(field, fileToAppend as any, fileName)
  } catch (error) {
    console.error('Error appending file to FormData:', error)
    // Fallback: append without filename
    form.append(field, file as any)
  }
}

export const mockApi = {
  
  async listStudentHomeEvents(): Promise<EventItem[]> {
    return withCache<EventItem[]>('student:events:list', TWENTY_HOURS_MS, async () => {
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/student/events`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`Failed to load events (${response.status})`)
      }
      const json: { success: boolean; events: Array<{ id: string; imageUrl?: string; title: string; description: string; date?: string; startTime?: string; eventType?: string }> } = await response.json()
      const allowed: EventItem['type'][] = ['Workshop', 'Seminar', 'Guest Lecture', 'Industrial Visit', 'Cultural', 'Sports']
      const mapType = (t?: string): EventItem['type'] => (t && (allowed as string[]).includes(t) ? (t as EventItem['type']) : 'Seminar')
      return (json.events || []).map((e) => ({
        id: e.id,
        image: e.imageUrl ? { uri: e.imageUrl } : undefined,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.startTime,
        type: mapType(e.eventType),
      }))
    })
  },

  async getStudentEventById(id: string): Promise<(EventItem | SearchEvent) | null> {
    return withCache<(EventItem | SearchEvent) | null>(`student:events:${id}`, TWENTY_HOURS_MS, async () => {
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/student/events/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Failed to load event (${response.status})`)
      }
      const json: { success: boolean; event?: {
        id: string;
        title: string;
        description: string;
        eventType?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
        venue?: string;
        mode?: string;
        eligibility?: string;
        fee?: string;
        registrationLink?: string;
        organizers?: Array<{ orgName: string; parentOrgName?: string }>;
        contacts?: Array<{ name: string; role: string; phone: string }>;
        imageUrl?: string;
      } } = await response.json()

      if (!json.event) return null

      const allowed: EventItem['type'][] = ['Workshop', 'Seminar', 'Guest Lecture', 'Industrial Visit', 'Cultural', 'Sports']
      const mapType = (t?: string): EventItem['type'] => (t && (allowed as string[]).includes(t) ? (t as EventItem['type']) : 'Seminar')

      const ev = json.event
      const mapped: EventItem = {
        id: ev.id,
        type: mapType(ev.eventType),
        title: ev.title,
        description: ev.description,
        date: ev.date,
        time: ev.startTime,
        endTime: ev.endTime,
        venue: ev.venue,
        eligibility: ev.eligibility,
        fee: ev.fee,
        registrationLink: ev.registrationLink,
        image: ev.imageUrl ? { uri: ev.imageUrl } : undefined,
        organizers: Array.isArray(ev.organizers)
          ? ev.organizers.map(o => ({ name: o.orgName, subtitle: o.parentOrgName || '', icon: 'people' }))
          : undefined,
        contacts: Array.isArray(ev.contacts)
          ? ev.contacts.map(c => ({ name: c.name, role: c.role, phone: c.phone, icon: 'person' }))
          : undefined,
      }

      return mapped
    })
  },

  async getPublisherEventById(id: string): Promise<(EventItem | SearchEvent) | null> {
    const baseUrl = await getApiBaseUrl()
    if (!baseUrl) {
      throw new Error('Missing API base URL configuration')
    }
    try {
      new URL(baseUrl)
    } catch {
      throw new Error('Invalid API base URL configuration')
    }
    const token = await (async () => {
      try { return (await import('@react-native-async-storage/async-storage')).default.getItem('auth:publisher:jwt') } catch { return null }
    })()
    const resolvedToken = typeof token === 'string' ? token : (await token)
    return withCache<(EventItem | SearchEvent) | null>(`publisher:events:${id}`, TWENTY_HOURS_MS, async () => {
      const response = await fetch(`${String(baseUrl).replace(/\/$/, '')}/api/publisher/events/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
        },
      })
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Failed to load publisher event (${response.status})`)
      }
      const json: { success: boolean; event?: {
        id: string;
        title: string;
        description: string;
        eventType?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
        venue?: string;
        mode?: string;
        eligibility?: string;
        fee?: string;
        registrationLink?: string;
        organizers?: Array<{ orgName: string; parentOrgName?: string }>;
        contacts?: Array<{ name: string; role: string; phone: string }>;
        imageUrl?: string;
        publisher?: { name?: string; department?: string };
      } } = await response.json()

      if (!json.event) return null

      const allowed: EventItem['type'][] = ['Workshop', 'Seminar', 'Guest Lecture', 'Industrial Visit', 'Cultural', 'Sports']
      const mapType = (t?: string): EventItem['type'] => (t && (allowed as string[]).includes(t) ? (t as EventItem['type']) : 'Seminar')

      const allowedModes: ('Online' | 'Offline' | 'Hybrid')[] = ['Online', 'Offline', 'Hybrid']
      const mapMode = (m?: string): 'Online' | 'Offline' | 'Hybrid' | undefined => 
        (m && allowedModes.includes(m as any) ? (m as 'Online' | 'Offline' | 'Hybrid') : undefined)

      const ev = json.event
      const mapped: EventItem = {
        id: ev.id,
        type: mapType(ev.eventType),
        title: ev.title,
        description: ev.description,
        date: ev.date,
        time: ev.startTime,
        endTime: ev.endTime,
        venue: ev.venue,
        mode: mapMode(ev.mode),
        eligibility: ev.eligibility,
        fee: ev.fee,
        registrationLink: ev.registrationLink,
        image: ev.imageUrl ? { uri: ev.imageUrl } : undefined,
        organizers: Array.isArray(ev.organizers)
          ? ev.organizers.map(o => ({ name: o.orgName, subtitle: o.parentOrgName || '', icon: 'people' }))
          : undefined,
        creator: ev.publisher ? { name: ev.publisher.name || 'Publisher', subtitle: ev.publisher.department || '', icon: 'person' } : undefined,
        contacts: Array.isArray(ev.contacts)
          ? ev.contacts.map(c => ({ name: c.name, role: c.role, phone: c.phone, icon: 'person' }))
          : undefined,
      }

      return mapped
    })
  },

  
  async fetchUserProfile(params?: { role: 'user' | 'publisher' }): Promise<UserProfile> {
    const roleKey = params?.role === 'publisher' ? 'publisher' : 'user'
    return withCache<UserProfile>(`profile:${roleKey}`, TWENTY_HOURS_MS, async () => {
      const baseUrl = await getApiBaseUrl();
      const isPublisher = params?.role === 'publisher'
      const token = isPublisher ? await (async () => {
        try { return (await import('@react-native-async-storage/async-storage')).default.getItem('auth:publisher:jwt') } catch { return null }
      })() : null
      const resolvedToken = token ? (typeof token === 'string' ? token : (await token)) : null

      const endpoint = params?.role === 'publisher' ? '/api/publisher/profile' : '/api/student/profile'
      const resp = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
        },
      })
      if (!resp.ok) {
        throw new Error(`Failed to load ${params?.role || 'user'} profile (${resp.status})`)
      }
      const json: { success: boolean; user?: { fullname?: string; role?: string; department?: string } } = await resp.json()
      const user = json.user || {}
      return {
        name: user.fullname || ((user.role || params?.role) === 'publisher' ? 'Publisher' : 'User'),
        role: user.role || (params?.role === 'publisher' ? 'Publisher' : 'User'),
        department: user.department || '',
        email: undefined,
      }
    })
  },

  // Helper to derive status based on event dates/times
  // Rules:
  // - past: event end < now
  // - upcoming: event start > now
  // - ongoing: start <= now <= end
  // - If only a single date is provided (no explicit end date), treat that date as the full day window
  //   and if a start time is provided without an end time, the window is [start time .. end of day]
  deriveStatusFromDates(e: (typeof searchEvents)[number], now: Date = new Date()): 'upcoming' | 'ongoing' | 'past' {
    const dateString = e.date?.trim()
    const timeString = e.time?.trim()

    // Optional end fields (not in type but may be provided later)
    const endDateString = (e as any).endDate as string | undefined
    const endTimeString = (e as any).endTime as string | undefined

    const parseDateTime = (d?: string, t?: string): Date | null => {
      if (!d) return null
      const composed = t ? `${d} ${t}` : d
      const parsed = new Date(composed)
      if (!Number.isNaN(parsed.getTime())) return parsed
      return null
    }

    const startDateTime = parseDateTime(dateString, timeString) || (dateString ? parseDateTime(dateString) : null)

    let endDateTime: Date | null = null
    if (endDateString) {
      // Multi-day: use provided end date/time; default to end-of-day if no time
      endDateTime = parseDateTime(endDateString, endTimeString) || parseDateTime(endDateString)
      if (endDateTime) endDateTime.setHours(23, 59, 59, 999)
    } else if (endTimeString) {
      // Same-day with explicit end time
      endDateTime = parseDateTime(dateString, endTimeString)
    } else if (dateString) {
      // Single date provided (with or without start time): treat as full day window if no end provided
      endDateTime = parseDateTime(dateString) || null
      if (endDateTime) endDateTime.setHours(23, 59, 59, 999)
    }

    // If we somehow failed to parse start but have date, assume start-of-day
    let normalizedStart = startDateTime
    if (!normalizedStart && dateString) {
      const d = parseDateTime(dateString)
      if (d) {
        d.setHours(0, 0, 0, 0)
        normalizedStart = d
      }
    }

    // If nothing parsable, default to upcoming
    if (!normalizedStart && !endDateTime) {
      return 'upcoming'
    }

    // If we have start but no end, and there is a date, treat end as end-of-day
    if (normalizedStart && !endDateTime && dateString) {
      const d = new Date(normalizedStart)
      d.setHours(23, 59, 59, 999)
      endDateTime = d
    }

    // Final comparisons
    const start = normalizedStart ?? endDateTime!
    const end = endDateTime ?? normalizedStart!

    if (end.getTime() < now.getTime()) return 'past'
    if (start.getTime() > now.getTime()) return 'upcoming'
    return 'ongoing'
  },

  //Fetching publisher events

  async fetchPublisherEvents(): Promise<PublisherEvent[]> {
    return withCache<PublisherEvent[]>(`publisher:events:list`, TWENTY_HOURS_MS, async () => {
      const baseUrl = await getApiBaseUrl();
      const token = await (async () => {
        try { return (await import('@react-native-async-storage/async-storage')).default.getItem('auth:publisher:jwt') } catch { return null }
      })()
      const resolvedToken = typeof token === 'string' ? token : (await token)
      const response = await fetch(`${baseUrl}/api/publisher/events`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to load publisher events (${response.status})`)
      }
      const json: { success: boolean; events: Array<{ id: string; title: string; description: string; date?: string; eventDepartment?: string; eventType?: string; imageUrl?: string }> } = await response.json()
      const allowed: EventItem['type'][] = ['Workshop', 'Seminar', 'Guest Lecture', 'Industrial Visit', 'Cultural', 'Sports']
      const mapType = (t?: string): EventItem['type'] => (t && (allowed as string[]).includes(t) ? (t as EventItem['type']) : 'Seminar')

      const deriveStatusFromDateOnly = (dateString?: string): 'upcoming' | 'ongoing' | 'past' => {
        if (!dateString) return 'upcoming'
        const d = new Date(dateString)
        if (Number.isNaN(d.getTime())) return 'upcoming'
        const now = new Date()
        const endOfDay = new Date(d)
        endOfDay.setHours(23, 59, 59, 999)
        if (endOfDay.getTime() < now.getTime()) return 'past'
        if (d.getTime() > now.getTime()) return 'upcoming'
        return 'ongoing'
      }

      return (json.events || []).map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        type: mapType(e.eventType),
        imageUrl: e.imageUrl,
        status: deriveStatusFromDateOnly(e.date),
        description: e.description,
        venue: undefined,
        fee: undefined,
      }))
    })
  },

  async updatePublisherEvent(id: string, dataObj: Record<string, any>, imageFile?: any): Promise<{ success: boolean; eventId?: string; message?: string }> {
    const baseUrl = await getApiBaseUrl();
    const token = await (async () => {
      try { return (await import('@react-native-async-storage/async-storage')).default.getItem('auth:publisher:jwt') } catch { return null }
    })()
    const resolvedToken = typeof token === 'string' ? token : (await token)

    const form = new FormData()
    if (imageFile) {
      const resolved = await resolveFileForFormData(imageFile)
      if (resolved) appendFileWithName(form, 'image', resolved)
    }

    const cleanData = toBackendEventData(dataObj)
    form.append('data', JSON.stringify(cleanData))

    const response = await fetch(`${baseUrl}/api/publisher/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      },
      body: form,
    })
    if (!response.ok) {
      const message = `Failed to update event (${response.status})`
      throw new Error(message)
    }
    const json = await response.json()
    // Invalidate caches related to publisher events and listings
    await invalidateCacheByPrefix('publisher:events:')
    await invalidateCacheByPrefix('student:events:')
    await invalidateCacheByPrefix('student:events:list')
    return json
  },

  async createPublisherEvent(dataObj: Record<string, any>, imageFile?: any): Promise<{ success: boolean; eventId?: string; message?: string }> {
    const baseUrl = await getApiBaseUrl();
    const token = await (async () => {
      try { return (await import('@react-native-async-storage/async-storage')).default.getItem('auth:publisher:jwt') } catch { return null }
    })()
    const resolvedToken = typeof token === 'string' ? token : (await token)

    const form = new FormData()
    if (imageFile) {
      const resolved = await resolveFileForFormData(imageFile)
      if (resolved) appendFileWithName(form, 'image', resolved)
    }

    // Clean the data object to match backend expectations
    const cleanData = toBackendEventData(dataObj);

    // Append the data as a JSON string
    form.append('data', JSON.stringify(cleanData));

    const url = `${baseUrl}/api/publisher/events`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      },
      body: form,
    })
    
    if (!(response.status === 201 || response.ok)) {
      let errorMessage = `Failed to create event (${response.status})`
      try {
        const errorJson = await response.json()
        if (errorJson.message) {
          errorMessage = errorJson.message
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      throw new Error(errorMessage)
    }
    
    const json = await response.json()
    // Invalidate caches related to listings so new event shows up
    await invalidateCacheByPrefix('publisher:events:')
    await invalidateCacheByPrefix('student:events:')
    await invalidateCacheByPrefix('student:events:list')
    return json
  },


async deleteEvent(eventId: string): Promise<boolean> {
  const baseUrl = await getApiBaseUrl();
  const token = await (async () => {
    try { return (await import('@react-native-async-storage/async-storage')).default.getItem('auth:publisher:jwt') } catch { return null }
  })()
  const resolvedToken = typeof token === 'string' ? token : (await token)

  const resp = await fetch(`${baseUrl}/api/publisher/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    },
  })

  let success = resp.ok
  try {
    const json: any = await resp.json()
    if (typeof json?.success === 'boolean') success = json.success
  } catch {
    // ignore JSON parse errors; rely on HTTP status
  }

  if (success) {
    await invalidateCacheByPrefix('publisher:events:')
    await invalidateCacheByPrefix('student:events:')
    await invalidateCacheByPrefix('student:events:list')
  }

  return success
},
  /*
  async deleteEvent(eventId: string): Promise<boolean> {
  const { status } = await api.delete(`/events/${eventId}`);
  return status >= 200 && status < 300;
  } */

  async listSearchEvents(params?: { dept?: string; type?: string; name?: string }): Promise<SearchEvent[]> {
    const baseUrl = await getApiBaseUrl();
    
    try {
      const url = new URL(`${baseUrl}/api/student/events`)
      
      // Add query parameters if they exist and aren't 'All' or 'All Departments'
      if (params?.dept && params.dept !== 'All Departments') {
        url.searchParams.set('dept', params.dept)
      }
      
      if (params?.type && params.type !== 'All') {
        url.searchParams.set('type', params.type)
      }
      
      if (params?.name?.trim()) {
        url.searchParams.set('name', params.name.trim())
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`)
      }
      
      const json = await response.json()
      
      if (!json.success || !Array.isArray(json.events)) {
        console.error('Invalid response format:', json)
        throw new Error('Invalid response format: expected { success: true, events: [...] }')
      }
      
      // Map the API response to the SearchEvent type
      return (json.events || []).map((event: any) => ({
        id: event.id || Math.random().toString(36).substr(2, 9),
        title: event.title || 'Untitled Event',
        description: event.description || '',
        category: event.eventType || 'Seminar',
        department: event.department || 'CSE',
        image: event.imageUrl ? { uri: event.imageUrl } : undefined,
        date: event.date,
        time: event.startTime,
        venue: event.venue || 'TBD',
        registrationLink: event.registrationLink,
        organizers: [],
        creator: { name: 'Event Organizer', subtitle: 'Department', icon: 'person' },
        contacts: []
      }))
      
    } catch (error) {
      console.error('Error in listSearchEvents:', error)
      throw error // Re-throw to be handled by the caller
    }
  },
}

export default mockApi


