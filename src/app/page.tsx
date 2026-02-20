import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ScreenshotsSection } from '@/components/landing/ScreenshotsSection';
import { WhySection } from '@/components/landing/WhySection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNav />
            <HeroSection />
            <FeaturesSection />
            <ScreenshotsSection />
            <WhySection />
            <TestimonialsSection />
            <PricingSection />
            <FAQSection />
            <FinalCTA />
            <LandingFooter />
        </div>
    );
}
