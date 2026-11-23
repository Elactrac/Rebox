import React, { useState, useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { qrAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ShippingLabelModal = ({ trackingCode, onClose }) => {
    const [labelData, setLabelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef();

    useEffect(() => {
        fetchLabel();
        // eslint-disable-next-line
    }, [trackingCode]);

    const fetchLabel = async () => {
        try {
            setLoading(true);
            const response = await qrAPI.getShippingLabel(trackingCode);
            setLabelData(response.data.data.label);
        } catch (error) {
            toast.error('Failed to load shipping label');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - ${trackingCode}</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; }
            .label-container { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .qr-code img { width: 150px; height: 150px; }
            .tracking-info { text-align: right; }
            .tracking-number { font-size: 1.5rem; font-weight: bold; font-family: monospace; letter-spacing: 2px; }
            .address-section { display: flex; gap: 40px; margin-bottom: 20px; }
            .address-block h3 { margin: 0 0 10px 0; font-size: 1rem; text-transform: uppercase; color: #555; }
            .address-block p { margin: 0; line-height: 1.5; }
            .details-section { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 20px 0; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .detail-item strong { display: block; text-transform: uppercase; font-size: 0.8rem; color: #555; }
            .detail-item span { font-size: 1.2rem; font-weight: 600; }
            .instructions { font-style: italic; color: #333; }
            .footer { text-align: center; font-size: 0.8rem; color: #555; margin-top: 40px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Shipping Label</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                        </div>
                    ) : labelData ? (
                        <>
                            {/* Printable Area - Hidden in UI but used for Print */}
                            <div className="printable-label" ref={printRef} style={{ padding: '20px', border: '1px solid #ddd', background: 'white' }}>
                                <div className="label-container">
                                    <div className="header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
                                        <div className="qr-code">
                                            <img src={labelData.qrCode} alt="QR Code" style={{ width: '120px' }} />
                                        </div>
                                        <div className="tracking-info" style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>TRACKING NUMBER</div>
                                            <div className="tracking-number" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                                {labelData.trackingCode}
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                <strong>ReBox Standard Shipping</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="address-section" style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                                        <div className="address-block" style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0', color: '#666' }}>FROM</h3>
                                            <p><strong>{labelData.contact.name}</strong></p>
                                            <p>{labelData.address.street}</p>
                                            <p>{labelData.address.city}, {labelData.address.state}</p>
                                            <p>{labelData.contact.phone}</p>
                                        </div>
                                        <div className="address-block" style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0', color: '#666' }}>TO</h3>
                                            <p><strong>ReBox Processing Center</strong></p>
                                            <p>123 Green Way</p>
                                            <p>{labelData.address.city}, {labelData.address.state} {labelData.address.zipCode}</p>
                                        </div>
                                    </div>

                                    <div className="details-section" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '15px 0', marginBottom: '20px' }}>
                                        <div className="detail-item">
                                            <strong style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>DATE</strong>
                                            <span style={{ fontWeight: 'bold' }}>{new Date(labelData.pickupDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>WEIGHT</strong>
                                            <span style={{ fontWeight: 'bold' }}>{labelData.weight?.toFixed(1) || '0.0'} kg</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>ITEMS</strong>
                                            <span style={{ fontWeight: 'bold' }}>{labelData.items}</span>
                                        </div>
                                    </div>

                                    {labelData.instructions && (
                                        <div className="instructions" style={{ fontStyle: 'italic', marginBottom: '20px' }}>
                                            Note: {labelData.instructions}
                                        </div>
                                    )}

                                    <div className="footer" style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>
                                        Generated by ReBox Logistics • scan to view details
                                    </div>
                                </div>
                            </div>

                            <div className="action-buttons" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handlePrint}>
                                    <Printer size={18} /> Print Label
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="error-state">
                            Failed to load label data
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 1rem;
          width: 90%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--gray-900);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0.5rem;
        }

        .close-btn:hover {
          color: var(--danger);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .loading-state {
          padding: 3rem;
          display: flex;
          justify-content: center;
        }

        @media print {
            body * {
                visibility: hidden;
            }
            .printable-label, .printable-label * {
                visibility: visible;
            }
            .printable-label {
                position: absolute;
                left: 0;
                top: 0;
            }
        }
      `}</style>
        </div>
    );
};

export default ShippingLabelModal;
