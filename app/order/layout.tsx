
import NavigationLanding from '@/components/nav-landing/NavigationLanding';
import '../globals.css';



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <NavigationLanding/>
        {children}
    </>
  );
}
