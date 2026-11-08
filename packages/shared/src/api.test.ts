import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  MAX_KNOWLEDGE_FILE_BYTES,
  MAX_MESSAGE_CHARS,
  chatRequestSchema,
  createProjectRequestSchema,
  createTextKnowledgeRequestSchema,
  createUploadUrlRequestSchema,
  deleteKnowledgeParamsSchema,
  deleteProjectParamsSchema,
  finalizeUploadRequestSchema,
  getConversationParamsSchema,
  idParamsSchema,
  knowledgeFileTypeFromName,
  listConversationsParamsSchema,
  updateProjectRequestSchema,
  updateWidgetConfigRequestSchema,
  widgetConfigQuerySchema,
  widgetSettingsSchema,
} from "./index";

const KEY = "pk_a1B2c3D4e5F6g7H8i9J0";
const ID = "3f2b8c1e-6a4d-4e2f-9b7a-1c2d3e4f5a6b";

const ok = (schema: z.ZodType, value: unknown) => expect(schema.safeParse(value).success).toBe(true);
const bad = (schema: z.ZodType, value: unknown) => expect(schema.safeParse(value).success).toBe(false);

describe("GET /api/widget/config", () => {
  it("accepts a pk_ key, ignoring extra params", () => {
    ok(widgetConfigQuerySchema, { key: KEY });
    ok(widgetConfigQuerySchema, { key: KEY, v: "1" });
  });
  it("rejects a missing or malformed key", () => {
    bad(widgetConfigQuerySchema, {});
    bad(widgetConfigQuerySchema, { key: "sk_live_123" });
  });
});

describe("POST /api/widget/chat", () => {
  const valid = { key: KEY, visitorId: "v_123", message: "Hi" };
  it("accepts a first message and a follow-up", () => {
    ok(chatRequestSchema, valid);
    ok(chatRequestSchema, { ...valid, conversationId: ID });
    ok(chatRequestSchema, { ...valid, message: "a".repeat(MAX_MESSAGE_CHARS) });
  });
  it("rejects long, empty, or malformed input", () => {
    bad(chatRequestSchema, { ...valid, message: "a".repeat(MAX_MESSAGE_CHARS + 1) });
    bad(chatRequestSchema, { ...valid, message: "   " });
    bad(chatRequestSchema, { ...valid, conversationId: "not-a-uuid" });
    bad(chatRequestSchema, { ...valid, key: "bad" });
    bad(chatRequestSchema, { key: KEY, message: "Hi" });
    bad(chatRequestSchema, { ...valid, plan: "pro" });
  });
});

describe("route :id params", () => {
  const schemas = [
    idParamsSchema,
    deleteProjectParamsSchema,
    deleteKnowledgeParamsSchema,
    listConversationsParamsSchema,
    getConversationParamsSchema,
  ];
  it("accept a uuid", () => schemas.forEach((s) => ok(s, { id: ID })));
  it("reject anything else", () => schemas.forEach((s) => bad(s, { id: "123" })));
});

describe("POST /api/projects and PATCH /api/projects/:id", () => {
  it("accept a name", () => {
    ok(createProjectRequestSchema, { name: "My site" });
    ok(updateProjectRequestSchema, { name: "Renamed" });
  });
  it("reject empty, too long, or extra fields", () => {
    bad(createProjectRequestSchema, { name: "" });
    bad(createProjectRequestSchema, { name: "a".repeat(81) });
    bad(updateProjectRequestSchema, { name: "x", publicKey: KEY });
  });
});

describe("POST /api/projects/:id/knowledge", () => {
  it("accepts a title and text", () => {
    ok(createTextKnowledgeRequestSchema, { title: "FAQ", content: "We open at 9." });
  });
  it("rejects empty content", () => {
    bad(createTextKnowledgeRequestSchema, { title: "FAQ", content: "" });
    bad(createTextKnowledgeRequestSchema, { content: "x" });
  });
});

describe("POST /api/projects/:id/knowledge/upload-url", () => {
  const valid = { title: "Guide", fileName: "guide.PDF", sizeBytes: 1024 };
  it("accepts pdf, md and txt up to 10 MB", () => {
    ok(createUploadUrlRequestSchema, valid);
    ok(createUploadUrlRequestSchema, { ...valid, fileName: "notes.md" });
    ok(createUploadUrlRequestSchema, { ...valid, fileName: "notes.txt", sizeBytes: MAX_KNOWLEDGE_FILE_BYTES });
  });
  it("rejects other types, oversize, and bad sizes", () => {
    bad(createUploadUrlRequestSchema, { ...valid, fileName: "evil.exe" });
    bad(createUploadUrlRequestSchema, { ...valid, fileName: "noext" });
    bad(createUploadUrlRequestSchema, { ...valid, sizeBytes: MAX_KNOWLEDGE_FILE_BYTES + 1 });
    bad(createUploadUrlRequestSchema, { ...valid, sizeBytes: 0 });
    bad(createUploadUrlRequestSchema, { ...valid, sizeBytes: 1.5 });
  });
  it("maps extensions to file types", () => {
    expect(knowledgeFileTypeFromName("a.pdf")).toBe("pdf");
    expect(knowledgeFileTypeFromName("a.Markdown")).toBe("md");
    expect(knowledgeFileTypeFromName("a.txt")).toBe("txt");
    expect(knowledgeFileTypeFromName("a.pdf.exe")).toBeNull();
    expect(knowledgeFileTypeFromName("pdf")).toBeNull();
  });
});

describe("POST /api/projects/:id/knowledge/finalize", () => {
  it("accepts a source id", () => ok(finalizeUploadRequestSchema, { sourceId: ID }));
  it("rejects a missing or bad id", () => {
    bad(finalizeUploadRequestSchema, {});
    bad(finalizeUploadRequestSchema, { sourceId: "x" });
  });
});

describe("PATCH /api/projects/:id/config", () => {
  it("accepts a full or partial update", () => {
    ok(widgetSettingsSchema, {
      buttonColor: "#ff00AA",
      position: "top-left",
      label: "Help",
      animation: "slide",
      headerText: "Ask us",
      showBadge: false,
    });
    ok(updateWidgetConfigRequestSchema, { buttonColor: "#000000" });
  });
  it("rejects empty, bad values, and unknown fields", () => {
    bad(updateWidgetConfigRequestSchema, {});
    bad(updateWidgetConfigRequestSchema, { buttonColor: "red" });
    bad(updateWidgetConfigRequestSchema, { buttonColor: "#fff" });
    bad(updateWidgetConfigRequestSchema, { position: "center" });
    bad(updateWidgetConfigRequestSchema, { animation: "bounce" });
    bad(updateWidgetConfigRequestSchema, { label: "" });
    bad(updateWidgetConfigRequestSchema, { projectId: ID });
  });
});
