'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createLink } from '@/app/actions/linkActions';
import { Instagram, MapPin, MessageCircle, Music2, ShoppingCart, Link as LinkIcon } from 'lucide-react';

const iconOptions = [
  { name: 'Whatsapp', icon: <MessageCircle className="h-4 w-4" /> },
  { name: 'Instagram', icon: <Instagram className="h-4 w-4" /> },
  { name: 'Shopee', icon: <ShoppingCart className="h-4 w-4" /> },
  { name: 'Tiktok', icon: <Music2 className="h-4 w-4" /> },
  { name: 'Alamat', icon: <MapPin className="h-4 w-4" /> },
  { name: 'Default', icon: <LinkIcon className="h-4 w-4" /> },
];

const linkSchema = z.object({
  title: z.string().min(2, 'Judul minimal 2 karakter.'),
  url: z.string().url('URL tidak valid.'),
  icon: z.string().min(2, 'Ikon harus dipilih.'),
});

export function AddLinkForm({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: { title: '', url: '', icon: 'Default' },
  });

  const onSubmit = async (values: z.infer<typeof linkSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('url', values.url);
    formData.append('icon', values.icon);

    const result = await createLink(formData);
    if (result.success) {
      toast.success(result.success);
      setOpen(false);
      form.reset();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Tautan Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: WhatsApp Admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ikon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih ikon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconOptions.map((opt) => (
                        <SelectItem key={opt.name} value={opt.name}>
                          <div className="flex items-center gap-2">
                            {opt.icon} {opt.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
