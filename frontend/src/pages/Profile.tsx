import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  User, Award, Heart, ClipboardCheck, Calendar, ShieldCheck, Mail, Phone, Building, MapPin, Sparkles, BookOpen, UserPlus, Users
} from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface DonationLog {
  id: string;
  donationDate: string;
  bloodBank: string;
  status: string;
  camp?: { title: string } | null;
}

interface EligibilityLog {
  id: string;
  createdAt: string;
  result: string;
  reason: string;
  nextEligibleDate: string | null;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [donations, setDonations] = useState<DonationLog[]>([]);
  const [eligibilityChecks, setEligibilityChecks] = useState<EligibilityLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/profile');
        setProfileUser(res.data.user);
        setBadges(res.data.badges);
        setDonations(res.data.donations);
        setEligibilityChecks(res.data.lastCheck ? [res.data.lastCheck] : []); // let's fetch history if any
        setStats(res.data.stats);

        // Fetch full eligibility checks history
        const eligRes = await api.get('/eligibility/history');
        setEligibilityChecks(eligRes.data);
      } catch (err) {
        console.error('Error fetching profile information:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="h-6 w-6" />;
      case 'Heart': return <Heart className="h-6 w-6" />;
      case 'Award': return <Award className="h-6 w-6" />;
      case 'UserPlus': return <UserPlus className="h-6 w-6" />;
      case 'Users': return <Users className="h-6 w-6" />;
      case 'Calendar': return <Calendar className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">Verified</span>;
      case 'PENDING':
        return <span className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded text-[10px] font-bold">Awaiting Verification</span>;
      default:
        return <span className="bg-red-50 text-primary border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold">Rejected</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-slate-100 rounded-card p-16 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-semibold">Loading profile history...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 leading-tight">My Profile</h2>
        <p className="text-xs text-slate-400">View your active achievements, donation records, and credentials.</p>
      </div>

      {/* Grid: Details & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal info */}
        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm flex flex-col items-center text-center space-y-5">
          {/* Avatar bubble */}
          <div className="h-20 w-20 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center text-3xl font-extrabold shadow-sm">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">{user?.name}</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded mt-1 inline-block uppercase">
              {user?.role === 'ADMIN' ? 'NSS Organizer' : 'Donor Advocate'}
            </span>
          </div>

          <div className="w-full space-y-3.5 pt-4 text-xs font-semibold text-slate-600 border-t border-slate-100 text-left">
            <div className="flex gap-2.5 items-center">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{profileUser?.email || user?.email}</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>{profileUser?.phone || 'N/A'}</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <Building className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{profileUser?.college || user?.college}</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{profileUser?.district || user?.district}</span>
            </div>
            {(profileUser?.bloodGroup || user?.bloodGroup) && (
              <div className="flex gap-2.5 items-center">
                <Heart className="h-4 w-4 text-primary shrink-0" />
                <span>Blood Group: <strong className="text-primary">{profileUser?.bloodGroup || user?.bloodGroup}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): Earned Badges */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-card shadow-sm flex flex-col space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Earned Badges</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Achievements unlocked via voluntary donations, referrals, and learning.</p>
            </div>
          </div>

          {badges.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-xs text-slate-400 space-y-1">
              <Sparkles className="h-6 w-6 text-slate-300 animate-pulse" />
              <p className="font-semibold text-slate-500">No Achievements Yet</p>
              <p>Take the quiz or log your first donation to earn a badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`border rounded-card p-4 flex gap-3.5 items-center ${badge.color}`}
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">{badge.title}</h4>
                    <p className="text-[10px] opacity-80 mt-0.5 leading-relaxed font-semibold">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Donation logs & Deferral logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Log History */}
        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm flex flex-col space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Heart className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Donation Log History</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Logs of all voluntary blood donation drives.</p>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[250px] flex-1">
            {donations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No blood donation logs recorded.</div>
            ) : (
              <div className="space-y-3 pr-1 text-xs">
                {donations.map((log) => (
                  <div
                    key={log.id}
                    className="border border-slate-100 p-3.5 rounded-card bg-slate-50/50 flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">
                        {log.camp?.title || 'Voluntary Donor Drive'}
                      </p>
                      <div className="flex gap-3 text-[10px] text-slate-400 font-semibold">
                        <span>Clinic: {log.bloodBank}</span>
                        <span>Date: {new Date(log.donationDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Eligibility Check History */}
        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm flex flex-col space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Eligibility Screenings</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Records of questionnaire eligibility checks.</p>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[250px] flex-1">
            {eligibilityChecks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No eligibility checks performed.</div>
            ) : (
              <div className="space-y-3 pr-1 text-xs">
                {eligibilityChecks.map((check) => (
                  <div
                    key={check.id}
                    className="border border-slate-100 p-3.5 rounded-card bg-slate-50/50 flex flex-col space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold">
                        Screened: {new Date(check.createdAt).toLocaleDateString('en-GB')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          check.result === 'ELIGIBLE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                            : 'bg-red-50 text-primary border border-red-100'
                        }`}
                      >
                        {check.result === 'ELIGIBLE' ? 'Eligible' : 'Deferred'}
                      </span>
                    </div>

                    {check.reason && (
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        Reason: {check.reason}
                      </p>
                    )}

                    {check.nextEligibleDate && check.result === 'TEMPORARY_DEFERRAL' && (
                      <p className="text-[9px] text-primary font-bold">
                        Re-evaluate Date: {new Date(check.nextEligibleDate).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
