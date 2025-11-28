import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function TeamsPage() {
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Echipe</h1>

      <Link href="/teams/new" className="px-4 py-2 bg-black text-white rounded">
        Creează echipă
      </Link>

      <div className="mt-6 space-y-4">
        {teams?.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}`}
            className="block p-4 border rounded"
          >
            <h2 className="text-xl font-semibold">{team.name}</h2>
            <p className="text-sm text-gray-600">{team.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
