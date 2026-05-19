'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MenuNav } from './MenuNav';
import { ModeToggle } from './ModeToggle';

export default function Navigation() {

  const { data: session } = useSession();

  return (
    <>
      <header className="py-2 ">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/img/logo.png" style={{ width: '60px' }} alt="" />
              <h1 className="logo" style={{ fontWeight: 500, fontSize: '1.5rem' }}>
                Jekadege
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <ModeToggle />
            {session?.user?.name && (
              <Button onClick={() => signOut()} variant="default">
              Logout
            </Button>
            )}
          </div>
        </div>
      </header>
            {session?.user?.name && (
              <div className=" z-50 w-fit mx-auto  items-center gap-6 text-sm font-medium md:flex sticky top-5 md:-mt-16">
        <MenuNav />
      </div>
      )}
    </>
  );
}
