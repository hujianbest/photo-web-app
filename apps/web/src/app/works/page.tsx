import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WorksMasonry } from '@/components/WorksMasonry';

export default function WorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-8">作品展示</h1>
        <WorksMasonry />
      </main>
      <Footer />
    </div>
  );
}
