import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { verifyGhanaCard, type GhanaCardData } from '../services/ghanaCardVerification';

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: (cardData: GhanaCardData) => void;
}

type Status = 'idle' | 'scanning' | 'extracting' | 'verifying' | 'verified' | 'error' | 'manual' | 'underage';

export default function VerificationModal({ open, onClose, onVerified }: VerificationModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cardData, setCardData] = useState<GhanaCardData | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [manualEntry, setManualEntry] = useState({
    cardNumber: '',
    fullName: '',
    dateOfBirth: '',
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFileRef = useRef<File | null>(null);

  if (!open) return null;

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setErrorMessage('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setStatus('error');
      setErrorMessage('Image file is too large. Please use an image smaller than 10MB.');
      return;
    }

    currentFileRef.current = file;
    setStatus('scanning');
    setErrorMessage('');

    // Show preview
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
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // Start verification process
    try {
      setStatus('extracting');
      
      const result = await verifyGhanaCard(file);

      if (!result.success || !result.verified) {
        setStatus('error');
        setErrorMessage(result.error || 'Ghana Card verification failed. Please try again with a clearer image.');
        return;
      }

      // Check if user is eligible (18+ years old)
      if (result.eligible === false) {
        setStatus('underage');
        setCardData(result.data || null);
        setUserAge(result.age || null);
        setErrorMessage(result.message || 'You must be 18 years or older to vote.');
        return;
      }

      // Verification successful and user is eligible!
      setStatus('verified');
      setCardData(result.data || null);
      setUserAge(result.age || null);
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setErrorMessage('An error occurred during verification. Please check your internet connection and try again.');
    }
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

  const handleContinue = () => {
    if (status === 'manual') {
      // Use manually entered data
      const manualCardData: GhanaCardData = {
        cardNumber: manualEntry.cardNumber,
        fullName: manualEntry.fullName,
        dateOfBirth: manualEntry.dateOfBirth,
      };
      onVerified(manualCardData);
    } else if (status === 'underage') {
      // Allow user to continue but they won't be fully verified
      if (cardData) {
        onVerified(cardData);
      }
    } else if (cardData) {
      onVerified(cardData);
    }
  };

  const handleManualEntry = () => {
    setStatus('manual');
    setErrorMessage('');
  };

  const handleRetry = () => {
    setStatus('idle');
    setPreview(null);
    setErrorMessage('');
    setCardData(null);
    currentFileRef.current = null;
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'scanning':
        return 'Reading image...';
      case 'extracting':
        return 'Extracting Ghana Card details using AI...';
      case 'verifying':
        return 'Verifying with NIA database...';
      case 'verified':
        return cardData ? `Verified: ${cardData.fullName}${userAge ? ` (Age: ${userAge})` : ''}` : 'Ghana Card verified successfully!';
      case 'underage':
        return `Age Verification Failed: You are ${userAge} years old`;
      case 'error':
        return errorMessage;
      default:
        return '';
    }
  };

  const isProcessing = ['scanning', 'extracting', 'verifying'].includes(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Verify with Ghana Card</h2>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            aria-label="Close" 
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-ghana-gold/60 bg-ghana-gold/5 p-8 text-center"
        >
          {preview ? (
            <div className="relative w-full">
              <canvas ref={canvasRef} className="max-h-48 w-full rounded-md object-contain" />
              {status === 'verified' && (
                <div className="absolute inset-0 flex items-center justify-center bg-ghana-green/10 rounded-md">
                  <CheckCircle2 className="h-12 w-12 text-ghana-green" />
                </div>
              )}
            </div>
          ) : (
            <UploadCloud className="h-10 w-10 text-ghana-gold" />
          )}

          {!preview && (
            <p className="mt-3 text-sm text-slate-600">
              Drag and drop a photo of your Ghana Card, or
              <label className="ml-1 cursor-pointer font-medium text-ghana-green underline">
                browse files
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileInput}
                  disabled={isProcessing}
                />
              </label>
            </p>
          )}
        </div>

        {/* Status Messages */}
        <div className="mt-4 min-h-[3rem]">
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-ghana-green" />
              <span>{getStatusMessage()}</span>
            </div>
          )}
          
          {status === 'verified' && cardData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-ghana-green font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                <span>Ghana Card Verified!</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1">
                <p><span className="font-semibold">Name:</span> {cardData.fullName}</p>
                <p><span className="font-semibold">Card Number:</span> {cardData.cardNumber}</p>
                {cardData.dateOfBirth && <p><span className="font-semibold">Date of Birth:</span> {cardData.dateOfBirth}</p>}
                {userAge && <p><span className="font-semibold">Age:</span> {userAge} years old</p>}
                {cardData.district && <p><span className="font-semibold">District:</span> {cardData.district}</p>}
              </div>
              <div className="rounded-lg bg-ghana-green/10 border border-ghana-green/30 p-3 text-xs text-ghana-green">
                <p className="font-semibold">✅ You are eligible to vote and participate!</p>
              </div>
            </div>
          )}
          
          {status === 'underage' && cardData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
                <AlertCircle className="h-5 w-5" />
                <span>Age Verification Failed</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1">
                <p><span className="font-semibold">Name:</span> {cardData.fullName}</p>
                <p><span className="font-semibold">Card Number:</span> {cardData.cardNumber}</p>
                {cardData.dateOfBirth && <p><span className="font-semibold">Date of Birth:</span> {cardData.dateOfBirth}</p>}
                {userAge !== null && <p><span className="font-semibold">Age:</span> {userAge} years old</p>}
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <p className="font-semibold mb-1">❌ You are not eligible to vote</p>
                <p>You must be <strong>18 years or older</strong> to vote and participate in discussions.</p>
                {userAge !== null && (
                  <p className="mt-2">You can return when you turn 18 (in {18 - userAge} years).</p>
                )}
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                Your account will be created but you won't be able to vote or post until you are 18.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-red-600">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="whitespace-pre-line">{errorMessage}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="text-xs text-ghana-green underline hover:no-underline"
                >
                  Try again with a different image
                </button>
                <span className="text-xs text-slate-400">or</span>
                <button
                  onClick={handleManualEntry}
                  className="text-xs text-blue-600 underline hover:no-underline"
                >
                  Enter details manually
                </button>
              </div>
            </div>
          )}
          
          {status === 'manual' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 font-medium">Enter your Ghana Card details:</p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ghana Card Number</label>
                <input
                  type="text"
                  placeholder="GHA-XXXXXXXXX-X"
                  value={manualEntry.cardNumber}
                  onChange={(e) => setManualEntry({...manualEntry, cardNumber: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name (as on card)</label>
                <input
                  type="text"
                  placeholder="JOHN DOE"
                  value={manualEntry.fullName}
                  onChange={(e) => setManualEntry({...manualEntry, fullName: e.target.value.toUpperCase()})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={manualEntry.dateOfBirth}
                  onChange={(e) => setManualEntry({...manualEntry, dateOfBirth: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="text-xs text-slate-600 underline hover:no-underline"
              >
                ← Back to upload
              </button>
            </div>
          )}
        </div>

        {/* Card Requirements */}
        {status === 'idle' && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold mb-1">For best results:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Use a clear, well-lit photo</li>
              <li>Ensure all text is visible</li>
              <li>Avoid glare or shadows</li>
              <li>Photo or front side of card</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            {status === 'underage' ? 'Close' : 'Cancel'}
          </button>
          <button
            disabled={
              (status !== 'verified' && status !== 'manual' && status !== 'underage') || 
              (status === 'manual' && (!manualEntry.cardNumber || !manualEntry.fullName))
            }
            onClick={handleContinue}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40 ${
              status === 'underage' 
                ? 'bg-orange-600 hover:bg-orange-600/90' 
                : 'bg-ghana-green hover:bg-ghana-green/90'
            }`}
          >
            {isProcessing 
              ? 'Verifying...' 
              : status === 'underage' 
                ? 'Continue Anyway' 
                : 'Continue'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
