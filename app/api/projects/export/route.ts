import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // folosim clientul global

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