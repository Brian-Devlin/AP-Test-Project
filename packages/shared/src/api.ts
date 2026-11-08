import { z } from "zod";
import {
  HEX_COLOR_PATTERN,
  MAX_FILE_NAME_CHARS,
  MAX_KNOWLEDGE_FILE_BYTES,
  MAX_KNOWLEDGE_TEXT_CHARS,
  MAX_KNOWLEDGE_TITLE_CHARS,
  MAX_MESSAGE_CHARS,
  MAX_PROJECT_NAME_CHARS,
  MAX_VISITOR_ID_CHARS,
  MAX_WIDGET_HEADER_TEXT_CHARS,
  MAX_WIDGET_LABEL_CHARS,
  PUBLIC_KEY_PATTERN,
} from "./constants";
import type {
  Conversation,
  KnowledgeFileType,
  KnowledgeSource,
  Message,
  Plan,
  Project,
  WidgetSettings,
} from "./domain";
import { widgetAnimationSchema, widgetPositionSchema } from "./domain";

/**
 * Request schemas and response types for every route in project.md §8.
 * Routes parse input with these schemas; a parse failure → 400 `invalid_request`.
 */

// ---------- Shared pieces ----------

export const publicKeySchema = z.string().regex(PUBLIC_KEY_PATTERN, "Invalid public key");
export const idSchema = z.uuid();

/** Route params with a single `:id` (projects, knowledge, conversations). */
export const idParamsSchema = z.strictObject({ id: idSchema });
export type IdParams = z.infer<typeof idParamsSchema>;

/** Trimmed, non-empty, at most `max` characters. */
const text = (max: number) => z.string().trim().min(1).max(max);

/** Body of a successful DELETE. */
export interface DeletedResponse {
  id: string;
}

// ---------- Public: GET /api/widget/config ----------

/** Not strict: extra query params (e.g. cache busters) are ignored. */
export const widgetConfigQuerySchema = z.object({ key: publicKeySchema });
export type WidgetConfigQuery = z.infer<typeof widgetConfigQuerySchema>;

/** Plan-applied config: Free gets the defaults and the badge. */
export interface WidgetConfigResponse {
  config: WidgetSettings;
}

// ---------- Public: POST /api/widget/chat ----------

export const chatRequestSchema = z.strictObject({
  key: publicKeySchema,
  visitorId: text(MAX_VISITOR_ID_CHARS),
  conversationId: idSchema.optional(),
  message: text(MAX_MESSAGE_CHARS),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export interface ChatResponse {
  conversationId: string;
  reply: string;
}

// ---------- Owner: /api/projects ----------

/** A project with its usage for the current monthly period (project.md §6.12). */
export interface ProjectWithUsage extends Project {
  messageLimit: number;
}

/** GET /api/projects */
export interface ListProjectsResponse {
  plan: Plan;
  projects: ProjectWithUsage[];
}

/** POST /api/projects */
export const createProjectRequestSchema = z.strictObject({ name: text(MAX_PROJECT_NAME_CHARS) });
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;
export interface CreateProjectResponse {
  project: ProjectWithUsage;
}

/** PATCH /api/projects/:id (rename only) */
export const updateProjectParamsSchema = idParamsSchema;
export const updateProjectRequestSchema = z.strictObject({ name: text(MAX_PROJECT_NAME_CHARS) });
export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>;
export interface UpdateProjectResponse {
  project: ProjectWithUsage;
}

/** DELETE /api/projects/:id */
export const deleteProjectParamsSchema = idParamsSchema;
export type DeleteProjectResponse = DeletedResponse;

// ---------- Owner: knowledge ----------

/** POST /api/projects/:id/knowledge (paste text) */
export const createTextKnowledgeParamsSchema = idParamsSchema;
export const createTextKnowledgeRequestSchema = z.strictObject({
  title: text(MAX_KNOWLEDGE_TITLE_CHARS),
  content: text(MAX_KNOWLEDGE_TEXT_CHARS),
});
export type CreateTextKnowledgeRequest = z.infer<typeof createTextKnowledgeRequestSchema>;
export interface CreateTextKnowledgeResponse {
  source: KnowledgeSource;
}

/** File extension → knowledge file type. Anything else is unsupported. */
export const KNOWLEDGE_FILE_EXTENSIONS: Readonly<Record<string, KnowledgeFileType>> = Object.freeze({
  ".pdf": "pdf",
  ".md": "md",
  ".markdown": "md",
  ".txt": "txt",
});

/** The knowledge file type for `fileName`, from its extension, or null if unsupported. */
export function knowledgeFileTypeFromName(fileName: string): KnowledgeFileType | null {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return null;
  return KNOWLEDGE_FILE_EXTENSIONS[fileName.slice(dot).toLowerCase()] ?? null;
}

/** POST /api/projects/:id/knowledge/upload-url (declared size and extension checked here) */
export const createUploadUrlParamsSchema = idParamsSchema;
export const createUploadUrlRequestSchema = z.strictObject({
  title: text(MAX_KNOWLEDGE_TITLE_CHARS),
  fileName: text(MAX_FILE_NAME_CHARS).refine((name) => knowledgeFileTypeFromName(name) !== null, {
    message: "File must be .pdf, .md or .txt",
  }),
  sizeBytes: z.int().positive().max(MAX_KNOWLEDGE_FILE_BYTES),
});
export type CreateUploadUrlRequest = z.infer<typeof createUploadUrlRequestSchema>;
export interface CreateUploadUrlResponse {
  /** The reserved source, status `uploading`. */
  source: KnowledgeSource;
  /** One-time signed upload URL for Supabase Storage. */
  uploadUrl: string;
  /** Token that goes with the signed upload URL. */
  token: string;
}

/** POST /api/projects/:id/knowledge/finalize */
export const finalizeUploadParamsSchema = idParamsSchema;
export const finalizeUploadRequestSchema = z.strictObject({ sourceId: idSchema });
export type FinalizeUploadRequest = z.infer<typeof finalizeUploadRequestSchema>;
export interface FinalizeUploadResponse {
  source: KnowledgeSource;
}

/** DELETE /api/knowledge/:id */
export const deleteKnowledgeParamsSchema = idParamsSchema;
export type DeleteKnowledgeResponse = DeletedResponse;

// ---------- Owner: conversations ----------

/** One row in the conversation list (project.md §6.7). */
export interface ConversationSummary extends Conversation {
  /** First visitor message, truncated for display. */
  preview: string;
  messageCount: number;
  lastMessageAt: string;
}

/** GET /api/projects/:id/conversations (newest first) */
export const listConversationsParamsSchema = idParamsSchema;
export interface ListConversationsResponse {
  conversations: ConversationSummary[];
}

/** GET /api/conversations/:id */
export const getConversationParamsSchema = idParamsSchema;
export interface GetConversationResponse {
  conversation: Conversation;
  /** Oldest first. */
  messages: Message[];
}

// ---------- Owner: PATCH /api/projects/:id/config ----------

export const widgetSettingsSchema = z.strictObject({
  buttonColor: z.string().regex(HEX_COLOR_PATTERN, "Use a hex color like #111111"),
  position: widgetPositionSchema,
  label: text(MAX_WIDGET_LABEL_CHARS),
  animation: widgetAnimationSchema,
  headerText: text(MAX_WIDGET_HEADER_TEXT_CHARS),
  showBadge: z.boolean(),
});

/** Any subset of settings, at least one. Free → 402 `plan_required`. */
export const updateWidgetConfigParamsSchema = idParamsSchema;
export const updateWidgetConfigRequestSchema = widgetSettingsSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, { message: "Nothing to update" });
export type UpdateWidgetConfigRequest = z.infer<typeof updateWidgetConfigRequestSchema>;
export interface UpdateWidgetConfigResponse {
  config: WidgetSettings;
}

// ---------- System ----------

/**
 * POST /api/clerk/webhook. The body is Clerk's event; the route verifies the
 * signature with Clerk's `verifyWebhook` and needs no schema of ours.
 */
export interface ClerkWebhookResponse {
  received: true;
}

/** GET /api/posthog-config: public project key and host, read at request time. */
export interface PosthogConfigResponse {
  key: string;
  host: string;
}
