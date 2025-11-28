import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // cheia secretă, doar pe server

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, team_id, title, repo_url, demo_url, created_at');

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  // transformăm în CSV simplu
  const header = ['id', 'team_id', 'title', 'repo_url', 'demo_url', 'created_at'];

  const rows =
    data?.map((row) =>
      header
        .map((key) =>
          (row as any)[key] !== null ? String((row as any)[key]) : '',
        )
        .join(','),
    ) || [];

  const csv = [header.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="projects.csv"',
    },
  });
}
