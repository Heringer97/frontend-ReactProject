// pages/movie/[id].js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "../../components/SearchBar";
import styles from "./movie.module.css";

// 🌍 Normalise la base API (ajoute /v1 si manquant)
const RAW = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
const BASE = RAW.endsWith("/v1") ? RAW : RAW.replace(/\/$/, "") + "/v1";

const IMG = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export default function MoviePage({ data, error }) {
  if (error || !data) {
    return (
      <div className={styles.page}>
        <SearchBar compact placeholder="Rechercher un film..." />
        <p style={{ color: "#ff7676", fontWeight: 600 }}>
          ⚠️ Impossible de charger la fiche (erreur: {String(error)})
        </p>
        <Link className={styles.back} href="/">← Retour à l'accueil</Link>
      </div>
    );
  }

  const title = data.title || data.name;
  const year = data.release_date?.slice(0, 4) || "—";
  const poster = IMG(data.poster_path, "w500");
  const backdrop = IMG(data.backdrop_path, "w1280");
  const note = data.vote_average ? data.vote_average.toFixed(1) : "—";
  const genres = data.genres?.map((g) => g.name).join(" • ") || "—";
  const overview = data.overview?.trim() || "Aucun synopsis disponible.";

  const cast = data.credits?.cast?.slice(0, 10) || [];
  const trailer = (data.videos?.results || []).find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const recs = data.recommendations?.results?.slice(0, 12) || [];

  return (
    <div className={styles.page}>
      <Head>
        <title>{title} – {year}</title>
        <meta name="theme-color" content="#0b0f14" />
      </Head>

      {/* 🔝 Logo + barre (logo en haut à gauche) */}
      <SearchBar compact placeholder="Rechercher un film..." />

      {/* ====== Bandeau ====== */}
      <section className={styles.hero}>
        {backdrop && (
          <Image
            src={backdrop}
            alt={title}
            layout="fill"       // ✅ compatible Next 12
            objectFit="cover"   // ✅ remplace class CSS pour le fit
            priority
            className={styles.backdrop}
          />
        )}
        <div className={styles.heroInner}>
          {poster ? (
            <Image
              src={poster}
              alt={title}
              width={360}
              height={540}
              className={styles.poster}
            />
          ) : (
            <div className={styles.posterEmpty}>Aucune affiche</div>
          )}

          <div className={styles.meta}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.sub}>
              <span className={styles.badge}>★ {note}</span>
              <span className={styles.dot} />
              <span>{year}</span>
              {genres && (
                <>
                  <span className={styles.dot} />
                  <span className={styles.genres}>{genres}</span>
                </>
              )}
            </div>

            <h3 className={styles.blockTitle}>Synopsis</h3>
            <p className={styles.overview}>{overview}</p>
          </div>
        </div>
      </section>

      {/* ====== Bande-annonce ====== */}
      {trailer && (
        <section className={styles.section}>
          <h3 className={styles.blockTitle}>Bande-annonce</h3>
          <div className={styles.trailerWrap}>
            <iframe
              className={styles.trailer}
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="YouTube trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* ====== Casting ====== */}
      {!!cast.length && (
        <section className={styles.section}>
          <h3 className={styles.blockTitle}>Distribution</h3>
          <div className={styles.castGrid}>
            {cast.map((p) => {
              const avatar =
                IMG(p.profile_path, "w185") || "/avatar-placeholder.svg";
              return (
                <div className={styles.castCard} key={p.cast_id || p.credit_id}>
                  <Image
                    src={avatar}
                    alt={p.name}
                    width={148}
                    height={148}
                    className={styles.castImg}
                  />
                  <div className={styles.castName}>{p.name}</div>
                  <div className={styles.castRole}>{p.character || "—"}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ====== Recommandations ====== */}
      {!!recs.length && (
        <section className={styles.section}>
          <h3 className={styles.blockTitle}>Vous aimerez peut-être</h3>
          <div className={styles.grid}>
            {recs.map((m) => {
              const p = IMG(m.poster_path, "w342");
              const y = m.release_date?.slice(0, 4) || "—";
              const n = m.vote_average ? m.vote_average.toFixed(1) : "—";
              return (
                <Link href={`/movie/${m.id}`} legacyBehavior key={m.id}>
                  <a className={styles.card} title={m.title}>
                    {p ? (
                      <Image
                        className={styles.cardPoster}
                        src={p}
                        alt={m.title}
                        width={342}
                        height={513}
                      />
                    ) : (
                      <div className={styles.empty}>Aucune affiche</div>
                    )}
                    <div className={styles.cardMeta}>
                      <h4 className={styles.cardTitle}>{m.title}</h4>
                      <div className={styles.cardSub}>
                        <span className={styles.badge}>★ {n}</span>
                        <span className={styles.dot} />
                        <span>{y}</span>
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className={styles.footerNav}>
        <Link className={styles.back} href="/">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const id = ctx.params?.id;
  if (!id) return { notFound: true };

  try {
    const url = `${BASE}/movies/details/${encodeURIComponent(id)}`;
    const r = await fetch(url);

    const ct = r.headers.get("content-type") || "";
    if (!r.ok || !ct.includes("application/json")) {
      const txt = await r.text();
      console.error(
        "❌ Fetch details failed",
        "\nURL :", url,
        "\nStatus :", r.status,
        "\nContent-Type :", ct,
        "\nBody :", txt.slice(0, 200)
      );
      return { props: { data: null, error: r.status || "not_json" } };
    }

    const data = await r.json();
    return { props: { data, error: null } };
  } catch (e) {
    console.error("❌ Exception details:", e);
    return { props: { data: null, error: "fetch_failed" } };
  }
}
