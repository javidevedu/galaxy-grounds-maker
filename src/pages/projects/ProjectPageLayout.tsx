import { Link } from "react-router-dom";

export type ProjectPageSection = {
  title: string;
  description?: string;
  bullets?: string[];
  image?: string;
  imageAlt?: string;
};

type ProjectPageLayoutProps = {
  eyebrow: string;
  title: string;
  summary: string;
  techs: string[];
  heroImage?: string;
  heroAlt?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  sections: ProjectPageSection[];
};

function SectionBlock({ section }: { section: ProjectPageSection }) {
  return (
    <section
      style={{
        background: "rgba(255,255,255,0.96)",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: "1.5rem",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "1.4rem",
          color: "#111827",
          marginBottom: "0.75rem",
        }}
      >
        {section.title}
      </h2>

      {section.description ? (
        <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: section.bullets?.length ? "1rem" : 0 }}>
          {section.description}
        </p>
      ) : null}

      {section.bullets?.length ? (
        <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#374151", lineHeight: 1.7 }}>
          {section.bullets.map((bullet) => (
            <li key={bullet} style={{ marginBottom: "0.45rem" }}>
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}

      {section.image ? (
        <img
          src={section.image}
          alt={section.imageAlt ?? section.title}
          style={{
            width: "100%",
            borderRadius: 16,
            marginTop: "1rem",
            border: "1px solid #dbeafe",
            boxShadow: "0 8px 24px rgba(59, 130, 246, 0.12)",
          }}
        />
      ) : null}
    </section>
  );
}

export default function ProjectPageLayout({
  eyebrow,
  title,
  summary,
  techs,
  heroImage,
  heroAlt,
  primaryAction,
  sections,
}: ProjectPageLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "1.5rem 1rem 3rem",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#312e81",
            textDecoration: "none",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          ← Volver al inicio
        </Link>

        <section
          style={{
            background: "rgba(255,255,255,0.96)",
            borderRadius: 24,
            padding: "1.5rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 18px 40px rgba(99, 102, 241, 0.12)",
            display: "grid",
            gridTemplateColumns: heroImage ? "1.2fr 1fr" : "1fr",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
          className="project-page-hero"
        >
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#6366f1",
                marginBottom: "0.75rem",
              }}
            >
              {eyebrow}
            </span>

            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                color: "#111827",
                marginBottom: "0.75rem",
              }}
            >
              {title}
            </h1>

            <p style={{ color: "#4b5563", lineHeight: 1.8, marginBottom: "1rem" }}>{summary}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: primaryAction ? "1rem" : 0 }}>
              {techs.map((tech) => (
                <span
                  key={tech}
                  style={{
                    padding: "0.35rem 0.7rem",
                    borderRadius: 999,
                    background: "#eef2ff",
                    color: "#3730a3",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            {primaryAction ? (
              <a
                href={primaryAction.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "0.8rem 1.1rem",
                  borderRadius: 12,
                  background: "#111827",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {primaryAction.label}
              </a>
            ) : null}
          </div>

          {heroImage ? (
            <img
              src={heroImage}
              alt={heroAlt ?? title}
              style={{
                width: "100%",
                borderRadius: 18,
                objectFit: "cover",
                border: "1px solid #dbeafe",
                boxShadow: "0 12px 28px rgba(59, 130, 246, 0.16)",
              }}
            />
          ) : null}
        </section>

        <div style={{ display: "grid", gap: "1rem" }}>
          {sections.map((section) => (
            <SectionBlock key={section.title} section={section} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .project-page-hero {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
