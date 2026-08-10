import { z } from 'zod'

export const ChatRole = z.enum(['USER', 'ASSISTANT'])
export type ChatRole = z.infer<typeof ChatRole>

export const ChatMessageItem = z.object({
  id: z.string(),
  role: ChatRole,
  content: z.string(),
  createdAt: z.string(), // ISO datetime
})
export type ChatMessageItem = z.infer<typeof ChatMessageItem>

// GET /api/chatbot/threads
export const ChatThreadSummary = z.object({
  id: z.string(),
  title: z.string().nullable(),
  updatedAt: z.string(),
  lastMessage: z.string().nullable(),
})
export type ChatThreadSummary = z.infer<typeof ChatThreadSummary>

export const ChatThreadListResponse = z.object({
  threads: z.array(ChatThreadSummary),
})
export type ChatThreadListResponse = z.infer<typeof ChatThreadListResponse>

// GET /api/chatbot/threads/:id
export const ChatThreadDetail = z.object({
  id: z.string(),
  title: z.string().nullable(),
  messages: z.array(ChatMessageItem),
})
export type ChatThreadDetail = z.infer<typeof ChatThreadDetail>

// POST /api/chatbot — threadId omitted/null starts a new thread.
export const SendMessageRequest = z.object({
  threadId: z.string().nullable().optional(),
  message: z.string().min(1),
})
export type SendMessageRequest = z.infer<typeof SendMessageRequest>

export const SendMessageResponse = z.object({
  threadId: z.string(),
  reply: ChatMessageItem,
})
export type SendMessageResponse = z.infer<typeof SendMessageResponse>
