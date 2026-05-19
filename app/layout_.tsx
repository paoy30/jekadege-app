import './globals.css';
import Providers from './providers';
import { ThemeProvider } from './theme-provider';

export const metadata = {
  title: 'Superblog',
  description: 'A blog app using Next.js and Prisma',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
