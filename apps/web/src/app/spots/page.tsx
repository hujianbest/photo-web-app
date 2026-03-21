import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SpotsMapView } from '@/components/SpotsMapView';

export default function SpotsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-8">打卡点</h1>
        <SpotsMapView />
      </main>
      <Footer />
    </div>
  );
}
