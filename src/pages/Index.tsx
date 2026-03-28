import HeroSection from "@/components/HeroSection";
import PhilosophySection from "@/components/PhilosophySection";
import GallerySection from "@/components/GallerySection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <HeroSection />
      <PhilosophySection />
      <GallerySection />
      <FooterSection />
    </main>
  );
};

export default Index;
