// pages/mood.js
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "./mood.module.css";
import { API_BASE as BASE } from "../lib/config";

const MOODS = [
  { key: "happy", label: "Heureux 😊" },
  { key: "sad", label: "Triste 🥺" },
  { key: "romance", label: "Romantique 💘" },
  { key: "nostalgic", label: "Nostalgique 📼" },
  { key: "excited", label: "Excité ⚡" },
  { key: "adventurer", label: "Aventurier 🧭" },
  { key: "scifi", label: "SF 🚀" },
];

export default function MoodPage() {
  const [mood, setMood] = useState("happy");
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMood = async (m) => {
    try {
      setLoading(true);
      setErr(null);
      // 👇 adapte ce chemin si ton backend est différent (ex: /movies/by-mood?mood=)
      const url = `${BASE}/mood?mood=${encodeURIComponent(m)}&page=1`;
      const r = await fetch(url);
      const ct = r.headers.get("content-type") || "";
      if (!r.ok || !ct.includes("application/json")) throw new Error(`status ${r.status}`);
      const json = await r.json();
      setData(json);
    } catch (e) {
      setErr("fetch_failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMood(mood);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPick = (m) => {
    setMood(m);
    fetchMood(m);
  };

  return (
    <div className={styles.page}>
      <Head><title>Films selon l’humeur</title></Head>

      <h1 className={styles.title}>Films selon l’humeur</h1>

      <div className={styles.chips}>
        {MOODS.map((m) => (
          <button
            key={m.key}
            className={`${styles.chip} ${mood === m.key ? styles.active : ""}`}
            onClick={() => onPick(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && <p>Chargement…</p>}
      {err && <p className={styles.error}>⚠️ Failed to fetch</p>}

      <div className={styles.grid}>
        {(data?.results || []).map((mv) => {
          const poster = mv.poster_path
            ? `https://image.tmdb.org/t/p/w500${mv.poster_path}`
            : null;
          const year = mv.release_date?.slice(0, 4) || "—";
          const note = mv.vote_average ? mv.vote_average.toFixed(1) : "—";
          return (
            <Link href={`/movie/${mv.id}`} key={mv.id}>
              <a className={styles.card}>
                {poster ? (
                  <img className={styles.poster} src={poster} alt={mv.title} />
                ) : (
                  <div className={styles.empty}>Aucune affiche</div>
                )}
                <div className={styles.meta}>
                  <h3 className={styles.name}>{mv.title}</h3>
                  <div className={styles.sub}>
                    <span className={styles.badge}>★ {note}</span>
                    <span className={styles.dot} />
                    <span>{year}</span>
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/">← Accueil</Link>
      </p>
    </div>
  );
}
