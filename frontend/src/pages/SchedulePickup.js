import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { packageAPI, pickupAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, Clock, MapPin, Package, Check, Recycle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const SchedulePickup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [loadingRecyclers, setLoadingRecyclers] = useState(false);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledSlot: '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    instructions: '',
    recyclerId: null
  });

  const timeSlots = ['9AM-12PM', '12PM-3PM', '3PM-6PM'];

  useEffect(() => {
    fetchAvailablePackages();
  }, []);

  useEffect(() => {
    if (formData.city && formData.state) {
      fetchRecyclers();
    }
  }, [formData.city, formData.state]);

  const fetchAvailablePackages = async () => {
    try {
      const response = await packageAPI.getAll({ myPackages: 'true', status: 'LISTED' });
      setPackages(response.data.data.packages);
    } catch (error) {
      toast.error('Failed to load packages');
    }
  };

  const fetchRecyclers = async () => {
    setLoadingRecyclers(true);
    try {
      const response = await userAPI.getRecyclers({
        city: formData.city,
        state: formData.state
      });
      setRecyclers(response.data.data);
    } catch (error) {
      console.error('Failed to load recyclers:', error);
      setRecyclers([]);
    } finally {
      setLoadingRecyclers(false);
    }
  };

  const togglePackage = (pkgId) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId)
        ? prev.filter((id) => id !== pkgId)
        : [...prev, pkgId]
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (selectedPackages.length === 0) {
      toast.error('Please select at least one package');
      return;
    }

    if (!formData.scheduledDate || !formData.scheduledSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    setLoading(true);
    try {
      const response = await pickupAPI.create({
        packageIds: selectedPackages,
        ...formData
      });
      toast.success('Pickup scheduled successfully!');
      navigate(`/pickups/${response.data.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  const selectedPackagesData = packages.filter((p) => selectedPackages.includes(p.id));
  const totalValue = selectedPackagesData.reduce((sum, p) => sum + p.estimatedValue, 0);
  const totalItems = selectedPackagesData.reduce((sum, p) => sum + p.quantity, 0);
  const estimatedPoints = Math.floor(totalValue * 10) + selectedPackages.length * 5;

  return (
    <div className="schedule-pickup">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Schedule Pickup</h1>
        <p className="page-description">Select packages and choose a pickup time</p>
      </div>

      {/* Progress Steps */}
      <div className="steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">{step > 1 ? <Check size={16} /> : '1'}</div>
          <span>Packages</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">{step > 2 ? <Check size={16} /> : '2'}</div>
          <span>Schedule</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
          <div className="step-number">{step > 3 ? <Check size={16} /> : '3'}</div>
          <span>Recycler</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <span>Confirm</span>
        </div>
      </div>

      <div className="schedule-content">
        {/* Step 1: Select Packages */}
        {step === 1 && (
          <div className="step-content card">
            <h2>Select Packages for Pickup</h2>
            {packages.length > 0 ? (
              <div className="package-selection">
                {packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`package-option ${selectedPackages.includes(pkg.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPackages.includes(pkg.id)}
                      onChange={() => togglePackage(pkg.id)}
                    />
                    <div className="package-info">
                      <span className="package-type">{pkg.type}</span>
                      <span className="package-brand">{pkg.brand || 'No brand'}</span>
                    </div>
                    <div className="package-meta">
                      <span>Qty: {pkg.quantity}</span>
                      <span className="package-value">${pkg.estimatedValue.toFixed(2)}</span>
                    </div>
                    <div className="checkbox-indicator">
                      <Check size={16} />
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="empty-packages">
                <Package size={48} />
                <p>No packages available for pickup</p>
                <button onClick={() => navigate('/packages/new')} className="btn btn-primary">
                  List a Package
                </button>
              </div>
            )}
            <div className="step-actions">
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={selectedPackages.length === 0}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="step-content card">
            <h2>Choose Pickup Time & Location</h2>
            
            <div className="form-section">
              <h3><Calendar size={18} /> Select Date</h3>
              <input
                type="date"
                name="scheduledDate"
                className="form-input"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={getMinDate()}
              />
            </div>

            <div className="form-section">
              <h3><Clock size={18} /> Select Time Slot</h3>
              <div className="time-slots">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`slot-option ${formData.scheduledSlot === slot ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="scheduledSlot"
                      value={slot}
                      checked={formData.scheduledSlot === slot}
                      onChange={handleChange}
                    />
                    <span>{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3><MapPin size={18} /> Pickup Address</h3>
              <div className="address-form">
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      className="form-input"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Special Instructions</label>
                  <textarea
                    name="instructions"
                    className="form-textarea"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Gate code, parking info, etc."
                  />
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(3)}
                disabled={!formData.scheduledDate || !formData.scheduledSlot}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Recycler */}
        {step === 3 && (
          <div className="step-content card">
            <h2>Choose a Recycler</h2>
            <p className="step-description">
              Select a recycler from your area to pick up your packages
            </p>
            
            {loadingRecyclers ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading recyclers in your area...</p>
              </div>
            ) : recyclers.length > 0 ? (
              <div className="recycler-selection">
                {recyclers.map((recycler) => (
                  <label
                    key={recycler.id}
                    className={`recycler-option ${formData.recyclerId === recycler.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="recyclerId"
                      value={recycler.id}
                      checked={formData.recyclerId === recycler.id}
                      onChange={(e) => setFormData({ ...formData, recyclerId: e.target.value })}
                    />
                    <div className="recycler-icon">
                      <Recycle size={24} />
                    </div>
                    <div className="recycler-info">
                      <div className="recycler-name">{recycler.companyName || recycler.name}</div>
                      <div className="recycler-location">{recycler.city}, {recycler.state}</div>
                      <div className="recycler-stats">
                        <Star size={14} />
                        <span>{recycler._count?.pickupsAsRecycler || 0} completed pickups</span>
                      </div>
                    </div>
                    <div className="checkbox-indicator">
                      <Check size={16} />
                    </div>
                  </label>
                ))}
                <div className="recycler-note">
                  <p>💡 Don't see any recyclers? You can still schedule the pickup and we'll assign one automatically.</p>
                </div>
              </div>
            ) : (
              <div className="empty-recyclers">
                <Recycle size={48} />
                <p>No recyclers found in your area</p>
                <span>Don't worry! We'll automatically assign the best recycler for your pickup.</span>
              </div>
            )}

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(4)}
              >
                {formData.recyclerId ? 'Continue' : 'Skip & Auto-Assign'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="step-content card">
            <h2>Confirm Your Pickup</h2>
            
            <div className="confirm-section">
              <h3>Packages ({selectedPackages.length})</h3>
              <div className="confirm-packages">
                {selectedPackagesData.map((pkg) => (
                  <div key={pkg.id} className="confirm-package">
                    <span>{pkg.type}</span>
                    <span>x{pkg.quantity}</span>
                    <span>${pkg.estimatedValue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="confirm-section">
              <h3>Pickup Details</h3>
              <div className="confirm-details">
                <div className="confirm-item">
                  <Calendar size={16} />
                  <span>{new Date(formData.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })} • {formData.scheduledSlot}</span>
                </div>
                <div className="confirm-item">
                  <MapPin size={16} />
                  <span>{formData.address}, {formData.city}, {formData.state} {formData.zipCode}</span>
                </div>
              </div>
            </div>

            <div className="confirm-summary">
              <div className="summary-row">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Value</span>
                <span>${totalValue.toFixed(2)}</span>
              </div>
              <div className="summary-row highlight">
                <span>Reward Points</span>
                <span>+{estimatedPoints} pts</span>
              </div>
            </div>

            {formData.recyclerId && (
              <div className="confirm-section">
                <h3>Selected Recycler</h3>
                <div className="confirm-details">
                  {recyclers.find(r => r.id === formData.recyclerId) && (
                    <div className="confirm-item">
                      <Recycle size={16} />
                      <span>
                        {recyclers.find(r => r.id === formData.recyclerId).companyName || 
                         recyclers.find(r => r.id === formData.recyclerId).name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(3)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Scheduling...' : 'Confirm Pickup'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--gray-600);
          font-size: 0.875rem;
          cursor: pointer;
          margin-bottom: 1.5rem;
        }

        .steps {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-400);
        }

        .step.active {
          color: var(--primary);
        }

        .step.completed {
          color: var(--primary);
        }

        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .step.active .step-number,
        .step.completed .step-number {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .step-line {
          width: 60px;
          height: 2px;
          background: var(--gray-200);
          margin: 0 1rem;
        }

        .schedule-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .step-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .step-description {
          color: var(--gray-600);
          margin-bottom: 1.5rem;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          color: var(--gray-500);
        }

        .recycler-selection {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .recycler-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid var(--gray-200);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .recycler-option:hover {
          border-color: var(--gray-300);
        }

        .recycler-option.selected {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .recycler-option input {
          display: none;
        }

        .recycler-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recycler-info {
          flex: 1;
        }

        .recycler-name {
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .recycler-location {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 0.375rem;
        }

        .recycler-stats {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--gray-600);
        }

        .recycler-stats svg {
          color: #F59E0B;
        }

        .recycler-note {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 0.5rem;
        }

        .recycler-note p {
          font-size: 0.875rem;
          color: #1E40AF;
          margin: 0;
        }

        .empty-recyclers {
          text-align: center;
          padding: 3rem;
          color: var(--gray-400);
        }

        .empty-recyclers svg {
          margin-bottom: 1rem;
        }

        .empty-recyclers p {
          font-size: 1rem;
          font-weight: 500;
          color: var(--gray-600);
          margin-bottom: 0.5rem;
        }

        .empty-recyclers span {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .package-selection {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .package-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid var(--gray-200);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .package-option:hover {
          border-color: var(--gray-300);
        }

        .package-option.selected {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .package-option input {
          display: none;
        }

        .package-info {
          flex: 1;
        }

        .package-type {
          display: block;
          font-weight: 600;
        }

        .package-brand {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .package-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .package-value {
          font-weight: 600;
          color: var(--primary);
        }

        .checkbox-indicator {
          width: 24px;
          height: 24px;
          border: 2px solid var(--gray-300);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .package-option.selected .checkbox-indicator {
          background: var(--primary);
          border-color: var(--primary);
        }

        .empty-packages {
          text-align: center;
          padding: 3rem;
          color: var(--gray-400);
        }

        .empty-packages p {
          margin: 1rem 0;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--gray-700);
        }

        .time-slots {
          display: flex;
          gap: 1rem;
        }

        .slot-option {
          flex: 1;
          padding: 1rem;
          border: 2px solid var(--gray-200);
          border-radius: 0.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .slot-option:hover {
          border-color: var(--gray-300);
        }

        .slot-option.selected {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .slot-option input {
          display: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        .confirm-section {
          margin-bottom: 1.5rem;
        }

        .confirm-section h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-500);
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .confirm-packages {
          background: var(--gray-50);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .confirm-package {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--gray-200);
        }

        .confirm-package:last-child {
          border-bottom: none;
        }

        .confirm-details {
          background: var(--gray-50);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .confirm-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          color: var(--gray-700);
        }

        .confirm-item svg {
          color: var(--gray-400);
        }

        .confirm-summary {
          background: var(--gray-900);
          color: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .summary-row.highlight {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--primary-light);
          padding-top: 0.75rem;
          margin-top: 0.5rem;
          border-top: 1px solid var(--gray-700);
        }

        .step-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }

        @media (max-width: 640px) {
          .time-slots {
            flex-direction: column;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SchedulePickup;
