import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Nfc, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';
import { isNfcWriteSupported, mapNfcWriteError, writeUrlToNfcTag } from '@/lib/nfc-write';
import { openNfcTools } from '@/lib/open-nfc-tools';

type LinkNfcWriteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
};

type WriteState = 'idle' | 'writing' | 'success' | 'error';

function NfcToolsSteps() {
  return (
    <ol className="space-y-4 text-sm text-muted-foreground">
      <li className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
          1
        </span>
        <span className="pt-0.5">
          Open{' '}
          <button
            type="button"
            onClick={() => openNfcTools()}
            className="font-semibold text-primary hover:underline"
          >
            NFC Tools
          </button>{' '}
          on your phone.
        </span>
      </li>
      <li className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
          2
        </span>
        <span className="pt-0.5">
          Tap <strong className="text-foreground">Write</strong> →{' '}
          <strong className="text-foreground">Add a record</strong> →{' '}
          <strong className="text-foreground">URL / URI</strong>.
        </span>
      </li>
      <li className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
          3
        </span>
        <span className="pt-0.5">
          Paste the copied URL below, then tap <strong className="text-foreground">Write</strong>{' '}
          and hold your phone near the tag.
        </span>
      </li>
    </ol>
  );
}

export function LinkNfcWriteModal({ open, onOpenChange, url }: LinkNfcWriteModalProps) {
  const [writeState, setWriteState] = useState<WriteState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const webNfcSupported = isNfcWriteSupported();

  useEffect(() => {
    if (!open) {
      setWriteState('idle');
      setErrorMessage('');
      return;
    }

    if (!webNfcSupported) {
      void navigator.clipboard.writeText(url).then(
        () => toast.success('URL copied to clipboard'),
        () => toast.error('Could not copy URL'),
      );
    }
  }, [open, url, webNfcSupported]);

  const handleWrite = async () => {
    setWriteState('writing');
    setErrorMessage('');

    try {
      await writeUrlToNfcTag(url);
      setWriteState('success');
      toast.success('NFC tag programmed');
    } catch (error) {
      setWriteState('error');
      setErrorMessage(mapNfcWriteError(error));
    }
  };

  const handleRetry = () => {
    setWriteState('idle');
    setErrorMessage('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            {webNfcSupported ? (
              <Nfc className="h-5 w-5 text-primary" />
            ) : (
              <Smartphone className="h-5 w-5 text-primary" />
            )}
          </div>
          <DrawerTitle>{webNfcSupported ? 'Write to NFC tag' : 'Program NFC tag'}</DrawerTitle>
          <DrawerDescription>
            {webNfcSupported
              ? 'Write this short link to a blank or rewritable NFC tag.'
              : 'Use your phone and NFC Tools to program this tag. The URL has been copied to your clipboard.'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              URL record
            </p>
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 break-all text-sm text-foreground">{url}</p>
              <button
                type="button"
                onClick={() => copyToClipboard(url)}
                className="shrink-0 rounded p-1 hover:bg-muted"
                aria-label="Copy URL"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {webNfcSupported ? (
            <>
              {writeState === 'writing' && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                  <Nfc className="mx-auto mb-2 h-8 w-8 animate-pulse text-primary" />
                  <p className="font-medium text-foreground">Ready to scan</p>
                  <p className="text-sm text-muted-foreground">Approach an NFC tag</p>
                </div>
              )}

              {writeState === 'success' && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  Tag programmed successfully.
                </div>
              )}

              {writeState === 'error' && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}
            </>
          ) : (
            <NfcToolsSteps />
          )}
        </div>

        <DrawerFooter>
          {webNfcSupported ? (
            writeState === 'success' ? (
              <Button type="button" onClick={() => onOpenChange(false)} className="w-full">
                Done
              </Button>
            ) : writeState === 'error' ? (
              <Button type="button" onClick={() => void handleWrite()} className="w-full">
                Try again
              </Button>
            ) : writeState === 'writing' ? (
              <Button type="button" disabled className="w-full">
                Waiting for tag…
              </Button>
            ) : (
              <Button type="button" onClick={() => void handleWrite()} className="w-full">
                Write to tag
              </Button>
            )
          ) : (
            <Button type="button" onClick={() => onOpenChange(false)} className="w-full">
              Done
            </Button>
          )}

          {webNfcSupported && writeState === 'error' && (
            <Button type="button" variant="outline" onClick={handleRetry} className="w-full">
              Cancel
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
