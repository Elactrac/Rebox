import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  type = 'packages' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    const validFiles = filesToUpload.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadPackageImages(validFiles);
      const newImages = response.data.data.images;
      onImagesChange([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveImage = async (index) => {
    const imageUrl = images[index];
    const filename = imageUrl.split('/').pop();
    
    try {
      await uploadAPI.deleteFile(type, filename);
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success('Image removed');
    } catch (error) {
      // Still remove from UI even if delete fails
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const getImageSrc = (url) => {
    // Handle both absolute URLs and relative paths
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    const apiUrl = process.env.REACT_APP_API_URL || '';
    return apiUrl.replace('/api', '') + url;
  };

  return (
    <div className="image-upload">
      {/* Upload Area */}
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="upload-content">
            <Loader className="spin" size={32} />
            <p>Uploading...</p>
          </div>
        ) : (
          <div className="upload-content">
            <Upload size={32} />
            <p>Drag & drop images here or click to browse</p>
            <span className="upload-hint">
              Max {maxImages} images, up to 5MB each (JPEG, PNG, GIF, WebP)
            </span>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((url, index) => (
            <div key={index} className="image-preview">
              <img src={getImageSrc(url)} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
              >
                <X size={16} />
              </button>
              {index === 0 && <span className="primary-badge">Primary</span>}
            </div>
          ))}
          
          {/* Add more placeholder */}
          {images.length < maxImages && (
            <div 
              className="image-preview add-more"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={24} />
              <span>Add more</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        .image-upload {
          margin-bottom: 1rem;
        }

        .upload-zone {
          border: 2px dashed var(--gray-300);
          border-radius: 0.75rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--gray-50);
        }

        .upload-zone:hover {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .upload-zone.drag-over {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.1);
        }

        .upload-zone.uploading {
          pointer-events: none;
          opacity: 0.7;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-500);
        }

        .upload-content p {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
        }

        .upload-hint {
          font-size: 0.75rem;
          color: var(--gray-400);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .image-preview {
          position: relative;
          aspect-ratio: 1;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 2px solid var(--gray-200);
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-preview .remove-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .image-preview:hover .remove-btn {
          opacity: 1;
        }

        .primary-badge {
          position: absolute;
          bottom: 0.25rem;
          left: 0.25rem;
          background: var(--primary);
          color: white;
          font-size: 0.625rem;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-weight: 600;
        }

        .image-preview.add-more {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          background: var(--gray-50);
          border-style: dashed;
          cursor: pointer;
          color: var(--gray-400);
        }

        .image-preview.add-more:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .image-preview.add-more span {
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
