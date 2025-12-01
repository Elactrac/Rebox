import React, { useState } from 'react';
import { Download, FileText, Database, Calendar, Loader2 } from 'lucide-react';
import { exportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ExportData = ({ type = 'all' }) => {
  const [loading, setLoading] = useState({});
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (exportType) => {
    setLoading(prev => ({ ...prev, [exportType]: true }));

    try {
      let response;
      let filename;
      const params = {};
      
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      switch (exportType) {
        case 'packages':
          response = await exportAPI.packagesCSV(params);
          filename = `rebox-packages-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'pickups':
          response = await exportAPI.pickupsCSV(params);
          filename = `rebox-pickups-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'transactions':
          response = await exportAPI.transactionsCSV(params);
          filename = `rebox-transactions-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'impact':
          response = await exportAPI.impactCSV();
          filename = `rebox-impact-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'userData':
          response = await exportAPI.userDataJSON();
          filename = `rebox-user-data-${new Date().toISOString().split('T')[0]}.json`;
          break;
        default:
          throw new Error('Invalid export type');
      }

      downloadFile(response.data, filename);
      toast.success(`${exportType} data exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setLoading(prev => ({ ...prev, [exportType]: false }));
    }
  };

  const exportOptions = [
    {
      id: 'packages',
      title: 'Packages',
      description: 'Export all your package listings with details',
      icon: FileText,
      format: 'CSV',
      visible: ['all', 'packages'].includes(type)
    },
    {
      id: 'pickups',
      title: 'Pickups',
      description: 'Export your pickup history and schedules',
      icon: FileText,
      format: 'CSV',
      visible: ['all', 'pickups'].includes(type)
    },
    {
      id: 'transactions',
      title: 'Transactions',
      description: 'Export your reward points transactions',
      icon: FileText,
      format: 'CSV',
      visible: ['all', 'transactions'].includes(type)
    },
    {
      id: 'impact',
      title: 'Impact Report',
      description: 'Export your environmental impact summary',
      icon: FileText,
      format: 'CSV',
      visible: ['all', 'impact'].includes(type)
    },
    {
      id: 'userData',
      title: 'Complete Data',
      description: 'Export all your data (GDPR compliant)',
      icon: Database,
      format: 'JSON',
      visible: ['all', 'userData'].includes(type)
    }
  ].filter(opt => opt.visible);

  return (
    <div className="export-data">
      <div className="export-header">
        <h3 className="export-title">
          <Download size={20} />
          Export Your Data
        </h3>
        <p className="export-description">
          Download your data in CSV or JSON format for your records or analysis.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <Calendar size={18} className="date-icon" />
        <div className="date-inputs">
          <div className="date-group">
            <label>From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="date-input"
            />
          </div>
          <div className="date-group">
            <label>To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="date-input"
            />
          </div>
          {(dateRange.from || dateRange.to) && (
            <button 
              className="clear-dates"
              onClick={() => setDateRange({ from: '', to: '' })}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="export-options">
        {exportOptions.map((option) => (
          <div key={option.id} className="export-option">
            <div className="option-info">
              <option.icon size={24} className="option-icon" />
              <div>
                <h4>{option.title}</h4>
                <p>{option.description}</p>
              </div>
            </div>
            <div className="option-action">
              <span className="format-badge">{option.format}</span>
              <button
                className="export-btn"
                onClick={() => handleExport(option.id)}
                disabled={loading[option.id]}
              >
                {loading[option.id] ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {loading[option.id] ? 'Exporting...' : 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .export-data {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .export-header {
          margin-bottom: 1.5rem;
        }

        .export-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }

        .export-description {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .date-filter {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: var(--gray-50);
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .date-icon {
          color: var(--gray-400);
          margin-top: 0.25rem;
        }

        .date-inputs {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 1rem;
        }

        .date-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date-group label {
          font-size: 0.75rem;
          color: var(--gray-500);
          font-weight: 500;
        }

        .date-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--gray-200);
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .clear-dates {
          padding: 0.5rem 0.75rem;
          background: none;
          border: 1px solid var(--gray-300);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: var(--gray-600);
          cursor: pointer;
        }

        .clear-dates:hover {
          background: white;
        }

        .export-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .export-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid var(--gray-200);
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .export-option:hover {
          border-color: var(--primary);
          background: rgba(34, 197, 94, 0.02);
        }

        .option-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .option-icon {
          color: var(--gray-400);
        }

        .option-info h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .option-info p {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .option-action {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .format-badge {
          padding: 0.25rem 0.5rem;
          background: var(--gray-100);
          border-radius: 0.25rem;
          font-size: 0.625rem;
          font-weight: 600;
          color: var(--gray-500);
          text-transform: uppercase;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--primary);
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .export-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .export-option {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .option-action {
            width: 100%;
            justify-content: flex-end;
          }

          .date-inputs {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ExportData;
