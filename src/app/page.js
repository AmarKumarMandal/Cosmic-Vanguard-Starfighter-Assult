import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), { ssr: false });

export const metadata = {
  title: 'Space War',
  description: 'A 2D arcade space shooter built with Next.js and HTML5 Canvas',
};

export default function Home() {
  return (
    <main>
      <GameCanvas />
    </main>
  );
}
