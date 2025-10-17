// pages/search.js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "../components/SearchBar";
import styles from "./search.module.css";

const RAW = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
const BASE = RAW.endsWith("/v1") ? RAW : RAW.replace(/\/$/, "") + "/v1";

const IMG = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export default function SearchPage({ data, q, page, error, _debug }) {
  const list = Array.isArray(data?.results) ? data.results : [];
  const results = list.filter((r) => (r.media_type ? r.media_type === "movie" : true));

  return (
    <div className={styles.page} style={{ background: "#0b0f14", minHeight: "100vh" }}>
      <Head>
        <title>Recherche – {q || "Films"}</title>
        <meta name="theme-color" content="#0b0f14" />
      </Head>

      <SearchBar initialQuery={q} placeholder="Rechercher un film..." />

      <div className={styles.header} style={{ marginTop: 4 }}>
        <div className={styles.icon} />
        <h1 className={styles.title}>
          Recherche <span className={styles.queryHint}>{q ? `“${q}”` : ""}</span>
        </h1>
      </div>

      {error && (
        <pre
          style={{
            background: "rgba(255, 118, 118, 0.1)",
            border: "1px solid rgba(255, 118, 118, 0.35)",
            color: "#ffbaba",
            padding: 12,
            borderRadius: 12,
            marginBottom: 16,
            whiteSpace: "pre-wrap",
            fontSize: 12,
          }}
        >
{`Erreur: ${error}
URL: ${_debug?.url || "-"}
Status: ${_debug?.status || "-"}
Content-Type: ${_debug?.contentType || "-"}
Aperçu: ${_debug?.preview || "-"}`}
        </pre>
      )}

      <div className={styles.grid}>
        {results.length ? (
          results.map((m) => {
            const year = m.release_date?.slice(0, 4) || "—";
            const poster = IMG(m.poster_path);
            const note = m.vote_average ? m.vote_average.toFixed(1) : "—";
            const title = m.title || m.name || "Sans titre";

            return (
              <article className={styles.card} key={`${m.id}-${title}`} title={title}>
                {poster ? (
                  <Link href={`/movie/${m.id}`} legacyBehavior>
                    <a style={{ textDecoration: "none", color: "inherit" }}>
                      <Image
                        className={styles.poster}
                        src={poster}
                        alt={title}
                        width={500}
                        height={750}
                      />
                    </a>
                  </Link>
                ) : (
                  <div className={styles.empty}>Aucune affiche</div>
                )}
                <div className={styles.meta}>
                  <h3 className={styles.name}>{title}</h3>
                  <div className={styles.sub}>
                    <span className={styles.badge}>★ {note}</span>
                    <span className={styles.dot} />
                    <span>{year}</span>
                  </div>
                </div>
              </article>
            );
          })
        ) : q && !error ? (
          <p style={{ color: "#c7d5ea" }}>Aucun résultat pour “{q}”.</p>
        ) : (
          !error && <p style={{ color: "#9ab0ca" }}>Commencez une recherche…</p>
        )}
      </div>

      {!!data?.total_pages && data.total_pages > 1 && (
        <nav className={styles.pager} aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}>← Précédent</Link>
          ) : (
            <span className="disabled">← Précédent</span>
          )}
          <span>
            Page {page} / {data.total_pages}
          </span>
          {page < data.total_pages ? (
            <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}>Suivant →</Link>
          ) : (
            <span className="disabled">Suivant →</span>
          )}
        </nav>
      )}
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const q = typeof ctx.query.q === "string" ? ctx.query.q.trim() : "";
  const page = Math.max(1, parseInt(ctx.query.page || "1", 10) || 1);

  if (!q) {
    return { props: { q: "", page: 1, data: null, error: null, _debug: null } };
  }

  const url = `${BASE}/movies/search?query=${encodeURIComponent(q)}&page=${page}`;

  try {
    const r = await fetch(url);
    const ct = r.headers.get("content-type") || "";

    if (!r.ok || !ct.includes("application/json")) {
      const txt = await r.text().catch(() => "");
      console.error("❌ Fetch search failed\nURL:", url, "\nStatus:", r.status, "\nCT:", ct, "\nBody:", txt.slice(0, 300));
      return {
        props: {
          q,
          page,
          data: null,
          error: r.status || "not_json",
          _debug: { url, status: r.status || null, contentType: ct, preview: txt.slice(0, 300) },
        },
      };
    }

    const data = await r.json();
    return { props: { q, page, data, error: null, _debug: { url, status: r.status, contentType: ct, preview: "OK" } } };
  } catch (e) {
    console.error("❌ Exception search:", e);
    return {
      props: { q, page, data: null, error: "fetch_failed", _debug: { url, status: null, contentType: null, preview: String(e) } },
    };
  }
}
