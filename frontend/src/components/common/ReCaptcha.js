import React, { useRef, useCallback, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const ReCaptcha = ({ 
  onChange, 
  onExpired, 
  onError,
  size = 'normal', // 'normal', 'compact', 'invisible'
  theme = 'light', // 'light', 'dark'
  className = ''
}) => {
  const recaptchaRef = useRef(null);
  const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    // Log if reCAPTCHA is not configured (for debugging)
    if (!siteKey || siteKey === 'your-recaptcha-site-key') {
      console.warn('reCAPTCHA site key not configured. Set REACT_APP_RECAPTCHA_SITE_KEY in .env');
    }
  }, [siteKey]);

  const handleChange = useCallback((token) => {
    if (onChange) {
      onChange(token);
    }
  }, [onChange]);

  const handleExpired = useCallback(() => {
    if (onExpired) {
      onExpired();
    }
    if (onChange) {
      onChange(null);
    }
  }, [onExpired, onChange]);

  const handleError = useCallback(() => {
    if (onError) {
      onError();
    }
    if (onChange) {
      onChange(null);
    }
  }, [onError, onChange]);

  // Don't render if site key is not configured
  if (!siteKey || siteKey === 'your-recaptcha-site-key') {
    return null;
  }

  return (
    <div className={`recaptcha-wrapper ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpired}
        onErrored={handleError}
        size={size}
        theme={theme}
      />
      <style>{`
        .recaptcha-wrapper {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default ReCaptcha;
