import { z } from "zod";

/**
 * Domain types matching project.md §7. Field names are camelCase (API shape);
 * the database columns are snake_case. Timestamps are ISO 8601 strings.
 */

export const PLANS = ["free", "pro"] as const;
export const planSchema = z.enum(PLANS);
export type Plan = z.infer<typeof planSchema>;

export const KNOWLEDGE_SOURCE_TYPES = ["text", "pdf", "md", "txt"] as const;
export const knowledgeSourceTypeSchema = z.enum(KNOWLEDGE_SOURCE_TYPES);
export type KnowledgeSourceType = z.infer<typeof knowledgeSourceTypeSchema>;

/** File types an owner may upload. `text` is pasted, never uploaded. */
export const KNOWLEDGE_FILE_TYPES = ["pdf", "md", "txt"] as const;
export const knowledgeFileTypeSchema = z.enum(KNOWLEDGE_FILE_TYPES);
export type KnowledgeFileType = z.infer<typeof knowledgeFileTypeSchema>;

export const KNOWLEDGE_SOURCE_STATUSES = ["uploading", "processing", "ready", "failed"] as const;
export const knowledgeSourceStatusSchema = z.enum(KNOWLEDGE_SOURCE_STATUSES);
export type KnowledgeSourceStatus = z.infer<typeof knowledgeSourceStatusSchema>;

export const MESSAGE_ROLES = ["visitor", "bot"] as const;
export const messageRoleSchema = z.enum(MESSAGE_ROLES);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const WIDGET_POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left"] as const;
export const widgetPositionSchema = z.enum(WIDGET_POSITIONS);
export type WidgetPosition = z.infer<typeof widgetPositionSchema>;

export const WIDGET_ANIMATIONS = ["fade", "slide", "scale"] as const;
export const widgetAnimationSchema = z.enum(WIDGET_ANIMATIONS);
export type WidgetAnimation = z.infer<typeof widgetAnimationSchema>;

export interface Account {
  clerkUserId: string;
  plan: Plan;
  createdAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  publicKey: string;
  messagesUsed: number;
  periodStart: string;
  createdAt: string;
}

export interface WidgetConfig {
  projectId: string;
  buttonColor: string;
  position: WidgetPosition;
  label: string;
  animation: WidgetAnimation;
  headerText: string;
  showBadge: boolean;
}

/** The customizable part of a widget config (no `projectId`). */
export type WidgetSettings = Omit<WidgetConfig, "projectId">;

export interface KnowledgeSource {
  id: string;
  projectId: string;
  title: string;
  type: KnowledgeSourceType;
  /** Null for pasted text. */
  storageKey: string | null;
  status: KnowledgeSourceStatus;
  createdAt: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  visitorId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  body: string;
  createdAt: string;
}
