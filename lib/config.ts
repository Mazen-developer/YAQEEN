// Server-only. Never import this file from a "use client" component —
// its value would end up in the browser bundle. Client code should use
// the /api/admin-auth endpoint instead of checking the password directly.
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "010101";
