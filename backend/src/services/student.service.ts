import { SupabaseClient } from "@supabase/supabase-js";
import { signUrl, formatTime } from "../utils/event.utils";

export class StudentService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Fetches a list of upcoming events, optionally filtered by department, type, and name.
   *
   * - Only events that have not finished (based on end_time and current India time) are returned.
   * - Events are sorted by date (ascending), then start_time (ascending), then created_at (ascending).
   * - Each event's image_url is signed for secure access.
   * - The returned events are formatted to a specific schema for the frontend.
   *
   * @param dept - (string) Department to filter events by (optional).
   * @param type - (string) Event type to filter by (optional).
   * @param name - (string) Event name/title to filter by (optional, partial match).
   * @returns An array of event objects formatted for the frontend, or an error object.
   */
  async getEvents(dept: string, type: string, name: string) {
    let query = this.supabase.from("events").select(`
      id,
      title,
      description,
      date,
      start_time,
      end_time,
      created_at,
      event_type,
      image_url,
      publisher:publishers (
        department
      )
    `);

    if (type) {
      query = query.eq("event_type", type);
    }

    if (name) {
      query = query.ilike("title", `%${name}%`);
    }

    const now = new Date();
    const indiaTime = new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(now);

    const [datePart, timePart] = indiaTime.split(", ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    
    query = query
      .gte("date", `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .order("created_at", { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error getting events:", error);
      return { success: false, message: "Failed to get events." };
    }
   
    const currentIndiaDateTime = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    );

    let events = data;

    events = events.filter((event: any) => {
      const [eventYear, eventMonth, eventDay] = event.date
        .split("-")
        .map(Number);
      const [eventHour, eventMinute, eventSecond] = event.end_time
        .split(":")
        .map(Number);
      const eventEndDateTime = new Date(
        eventYear,
        eventMonth - 1,
        eventDay,
        eventHour,
        eventMinute,
        eventSecond
      );

      return eventEndDateTime > currentIndiaDateTime;
    });

    if (dept) {
      events = data.filter((event: any) => event.publisher.department === dept);
    }

    if (events) {
      events.forEach((event: any) => {
        if (event.image_url) {
          event.image_url = signUrl(event.image_url);
        }
      });
    }

    const formattedEvents = events.map((event: any) => ({
      id: event.id,
      imageUrl: event.image_url,
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: formatTime(event.start_time),
      eventType: event.event_type,
    }));

    return { success: true, events: formattedEvents };
  }

  /**
   * Fetches a single event by its ID, formats the result, and returns it.
   * @param eventId - The UUID of the event to fetch.
   * @returns An object with { success: boolean, event?: object, message?: string }
   */
  async getEventById(eventId: string) {
    const { data, error } = await this.supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        event_type,
        date,
        start_time,
        end_time,
        venue,
        mode,
        eligibility,
        fee,
        registration_link,
        organizers,
        contacts,
        image_url
      `)
      .eq("id", eventId)
      .maybeSingle();

    if (error) {
      console.error("Error getting event:", error);
      return { success: false, message: "Failed to get event." };
    }

    if (!data) {
      return { success: false, code: "NOT_FOUND", message: "Event not found." };
    }

    if (data.image_url) {
      data.image_url = signUrl(data.image_url);
    }

    if (data.start_time) {
      data.start_time = formatTime(data.start_time);
    }
    if (data.end_time) {
      data.end_time = formatTime(data.end_time);
    }

    const formattedEvent = {
      id: data.id,
      title: data.title,
      description: data.description,
      eventType: data.event_type,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      venue: data.venue,
      mode: data.mode,
      eligibility: data.eligibility,
      fee: data.fee,
      registrationLink: data.registration_link,
      organizers: data.organizers,
      contacts: data.contacts,
      imageUrl: data.image_url,
    };

    return { success: true, event: formattedEvent };
  }
}
