import type { MetaFunction } from '@remix-run/node';
import ThreeDemo from '~/components/ThreeDemo';
import { Header } from '~/components/layout/Header';
import { Footer } from '~/components/layout/Footer';

export const meta: MetaFunction = () => {
  return [{ title: 'Nebu — Demo 3D' }];
};

export default function Demo3DRoute() {
  return (
    <div className="min-h-screen bg-nebu-bg">
      <Header />

      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Demo 3D — Caja interactiva</h1>
        <p className="mb-6 text-muted">Usa el ratón o el táctil para rotar y hacer zoom.</p>

        <ThreeDemo />
      </main>

      <Footer />
    </div>
  );
}
