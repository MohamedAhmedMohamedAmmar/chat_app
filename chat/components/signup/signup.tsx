'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Auth from '../auth';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faEye, faEyeSlash, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';

type Props = {};

const Signup = (props: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (pass: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (pass.length < 6) errors.push('At least 6 characters');
    if (!/[A-Z]/.test(pass)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pass)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(pass)) errors.push('One number');
    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!username || !email || !password || !confirmPassword) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        setLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setError(`Password must have: ${passwordValidation.errors.join(', ')}`);
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const response = await Auth.register(username, email, password);
      Auth.saveToken(response.token);
      
      // Redirect to chat page
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join us today and start chatting</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <div className="text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faUser}
                className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Email Input */}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password Input */}n          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-3 space-y-1">
              {password && (
                <div className="text-xs space-y-1">
                  <div className={`flex items-center gap-2 ${password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <FontAwesomeIcon icon={password.length >= 6 ? faCheck : faLock} className="w-3" />
                    <span>At least 6 characters</span>n                  </div>
                  <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <FontAwesomeIcon icon={/[A-Z]/.test(password) ? faCheck : faLock} className="w-3" />
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <FontAwesomeIcon icon={/[a-z]/.test(password) ? faCheck : faLock} className="w-3" />
                    <span>One lowercase letter</span>n                  </div>
                  <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <FontAwesomeIcon icon={/[0-9]/.test(password) ? faCheck : faLock} className="w-3" />
                    <span>One number</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && password && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400">Passwords match</p>
            )}
          </div>

          {/* Terms & Privacy */}
          <label className="flex items-start gap-2 cursor-pointer pb-4">
            <input
              type="checkbox"
              className="w-4 h-4 mt-1 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-green-400"
                />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              I agree to the{' '}
              <Link href="#" className="text-green-600 dark:text-green-400 hover:underline">
                Terms of Service
              </Link>
              and
              <Link href="#" className="text-green-600 dark:text-green-400 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading || !passwordValidation.valid || password !== confirmPassword}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 dark:bg-green-600 dark:hover:bg-green-700 dark:disabled:bg-green-500 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or</span>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
