import ProjectPageLayout from "./ProjectPageLayout";
import heroImg from "./javidev-site/images/Screenshot-2024-12-31-175150.png";
import designImg from "./javidev-site/images/Screenshot-2024-12-31-175438-768x366.png";
import featureImg from "./javidev-site/images/Screenshot-2024-12-31-175937.png";

export default function JavidevSite() {
  return (
    <ProjectPageLayout
      eyebrow="Frontend Development"
      title="javidev.site UX/UI coding & design"
      summary="A personal developer platform designed to share tutorials, resources, roadmaps, and tools with a polished visual identity."
      techs={["HTML5", "CSS", "JavaScript", "Figma", "Tailwind"]}
      heroImage={heroImg}
      heroAlt="javidev.site homepage screenshot"
      primaryAction={{
        label: "Visit external site",
        href: "http://javidev.site/frontend-javidev-portafolio1/",
      }}
      sections={[
        {
          title: "Highlights",
          description:
            "This project combines UX/UI design in Figma with frontend coding to create a visually compelling and fully responsive portfolio platform.",
          bullets: [
            "Mood boards, sitemaps, frameworks, and prototypes designed in Figma.",
            "Built from scratch with HTML5, CSS, Tailwind CSS, and JavaScript.",
          ],
          image: designImg,
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
          image: featureImg,
          imageAlt: "javidev.site feature screenshot",
        },
      ]}
    />
  );
}
