import { z } from 'zod'

// The Terms of Service, Privacy Policy and Community Rules are published on the website
// (jommancing.com/terms, /privacy, /community-rules; source in jom-mancing-admin's
// docs/legal). Every account must agree to them before using the app.
//
// Bump this to the new "Last updated" date when a change is significant enough that
// existing users must agree again; the app then shows its agree-to-terms screen to
// everyone whose AuthUser.termsAcceptedVersion differs. Wording fixes do not need a bump.
export const CURRENT_TERMS_VERSION = '2026-11-01'

// POST /api/account/terms — records that the signed-in account agrees to the documents
// at `version`. The server accepts only CURRENT_TERMS_VERSION, so an app build that
// shows older documents cannot record agreement to newer ones. Responds with AuthUser.
export const AcceptTermsRequest = z.object({
  version: z.string().min(1),
})
export type AcceptTermsRequest = z.infer<typeof AcceptTermsRequest>
