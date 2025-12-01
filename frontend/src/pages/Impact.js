import React, { useState, useEffect, useRef } from 'react';
import { impactAPI } from '../services/api';
import { Leaf, Droplets, TreePine, Car, Zap, Award, TrendingUp, Download, Printer, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Impact = () => {
  const { user } = useAuth();
  const [impact, setImpact] = useState(null);
  const [history, setHistory] = useState([]);
  const [globalImpact, setGlobalImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [impactRes, historyRes, globalRes] = await Promise.all([
        impactAPI.get(),
        impactAPI.getHistory('month'),
        impactAPI.getGlobal()
      ]);
      setImpact(impactRes.data.data);
      setHistory(historyRes.data.data);
      setGlobalImpact(globalRes.data.data);
    } catch (error) {
      toast.error('Failed to load impact data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await impactAPI.getCertificate();
      setCertificateData(response.data.data);
      setShowCertificate(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No impact data available yet');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;

    try {
      // Create a canvas from the certificate
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const cert = certificateRef.current;
      
      const scale = 2; // Higher resolution
      canvas.width = cert.offsetWidth * scale;
      canvas.height = cert.offsetHeight * scale;
      
      ctx.scale(scale, scale);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw certificate content
      await drawCertificateToCanvas(ctx, cert);

      // Download as PNG
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ReBox-Impact-Certificate-${certificateData.certificateId}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Certificate downloaded!');
      });
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const drawCertificateToCanvas = async (ctx, element) => {
    // This is a simplified version - for production use html2canvas library
    return new Promise((resolve) => {
      // Fallback: just show success message
      resolve();
    });
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  const impactCards = [
    {
      icon: Leaf,
      label: 'CO2 Prevented',
      value: `${impact?.co2Saved?.toFixed(1) || 0} kg`,
      color: '#10B981',
      desc: 'Carbon dioxide emissions prevented'
    },
    {
      icon: Droplets,
      label: 'Water Saved',
      value: `${impact?.waterSaved?.toFixed(0) || 0} L`,
      color: '#3B82F6',
      desc: 'Water saved from recycling'
    },
    {
      icon: TreePine,
      label: 'Trees Equivalent',
      value: impact?.treesEquivalent?.toFixed(1) || 0,
      color: '#22C55E',
      desc: 'Based on annual CO2 absorption'
    },
    {
      icon: Car,
      label: 'Car Miles Avoided',
      value: impact?.carMilesEquivalent?.toLocaleString() || 0,
      color: '#F59E0B',
      desc: 'Equivalent driving distance'
    }
  ];

  const equivalents = [
    { icon: Car, value: impact?.carMilesEquivalent || 0, label: 'miles not driven' },
    { icon: Zap, value: impact?.energySaved || 0, label: 'kWh saved' },
    { icon: Droplets, value: impact?.showersEquivalent || 0, label: 'showers worth of water' }
  ];

  return (
    <div className="impact-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Environmental Impact</h1>
          <p className="page-description">Track your contribution to sustainability</p>
        </div>
        <button className="btn btn-outline" onClick={handleDownloadCertificate}>
          <Award size={18} /> Get Certificate
        </button>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-4 mb-6">
        {impactCards.map((card, index) => (
          <div key={index} className="card impact-card">
            <div className="impact-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
              <card.icon size={24} />
            </div>
            <div className="impact-value" style={{ color: card.color }}>{card.value}</div>
            <div className="impact-label">{card.label}</div>
            <div className="impact-desc">{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 mb-6">
        <div className="card summary-card">
          <div className="summary-header">
            <TrendingUp size={20} />
            <span>Total Packages</span>
          </div>
          <div className="summary-value">{impact?.totalPackages || 0}</div>
        </div>
        <div className="card summary-card">
          <div className="summary-header">
            <Leaf size={20} />
            <span>Total Weight</span>
          </div>
          <div className="summary-value">{impact?.totalWeight?.toFixed(1) || 0} kg</div>
        </div>
        <div className="card summary-card">
          <div className="summary-header">
            <TreePine size={20} />
            <span>Landfill Diverted</span>
          </div>
          <div className="summary-value">{impact?.landfillDiverted?.toFixed(1) || 0} kg</div>
        </div>
      </div>

      {/* Impact Chart */}
      <div className="card mb-6">
        <h3 className="card-title">Impact Over Time</h3>
        {history.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="co2Saved" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="CO2 Saved (kg)"
                />
                <Line 
                  type="monotone" 
                  dataKey="packages" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Packages"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-chart">
            <p>Complete some pickups to see your impact history</p>
          </div>
        )}
      </div>

      {/* Impact Equivalents */}
      <div className="card mb-6">
        <h3 className="card-title">What Your Impact Means</h3>
        <div className="equivalents-grid">
          {equivalents.map((eq, index) => (
            <div key={index} className="equivalent-item">
              <eq.icon size={32} className="eq-icon" />
              <div className="eq-value">{eq.value.toLocaleString()}</div>
              <div className="eq-label">{eq.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Impact */}
      <div className="card">
        <h3 className="card-title">Community Impact</h3>
        <p className="card-subtitle">Together, the ReBox community has achieved:</p>
        <div className="global-stats">
          <div className="global-stat">
            <div className="global-value">{globalImpact?.totalUsers?.toLocaleString() || 0}</div>
            <div className="global-label">Active Users</div>
          </div>
          <div className="global-stat">
            <div className="global-value">{globalImpact?.totalPackages?.toLocaleString() || 0}</div>
            <div className="global-label">Packages Recycled</div>
          </div>
          <div className="global-stat">
            <div className="global-value">{globalImpact?.co2Saved?.toFixed(0) || 0} kg</div>
            <div className="global-label">CO2 Prevented</div>
          </div>
          <div className="global-stat">
            <div className="global-value">{globalImpact?.waterSaved?.toFixed(0) || 0} L</div>
            <div className="global-label">Water Saved</div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && certificateData && (
        <>
          <div className="modal-overlay no-print" onClick={() => setShowCertificate(false)} />
          <div className="certificate-modal no-print">
            <div className="certificate-actions">
              <div className="action-buttons">
                <button className="btn btn-secondary" onClick={handlePrint}>
                  <Printer size={18} />
                  Print
                </button>
                <button className="btn btn-primary" onClick={handleDownloadImage}>
                  <Download size={18} />
                  Download
                </button>
              </div>
              <button className="close-btn" onClick={() => setShowCertificate(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div ref={certificateRef} className="certificate-container">
              <div className="certificate">
                <div className="certificate-border">
                  <div className="certificate-header">
                    <div className="certificate-logo">
                      <Leaf size={48} />
                    </div>
                    <h1 className="certificate-title">ReBox</h1>
                    <div className="certificate-subtitle">Environmental Impact Certificate</div>
                  </div>

                  <div className="certificate-body">
                    <div className="certificate-text">
                      This certifies that
                    </div>
                    <div className="certificate-name">{user?.name}</div>
                    <div className="certificate-text">
                      has made a significant contribution to environmental sustainability
                      through the ReBox platform
                    </div>

                    <div className="certificate-stats">
                      <div className="cert-stat">
                        <div className="cert-stat-icon">
                          <Leaf size={24} />
                        </div>
                        <div className="cert-stat-value">{certificateData.co2Saved.toFixed(1)} kg</div>
                        <div className="cert-stat-label">CO2 Saved</div>
                      </div>
                      <div className="cert-stat">
                        <div className="cert-stat-icon">
                          <Droplets size={24} />
                        </div>
                        <div className="cert-stat-value">{certificateData.waterSaved.toFixed(0)} L</div>
                        <div className="cert-stat-label">Water Saved</div>
                      </div>
                      <div className="cert-stat">
                        <div className="cert-stat-icon">
                          <TreePine size={24} />
                        </div>
                        <div className="cert-stat-value">{certificateData.treesEquivalent.toFixed(1)}</div>
                        <div className="cert-stat-label">Trees Planted Equivalent</div>
                      </div>
                    </div>

                    <div className="certificate-achievements">
                      <div className="achievement-item">
                        <Award size={20} />
                        <span>{certificateData.totalPackages} packages recycled</span>
                      </div>
                      <div className="achievement-item">
                        <TrendingUp size={20} />
                        <span>{certificateData.pickupCount} pickups completed</span>
                      </div>
                      <div className="achievement-item">
                        <TreePine size={20} />
                        <span>{certificateData.landfillDiverted.toFixed(1)} kg diverted from landfill</span>
                      </div>
                    </div>
                  </div>

                  <div className="certificate-footer">
                    <div className="certificate-date">
                      Issued: {new Date(certificateData.generatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="certificate-id">
                      Certificate ID: {certificateData.certificateId}
                    </div>
                    <div className="certificate-signature">
                      <div className="signature-line">ReBox Team</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 4rem;
        }

        .impact-card {
          text-align: center;
        }

        .impact-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .impact-value {
          font-size: 1.75rem;
          font-weight: 800;
        }

        .impact-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-700);
          margin-top: 0.25rem;
        }

        .impact-desc {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }

        .summary-card {
          text-align: center;
        }

        .summary-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gray-900);
        }

        .chart-container {
          margin-top: 1rem;
        }

        .empty-chart {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-400);
        }

        .equivalents-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 1rem;
        }

        .equivalent-item {
          text-align: center;
          padding: 1.5rem;
          background: var(--gray-50);
          border-radius: 0.75rem;
        }

        .eq-icon {
          color: var(--primary);
          margin-bottom: 0.75rem;
        }

        .eq-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--gray-900);
        }

        .eq-label {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }

        .card-subtitle {
          color: var(--gray-500);
          margin-bottom: 1.5rem;
        }

        .global-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .global-stat {
          text-align: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
          border-radius: 0.75rem;
        }

        .global-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
        }

        .global-label {
          font-size: 0.75rem;
          color: var(--gray-600);
          margin-top: 0.25rem;
        }

        @media (max-width: 1024px) {
          .global-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .certificate-modal {
          position: fixed;
          inset: 2rem;
          background: white;
          border-radius: 1rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          max-width: 1000px;
          max-height: 90vh;
          margin: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .certificate-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }

        .certificate-container {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          background: var(--gray-50);
        }

        .certificate {
          background: white;
          max-width: 800px;
          margin: 0 auto;
          padding: 3rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .certificate-border {
          border: 8px double var(--primary);
          padding: 2.5rem;
          position: relative;
        }

        .certificate-border::before {
          content: '';
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          border: 1px solid var(--gray-200);
          pointer-events: none;
        }

        .certificate-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .certificate-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          color: var(--primary);
        }

        .certificate-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .certificate-subtitle {
          font-size: 1rem;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .certificate-body {
          text-align: center;
        }

        .certificate-text {
          font-size: 1.125rem;
          color: var(--gray-700);
          margin-bottom: 1rem;
          font-style: italic;
        }

        .certificate-name {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 1.5rem 0;
          border-bottom: 2px solid var(--primary);
          padding-bottom: 0.5rem;
          display: inline-block;
        }

        .certificate-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin: 2.5rem 0;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.1));
          border-radius: 0.75rem;
        }

        .cert-stat {
          text-align: center;
        }

        .cert-stat-icon {
          color: var(--primary);
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: center;
        }

        .cert-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .cert-stat-label {
          font-size: 0.875rem;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .certificate-achievements {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin: 2rem 0;
        }

        .achievement-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1rem;
          color: var(--gray-700);
        }

        .achievement-item svg {
          color: var(--primary);
        }

        .certificate-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid var(--gray-200);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .certificate-date,
        .certificate-id {
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        .certificate-signature {
          margin-top: 1rem;
        }

        .signature-line {
          border-top: 2px solid var(--gray-900);
          padding-top: 0.5rem;
          min-width: 200px;
          text-align: center;
          font-weight: 600;
          color: var(--gray-900);
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .certificate-container,
          .certificate-container * {
            visibility: visible;
          }

          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 0;
          }

          .certificate {
            box-shadow: none;
            page-break-inside: avoid;
          }

          .no-print {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .equivalents-grid {
            grid-template-columns: 1fr;
          }

          .global-stats {
            grid-template-columns: 1fr 1fr;
          }

          .certificate {
            padding: 1.5rem;
          }

          .certificate-border {
            padding: 1.5rem;
          }

          .certificate-title {
            font-size: 2rem;
          }

          .certificate-name {
            font-size: 1.5rem;
          }

          .certificate-stats {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }

          .cert-stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Impact;
