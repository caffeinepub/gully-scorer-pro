// ============================================================
// QR SCANNER MODAL — Scan QR codes via camera
// ============================================================
import { useEffect, useState } from "react";
import { useQRScanner } from "../../qr-code/useQRScanner";

interface QRScannerModalProps {
  onClose: () => void;
}

export default function QRScannerModal({ onClose }: QRScannerModalProps) {
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [handled, setHandled] = useState(false);

  const { qrResults, startScanning, stopScanning, videoRef, canvasRef } =
    useQRScanner({});

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning]);

  // Handle scan results
  useEffect(() => {
    if (handled) return;
    const result = qrResults?.[0];
    if (!result?.data) return;
    setHandled(true);

    if (result.data.includes("#match=")) {
      // Navigate to view-only match URL
      stopScanning();
      window.location.href = result.data;
    } else {
      // Show scanned URL
      setScannedUrl(result.data);
      stopScanning();
    }
  }, [qrResults, handled, stopScanning]);

  const handleOpenLink = () => {
    if (scannedUrl) {
      window.open(scannedUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleRescan = () => {
    setScannedUrl(null);
    setHandled(false);
    startScanning();
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      data-ocid="qr_scanner.modal"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-black/80 z-10">
        <h2 className="font-black text-white text-base">📷 Scan QR Code</h2>
        <button
          type="button"
          className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm active:scale-95 transition-transform"
          onClick={() => {
            stopScanning();
            onClose();
          }}
          data-ocid="qr_scanner.close_button"
        >
          ✕
        </button>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan frame overlay */}
        {!scannedUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-4 border-green-400 rounded-2xl relative">
              <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
              <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
              <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <span className="text-green-300 text-xs font-bold bg-black/50 px-3 py-1 rounded-full">
                  Align QR code here
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Panel */}
      {scannedUrl && (
        <div className="bg-card border-t border-border p-4 flex flex-col gap-3">
          <div className="text-sm font-bold text-green-400">✅ QR Scanned!</div>
          <div className="bg-secondary rounded-xl px-3 py-2">
            <p className="text-xs text-muted-foreground truncate">
              {scannedUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl bg-green-600 text-white font-bold text-sm py-3 active:scale-95 transition-transform"
              onClick={handleOpenLink}
              data-ocid="qr_scanner.primary_button"
            >
              Open Link
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-secondary text-foreground font-bold text-sm py-3 active:scale-95 transition-transform border border-border"
              onClick={handleRescan}
              data-ocid="qr_scanner.secondary_button"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
