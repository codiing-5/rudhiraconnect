import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  Heart, ShieldAlert, Award, ClipboardCheck, Users, Calendar, 
  MessageSquareCode, FileText, Plus, CheckCircle, Info, FileSpreadsheet, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileStats {
  eligibilityChecksCount: number;
  campRegistrationsCount: number;
  donationsCount: number;
  verifiedDonationsCount: number;
  certificatesCount: number;
  referralsCount: number;
  joinedReferralsCount: number;
  buddyPoints: number;
}

interface EligibilityStatus {
  result: 'ELIGIBLE' | 'TEMPORARY_DEFERRAL' | 'PERMANENT_DEFERRAL';
  reason: string;
  nextEligibleDate: string | null;
  createdAt: string;
}

interface Certificate {
  id: string;
  certificateUrl: string;
  issuedDate: string;
  donation: {
    donationDate: string;
    bloodBank: string;
    camp?: { title: string } | null;
  };
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [camps, setCamps] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Log donation modal states
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logDate, setLogDate] = useState('');
  const [logBank, setLogBank] = useState('');
  const [logCampId, setLogCampId] = useState('');
  const [logError, setLogError] = useState<string | null>(null);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  // Selected Certificate for preview modal
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/users/profile');
      setStats(profileRes.data.stats);
      setEligibility(profileRes.data.lastCheck);
      
      const certRes = await api.get('/donations/certificates');
      setCertificates(certRes.data);

      const campsRes = await api.get('/camps');
      setCamps(campsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDate || !logBank) {
      setLogError('Please fill in both donation date and blood bank location.');
      return;
    }

    setLogError(null);
    setLogSuccess(null);
    setIsLogging(true);

    try {
      const res = await api.post('/donations/log', {
        campId: logCampId || null,
        donationDate: logDate,
        bloodBank: logBank,
      });

      setLogSuccess(res.data.message);
      // Reset inputs
      setLogDate('');
      setLogBank('');
      setLogCampId('');
      // Refetch
      fetchDashboardData();
      
      setTimeout(() => {
        setLogModalOpen(false);
        setLogSuccess(null);
      }, 2500);
    } catch (err: any) {
      console.error('Log donation error:', err);
      setLogError(err.response?.data?.message || 'Could not log donation. Try again.');
    } finally {
      setIsLogging(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-slate-100 rounded-card p-16 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-semibold">Loading dashboard details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const getEligibilityBanner = () => {
    if (!eligibility) {
      return (
        <div className="bg-orange-50 border border-orange-100 rounded-card p-5 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-orange-800">
          <div className="flex gap-3 items-start">
            <ShieldAlert className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Check Eligibility</p>
              <p className="text-slate-600 mt-0.5">You have not completed an eligibility test yet. Take the quick 2-minute assessment before registering for camps.</p>
            </div>
          </div>
          <Link
            to="/eligibility-checker"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-card font-semibold shrink-0 transition-colors shadow-sm"
          >
            Take Test Now
          </Link>
        </div>
      );
    }

    if (eligibility.result === 'ELIGIBLE') {
      return (
        <div className="bg-emerald-50 border border-emerald-100 rounded-card p-5 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-emerald-800">
          <div className="flex gap-3 items-start">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">You are Eligible to Donate Today!</p>
              <p className="text-slate-600 mt-0.5">Your eligibility screening is active. Find a scheduled camp in your district to make your contribution.</p>
            </div>
          </div>
          <Link
            to="/camps"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-card font-semibold shrink-0 transition-colors shadow-sm"
          >
            Find Camps
          </Link>
        </div>
      );
    }

    if (eligibility.result === 'TEMPORARY_DEFERRAL') {
      return (
        <div className="bg-amber-50 border border-amber-100 rounded-card p-5 text-xs flex gap-3 items-start text-amber-800">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Temporarily Deferred</p>
            <p className="text-slate-600 mt-1">
              **Next Eligible Date:** {new Date(eligibility.nextEligibleDate!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
              **Reason:** {eligibility.reason || 'Safety deferral interval not met.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-100 border border-slate-200 rounded-card p-5 text-xs flex gap-3 items-start text-slate-700">
        <ShieldAlert className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Deferred from Voluntary Donation</p>
          <p className="text-slate-500 mt-1 leading-relaxed">
            Based on your answers, you are deferred from direct blood donation. However, you can still play a vital role! Invite friends to join the **Blood Buddy Challenge** and represent your college NSS cell as an organizer.
          </p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Welcome & Stats Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">Welcome, {user?.name}!</h2>
          <p className="text-xs text-slate-400">Manage your donation metrics and certifications from here.</p>
        </div>

        <button
          onClick={() => setLogModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-card text-xs font-semibold shadow-md shadow-primary/10 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Log Past Donation
        </button>
      </div>

      {/* Dynamic Eligibility Banner */}
      {getEligibilityBanner()}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-100 p-5 rounded-card shadow-sm space-y-2 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed Donations</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-800">{stats?.verifiedDonationsCount || 0}</span>
            <span className="text-[10px] text-slate-400">verified</span>
          </div>
          <p className="text-[10px] text-slate-400">Total logged: {stats?.donationsCount || 0}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-100 p-5 rounded-card shadow-sm space-y-2 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Buddy Referrals</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-800">{stats?.joinedReferralsCount || 0}</span>
            <span className="text-[10px] text-slate-400">registered</span>
          </div>
          <p className="text-[10px] text-slate-400">Total invitations: {stats?.referralsCount || 0}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-100 p-5 rounded-card shadow-sm space-y-2 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Referral Points</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-primary">{stats?.buddyPoints || 0}</span>
            <span className="text-[10px] text-primary/80 font-bold">pts</span>
          </div>
          <p className="text-[10px] text-slate-400">Contributes to college rank</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-100 p-5 rounded-card shadow-sm space-y-2 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Camps Registered</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-800">{stats?.campRegistrationsCount || 0}</span>
            <span className="text-[10px] text-slate-400">drives</span>
          </div>
          <p className="text-[10px] text-slate-400">Upcoming community camps</p>
        </div>
      </div>

      {/* Grid: Certificate Center & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Center (2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-card shadow-sm flex flex-col space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Certificate Center</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Download your digital certificates of appreciation verified by admins.</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px]">
            {certificates.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-1">
                <FileText className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-500">No Certificates Available</p>
                <p>When you log a donation and the admin verifies it, your certificate will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 pr-1">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-slate-100 hover:border-slate-200 rounded-card p-4 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
                  >
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-800">
                        {cert.donation.camp?.title || 'Voluntary Donor Drive'}
                      </p>
                      <div className="flex gap-3 text-[10px] text-slate-400 font-semibold">
                        <span>Clinic: {cert.donation.bloodBank}</span>
                        <span>Date: {new Date(cert.donation.donationDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-primary border border-red-100 rounded-card font-semibold transition-colors flex items-center gap-1 text-[10px]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Certificate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (1 column) */}
        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Quick Actions</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Shortcuts to dashboard features.</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <Link
              to="/eligibility-checker"
              className="flex items-center gap-3 p-3 border border-slate-100 rounded-card text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ClipboardCheck className="h-4.5 w-4.5 text-primary" />
              <span>Eligibility Questionnaire</span>
            </Link>
            <Link
              to="/camps"
              className="flex items-center gap-3 p-3 border border-slate-100 rounded-card text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <MapPin className="h-4.5 w-4.5 text-primary" />
              <span>Browse Donation Camps</span>
            </Link>
            <Link
              to="/blood-buddy"
              className="flex items-center gap-3 p-3 border border-slate-100 rounded-card text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Users className="h-4.5 w-4.5 text-primary" />
              <span>Blood Buddy Challenge</span>
            </Link>
            <Link
              to="/ai-assistant"
              className="flex items-center gap-3 p-3 border border-slate-100 rounded-card text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <MessageSquareCode className="h-4.5 w-4.5 text-primary" />
              <span>Ask Blood Buddy AI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* LOG DONATION MODAL */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 max-w-md w-full space-y-5 slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Log Blood Donation</h3>
              <button onClick={() => setLogModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">&times;</button>
            </div>

            {logError && (
              <div className="bg-red-50 border border-red-100 text-primary p-2.5 rounded-card text-xs flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{logError}</span>
              </div>
            )}

            {logSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-card text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{logSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLogDonationSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Donation Date *</label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Blood Bank / Donation Venue *</label>
                <input
                  type="text"
                  placeholder="e.g. IMA Blood Bank Ernakulam"
                  value={logBank}
                  onChange={(e) => setLogBank(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Select Donation Camp (Optional)</label>
                <select
                  value={logCampId}
                  onChange={(e) => setLogCampId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none bg-white"
                >
                  <option value="">Independent Clinic / Not listed</option>
                  {camps.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-card text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLogging}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-card shadow"
                >
                  {isLogging ? 'Submitting...' : 'Log Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL CERTIFICATE POPUP MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 max-w-2xl w-full space-y-6 relative slide-up my-8">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl select-none"
            >
              &times;
            </button>

            {/* Certificate Print Frame */}
            <div id="print-area" className="border-8 border-double border-primary p-8 text-center space-y-6 bg-amber-50/20 relative overflow-hidden">
              {/* Background watermark */}
              <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none">
                <Heart className="h-80 w-80 fill-current text-primary" />
              </div>

              <div className="space-y-1.5 relative z-10">
                <h2 className="text-xs font-bold tracking-widest text-primary uppercase">National Service Scheme (NSS)</h2>
                <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase">Certificate of Appreciation</h1>
                <p className="text-[10px] text-slate-400 italic font-semibold">Awarded for Voluntary Blood Donation</p>
              </div>

              <div className="space-y-4 my-8 relative z-10">
                <p className="text-xs text-slate-600">This certificate is proudly presented to</p>
                <h3 className="text-xl font-extrabold text-slate-900 border-b border-dashed border-slate-300 pb-2 max-w-sm mx-auto tracking-wide">
                  {user?.name}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 max-w-md mx-auto">
                  for their noble act of voluntary blood donation completed on{' '}
                  <span className="font-bold text-slate-900">
                    {new Date(selectedCert.donation.donationDate).toLocaleDateString()}
                  </span>{' '}
                  at{' '}
                  <span className="font-bold text-slate-900">{selectedCert.donation.bloodBank}</span>. 
                  Your generosity has contributed directly to saving valuable human lives.
                </p>
              </div>

              <div className="grid grid-cols-2 pt-6 relative z-10 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <div className="text-left space-y-1">
                  <p className="border-t border-slate-300 pt-1.5 max-w-[150px]">NSS Coordinator</p>
                  <p className="text-[8px] text-slate-400 font-normal">RudhiraConnect NSS Unit</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-mono text-primary font-bold">{selectedCert.certificateUrl}</p>
                  <p className="text-[8px] text-slate-400 font-normal">Verification Identifier</p>
                </div>
              </div>
            </div>

            {/* Print Action Trigger */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-card text-xs font-semibold shadow transition-colors"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-card text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
