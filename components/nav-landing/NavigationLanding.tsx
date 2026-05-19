'use client';

import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from '@/components/ui/input';
import { Search } from "lucide-react";
import '../../app/globals.css';

export default function NavigationLanding() {
  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <div className="flex justify-between w-full items-center  ">
        <Link href="/" className="mr-6  lg:flex" prefetch={false}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/img/logo.png" className="w-[60px]" alt="" />
            <h1 className="font-medium text-[1.2rem] md:text-[1.5rem]">Jekadege</h1>
          </div>
        </Link>
        {/* <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTitle className="mb-4 text-lg font-semibold">Menu</SheetTitle>
            <Link href="#" className="mr-6 hidden lg:flex" prefetch={false}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/img/logo.png" className="w-[60px] " alt="" />
                <h1 className="font-medium text-[1.2rem] md:text-[1.5rem]">Jekadege</h1>
              </div>
            </Link>
            <div className="grid gap-2 py-6">
              <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                Home
              </Link>
              <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                About
              </Link>
              <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                Services
              </Link>
              <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                Contact
              </Link>
            </div>
          </SheetContent>
        </Sheet> */}
      </div>
      {/* <nav className="ml-auto hidden lg:flex gap-6">
        <InputWithButton/>
        <Button variant={'destructive'} >
          HUBUNGI SEKARANG 
        </Button>
        
      </nav> */}
    </header>
  );
}

export function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input type="invoice" placeholder="Invoice: INV-421346521" className="w-60 " />
      <Button type="submit" variant="outline" size="icon">
        <Search  />
      </Button>
    </div>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

