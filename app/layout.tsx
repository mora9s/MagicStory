import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MagicStory | Histoires Magiques pour Enfants',
  description: 'Où chaque enfant devient le héros de sa propre légende. Créez des histoires personnalisées avec l\'IA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
