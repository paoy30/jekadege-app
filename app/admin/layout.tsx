import Navigation from '@/components/nav/Navigation';
import '../globals.css';
// import Header from '../Header';
import { Toaster } from '@/components/ui/sonner';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-[#0e0e0e]">
      {/* <Header /> */}
      <Navigation />
      <main className="flex-1 mt-10">{children}</main>
      <Toaster richColors />
    </div>
  );
}
