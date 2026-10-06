import { z } from 'zod'

export const ChatRole = z.enum(['USER', 'ASSISTANT'])
export type ChatRole = z.infer<typeof ChatRole>

// Visual supplements Digital Otai attaches beneath a reply. Built server-side from tool
// results only, never from model text. Optional on ChatMessageItem: absent on user
// messages, on text-only replies, and on every message stored before 0.41.0.
export const ChatSpeciesPhoto = z.object({
  type: z.literal('SPECIES'),
  speciesId: z.string(),
  malayName: z.string(),
  englishName: z.string().nullable(),
  scientificName: z.string().nullable(),
  imageUrl: z.string(),
  // Licence attribution (CC BY-SA) — must be shown wherever the image is.
  imageCredit: z.string().nullable(),
})
export type ChatSpeciesPhoto = z.infer<typeof ChatSpeciesPhoto>

export const ChatYoutubeVideo = z.object({
  type: z.literal('YOUTUBE_VIDEO'),
  videoId: z.string(),
  title: z.string(),
  channelTitle: z.string(),
  thumbnailUrl: z.string(),
})
export type ChatYoutubeVideo = z.infer<typeof ChatYoutubeVideo>

export const ChatCatchPhoto = z.object({
  type: z.literal('CATCH_PHOTO'),
  catchId: z.string(),
  imageUrl: z.string(),
  speciesName: z.string().nullable(),
  weightGrams: z.number().int().nullable(),
  kolamName: z.string().nullable(),
})
export type ChatCatchPhoto = z.infer<typeof ChatCatchPhoto>

export const ChatKolamCard = z.object({
  type: z.literal('KOLAM'),
  kolamId: z.string(),
  name: z.string(),
  state: z.string().nullable(),
  avgRating: z.number().nullable(),
  thumbnailUrl: z.string().nullable(),
})
export type ChatKolamCard = z.infer<typeof ChatKolamCard>

export const ChatMediaItem = z.discriminatedUnion('type', [
  ChatSpeciesPhoto,
  ChatYoutubeVideo,
  ChatCatchPhoto,
  ChatKolamCard,
])
export type ChatMediaItem = z.infer<typeof ChatMediaItem>

export const ChatMessageItem = z.object({
  id: z.string(),
  role: ChatRole,
  content: z.string(),
  createdAt: z.string(), // ISO datetime
  media: z.array(ChatMediaItem).optional(),
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
