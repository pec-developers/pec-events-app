import express, { Request, Response } from "express";
import { supabase } from "../supabase";
import { StudentService } from "../services/student.service";

const router = express.Router();
const studentService = new StudentService(supabase);

router.get("/events", async (req: Request, res: Response) => {
  try {
    const { dept = '', type = '', name = '' } = req.query as { dept: string, type: string, name: string };
    const result = await studentService.getEvents(dept, type, name);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "An unexpected error occurred.", error: error.message });
  }
});

router.get("/events/:eventId", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    // Validate UUID format (RFC 4122 versions 1-5)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      return res
        .status(400)
        .json({ success: false, code: "INVALID_INPUT", message: "Invalid eventId. Must be a UUID." });
    }

    const result = await studentService.getEventById(eventId);

    if (!result || (result as any).success === false) {
      if ((result as any)?.code === "NOT_FOUND") {
        return res.status(404).json(result);
      }
      // For any other failure, return 500 with result or a generic payload
      return res
        .status(500)
        .json(result || { success: false, message: "Failed to fetch event." });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: "An unexpected error occurred.", error: error.message });
  }
});

export default router;
