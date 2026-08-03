import { NextResponse } from 'next/server';
import { processQueuedJobs } from '@/lib/jobs';

// Increase Vercel serverless function timeout to max 300s (Pro plan)
// to prevent truncated video uploads that cause YouTube "Processing abandoned" errors
export const maxDuration = 300;

export async function POST() {
  await processQueuedJobs();
  return NextResponse.json({ success: true, message: 'Queue processor executed' });
}
