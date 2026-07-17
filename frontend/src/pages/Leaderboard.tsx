import React, { useState, useEffect } from 'react';
import api from '../api';
import { Award, Trophy, Users, Star, Calendar, Medal } from 'lucide-react';

interface MonthlyRanking {
  id: string;
  college: string;
  totalDonations: number;
  bloodBuddyPoints: number;
}

interface AllTimeRanking {
  college: string;
  totalDonations: number;
  bloodBuddyPoints: number;
}

interface IndividualBuddy {
  name: string;
  college: string;
  district: string;
  referralCount: number;
  points: number;
}

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'alltime' | 'individuals'>('monthly');
  const [monthlyRankings, setMonthlyRankings] = useState<MonthlyRanking[]>([]);
  const [allTimeRankings, setAllTimeRankings] = useState<AllTimeRanking[]>([]);
  const [individualRankings, setIndividualRankings] = useState<IndividualBuddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateInfo, setDateInfo] = useState({ month: '', year: '' });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leaderboard');
        setMonthlyRankings(res.data.monthlyRankings);
        setAllTimeRankings(res.data.allTimeRankings);
        setIndividualRankings(res.data.individualRankings);

        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        setDateInfo({
          month: monthNames[res.data.month - 1] || 'Current',
          year: res.data.year || new Date().getFullYear().toString(),
        });
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankStyle = (index: number) => {
    if (index === 0) return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: '🏆' };
    if (index === 1) return { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', icon: '🥈' };
    if (index === 2) return { bg: 'bg-amber-50/40 border-amber-100', text: 'text-amber-800/80', icon: '🥉' };
    return { bg: 'bg-white border-slate-100', text: 'text-slate-600', icon: `#${index + 1}` };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leaderboard & Rankings</h1>
        <p className="text-slate-500 text-sm">
          Celebrate top-performing NSS units, colleges, and voluntary Blood Buddy campaigners leading the mission.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-card transition-all ${
              activeTab === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly College Rank
          </button>
          <button
            onClick={() => setActiveTab('alltime')}
            className={`px-4 py-2 rounded-card transition-all ${
              activeTab === 'alltime' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All-Time College Rank
          </button>
          <button
            onClick={() => setActiveTab('individuals')}
            className={`px-4 py-2 rounded-card transition-all ${
              activeTab === 'individuals' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Blood Buddies
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-card p-12 text-center shadow-sm max-w-3xl mx-auto">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-semibold">Fetching standings...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto slide-up space-y-6">
          {/* Calendar Indicator for Monthly */}
          {activeTab === 'monthly' && (
            <div className="flex items-center justify-center gap-2 bg-red-50 text-primary border border-red-100 py-2.5 rounded-card text-xs font-semibold max-w-sm mx-auto">
              <Calendar className="h-4 w-4" />
              <span>Current Standings: {dateInfo.month} {dateInfo.year}</span>
            </div>
          )}

          {/* Leaderboard Table Grid */}
          <div className="bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3.5 grid grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
              <div className="col-span-2 md:col-span-1">Rank</div>
              <div className="col-span-6 md:col-span-7">College / Volunteer</div>
              {activeTab !== 'individuals' ? (
                <>
                  <div className="col-span-2 text-center">Donations</div>
                  <div className="col-span-2 text-right">Referral Points</div>
                </>
              ) : (
                <>
                  <div className="col-span-2 text-center">Buddies</div>
                  <div className="col-span-2 text-right">Buddy Score</div>
                </>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {/* Monthly Rankings */}
              {activeTab === 'monthly' &&
                (monthlyRankings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No college points recorded this month yet.</div>
                ) : (
                  monthlyRankings.map((item, index) => {
                    const style = getRankStyle(index);
                    return (
                      <div
                        key={item.id}
                        className={`px-6 py-4.5 grid grid-cols-12 items-center text-xs border-l-4 hover:bg-slate-50/50 transition-colors ${
                          index < 3 ? 'border-l-primary' : 'border-l-transparent'
                        }`}
                      >
                        <div className="col-span-2 md:col-span-1 font-bold flex items-center">
                          <span className="text-sm">{style.icon}</span>
                        </div>
                        <div className="col-span-6 md:col-span-7 pr-4">
                          <p className="font-bold text-slate-800 truncate text-sm">{item.college}</p>
                          <span className="text-[10px] text-slate-400 font-medium">NSS Unit Activists</span>
                        </div>
                        <div className="col-span-2 text-center font-extrabold text-slate-800 text-sm">
                          {item.totalDonations}
                        </div>
                        <div className="col-span-2 text-right font-extrabold text-primary text-sm">
                          {item.bloodBuddyPoints}
                        </div>
                      </div>
                    );
                  })
                ))}

              {/* All Time Rankings */}
              {activeTab === 'alltime' &&
                (allTimeRankings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No all-time college stats found.</div>
                ) : (
                  allTimeRankings.map((item, index) => {
                    const style = getRankStyle(index);
                    return (
                      <div
                        key={item.college}
                        className={`px-6 py-4.5 grid grid-cols-12 items-center text-xs border-l-4 hover:bg-slate-50/50 transition-colors ${
                          index < 3 ? 'border-l-primary' : 'border-l-transparent'
                        }`}
                      >
                        <div className="col-span-2 md:col-span-1 font-bold flex items-center">
                          <span className="text-sm">{style.icon}</span>
                        </div>
                        <div className="col-span-6 md:col-span-7 pr-4">
                          <p className="font-bold text-slate-800 truncate text-sm">{item.college}</p>
                          <span className="text-[10px] text-slate-400 font-medium">All-time Aggregate Records</span>
                        </div>
                        <div className="col-span-2 text-center font-extrabold text-slate-800 text-sm">
                          {item.totalDonations}
                        </div>
                        <div className="col-span-2 text-right font-extrabold text-primary text-sm">
                          {item.bloodBuddyPoints}
                        </div>
                      </div>
                    );
                  })
                ))}

              {/* Individual Rankings */}
              {activeTab === 'individuals' &&
                (individualRankings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No buddy campaigner referrals recorded yet.</div>
                ) : (
                  individualRankings.map((item, index) => {
                    const style = getRankStyle(index);
                    return (
                      <div
                        key={index}
                        className={`px-6 py-4.5 grid grid-cols-12 items-center text-xs border-l-4 hover:bg-slate-50/50 transition-colors ${
                          index < 3 ? 'border-l-primary' : 'border-l-transparent'
                        }`}
                      >
                        <div className="col-span-2 md:col-span-1 font-bold flex items-center">
                          <span className="text-sm">{style.icon}</span>
                        </div>
                        <div className="col-span-6 md:col-span-7 pr-4">
                          <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold leading-tight truncate">
                            {item.college} ({item.district})
                          </p>
                        </div>
                        <div className="col-span-2 text-center font-extrabold text-slate-800 text-sm">
                          {item.referralCount}
                        </div>
                        <div className="col-span-2 text-right font-extrabold text-primary text-sm">
                          {item.points}
                        </div>
                      </div>
                    );
                  })
                ))}
            </div>
          </div>

          {/* Gamified rules box */}
          <div className="bg-slate-900 text-white rounded-card p-6 shadow-md flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-full text-primary shrink-0 hidden sm:block">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-red-200">How to score points for your college:</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Every verified blood donation logs **1 donation point** for your college. Referring a classmate through the Blood Buddy Challenge credits **5 points** when they register, and an additional **15 points** when they make a verified donation!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
