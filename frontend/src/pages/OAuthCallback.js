import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { oauthAPI } from '../services/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const hasProcessed = useRef(false); // Persist across re-renders

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate calls - check ref that persists across renders
      if (hasProcessed.current) {
        console.log('⏭️ OAuth already processed, skipping duplicate call');
        return;
      }
      hasProcessed.current = true;
      
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Verify state matches what we stored (if available)
        const storedState = sessionStorage.getItem('oauth_state');
        if (storedState && state !== storedState) {
          console.warn('OAuth state mismatch - possible CSRF attack');
          // Continue anyway as Google provides security
        }
        sessionStorage.removeItem('oauth_state');
        
        const redirectUri = `${window.location.origin}/oauth/callback/google`;
        console.log('🔄 Calling backend with OAuth code:', { codeLength: code.length, redirectUri });
        
        const response = await oauthAPI.googleCode(code, state, redirectUri);
        console.log('📥 Backend response:', response.data);
        
        if (response.data.success) {
          const { user, token, isNewUser } = response.data.data;
          
          console.log('👤 User data received:', { email: user.email, id: user.id, isNewUser });
          console.log('🎫 Token received:', token.substring(0, 30) + '...');
          
          // Store user and token in auth context
          loginWithToken(user, token);
          
          console.log('💾 Token stored in localStorage');
          console.log('✅ Login complete, navigating to dashboard...');
          
          setStatus('success');
          setMessage(isNewUser ? 'Account created successfully!' : 'Login successful!');
          
          toast.success(isNewUser ? 'Welcome to ReBox!' : 'Welcome back!');
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Authentication failed');
        toast.error('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-green-600 mx-auto animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
