import ProjectPageLayout from "./ProjectPageLayout";
import heroImg from "./whattobuy/images/landin-w2b.png";
import overviewImg from "./whattobuy/images/landin-w2b2-768x354.png";
import strategyImg from "./whattobuy/images/landin-w2b3-768x351.png";
import featureImg from "./whattobuy/images/car-w2b.png";

export default function WhatToBuy() {
  return (
    <ProjectPageLayout
      eyebrow="E-commerce Web Development"
      title="WhatToBuy"
      summary="A product recommendation and shopping experience built to help users browse products, compare options, and move smoothly toward checkout."
      techs={["WordPress", "WooCommerce", "HTML5", "CSS", "JavaScript", "Elementor"]}
      heroImage={heroImg}
      heroAlt="WhatToBuy homepage screenshot"
      primaryAction={{
        label: "Visit live site",
        href: "https://whattobuy-javier.great-site.net/",
      }}
      sections={[
        {
          title: "Overview",
          description:
            "The platform was built as a fully functional e-commerce site with product browsing, add-to-cart, and checkout flows, while maintaining a clear and attractive UI/UX focus.",
          bullets: [
            "Responsive design for mobile, tablet, and desktop.",
            "User-friendly product filtering and search.",
            "Fast loading experience with SEO-focused structure.",
          ],
          image: overviewImg,
          imageAlt: "WhatToBuy landing page detail",
        },
        {
          title: "Strategy & Design",
          description:
            "The goal was to create an e-commerce experience that is easy to navigate, visually engaging, and optimized to guide users toward conversion.",
          image: strategyImg,
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
          image: featureImg,
          imageAlt: "WhatToBuy feature showcase",
        },
      ]}
    />
  );
}
