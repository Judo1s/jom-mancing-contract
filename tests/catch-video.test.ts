import { describe, it, expect } from 'vitest'
import { CreateCatchRequest, CatchLogItem, PresignVideoUploadRequest } from '../src/catch-log'
import { FriendsFeedItem } from '../src/social'
import { MAX_CATCH_VIDEO_BYTES, MAX_CATCH_VIDEO_SECONDS } from '../src/common'

describe('PresignVideoUploadRequest', () => {
  const ok = { contentType: 'video/mp4', sizeBytes: 1000, durationMs: 12_000 }

  it('accepts mp4 and quicktime within the caps', () => {
    expect(PresignVideoUploadRequest.parse(ok)).toEqual(ok)
    expect(PresignVideoUploadRequest.parse({ ...ok, contentType: 'video/quicktime', sizeBytes: MAX_CATCH_VIDEO_BYTES, durationMs: MAX_CATCH_VIDEO_SECONDS * 1000 })).toBeTruthy()
  })

  it('rejects other types, oversize files and long videos', () => {
    expect(() => PresignVideoUploadRequest.parse({ ...ok, contentType: 'video/webm' })).toThrow()
    expect(() => PresignVideoUploadRequest.parse({ ...ok, sizeBytes: MAX_CATCH_VIDEO_BYTES + 1 })).toThrow()
    expect(() => PresignVideoUploadRequest.parse({ ...ok, durationMs: 30_001 })).toThrow()
    expect(() => PresignVideoUploadRequest.parse({ ...ok, sizeBytes: 0 })).toThrow()
  })
})

describe('CreateCatchRequest video fields', () => {
  const base = { caughtAt: new Date().toISOString() }

  it('are optional, so older app builds still validate', () => {
    const parsed = CreateCatchRequest.parse(base)
    expect(parsed.videoUrl).toBeUndefined()
    expect(parsed.videoDurationMs).toBeUndefined()
  })

  it('cap the duration at 30 s and accept null to remove', () => {
    expect(CreateCatchRequest.parse({ ...base, videoUrl: 'v', videoThumbUrl: 't', videoDurationMs: 30_000 }).videoDurationMs).toBe(30_000)
    expect(() => CreateCatchRequest.parse({ ...base, videoDurationMs: 30_001 })).toThrow()
    expect(() => CreateCatchRequest.parse({ ...base, videoDurationMs: 0 })).toThrow()
    expect(CreateCatchRequest.parse({ ...base, videoUrl: null }).videoUrl).toBeNull()
  })
})

describe('response video fields', () => {
  it('parse when absent (older server) and when set', () => {
    const feed = FriendsFeedItem.shape
    expect(feed.videoUrl.parse(undefined)).toBeUndefined()
    expect(feed.videoUrl.parse('https://x/v.mp4')).toBe('https://x/v.mp4')
    expect(CatchLogItem.shape.videoDurationMs.parse(null)).toBeNull()
  })
})
