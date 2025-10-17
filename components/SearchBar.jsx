// components/SearchBar.jsx
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

export default function SearchBar({
  initialQuery = "",
  placeholder = "Rechercher un film...",
  buttonLabel = "Chercher",
  compact = false,
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e) {
    e.preventDefault();
    const query = (q || "").trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: compact ? 8 : 16,
          gap: 8,
        }}
      >
        <Link href="/" title="Accueil">
          <div
            style={{
              fontSize: "28px",
              color: "#cfe0ff",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.transform = "scale(1.0)";
            }}
          >
            🎬
          </div>
        </Link>

        {/* Lien vers les recommandations d'humeur */}
        <Link
          href="/mood"
          style={{
            color: "#9ab0ca",
            fontSize: 13,
            textDecoration: "none",
            border: "1px solid rgba(137,174,255,.35)",
            padding: "6px 10px",
            borderRadius: 10,
          }}
          title="Films selon l'humeur"
        >
          😄 Films selon l’humeur
        </Link>
      </div>

      {/* Barre de recherche */}
      <form
        onSubmit={onSubmit}
        role="search"
        aria-label="Recherche de films"
        style={{
          display: "flex",
          gap: 10,
          marginTop: compact ? 8 : 12,
          marginBottom: compact ? 16 : 24,
        }}
      >
        <input
          type="text"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          style={{
            flex: 1,
            background: "#0e131a",
            border: "1px solid rgba(255,255,255,.08)",
            color: "#e9eef7",
            borderRadius: 12,
            padding: compact ? "10px 12px" : "12px 14px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: compact ? "10px 14px" : "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(137,174,255,.35)",
            background: "linear-gradient(135deg,#6ea8fe22,#a18cff22)",
            color: "#cfe0ff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
