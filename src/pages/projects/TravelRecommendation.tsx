import ProjectPageLayout from "./ProjectPageLayout";
import coverImg from "./travel-recommendation/images/cover.png";

export default function TravelRecommendation() {
  return (
    <ProjectPageLayout
      eyebrow="Frontend & Backend Development"
      title="Travel Recommendation Web"
      summary="A search-driven web experience that helps users explore destinations with dynamic filtering and real-time recommendations."
      techs={["HTML5", "CSS", "JavaScript", "JSON"]}
      heroImage={coverImg}
      heroAlt="Travel recommendation project cover"
      sections={[
        {
          title: "Overview",
          description:
            "The goal was to create an intuitive and visually appealing platform where users could input keywords to find relevant city recommendations from a predefined JSON dataset.",
          bullets: [
            "Displays city names, descriptions, and images dynamically.",
            "Provides responsive, real-time filtering with JavaScript.",
          ],
          image: coverImg,
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
      ]}
    />
  );
}
