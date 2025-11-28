"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // 1) login cu email + parolă
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // 2) luăm user-ul logat
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Nu s-a putut prelua user-ul.");
      setLoading(false);
      return;
    }

    // 3) verificăm dacă are profil în tabela `profiles`
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(profileError);
      setErrorMsg("Eroare la verificarea profilului.");
      setLoading(false);
      return;
    }

    // 4) dacă nu are profil -> trimitem la /onboarding
    if (!profile) {
      router.push("/onboarding");
    } else {
      // dacă are profil -> mergem în dashboard (poți schimba ruta dacă vrei)
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="max-w-sm w-full space-y-4 p-6 border rounded-lg"
      >
        <h1 className="text-xl font-bold">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Parola"
          className="border p-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && (
          <p className="text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 rounded bg-black text-white"
        >
          {loading ? "Autentificare..." : "Login"}
        </button>
      </form>
    </div>
  );
}
