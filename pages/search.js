// pages/search.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./search.module.css";
import { API_BASE as BASE } from "../lib/config";

export default function SearchPage({ q, data, error }) {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <Head>
        <title>Recherche – {q || "Films"}</title>
      </Head>

      <h1 className={styles.title}>Résultats pour “{q || "—"}”</h1>

      {error && (
        <p className={styles.error}>⚠️ Erreur de chargement ({error})</p>
      )}

      <div className={styles.grid}>
        {(data?.results || []).map((m) => {
          const poster = m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : null;
          const year = m.release_date?.slice(0, 4) || "—";
          const note = m.vote_average ? m.vote_average.toFixed(1) : "—";
          return (
            <Link href={`/movie/${m.id}`} key={m.id} className={styles.card}>
              <a className={styles.card}>
                {poster ? (
                  <img className={styles.poster} src={poster} alt={m.title} />
                ) : (
                  <div className={styles.empty}>Aucune affiche</div>
                )}
                <div className={styles.meta}>
                  <h3 className={styles.name}>{m.title}</h3>
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
        <a onClick={() => router.back()} style={{ cursor: "pointer" }}>
          ← Retour
        </a>
      </p>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const q = (ctx.query.q || "").toString().trim();
  if (!q) return { props: { q: "", data: { results: [] } } };

  try {
    const url = `${BASE}/search?q=${encodeURIComponent(q)}&page=1`;
    const r = await fetch(url);
    const ct = r.headers.get("content-type") || "";
    if (!r.ok || !ct.includes("application/json")) {
      return { props: { q, error: r.status || "not_json" } };
    }
    const data = await r.json();
    return { props: { q, data } };
  } catch {
    return { props: { q, error: "fetch_failed" } };
  }
}
