'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Logika handleSubmit tetap sama, tidak ada perubahan.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const response = await signIn('credentials', {
        ...Object.fromEntries(formData),
        redirect: false,
      });

      if (response?.error) {
        setError('Invalid email or password'); // Pesan error lebih spesifik
        return;
      }

      router.push('/admin/invoices');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    }
  }

  return (
    <div className="min-h-[70vh] md:min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm ">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email" // `name` penting untuk FormData
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password" // `name` penting untuk FormData
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Menampilkan pesan error di dalam form */}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          {/* <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/admin/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </p> */}
        </CardFooter>
      </Card>
    </div>
  );
}
