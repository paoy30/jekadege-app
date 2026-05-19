'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'default' | 'lg';

interface CopyUrlProps {
  url?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  size?: Size;
  buttonText?: string;
  successMessage?: string;
}

export function CopyUrl({ url, label = 'Page URL', className, inputClassName, buttonClassName, size = 'default', buttonText = 'Copy', successMessage = 'Copied URL to clipboard' }: CopyUrlProps) {
  const { toast } = useToast();
  const [value, setValue] = React.useState(url ?? '');
  const [copied, setCopied] = React.useState(false);

  // Populate from window on mount if no url provided
  React.useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setValue(window.location.href);
    }
  }, [url]);

  async function handleCopy() {
    const text = value;
    if (!text) {
      toast({
        variant: 'destructive',
        title: 'Nothing to copy',
        description: 'URL is empty.',
      });
      return;
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      setCopied(true);
      toast({ title: successMessage });
      const t = setTimeout(() => setCopied(false), 1200);
      return () => clearTimeout(t);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Please try again or copy manually.',
      });
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <Input readOnly value={value} aria-label={label} className={cn('font-mono', inputClassName)} size={size} />
        <Button type="button" onClick={handleCopy} aria-label="Copy URL to clipboard" className={buttonClassName} size={size}>
          {copied ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" aria-hidden="true" />
              Copied
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Copy className="h-4 w-4" aria-hidden="true" />
              {buttonText}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default CopyUrl;
