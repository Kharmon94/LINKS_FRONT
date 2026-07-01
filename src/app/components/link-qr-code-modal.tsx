import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type LinkQrCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  filename: string;
};

export function LinkQrCodeModal({ open, onOpenChange, url, filename }: LinkQrCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setDataUrl(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setDataUrl(null);

    QRCode.toDataURL(url, { width: 512, margin: 2 })
      .then((result) => {
        if (!cancelled) setDataUrl(result);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not generate QR code');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, url]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = `${filename}-qr.png`;
    anchor.click();
    toast.success('QR code downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg bg-white p-4">
            {loading ? (
              <Skeleton className="aspect-square w-[min(100%,280px)]" />
            ) : dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR code for ${url}`}
                className="aspect-square w-[min(100%,280px)]"
              />
            ) : null}
          </div>
          <p className="break-all text-center text-sm text-muted-foreground">{url}</p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={!dataUrl || loading}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
