import ProjectPageLayout from "./ProjectPageLayout";
import coverImg from "./book-review/images/cover.png";
import taskImg from "./book-review/images/task12-1.png";
import loginImg from "./book-review/images/7-login-1-768x554.png";
import technicalImg from "./book-review/images/8-reviewadded-2-1.png";

export default function BookReview() {
  return (
    <ProjectPageLayout
      eyebrow="Backend Development"
      title="Online Book Review Application"
      summary="A secure review platform with authentication, ratings, and structured book management built to help readers discover and evaluate books."
      techs={["Node.js", "Express", "MongoDB", "JWT", "JavaScript", "HTML5"]}
      heroImage={coverImg}
      heroAlt="Online Book Review cover"
      primaryAction={{
        label: "View project on GitHub",
        href: "https://github.com/javidevedu/expressBookReviews",
      }}
      sections={[
        {
          title: "Overview",
          description:
            "This project showcases the development of an online book review application where users can search by title, author, or genre and interact with reviews through a clear and user-friendly system.",
          bullets: [
            "Dynamically retrieves and displays book titles, descriptions, and user reviews.",
            "Uses backend logic to support authentication, review submissions, and efficient data management.",
          ],
          image: taskImg,
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
          image: loginImg,
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
          image: technicalImg,
          imageAlt: "Book review technical flow",
        },
      ]}
    />
  );
}
