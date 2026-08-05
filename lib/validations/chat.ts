import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message text cannot be empty").max(1000, "Message text is too long"),
  sessionId: z.string().optional(),
  language: z.string().optional().default("en"),
});

export const feedbackRequestSchema = z.object({
  messageId: z.string().min(1, "messageId is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});
