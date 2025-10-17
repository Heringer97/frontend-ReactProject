// pages/movie/[id].js
import Head from "next/head";
import Link from "next/link";
import styles from "./movie.module.css";
import { API_BASE as BASE } from "../../lib/config";

export default function MoviePage({ movie, error }) {
  if (error) {
    return (
      <div className={styles.page}>
        <Head><title>Film – Erreur</title></Head>
        <p className={styles.error}>⚠️ Erreur de chargement ({error})</p>
        <p><Link href="/">← Accueil</Link></p>
      </div>
    );
  }

  const poster = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : null;
  const backdrop = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  return (
    <div className={styles.page}>
      <Head><title>{movie?.title || "Film"}</title></Head>

      {backdrop && (
        <div
          className={styles.hero}
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      )}

      <div className={styles.content}>
        {poster ? (
          <img className={styles.poster} src={poster} alt={movie.title} />
        ) : (
          <div className={styles.empty}>Aucune affiche</div>
        )}

        <div className={styles.meta}>
          <h1 className={styles.title}>
            {movie?.title}{" "}
            {movie?.release_date && (
              <span className={styles.year}>({movie.release_date.slice(0, 4)})</span>
            )}
          </h1>
          <div className={styles.sub}>
            <span className={styles.badge}>★ {movie?.vote_average?.toFixed(1) || "—"}</span>
            <span className={styles.dot} />
            <span>{movie?.runtime ? `${movie.runtime} min` : "—"}</span>
          </div>
          <p className={styles.overview}>
            {movie?.overview || "Aucune description."}
          </p>
          <p><Link href="/">← Accueil</Link></p>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const id = ctx.params?.id;
  if (!id) return { notFound: true };

  try {
    const url = `${BASE}/movies/${id}`;
    const r = await fetch(url);
    const ct = r.headers.get("content-type") || "";
    if (!r.ok || !ct.includes("application/json")) {
      return { props: { error: r.status || "not_json" } };
    }
    const movie = await r.json();
    return { props: { movie } };
  } catch {
    return { props: { error: "fetch_failed" } };
  }
}
