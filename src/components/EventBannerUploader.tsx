import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface EventBannerUploaderProps {
  bannerUrl: string;
  bannerFileName?: string;
  bannerFileSize?: number;
  onBannerChange: (data: { url: string; fileName: string; fileSize: number; storagePath: string }) => void;
  onBannerRemove: () => void;
  isUploading?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const EventBannerUploader: React.FC<EventBannerUploaderProps> = ({
  bannerUrl,
  bannerFileName,
  bannerFileSize,
  onBannerChange,
  onBannerRemove,
  isUploading = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Optimize and process image using canvas
  const processImageFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported format. Please upload JPG, JPEG, PNG, or WEBP images only.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`Image is too large (${formatBytes(file.size)}). Maximum allowed size is 5 MB.`);
      return;
    }

    // Simulate upload progress with client-side compression
    setUploadProgress(15);
    setUploadStatusText('Reading image file...');

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('Failed to read file from your device. Please try again.');
      setUploadProgress(null);
    };

    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setUploadProgress(45);
      setUploadStatusText('Optimizing image for fast delivery...');

      // Resize if overly large for browser storage resilience
      const img = new Image();
      img.onerror = () => {
        setErrorMessage('Invalid image data. Please select another image.');
        setUploadProgress(null);
      };

      img.onload = () => {
        const MAX_WIDTH = 1440;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to raw data URI
          finishUpload(dataUri, file.name, file.size);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as WebP/JPEG for high compression & visual fidelity
        const optimizedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);

        setUploadProgress(85);
        setUploadStatusText('Saving to local persistent event storage...');

        setTimeout(() => {
          finishUpload(optimizedDataUrl, file.name, file.size);
        }, 250);
      };

      img.src = dataUri;
    };

    reader.readAsDataURL(file);
  };

  const finishUpload = (url: string, fileName: string, fileSize: number) => {
    setUploadProgress(100);
    setUploadStatusText('Upload complete!');

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `events/banners/event_${Date.now()}_${sanitizedName}`;

    onBannerChange({
      url,
      fileName,
      fileSize,
      storagePath,
    });

    setTimeout(() => {
      setUploadProgress(null);
      setUploadStatusText('');
    }, 800);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  // Quick preset samples for demonstration convenience
  const samplePresets = [
    { label: 'AI Hackathon', url: '/src/assets/images/event_ai_hackathon_1791531171162.jpg', name: 'hackathon_stage.jpg' },
    { label: 'Robotics Expo', url: '/src/assets/images/event_robotics_summit_1791531182841.jpg', name: 'robotics_arena.jpg' },
    { label: 'Cultural Fest', url: '/src/assets/images/event_cultural_fest_1791531195822.jpg', name: 'cultural_fest.jpg' },
    { label: 'Startup Summit', url: '/src/assets/images/event_startup_pitch_1791531209456.jpg', name: 'startup_pitch.jpg' },
  ];

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    onBannerChange({
      url: preset.url,
      fileName: preset.name,
      fileSize: 450 * 1024,
      storagePath: `events/banners/${preset.name}`,
    });
    setErrorMessage(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
            Upload Event Banner or Poster
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Recommended aspect ratio 16:9. Formats: JPG, PNG, WEBP up to 5 MB.
          </p>
        </div>

        {bannerUrl && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Poster</span>
            </button>
            <button
              type="button"
              onClick={onBannerRemove}
              className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploadProgress !== null && (
        <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-800/80 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-200 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>{uploadStatusText}</span>
            </span>
            <span className="font-mono font-bold text-indigo-300 tabular-nums">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Drag & Drop / Preview Box */}
      {bannerUrl ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group shadow-lg shadow-slate-950/40">
          <div className="aspect-video w-full max-h-72 overflow-hidden bg-slate-900 flex items-center justify-center">
            <img
              src={bannerUrl}
              alt="Event Poster Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          {/* Overlay Metadata Bar */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 truncate max-w-sm">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-white truncate">{bannerFileName || 'Custom Event Poster'}</span>
              {bannerFileSize && (
                <span className="text-[11px] text-slate-400 font-mono">({formatBytes(bannerFileSize)})</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-bold text-emerald-300 font-mono">
                READY FOR DISPLAY
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Target Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01]'
              : 'border-slate-800 hover:border-indigo-500/60 bg-slate-950/60 hover:bg-slate-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-950/40">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-white">
              Drag and drop your event poster here, or browse files
            </p>
            <p className="text-xs text-slate-400">
              High-resolution horizontal banners (16:9) work best. Supports JPG, PNG, WEBP up to 5 MB.
            </p>
          </div>

          <button
            type="button"
            className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold shadow transition-colors"
          >
            Browse From Device
          </button>
        </div>
      )}

      {/* Quick Demonstration Preset Picker */}
      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Or pick a high-res sample poster:</span>
        </span>
        {samplePresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-white transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Storage Information note */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 font-semibold">Storage Architecture: </strong>
          Images are stored persistently in browser local storage as optimized URIs. When Firebase Storage is provisioned, files automatically upload to the designated cloud bucket.
        </div>
      </div>
    </div>
  );
};
