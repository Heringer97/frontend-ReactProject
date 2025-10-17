// pages/index.js
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import SearchBar from "../components/SearchBar";
import styles from "./index.module.css";

const RAW = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
const BASE = RAW.endsWith("/v1") ? RAW : RAW.replace(/\/$/, "") + "/v1";
const IMG = (p, size = "w1280") => (p ? `https://image.tmdb.org/t/p/${size}${p}` : null);

export default function Home({ data, error }) {
  // 1) Sélection des films pour le carrousel (backdrop ou poster)
  const heroItems = useMemo(() => {
    const list = data?.results || [];
    const withImage = list.filter(m => m.backdrop_path || m.poster_path);
    return (withImage.length ? withImage : list).slice(0, 5);
  }, [data]);

  // 2) État du carrousel
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const AUTOPLAY_MS = 5000;

  useEffect(() => {
    if (!heroItems.length) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % heroItems.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [heroItems.length]);

  const goTo = (i) => {
    if (!heroItems.length) return;
    const len = heroItems.length;
    setIdx(((i % len) + len) % len);
  };
  const prev = () => goTo(idx - 1);
  const next = () => goTo(idx + 1);

  const onMouseEnter = () => clearInterval(timerRef.current);
  const onMouseLeave = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTOPLAY_MS);
  };

  const wheelLock = useRef(0);
  const onWheel = (e) => {
    const now = Date.now();
    if (now - wheelLock.current < 600) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
      e.deltaX > 0 ? next() : prev();
      wheelLock.current = now;
    }
  };

  // 3) FOND DIRECTEMENT SUR <section.hero>
  const active = heroItems[idx];
  const activeBg =
    IMG(active?.backdrop_path, "w1280") ||
    IMG(active?.poster_path, "w780") ||
    ""; // au pire, fond dégradé CSS

  const title = active?.title || active?.name || "—";
  const year  = active?.release_date?.slice(0, 4) || "";
  const note  = active?.vote_average ? active.vote_average.toFixed(1) : "—";

  return (
    <div className={styles.page}>
      <Head>
        <title>Films populaires</title>
        <meta name="theme-color" content="#0b0f14" />
      </Head>

      <SearchBar initialQuery="" placeholder="Rechercher un film..." />

      {/* ===== HERO (fond en background-image sur la section) ===== */}
      <section
        className={styles.hero}
        style={activeBg ? { backgroundImage: `url(${activeBg})` } : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>🎬 Tendance</div>
          <h1 className={styles.heroTitle}>
            {title} {year && <span className={styles.heroYear}>({year})</span>}
          </h1>
          <div className={styles.heroMeta}>
            <span className={styles.star}>★ {note}</span>
            <span className={styles.dot} />
            <span>Populaires cette semaine</span>
          </div>
          <div className={styles.heroActions}>
            {active?.id && (
              <Link href={`/movie/${active.id}`}>
                <a className={styles.ctaPrimary}>▶ Voir le film </a>
              </Link>
            )}
            <a href="#popular" className={styles.ctaGhost}>Découvrir ↓</a>
          </div>
        </div>

        {/* Flèches */}
        {heroItems.length > 1 && (
          <>
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Précédent">‹</button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Suivant">›</button>
          </>
        )}

        {/* Puces */}
        {heroItems.length > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Sélecteur de slide">
            {heroItems.map((_, i) => (
              <button
                key={i}
                className={`${styles.dotBtn} ${i === idx ? styles.dotBtnActive : ""}`}
                onClick={() => goTo(i)}
                aria-selected={i === idx}
                aria-label={`Aller à la slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== Section titre ===== */}
      <div className={styles.header} id="popular">
        <div className={styles.icon} />
        <h2 className={styles.title}>Films populaires</h2>
      </div>

      {error && (
        <p style={{ color: "#ff7676", fontWeight: 600 }}>⚠️ Erreur de chargement ({error})</p>
      )}

      {/* ===== Grille ===== */}
      <div className={styles.grid}>
        {(data?.results || []).map((m) => {
          const poster = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null;
          const year = m.release_date?.slice(0,4) || "—";
          const note = m.vote_average ? m.vote_average.toFixed(1) : "—";
          return (
            <Link href={`/movie/${m.id}`} legacyBehavior key={m.id}>
              <a className={styles.card} title={m.title} style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
                {poster ? (
                  <img className={styles.poster} src={poster} alt={m.title} />
                ) : <div className={styles.empty}>Aucune affiche</div>}
                <div className={styles.meta}>
                  <h3 className={styles.name}>{m.title}</h3>
                  <div className={styles.sub}>
                    <span className={styles.badge}>★ {note}</span>
                    <span className={styles.dot} />
                    <span>{year}</span>
                  </div>
                </div>
                <div className={styles.overlay}>
                  <h4 className={styles.overTitle}>Synopsis</h4>
                  <p className={styles.overText}>{m.overview?.trim() || "Aucun synopsis disponible."}</p>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const url = `${BASE}/movies/trending?page=1`;
    const r = await fetch(url);
    const ct = r.headers.get("content-type") || "";
    if (!r.ok || !ct.includes("application/json")) {
      const txt = await r.text();
      console.error("❌ Fetch trending failed", "\nURL :", url, "\nStatus :", r.status, "\nCT :", ct, "\nBody :", txt.slice(0, 200));
      return { props: { error: r.status || "not_json", data: null } };
    }
    const data = await r.json();
    return { props: { data } };
  } catch (e) {
    console.error("❌ Exception:", e);
    return { props: { error: "fetch_failed", data: null } };
  }
}
