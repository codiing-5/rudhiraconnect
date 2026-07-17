import React, { useState, useEffect } from 'react';
import api from '../api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  Users, UserPlus, Copy, CheckCircle, Share2, Award, 
  Mail, AlertCircle, Sparkles, Send, Check
} from 'lucide-react';

interface Referral {
  id: string;
  inviteeId: string;
  name: string;
  email: string;
  college: string;
  status: string;
  hasDonated: boolean;
  joinedDate: string | null;
}

export const BloodBuddyChallenge: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBloodBuddyData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/blood-buddy');
      setReferrals(res.data.referrals);
      setReferralLink(res.data.referralLink);
      setTotalPoints(res.data.totalPoints);
    } catch (err) {
      console.error('Error fetching Blood Buddy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodBuddyData();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteError(null);
    setInviteSuccess(null);
    setIsSending(true);

    try {
      const res = await api.post('/blood-buddy/invite', { email: inviteEmail });
      setInviteSuccess(res.data.message);
      setInviteEmail('');
      fetchBloodBuddyData();
    } catch (err: any) {
      console.error('Invite error:', err);
      setInviteError(err.response?.data?.message || 'Failed to send invite.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-slate-100 rounded-card p-16 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-semibold">Loading referral tree...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 leading-tight">Blood Buddy Challenge</h2>
        <p className="text-xs text-slate-400">Invite friends to join RudhiraConnect, grow the donor pool, and earn NSS service points.</p>
      </div>

      {/* Point Banner */}
      <div className="bg-gradient-to-r from-primary-dark to-red-600 text-white rounded-card p-6 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        {/* Sparkle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full text-white">
            <Award className="h-7 w-7 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-red-100">Your Campaign Standings</h3>
            <p className="text-xs text-red-200">Earn points when buddies register and complete verified donations.</p>
          </div>
        </div>

        <div className="text-center sm:text-right shrink-0 bg-white/10 px-5 py-2.5 rounded-xl border border-white/15">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-200">Total Score</p>
          <span className="text-2xl font-black">{totalPoints} Points</span>
        </div>
      </div>

      {/* Invite Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Link Copy Widget */}
        <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Share Campaign Link</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Copy your personal referral URL. When classmates sign up using this address, they will connect to your referral tree automatically.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-card text-xs focus:outline-none bg-slate-50 text-slate-500 font-mono select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 text-white rounded-card text-xs font-bold transition-all shadow-sm flex items-center gap-1 shrink-0 ${
                copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Invite by Email Form */}
        <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Send Campaign Email</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Send an email invitation directly to a classmate's inbox to encourage voluntary participation.
            </p>
          </div>

          {inviteSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2 py-2.5 rounded-card text-[10px] flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{inviteSuccess}</span>
            </div>
          )}

          {inviteError && (
            <div className="bg-red-50 border border-red-100 text-primary p-2 py-2.5 rounded-card text-[10px] flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{inviteError}</span>
            </div>
          )}

          <form onSubmit={handleInviteSubmit} className="flex gap-2 text-xs font-semibold">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="buddy@college.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSending || !inviteEmail}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-card text-xs font-bold transition-all shadow flex items-center gap-1 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              {isSending ? 'Sending...' : 'Invite'}
            </button>
          </form>
        </div>
      </div>

      {/* Referral tree section */}
      <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm flex flex-col space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-1.5">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Your Referral Network</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Buddies who registered using your referral code.</p>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-1">
            <Users className="h-6 w-6 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-500">No Buddies Joined Yet</p>
            <p>Share your link to recruit campaign helpers and build your tree.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {referrals.map((buddy) => (
              <div
                key={buddy.id}
                className="border border-slate-100 rounded-card p-4 bg-slate-50/40 space-y-3 hover:border-slate-200 transition-all text-xs"
              >
                <div className="space-y-1 border-b border-slate-100/50 pb-2">
                  <h4 className="font-bold text-slate-800">{buddy.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate leading-none">{buddy.email}</p>
                </div>

                <div className="space-y-2">
                  {/* Status: Joined */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-semibold">User Registration</span>
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-100 flex items-center gap-0.5">
                      <Check className="h-3 w-3" /> Registered (+5 pts)
                    </span>
                  </div>

                  {/* Status: Donated */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-semibold">Verified Donation</span>
                    {buddy.hasDonated ? (
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-100 flex items-center gap-0.5">
                        <Check className="h-3 w-3" /> Donated (+15 pts)
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold border border-slate-200">
                        No donation logged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
