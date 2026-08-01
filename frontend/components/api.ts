// Central API base URL used by all dashboard pages.
// Local dev defaults to the FastAPI server on :8000.
// On Vercel, set NEXT_PUBLIC_API_URL to your deployed backend origin, e.g.
//   https://your-backend.up.railway.app   (no trailing slash; /api/v1 is appended here)
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "") + "/api/v1";
