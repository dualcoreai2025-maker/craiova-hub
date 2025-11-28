"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminRoute from "@/components/AdminRoute";

// 👇 aici este logica reală a paginii (formular + listă)
function AdminResourcesInnerPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  const [resources, setResources] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Încarcă resursele existente
  const loadResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadResources error:", error);
    } else {
      setResources(data || []);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Salvează o resursă nouă
  const handleSave = async () => {
    setErrorMsg(null);
    setLoading(true);

    // Obține user-ul logat
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    // Creează payload-ul care va fi inserat
    const payload: any = {
      title,
      url,
      type,
      category,
    };

    // Dacă userul există, adaugă created_by
    if (user) {
      payload.created_by = user.id;
    }

    // Inserare în Supabase
    const { error } = await supabase.from("resources").insert(payload);

    if (error) {
      console.error("Insert error:", error);
      setErrorMsg(error.message);
    } else {
      // Resetare formulare
      setTitle("");
      setUrl("");
      setType("");
      setCategory("");

      // Reîncarcă lista
      await loadResources();
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin – Resurse</h1>

        <p className="mb-4 text-sm text-slate-400">
          Aici poți adăuga link-uri, PDF-uri, video-uri pentru participanți.
        </p>

        {/* FORMULAR */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-10">
          <h2 className="text-xl font-semibold mb-4">Adaugă resursă</h2>

          <input
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-3"
            placeholder="Titlu (ex: Ghidul participanților)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-3"
            placeholder="URL (ex: https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-3"
            placeholder="Tip (pdf, link, video...)"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />

          <input
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-3"
            placeholder="Categorie (ex: Organizatoric, Tehnic)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          {errorMsg && (
            <p className="text-red-400 text-sm mb-3">{errorMsg}</p>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
          >
            {loading ? "Se salvează..." : "Salvează resursa"}
          </button>
        </div>

        {/* LISTA DE RESURSE */}
        <h2 className="text-xl font-semibold mb-2">Lista de resurse</h2>

        {resources.length === 0 && (
          <p className="text-slate-500">Momentan nu există resurse.</p>
        )}

        <div className="space-y-4">
          {resources.map((r) => (
            <div
              key={r.id}
              className="p-4 bg-slate-900 rounded-lg border border-slate-800"
            >
              <h3 className="text-lg font-bold">{r.title}</h3>

              <p className="text-slate-400 text-sm">
                Tip: <span className="text-white">{r.type}</span> • Categorie:{" "}
                <span className="text-white">{r.category}</span>
              </p>

              <a
                href={r.url}
                target="_blank"
                className="text-indigo-400 underline text-sm"
              >
                Deschide resursa
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// 👇 Asta este pagina reală de Next, protejată de AdminRoute
export default function AdminResourcesPage() {
  return (
    <AdminRoute>
      <AdminResourcesInnerPage />
    </AdminRoute>
  );
}
