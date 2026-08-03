import { NextResponse } from 'next/server';
import { processQueuedJobs } from '@/lib/jobs';

export async function POST() {
  await processQueuedJobs();
  return NextResponse.json({ success: true, message: 'Queue processor executed' });
}
