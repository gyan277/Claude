import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud, X, CheckCircle2 } from 'lucide-react';

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

type Status = 'idle' | 'scanning' | 'verified' | 'error';

export default function VerificationModal({ open, onClose, onVerified }: VerificationModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!open) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      return;
    }

    setStatus('scanning');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);

      const image = new Image();
      image.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = image.width;
          canvas.height = image.height;
          canvas.getContext('2d')?.drawImage(image, 0, 0);
        }
        // Simulated OCR pass — a real integration would send canvas pixel
        // data to a Ghana Card OCR/verification endpoint here.
        setTimeout(() => {
          setStatus('verified');
        }, 1200);
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Verify with Ghana Card</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-ghana-gold/60 bg-ghana-gold/5 p-8 text-center"
        >
          {preview ? (
            <canvas ref={canvasRef} className="max-h-48 w-full rounded-md object-contain" />
          ) : (
            <UploadCloud className="h-10 w-10 text-ghana-gold" />
          )}

          <p className="mt-3 text-sm text-slate-600">
            Drag and drop a photo of your Ghana Card, or
            <label className="ml-1 cursor-pointer font-medium text-ghana-green underline">
              browse files
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </label>
          </p>
        </div>

        <div className="mt-4 min-h-[2rem] text-sm">
          {status === 'scanning' && <p className="text-slate-500">Scanning card details…</p>}
          {status === 'error' && <p className="text-red-600">Please upload a valid image file.</p>}
          {status === 'verified' && (
            <div className="flex items-center gap-2 text-ghana-green">
              <CheckCircle2 className="h-5 w-5" />
              <span>Card verified successfully.</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            disabled={status !== 'verified'}
            onClick={onVerified}
            className="rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
