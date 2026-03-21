import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroCarousel } from '@/components/HeroCarousel';
import { StatsBar } from '@/components/StatsBar';
import { FeaturedWorks } from '@/components/FeaturedWorks';
import { FeaturedSpots } from '@/components/FeaturedSpots';
import { CommunityFeed } from '@/components/CommunityFeed';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroCarousel />
        <StatsBar />
        <FeaturedWorks />
        <FeaturedSpots />
        <CommunityFeed />
      </main>
      <Footer />
    </div>
  );
}
