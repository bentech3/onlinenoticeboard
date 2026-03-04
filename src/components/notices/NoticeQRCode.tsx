import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download } from 'lucide-react';
import { useRef } from 'react';

interface NoticeQRCodeProps {
  noticeId: string;
  noticeTitle: string;
}

export function NoticeQRCode({ noticeId, noticeTitle }: NoticeQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const noticeUrl = `${window.location.origin}/notices/${noticeId}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx?.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement('a');
      link.download = `notice-qr-${noticeId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Notice QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div ref={qrRef} className="p-4 bg-white rounded-xl">
            <QRCodeSVG
              value={noticeUrl}
              size={200}
              level="H"
              includeMargin
              fgColor="hsl(210, 75%, 35%)"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center line-clamp-2 px-4">
            {noticeTitle}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="mr-1.5 h-4 w-4" />
              Download PNG
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(noticeUrl)}>
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
