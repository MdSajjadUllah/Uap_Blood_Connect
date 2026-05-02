import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BloodStatsSection } from "@/components/landing/BloodStatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { EmergencyContactSection } from "@/components/landing/EmergencyContactSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <BloodStatsSection />
      <TestimonialsSection />
      <FAQSection />
      <EmergencyContactSection />
      <Footer />
    </div>
  );
};

export default Index;
