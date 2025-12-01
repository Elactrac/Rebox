import React, { useState, useEffect } from 'react';
import { qrAPI } from '../../services/api';
import { Download, Printer, Copy, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const QRCodeDisplay = ({ 
  trackingCode, 
  packageId, 
  size = 200, 
  showActions = true,
  showLabel = true 
}) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, [trackingCode, packageId]);

  const fetchQRCode = async () => {
    setLoading(true);
    try {
      let response;
      if (trackingCode) {
        response = await qrAPI.getPickupQR(trackingCode, 'dataurl');
      } else if (packageId) {
        response = await qrAPI.getPackageQR(packageId, 'dataurl');
      }
      
      if (response?.data?.success) {
        setQrData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrData?.qrCode) return;

    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `rebox-${trackingCode || packageId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const handleCopyUrl = async () => {
    const url = qrData?.trackingUrl || qrData?.packageUrl;
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ReBox QR Code - ${trackingCode || packageId}</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .qr-container {
            text-align: center;
            padding: 2rem;
            border: 2px solid #e5e7eb;
            border-radius: 1rem;
          }
          .qr-code {
            margin-bottom: 1rem;
          }
          .tracking-code {
            font-size: 1.5rem;
            font-weight: bold;
            color: #10B981;
            letter-spacing: 0.1em;
          }
          .scan-text {
            color: #6b7280;
            margin-top: 0.5rem;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <img src="${qrData?.qrCode}" alt="QR Code" class="qr-code" width="200" height="200" />
          <div class="tracking-code">${trackingCode || packageId}</div>
          <div class="scan-text">Scan to track your pickup</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="qr-loading">
        <Loader className="spin" size={32} />
        <span>Generating QR code...</span>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="qr-error">
        <p>Failed to generate QR code</p>
        <button onClick={fetchQRCode} className="btn btn-sm btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="qr-display">
      <div className="qr-image-container">
        <img 
          src={qrData.qrCode} 
          alt={`QR Code for ${trackingCode || packageId}`}
          width={size}
          height={size}
        />
      </div>
      
      {showLabel && trackingCode && (
        <div className="qr-tracking-code">{trackingCode}</div>
      )}
      
      {showLabel && (
        <p className="qr-scan-text">Scan to track</p>
      )}

      {showActions && (
        <div className="qr-actions">
          <button 
            className="qr-action-btn" 
            onClick={handleDownload}
            title="Download"
          >
            <Download size={18} />
          </button>
          <button 
            className="qr-action-btn" 
            onClick={handlePrint}
            title="Print"
          >
            <Printer size={18} />
          </button>
          <button 
            className="qr-action-btn" 
            onClick={handleCopyUrl}
            title="Copy URL"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      )}

      <style>{`
        .qr-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .qr-loading,
        .qr-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
          color: var(--gray-500);
        }

        .qr-image-container {
          padding: 1rem;
          background: white;
          border: 2px solid var(--gray-100);
          border-radius: 0.75rem;
        }

        .qr-tracking-code {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.1em;
          margin-top: 1rem;
        }

        .qr-scan-text {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }

        .qr-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .qr-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--gray-200);
          border-radius: 0.5rem;
          background: white;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
        }

        .qr-action-btn:hover {
          background: var(--gray-50);
          color: var(--primary);
          border-color: var(--primary);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QRCodeDisplay;
