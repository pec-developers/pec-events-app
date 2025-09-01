import { SupabaseClient } from "@supabase/supabase-js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "../aws-s3";
import { randomBytes } from "crypto";
import {
  signUrl,
  formatTime,
  formatDateToDDMonYYYY,
} from "../utils/event.utils";

export class PublisherService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Uploads an image file to S3 and returns its CloudFront URL.
   * @param file - The image file to upload (from Multer).
   * @returns The public CloudFront URL of the uploaded image.
   */
  private async uploadImageToS3(file: Express.Multer.File): Promise<string> {
    if (!S3_BUCKET_NAME) {
      console.error(
        "S3 bucket name is not configured in environment variables"
      );
      throw new Error("S3 bucket name is not configured.");
    }

    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
    if (!cloudfrontDomain) {
      console.error(
        "CloudFront domain is not configured in environment variables"
      );
      throw new Error("CloudFront domain is not configured.");
    }

    // Basic validations and diagnostics to avoid corrupted uploads
    if (!file) {
      throw new Error("No file provided for upload.");
    }
    if (!(file as any).buffer || !Buffer.isBuffer(file.buffer)) {
      console.error("Upload error: provided file does not contain a Buffer payload", {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: (file as any).size,
        hasBuffer: !!(file as any).buffer,
      });
      throw new Error("Invalid file payload. Expected a binary buffer.");
    }
    if (!file.mimetype?.startsWith("image/")) {
      console.error("Upload error: non-image file attempted to upload", {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
      });
      throw new Error("Only image uploads are allowed.");
    }

    const fileExtension = file.originalname.split(".").pop();
    const key = `event-thumbnails/${randomBytes(16).toString("hex")}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Explicitly provide length to ensure full payload is written
      ContentLength: (file as any).size,
      // Long-lived caching for immutable image keys
      CacheControl: "public, max-age=31536000, immutable",
    });

    try {
      console.info("Uploading image to S3", {
        key,
        bucket: S3_BUCKET_NAME,
        mimetype: file.mimetype,
        size: (file as any).size,
      });
      await s3Client.send(command);
      const imageUrl = `https://${cloudfrontDomain}/${key}`;
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw new Error("Failed to upload image to S3.");
    }
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
      .gte(
        "date",
        `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`
      )
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
      title: event.title,
      description: event.description,
      date: event.date,
      eventDepartment: event.publisher.department,
      eventType: event.event_type,
      imageUrl: event.image_url,
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
      .select(
        `
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
        image_url,
        publisher:publishers (
          name:fullname,
          department
        )
      `
      )
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Error getting event:", error);
      return { success: false, message: "Failed to get event." };
    }

    if (data && data.image_url) {
      data.image_url = signUrl(data.image_url);
    }

    if (data && data.start_time) {
      data.start_time = formatTime(data.start_time);
    }
    if (data && data.end_time) {
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
      publisher: data.publisher,
    };

    return { success: true, event: formattedEvent };
  }

  async createEvent(
    title: string,
    description: string,
    eventType: string,
    date: string,
    startTime: string,
    endTime: string,
    venue: string,
    mode: string,
    eligibility: string,
    fee: string,
    registrationLink: string,
    organizers: any,
    contacts: any,
    username: string,
    imageFile?: Express.Multer.File
  ) {
    let imageUrl: string | undefined;
    if (imageFile) {
      imageUrl = await this.uploadImageToS3(imageFile);
    }

    const { data: publisher, error: publisherError } = await this.supabase
      .from("publishers")
      .select("id")
      .eq("username", username)
      .single();

    if (publisherError || !publisher) {
      console.error("Publisher not found for event creation:", publisherError);
      throw new Error("Publisher not found.");
    }

    const { data, error } = await this.supabase
      .from("events")
      .insert([
        {
          title,
          description,
          event_type: eventType,
          date,
          start_time: startTime,
          end_time: endTime,
          venue,
          mode,
          eligibility,
          fee,
          registration_link: registrationLink,
          organizers,
          contacts,
          image_url: imageUrl,
          publisher_id: publisher.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating event in database:", error);
      throw new Error("Failed to create event.");
    }

    return {
      success: true,
      eventId: data[0].id,
      message: "Event created successfully.",
    };
  }

  /**
   * Updates an existing event with new data and/or a new image.
   * @param eventId - The UUID of the event to update.
   * @param eventData - The fields to update.
   * @param imageFile - (Optional) A new image file to upload.
   * @returns An object with { success: boolean, eventId?: string, message: string }
   */
  async updateEvent(
    eventId: string,
    eventData: any,
    imageFile?: Express.Multer.File
  ) {
    // 1. Fetch the existing event to check if it has an old image to delete.
    const { data: existingEvent, error: existingEventError } =
      await this.supabase
        .from("events")
        .select("image_url")
        .eq("id", eventId)
        .single();

    if (existingEventError) {
      console.error("Error getting existing event:", existingEventError);
      return { success: false, message: "Failed to get existing event." };
    }

    let imageUrl: string | undefined;
    if (imageFile) {
      // 2. If the event has an old image, delete it from S3.
      if (existingEvent && existingEvent.image_url) {
        try {
          const oldKey = new URL(existingEvent.image_url).pathname.substring(1);
          if (oldKey) {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: S3_BUCKET_NAME,
              Key: oldKey,
            });
            await s3Client.send(deleteCommand);
          }
        } catch (error) {
          console.error("Error deleting old image from S3:", error);
        }
      }
      // 3. Upload the new image to S3 and get its URL.
      imageUrl = await this.uploadImageToS3(imageFile);
    }

    const {
      title,
      description,
      eventType,
      date,
      startTime,
      endTime,
      venue,
      mode,
      eligibility,
      fee,
      registrationLink,
      organizers,
      contacts,
    } = eventData;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (eventType) updateData.event_type = eventType;
    if (date) updateData.date = date;
    if (startTime) updateData.start_time = startTime;
    if (endTime) updateData.end_time = endTime;
    if (venue) updateData.venue = venue;
    if (mode) updateData.mode = mode;
    if (eligibility) updateData.eligibility = eligibility;
    if (fee) updateData.fee = fee;
    if (registrationLink) updateData.registration_link = registrationLink;
    if (organizers) updateData.organizers = organizers;
    if (contacts) updateData.contacts = contacts;
    if (imageUrl) updateData.image_url = imageUrl;

    if (Object.keys(updateData).length === 0 && !imageFile) {
      return { success: false, message: "No data to update." };
    }

    const { data, error } = await this.supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId)
      .select();

    if (error) {
      console.error("Error updating event:", error);
      return { success: false, message: "Failed to update event." };
    }

    return {
      success: true,
      eventId: data[0].id,
      message: "Event updated successfully.",
    };
  }

  /**
   * Deletes an event and its associated image from S3 (if any).
   * @param eventId - The UUID of the event to delete.
   * @returns An object with { success: boolean, message: string }
   */
  async deleteEvent(eventId: string) {
    // 1. Fetch the existing event to check if it has an image to delete.
    const { data: existingEvent, error: existingEventError } =
      await this.supabase
        .from("events")
        .select("image_url")
        .eq("id", eventId)
        .single();

    if (existingEventError) {
      console.error("Error getting existing event:", existingEventError);
      return { success: false, message: "Failed to get existing event." };
    }

    // 2. If the event has an image, delete it from S3.
    if (existingEvent && existingEvent.image_url) {
      try {
        const oldKey = new URL(existingEvent.image_url).pathname.substring(1);
        if (oldKey) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: oldKey,
          });
          await s3Client.send(deleteCommand);
        }
      } catch (error) {
        console.error("Error deleting image from S3:", error);
      }
    }

    // 3. Delete the event from the database.
    const { error } = await this.supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return { success: false, message: "Failed to delete event." };
    }

    return { success: true, message: "Event deleted successfully." };
  }

  /**
   * Fetches the profile data for a publisher, including their details and associated events.
   * @param username - The username of the publisher.
   * @returns An object containing publisher details, past events, and upcoming events.
   */
  async getProfile(userId: string) {
    // Fetch publisher details
    const { data: publisherData, error: publisherError } = await this.supabase
      .from("publishers")
      .select("fullname, department, id")
      .eq("id", userId)
      .single();

    if (publisherError || !publisherData) {
      console.error("Error fetching publisher data:", publisherError);
      return { success: false, message: "Publisher not found." };
    }

    // Fetch events for the publisher
    const { data: eventsData, error: eventsError } = await this.supabase
      .from("events")
      .select("id, title, date, event_type, image_url, start_time")
      .eq("publisher_id", publisherData.id)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      return { success: false, message: "Failed to fetch events." };
    }

    const now = new Date();
    const pastEvents: any[] = [];
    const upcomingEvents: any[] = [];

    eventsData.forEach((event: any) => {
      const eventDate = new Date(event.date);
      const eventStartTime = new Date(`${event.date}T${event.start_time}`);

      const formattedEvent = {
        id: event.id,
        imageUrl: event.image_url ? signUrl(event.image_url) : null,
        title: event.title,
        date: formatDateToDDMonYYYY(event.date),
        eventType: event.event_type,
      };

      if (eventStartTime < now) {
        pastEvents.push(formattedEvent);
      } else {
        upcomingEvents.push(formattedEvent);
      }
    });

    return {
      success: true,
      user: {
        fullname: publisherData.fullname,
        role: "Publisher",
        department: "Department of " + publisherData.department,
      },
      pastEvents: pastEvents,
      upcomingEvents: upcomingEvents,
    };
  }
}
