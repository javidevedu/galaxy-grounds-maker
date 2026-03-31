import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import NotFound from "./NotFound";

const projectHtmlFiles = import.meta.glob("./projects/*/index.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const projectImageFiles = import.meta.glob("./projects/*/images/*.{png,jpg,jpeg,gif,webp,svg}", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

function getProjectHtml(projectSlug: string) {
  const html = projectHtmlFiles[`./projects/${projectSlug}/index.html`];

  if (!html) {
    return null;
  }

  let processedHtml = html;

  Object.entries(projectImageFiles).forEach(([path, assetUrl]) => {
    const fileName = path.split("/images/")[1];

    if (!fileName) {
      return;
    }

    processedHtml = processedHtml
      .split(`src="images/${fileName}"`)
      .join(`src="${assetUrl}"`)
      .split(`src='images/${fileName}'`)
      .join(`src='${assetUrl}'`);
  });

  return processedHtml;
}

export default function ProjectDetail() {
  const { projectSlug } = useParams();

  const projectHtml = useMemo(() => {
    if (!projectSlug) {
      return null;
    }

    return getProjectHtml(projectSlug);
  }, [projectSlug]);

  if (!projectHtml) {
    return <NotFound />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", padding: "1rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 1rem" }}>
        <Link
          to="/"
          style={{
            display: "inline-block",
            color: "#e2e8f0",
            textDecoration: "none",
            fontWeight: 600,
            padding: "0.75rem 1rem",
            borderRadius: 10,
            background: "#0f172a",
            border: "1px solid #1e293b",
          }}
        >
          ← Volver al inicio
        </Link>
      </div>

      <iframe
        title={projectSlug}
        srcDoc={projectHtml}
        style={{
          width: "100%",
          minHeight: "calc(100vh - 5rem)",
          border: "none",
          borderRadius: 16,
          background: "white",
        }}
      />
    </div>
  );
}
