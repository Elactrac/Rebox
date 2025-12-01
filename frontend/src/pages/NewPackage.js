import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { packageAPI } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import ImageUpload from '../components/common/ImageUpload';
import toast from 'react-hot-toast';

const NewPackage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    type: 'BOX',
    condition: 'GOOD',
    quantity: 1,
    weight: '',
    brand: '',
    description: '',
    dimensions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData, images };
      if (data.weight) data.weight = parseFloat(data.weight);
      else delete data.weight;
      if (!data.brand) delete data.brand;
      if (!data.description) delete data.description;
      if (!data.dimensions) delete data.dimensions;

      const response = await packageAPI.create(data);
      toast.success('Package listed successfully!');
      navigate(`/packages/${response.data.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create package');
    } finally {
      setLoading(false);
    }
  };

  const packageTypes = [
    { value: 'BOX', label: 'Box', icon: '📦', desc: 'Cardboard boxes, shipping boxes' },
    { value: 'BOTTLE', label: 'Bottle', icon: '🍾', desc: 'Glass or plastic bottles' },
    { value: 'CONTAINER', label: 'Container', icon: '🥡', desc: 'Food containers, tubs' },
    { value: 'BAG', label: 'Bag', icon: '🛍️', desc: 'Reusable bags, packaging bags' },
    { value: 'OTHER', label: 'Other', icon: '📋', desc: 'Other packaging materials' }
  ];

  const conditions = [
    { value: 'EXCELLENT', label: 'Excellent', desc: 'Like new, minimal wear' },
    { value: 'GOOD', label: 'Good', desc: 'Light use, clean' },
    { value: 'FAIR', label: 'Fair', desc: 'Moderate wear, functional' },
    { value: 'POOR', label: 'Poor', desc: 'Heavy wear, still usable' }
  ];

  return (
    <div className="new-package">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">List New Package</h1>
        <p className="page-description">Add your packaging for recycling or reuse</p>
      </div>

      <form onSubmit={handleSubmit} className="package-form card">
        {/* Package Type */}
        <div className="form-section">
          <h3>Package Type</h3>
          <div className="type-grid">
            {packageTypes.map((type) => (
              <label
                key={type.value}
                className={`type-option ${formData.type === type.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={handleChange}
                />
                <span className="type-icon">{type.icon}</span>
                <span className="type-label">{type.label}</span>
                <span className="type-desc">{type.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div className="form-section">
          <h3>Condition</h3>
          <div className="condition-grid">
            {conditions.map((cond) => (
              <label
                key={cond.value}
                className={`condition-option ${formData.condition === cond.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="condition"
                  value={cond.value}
                  checked={formData.condition === cond.value}
                  onChange={handleChange}
                />
                <span className="condition-label">{cond.label}</span>
                <span className="condition-desc">{cond.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="form-section">
          <h3>Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="quantity"
                className="form-input"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                className="form-input"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                name="brand"
                className="form-input"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Amazon, Apple"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dimensions</label>
              <input
                type="text"
                name="dimensions"
                className="form-input"
                value={formData.dimensions}
                onChange={handleChange}
                placeholder="e.g., 12x8x6 inches"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional details about the packaging..."
            />
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>Photos</h3>
          <p className="section-description">Add photos to help recyclers and businesses see your packaging</p>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            type="packages"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'List Package'}
            {!loading && <Save size={18} />}
          </button>
        </div>
      </form>

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

        .package-form {
          max-width: 800px;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }

        .section-description {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 1rem;
        }

        .type-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
        }

        .type-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          border: 2px solid var(--gray-200);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .type-option:hover {
          border-color: var(--gray-300);
        }

        .type-option.selected {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .type-option input {
          display: none;
        }

        .type-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .type-label {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--gray-900);
        }

        .type-desc {
          font-size: 0.7rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }

        .condition-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .condition-option {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          border: 2px solid var(--gray-200);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .condition-option:hover {
          border-color: var(--gray-300);
        }

        .condition-option.selected {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .condition-option input {
          display: none;
        }

        .condition-label {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--gray-900);
        }

        .condition-desc {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }

        @media (max-width: 768px) {
          .type-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .condition-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .type-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default NewPackage;
