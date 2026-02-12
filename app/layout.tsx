import type { Metadata } from '\''next'\'';
import '\''./globals.css'\'';

export const metadata: Metadata = {
  title: '\''MagicStory'\'',
  description: '\''Générateur d’histoires magiques'\'',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
