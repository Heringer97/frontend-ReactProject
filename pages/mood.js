// pages/mood.js
import Head from "next/head";
import Link from "next/link";
import styles from "./mood.module.css";
import { API_BASE as BASE } from "../lib/config";

// Humeurs proposées (les clés sont passées à l'API)
const MOODS = [
  { key: "happy", label: "Heureux 😊" },
  { key: "sad", label: "Triste 🥺" },
  { key: "romance", label: "Romantique 💘" },
  { key: "nostalgic", label: "Nostalgique 📼" },
  { key: "excited", label: "Excité ⚡" },
  { key: "adventurer", label: "Aventurier 🧭" },
  { key: "scifi", label: "SF 🚀" },
];

export default function MoodPage({ mood, data, error, tried }) {
  return (
    <div className={styles.page}>
      <Head><title>Films selon l’humeur</title></Head>

      <h1 className={styles.title}>Films selon l’humeur</h1>

      <div className={styles.chips}>
        {MOODS.map((m) => (
          <Link key={m.key} href={`/mood?m=${encodeURIComponent(m.key)}`}>
            <a className={`${styles.chip} ${mood === m.key ? styles.active : ""}`}>
              {m.label}
            </a>
          </Link>
        ))}
      </div>

      {error && (
        <div className={styles.error}>
          ⚠️ Failed to fetch ({error})
          {tried?.length ? (
            <details style={{ marginTop: 8 }}>
              <summary>Endpoints testés</summary>
              <ul>
                {tried.map((u) => <li key={u}><code>{u}</code></li>)}
              </ul>
            </details>
          ) : null}
        </div>
      )}

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

// 👉 SSR : on teste plusieurs endpoints jusqu'à trouver celui qui marche
export async function getServerSideProps(ctx) {
  const mood = (ctx.query.m || "happy").toString();

  // Liste d'endpoints candidats (les plus fréquents)
  const CANDIDATES = [
    (m) => `${BASE}/mood?mood=${encodeURIComponent(m)}&page=1`,
    (m) => `${BASE}/movies/mood?mood=${encodeURIComponent(m)}&page=1`,
    (m) => `${BASE}/movies/by-mood?mood=${encodeURIComponent(m)}&page=1`,
    (m) => `${BASE}/recommendations/mood?mood=${encodeURIComponent(m)}&page=1`,
  ];

  const tried = [];
  for (const buildUrl of CANDIDATES) {
    const url = buildUrl(mood);
    tried.push(url);
    try {
      const r = await fetch(url);
      const ct = r.headers.get("content-type") || "";
      if (r.ok && ct.includes("application/json")) {
        const data = await r.json();
        return { props: { mood, data, tried } };
      }
    } catch (_) { /* ignore et on teste le suivant */ }
  }

  // Rien n'a répondu OK
  return { props: { mood, data: null, error: "404", tried } };
}
