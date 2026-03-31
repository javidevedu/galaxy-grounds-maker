import { Link, useParams } from "react-router-dom";
import NotFound from "./NotFound";

type ProjectSection = {
  title: string;
  description?: string;
  bullets?: string[];
  image?: string;
  imageAlt?: string;
};

type ProjectContent = {
  slug: string;
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
  sections: ProjectSection[];
};

const projectImageFiles = import.meta.glob("./projects/*/images/*.{png,jpg,jpeg,gif,webp,svg}", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

const getProjectImage = (projectSlug: string, fileName?: string) => {
  if (!fileName) {
    return undefined;
  }

  return projectImageFiles[`./projects/${projectSlug}/images/${fileName}`];
};

const projects: Record<string, ProjectContent> = {
  "book-review": {
    slug: "book-review",
    eyebrow: "Backend Development",
    title: "Online Book Review Application",
    summary:
      "A secure review platform with authentication, ratings, and structured book management built to help readers discover and evaluate books.",
    techs: ["Node.js", "Express", "MongoDB", "JWT", "JavaScript", "HTML5"],
    heroImage: "cover.png",
    heroAlt: "Online Book Review cover",
    primaryAction: {
      label: "View project on GitHub",
      href: "https://github.com/javidevedu/expressBookReviews",
    },
    sections: [
      {
        title: "Overview",
        description:
          "This project showcases the development of an online book review application where users can search by title, author, or genre and interact with reviews through a clear and user-friendly system.",
        bullets: [
          "Dynamically retrieves and displays book titles, descriptions, and user reviews.",
          "Uses backend logic to support authentication, review submissions, and efficient data management.",
        ],
        image: "task12-1.png",
        imageAlt: "Book review dashboard preview",
      },
      {
        title: "My Role",
        bullets: [
          "Designed and implemented the backend architecture for reviews and user interactions.",
          "Created and secured API endpoints for authentication, search, and review submissions.",
          "Built server-side logic with Node.js and Express.js for performance and scalability.",
          "Managed data handling for books, user accounts, and ratings.",
        ],
        image: "7-login-1-768x554.png",
        imageAlt: "Book review login screen",
      },
      {
        title: "Technical Implementation",
        description:
          "The application combines Node.js, Express.js, MongoDB, and JWT authentication to deliver a secure and scalable review experience for book enthusiasts.",
        bullets: [
          "RESTful API for book searches, reviews, and authentication.",
          "JWT sessions to protect user access and actions.",
          "Database design focused on efficient retrieval and growth.",
        ],
        image: "8-reviewadded-2-1.png",
        imageAlt: "Book review technical flow",
      },
    ],
  },
  "travel-recommendation": {
    slug: "travel-recommendation",
    eyebrow: "Frontend & Backend Development",
    title: "Travel Recommendation Web",
    summary:
      "A search-driven web experience that helps users explore destinations with dynamic filtering and real-time recommendations.",
    techs: ["HTML5", "CSS", "JavaScript", "JSON"],
    heroImage: "cover.png",
    heroAlt: "Travel recommendation project cover",
    sections: [
      {
        title: "Overview",
        description:
          "The goal was to create an intuitive and visually appealing platform where users could input keywords to find relevant city recommendations from a predefined JSON dataset.",
        bullets: [
          "Displays city names, descriptions, and images dynamically.",
          "Provides responsive, real-time filtering with JavaScript.",
        ],
        image: "cover.png",
        imageAlt: "Travel recommendation preview",
      },
      {
        title: "My Role",
        bullets: [
          "Structured the website with semantic HTML for accessibility and organization.",
          "Designed the interface with CSS for a modern and user-friendly experience.",
          "Developed core search and dynamic display functionality with JavaScript.",
          "Managed the project data through JSON for a scalable content structure.",
        ],
      },
      {
        title: "Key Learnings",
        bullets: [
          "Working with structured JSON data for dynamic content.",
          "Implementing real-time search experiences in plain JavaScript.",
          "Improving performance and responsiveness across devices.",
        ],
      },
    ],
  },
  "javidev-site": {
    slug: "javidev-site",
    eyebrow: "Frontend Development",
    title: "javidev.site UX/UI coding & design",
    summary:
      "A personal developer platform designed to share tutorials, resources, roadmaps, and tools with a polished visual identity.",
    techs: ["HTML5", "CSS", "JavaScript", "Figma", "Tailwind"],
    heroImage: "Screenshot-2024-12-31-175150.png",
    heroAlt: "javidev.site homepage screenshot",
    primaryAction: {
      label: "Visit external site",
      href: "http://javidev.site/frontend-javidev-portafolio1/",
    },
    sections: [
      {
        title: "Highlights",
        description:
          "This project combines UX/UI design in Figma with frontend coding to create a visually compelling and fully responsive portfolio platform.",
        bullets: [
          "Mood boards, sitemaps, frameworks, and prototypes designed in Figma.",
          "Built from scratch with HTML5, CSS, Tailwind CSS, and JavaScript.",
        ],
        image: "Screenshot-2024-12-31-175438-768x366.png",
        imageAlt: "javidev.site design preview",
      },
      {
        title: "My Role",
        bullets: [
          "Researched and defined user needs for developers and tech enthusiasts.",
          "Designed the UX/UI with a focus on usability and modern trends.",
          "Coded the entire website from scratch and optimized it for performance.",
        ],
      },
      {
        title: "Features",
        bullets: [
          "Interactive roadmaps for clear learning paths.",
          "Tutorial and resource sections for videos, AI tools, and developer resources.",
          "Responsive design across mobile, tablet, and desktop devices.",
        ],
        image: "Screenshot-2024-12-31-175937.png",
        imageAlt: "javidev.site feature screenshot",
      },
    ],
  },
  whattobuy: {
    slug: "whattobuy",
    eyebrow: "E-commerce Web Development",
    title: "WhatToBuy",
    summary:
      "A product recommendation and shopping experience built to help users browse products, compare options, and move smoothly toward checkout.",
    techs: ["WordPress", "WooCommerce", "HTML5", "CSS", "JavaScript", "Elementor"],
    heroImage: "landin-w2b.png",
    heroAlt: "WhatToBuy homepage screenshot",
    primaryAction: {
      label: "Visit live site",
      href: "https://whattobuy-javier.great-site.net/",
    },
    sections: [
      {
        title: "Overview",
        description:
          "The platform was built as a fully functional e-commerce site with product browsing, add-to-cart, and checkout flows, while maintaining a clear and attractive UI/UX focus.",
        bullets: [
          "Responsive design for mobile, tablet, and desktop.",
          "User-friendly product filtering and search.",
          "Fast loading experience with SEO-focused structure.",
        ],
        image: "landin-w2b2-768x354.png",
        imageAlt: "WhatToBuy landing page detail",
      },
      {
        title: "Strategy & Design",
        description:
          "The goal was to create an e-commerce experience that is easy to navigate, visually engaging, and optimized to guide users toward conversion.",
        image: "landin-w2b3-768x351.png",
        imageAlt: "WhatToBuy design section",
      },
      {
        title: "Features",
        bullets: [
          "Product search and category filters.",
          "Wishlist functionality.",
          "Secure payment gateway.",
          "Analytics integration.",
        ],
        image: "car-w2b.png",
        imageAlt: "WhatToBuy feature showcase",
      },
    ],
  },
  "jv-luxe": {
    slug: "jv-luxe",
    eyebrow: "Creative Agency Web Design",
    title: "JV Luxe Marketing",
    summary:
      "A premium landing page designed to reflect a sophisticated brand through clean visuals, performance, and mobile-first execution.",
    techs: ["WordPress", "HTML5", "CSS", "Elementor"],
    heroImage: "cover.png",
    heroAlt: "JV Luxe marketing cover image",
    sections: [
      {
        title: "Overview",
        description:
          "The JV Luxe Marketing website was crafted on WordPress with a custom theme, SEO optimization, and a responsive layout that reflects the agency’s luxury positioning.",
      },
      {
        title: "Highlights",
        bullets: [
          "Custom WordPress theme.",
          "Fully responsive design.",
          "SEO-optimized structure for better visibility.",
          "Fast loading times and modern visual identity.",
        ],
        image: "cover.png",
        imageAlt: "JV Luxe website preview",
      },
      {
        title: "Features",
        bullets: [
          "Portfolio section.",
          "Contact forms.",
          "Social media integration.",
        ],
      },
    ],
  },
};

function ProjectSectionBlock({ projectSlug, section }: { projectSlug: string; section: ProjectSection }) {
  const imageSrc = getProjectImage(projectSlug, section.image);

  return (
    <section
      style={{
        background: "rgba(255,255,255,0.92)",
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
          marginBottom: "0.75rem",
          color: "#111827",
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

      {imageSrc ? (
        <img
          src={imageSrc}
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

export default function ProjectDetail() {
  const { projectSlug = "" } = useParams();
  const project = projects[projectSlug];

  if (!project) {
    return <NotFound />;
  }

  const heroImage = getProjectImage(project.slug, project.heroImage);

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
              {project.eyebrow}
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
              {project.title}
            </h1>

            <p style={{ color: "#4b5563", lineHeight: 1.8, marginBottom: "1rem" }}>{project.summary}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: project.primaryAction ? "1rem" : 0 }}>
              {project.techs.map((tech) => (
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

            {project.primaryAction ? (
              <a
                href={project.primaryAction.href}
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
                {project.primaryAction.label}
              </a>
            ) : null}
          </div>

          {heroImage ? (
            <img
              src={heroImage}
              alt={project.heroAlt ?? project.title}
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
          {project.sections.map((section) => (
            <ProjectSectionBlock key={section.title} projectSlug={project.slug} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
