import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  college: z.string().min(1, 'College is required'),
  district: z.string().min(1, 'District is required'),
  bloodGroup: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('ref');
    if (code) {
      setRefCode(code);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // 1. Register User
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        college: data.college,
        district: data.district,
        bloodGroup: data.bloodGroup || null,
      });

      const { token, user } = res.data;

      // 2. Link Referral if referral code is present
      if (refCode) {
        try {
          await api.post('/blood-buddy/link-referral', {
            inviteeId: user.id,
            inviterId: refCode,
          });
        } catch (linkErr) {
          console.error('Error linking referral:', linkErr);
          // Don't fail the user registration if referral link fails
        }
      }

      // Log user in
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setApiError(err.response?.data?.message || 'Registration failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  const districts = [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'O+NEGETIVE'];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="bg-white border border-slate-100 rounded-card shadow-md max-w-lg w-full p-8 space-y-6 slide-up">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-400">
            Sign up to track your voluntary donations and support NSS activities.
          </p>
          {refCode && (
            <div className="inline-block bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2.5 py-1 rounded">
              Referred by friend! Establishing connection upon signup.
            </div>
          )}
        </div>

        {/* Error alert */}
        {apiError && (
          <div className="bg-red-50 border border-red-100 text-primary px-4 py-3 rounded-card text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold">
          {/* Double Column for name/email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-700 mb-1" htmlFor="name">
                Full Name *
              </label>
              <input
                id="name"
                placeholder="John Dev"
                {...register('name')}
                className={`w-full px-3 py-2 border rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.name ? 'border-primary' : 'border-slate-200'
                }`}
              />
              {errors.name && (
                <p className="text-[10px] text-primary mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-slate-700 mb-1" htmlFor="email">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@gmail.com"
                {...register('email')}
                className={`w-full px-3 py-2 border rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.email ? 'border-primary' : 'border-slate-200'
                }`}
              />
              {errors.email && (
                <p className="text-[10px] text-primary mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Double Column for phone/blood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-700 mb-1" htmlFor="phone">
                Phone Number *
              </label>
              <input
                id="phone"
                placeholder="9447123456"
                {...register('phone')}
                className={`w-full px-3 py-2 border rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.phone ? 'border-primary' : 'border-slate-200'
                }`}
              />
              {errors.phone && (
                <p className="text-[10px] text-primary mt-1 font-medium">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-slate-700 mb-1" htmlFor="bloodGroup">
                Blood Group (Optional)
              </label>
              <select
                id="bloodGroup"
                defaultValue=""
                {...register('bloodGroup')}
                className="w-full px-3 py-2 border border-slate-200 rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Double Column for College/District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-700 mb-1" htmlFor="college">
                College / Institution Name *
              </label>
              <input
                id="college"
                placeholder="GEC Ernakulam"
                {...register('college')}
                className={`w-full px-3 py-2 border rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.college ? 'border-primary' : 'border-slate-200'
                }`}
              />
              {errors.college && (
                <p className="text-[10px] text-primary mt-1 font-medium">{errors.college.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-slate-700 mb-1" htmlFor="district">
                District Location *
              </label>
              <select
                id="district"
                defaultValue=""
                {...register('district')}
                className={`w-full px-3 py-2 border rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white ${
                  errors.district ? 'border-primary' : 'border-slate-200'
                }`}
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="text-[10px] text-primary mt-1 font-medium">{errors.district.message}</p>
              )}
            </div>
          </div>

          {/* Double Column for Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-700 mb-1" htmlFor="password">
                Password *
              </label>
              <input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                {...register('password')}
                className={`w-full px-3 py-2 border rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.password ? 'border-primary' : 'border-slate-200'
                }`}
              />
              {errors.password && (
                <p className="text-[10px] text-primary mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-slate-700 mb-1" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Retype password"
                {...register('confirmPassword')}
                className={`w-full px-3 py-2 border rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.confirmPassword ? 'border-primary' : 'border-slate-200'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-[10px] text-primary mt-1 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-slate-50 border border-slate-100 rounded-card p-3 font-normal text-[10px] text-slate-500">
            Note: Medical details (age, weight, medication etc.) are **not** collected during registration. You will answer these in the Eligibility Checker.
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
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
