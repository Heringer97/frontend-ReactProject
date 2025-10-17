// pages/mood.js
import { useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "../components/SearchBar";
import styles from "./mood.module.css";

const RAW = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
const BASE = RAW.endsWith("/v1") ? RAW : RAW.replace(/\/$/, "") + "/v1";
const IMG = (p, size="w342") => p ? `https://image.tmdb.org/t/p/${size}${p}` : null;

const MOODS = [
  { key: "happy", label: "Heureux 😊" },
  { key: "sad", label: "Triste 😢" },
  { key: "romantic", label: "Romantique 💘" },
  { key: "nostalgic", label: "Nostalgique 📼" },
  { key: "excited", label: "Excité ⚡" },
  { key: "adventurous", label: "Aventurier 🧭" },
  { key: "scared", label: "Peureux 👻" },
  { key: "curious", label: "Curieux 🕵️" },
  { key: "dreamy", label: "Rêveur 🌙" },
  { key: "thoughtful", label: "Pensif 🧠" },
  { key: "inspired", label: "Inspiré 🎶" },
  { key: "sci_fi", label: "SF 🚀" },
];

export default function MoodPage() {
  const [mood, setMood] = useState(null);
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const title = useMemo(
    () => (mood ? `Films pour l'humeur : ${mood}` : "Films selon l’humeur"),
    [mood]
  );

  async function fetchByMood(key, p = 1) {
    setLoading(true); setErr(null);
    try {
      const url = `${BASE}/smart/by-mood?mood=${encodeURIComponent(key)}&page=${p}`;
      const r = await fetch(url);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || r.statusText);
      setList(data.results || []);
      setTotal(data.total_pages || 1);
      setPage(data.page || p);
      setMood(key);
      if (typeof window !== 'undefined') localStorage.setItem('last_mood', key);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function fetchByWeather() {
    setLoading(true); setErr(null); setMood(null);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const url = `${BASE}/smart/mood-by-weather?lat=${lat}&lon=${lon}`;
      const r = await fetch(url);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || r.statusText);

      setList(data.results || []);
      setTotal(data.total_pages || 1);
      setPage(data.page || 1);
      setMood(`meteo:${data.weather?.main || "?"}`);
    } catch (e) {
      setErr("Localisation refusée ou indisponible. Sélectionne une humeur manuellement.");
    } finally {
      setLoading(false);
    }
  }

  function onPrev() {
    if (page <= 1 || !mood || mood.startsWith('meteo:')) return;
    fetchByMood(mood, page - 1);
  }
  function onNext() {
    if (page >= total || !mood || mood.startsWith('meteo:')) return;
    fetchByMood(mood, page + 1);
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>{title}</title>
        <meta name="theme-color" content="#0b0f14" />
      </Head>

      <SearchBar compact placeholder="Rechercher un film..." />

      <div className={styles.header}>
        <div className={styles.icon} />
        <h1 className={styles.title}>Films selon l’humeur</h1>
      </div>

      <div className={styles.actions}>
        <button className={styles.weatherBtn} onClick={fetchByWeather}>
          🎯 Recommandation auto (météo)
        </button>
      </div>

      <div className={styles.moods}>
        {MOODS.map((m) => (
          <button
            key={m.key}
            className={`${styles.chip} ${mood === m.key ? styles.chipActive : ""}`}
            onClick={() => fetchByMood(m.key, 1)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {err && <p className={styles.error}>⚠️ {err}</p>}

      {loading ? (
        <p className={styles.loading}>Chargement…</p>
      ) : (
        <div className={styles.grid}>
          {list.map((it) => {
            const poster = IMG(it.poster_path);
            const note = it.vote_average ? it.vote_average.toFixed(1) : "—";
            const year = it.release_date?.slice(0, 4) || "—";
            return (
              <Link href={`/movie/${it.id}`} key={it.id} legacyBehavior>
                <a className={styles.card} title={it.title || it.name}>
                  {poster ? (
                    <Image
                      className={styles.poster}
                      src={poster}
                      alt={it.title || it.name}
                      width={342}
                      height={513}
                    />
                  ) : (
                    <div className={styles.empty}>Aucune affiche</div>
                  )}
                  <div className={styles.cardMeta}>
                    <h3 className={styles.cardTitle}>{it.title || it.name}</h3>
                    <div className={styles.cardSub}>
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
      )}

      {total > 1 && mood && !mood.startsWith('meteo:') && (
        <nav className={styles.pager} aria-label="Pagination">
          <button onClick={onPrev} disabled={page <= 1}>← Précédent</button>
          <span>Page {page} / {total}</span>
          <button onClick={onNext} disabled={page >= total}>Suivant →</button>
        </nav>
      )}

      <div className={styles.footerLinks}>
        <Link href="/" className={styles.back}>← Accueil</Link>
      </div>
    </div>
  );
}
