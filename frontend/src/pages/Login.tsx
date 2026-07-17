import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFields = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFields) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      // Save token and user in context
      login(res.data.token, res.data.user);
      
      // Navigate to dashboard or last accessed route
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="bg-white border border-slate-100 rounded-card shadow-md max-w-md w-full p-8 space-y-6 slide-up">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Log in to manage eligibility, invite buddies, or register for camps.
          </p>
        </div>

        {/* Form Error */}
        {apiError && (
          <div className="bg-red-50 border border-red-100 text-primary px-4 py-3 rounded-card text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@college.edu"
              {...register('email')}
              className={`w-full px-3 py-2 border rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                errors.email ? 'border-primary' : 'border-slate-200'
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-primary mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('For simulation: use admin@rudhiraconnect.org/admin123 or donor@gmail.com/donor123')}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`w-full px-3 py-2 border rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-10 ${
                  errors.password ? 'border-primary' : 'border-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-primary mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-xs text-slate-600 font-medium">
              Remember me
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 border border-transparent rounded-card text-sm font-semibold text-white bg-primary hover:bg-primary-dark focus:outline-none transition-all shadow-md shadow-primary/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
