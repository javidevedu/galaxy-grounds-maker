import ProjectPageLayout from "./ProjectPageLayout";
import coverImg from "./jv-luxe/images/cover.png";

export default function JVLuxe() {
  return (
    <ProjectPageLayout
      eyebrow="Creative Agency Web Design"
      title="JV Luxe Marketing"
      summary="A premium landing page designed to reflect a sophisticated brand through clean visuals, performance, and mobile-first execution."
      techs={["WordPress", "HTML5", "CSS", "Elementor"]}
      heroImage={coverImg}
      heroAlt="JV Luxe marketing cover image"
      sections={[
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
          image: coverImg,
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
      ]}
    />
  );
}
