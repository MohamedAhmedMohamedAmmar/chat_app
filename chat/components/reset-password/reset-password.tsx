'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getAuth } from '../auth';

type Props = {};

const ResetPassword = (props: Props) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${baseUrl}/users/reset-password/request`, { email });
      
      setMessage('If this email exists, you will receive a reset code');
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!code) {
        setError('Reset code is required');
        setLoading(false);
        return;
      }

      if (code.length !== 6) {
        setError('Reset code must be 6 characters');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${baseUrl}/users/reset-password/verify`, { email, code });
      
      setStep('password');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid reset code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!password || !confirmPassword) {
        setError('Both password fields are required');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${baseUrl}/users/reset-password/confirm`, {
        email,
        code,
        newPassword: password,
      });
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCheck} className="text-3xl text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Your password has been successfully reset</p>
          </div>

          <Link
            href="/auth/login"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition block"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 'email' && 'Enter your email address'}
            {step === 'code' && 'Enter the reset code'}
            {step === 'password' && 'Create a new password'}
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-700 dark:text-blue-300 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <div className="text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 dark:bg-purple-600 dark:hover:bg-purple-700 dark:disabled:bg-purple-500 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center justify-center gap-2 transition"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reset Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition text-center text-lg tracking-widest"
              />
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                Check your email for the 6-character code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 dark:bg-purple-600 dark:hover:bg-purple-700 dark:disabled:bg-purple-500 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
              }}
              className="w-full text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center justify-center gap-2 transition"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password !== confirmPassword}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 dark:bg-purple-600 dark:hover:bg-purple-700 dark:disabled:bg-purple-500 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('code');
                setPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="w-full text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center justify-center gap-2 transition"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
