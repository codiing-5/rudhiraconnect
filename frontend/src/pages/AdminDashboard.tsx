import React, { useState, useEffect } from 'react';
import api from '../api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  ShieldAlert, Check, X, Calendar, Plus, FileText, Trash2, 
  AlertCircle, CheckCircle, Clock, MapPin, Building
} from 'lucide-react';

interface PendingDonation {
  id: string;
  donationDate: string;
  bloodBank: string;
  user: {
    name: string;
    email: string;
    college: string;
    district: string;
    bloodGroup: string;
  };
  camp?: { title: string } | null;
}

interface Camp {
  id: string;
  title: string;
  location: string;
  district: string;
  date: string;
  time: string;
  organizer: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'verify' | 'camps' | 'articles'>('verify');
  const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Alerts
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Camp Form states
  const [campTitle, setCampTitle] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campLocation, setCampLocation] = useState('');
  const [campDistrict, setCampDistrict] = useState('');
  const [campDate, setCampDate] = useState('');
  const [campTime, setCampTime] = useState('');
  const [campOrganizer, setCampOrganizer] = useState('');

  // New Article Form states
  const [artTitle, setArtTitle] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artImage, setArtImage] = useState('');
  const [artCategory, setArtCategory] = useState('STORY');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const donationsRes = await api.get('/donations/pending');
      setPendingDonations(donationsRes.data);

      const campsRes = await api.get('/camps');
      setCamps(campsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyDonation = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.put(`/donations/${id}/verify`, { status });
      setActionSuccess(res.data.message);
      // Remove from state list
      setPendingDonations(pendingDonations.filter((d) => d.id !== id));
    } catch (err: any) {
      console.error('Verify error:', err);
      setActionError(err.response?.data?.message || 'Failed to verify donation.');
    }
  };

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle || !campLocation || !campDistrict || !campDate || !campTime || !campOrganizer) {
      setActionError('Please fill in all required fields for the camp.');
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.post('/camps', {
        title: campTitle,
        description: campDesc,
        location: campLocation,
        district: campDistrict,
        date: campDate,
        time: campTime,
        organizer: campOrganizer,
      });

      setActionSuccess(`Camp "${res.data.title}" successfully scheduled!`);
      // Reset fields
      setCampTitle('');
      setCampDesc('');
      setCampLocation('');
      setCampDistrict('');
      setCampDate('');
      setCampTime('');
      setCampOrganizer('');
      // Refetch
      fetchAdminData();
    } catch (err: any) {
      console.error('Create camp error:', err);
      setActionError(err.response?.data?.message || 'Could not create camp.');
    }
  };

  const handleDeleteCamp = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this camp?')) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      await api.delete(`/camps/${id}`);
      setActionSuccess('Camp successfully deleted.');
      setCamps(camps.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error('Delete camp error:', err);
      setActionError(err.response?.data?.message || 'Failed to delete camp.');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artContent) {
      setActionError('Title and content are required for articles.');
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      await api.post('/awareness/articles', {
        title: artTitle,
        content: artContent,
        image: artImage,
        category: artCategory,
      });

      setActionSuccess('Article successfully uploaded to the Awareness Hub!');
      setArtTitle('');
      setArtContent('');
      setArtImage('');
      setArtCategory('STORY');
    } catch (err: any) {
      console.error('Create article error:', err);
      setActionError(err.response?.data?.message || 'Could not upload article.');
    }
  };

  const districts = [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-slate-100 rounded-card p-16 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-semibold">Loading admin panels...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 leading-tight">Admin Coordinator Dashboard</h2>
        <p className="text-xs text-slate-400">Verify logs, schedule regional camps, and write educational modules.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('verify')}
          className={`px-4 py-3.5 border-b-2 transition-all ${
            activeTab === 'verify' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verify Donations ({pendingDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('camps')}
          className={`px-4 py-3.5 border-b-2 transition-all ${
            activeTab === 'camps' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Camps
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-3.5 border-b-2 transition-all ${
            activeTab === 'articles' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Upload Articles
        </button>
      </div>

      {/* Action alerts */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-card text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="bg-red-50 border border-red-100 text-primary p-3 rounded-card text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* TAB 1: VERIFY DONATIONS */}
      {activeTab === 'verify' && (
        <div className="bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden slide-up">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
            Pending Verifications
          </div>

          <div className="divide-y divide-slate-100">
            {pendingDonations.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No pending donation logs to process.</div>
            ) : (
              pendingDonations.map((item) => (
                <div key={item.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <h4 className="font-extrabold text-sm text-slate-900">{item.user.name}</h4>
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {item.user.bloodGroup || 'Blood Group not specified'}
                      </span>
                    </div>

                    <p className="text-slate-500 font-normal leading-tight text-[11px]">
                      College: **{item.user.college}** ({item.user.district})
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> Venue: {item.bloodBank}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" /> Date: {new Date(item.donationDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => handleVerifyDonation(item.id, 'VERIFIED')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-card text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyDonation(item.id, 'REJECTED')}
                      className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-card text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE CAMPS */}
      {activeTab === 'camps' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 slide-up">
          {/* Camp Registration Form */}
          <div className="lg:col-span-1 bg-white border border-slate-100 p-6 rounded-card shadow-sm self-start">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 mb-4">
              Schedule New Camp
            </h3>

            <form onSubmit={handleCreateCamp} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Camp Title *</label>
                <input
                  type="text"
                  placeholder="e.g. NSS Youth Camp"
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Description *</label>
                <textarea
                  placeholder="Details about refreshments, coordinators..."
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none text-xs font-semibold leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Site Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Auditorium Hall"
                  value={campLocation}
                  onChange={(e) => setCampLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">District *</label>
                  <select
                    value={campDistrict}
                    onChange={(e) => setCampDistrict(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-card focus:outline-none bg-white text-xs"
                  >
                    <option value="">Select</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Organizer Unit *</label>
                  <input
                    type="text"
                    placeholder="e.g. NSS Unit 42"
                    value={campOrganizer}
                    onChange={(e) => setCampOrganizer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={campDate}
                    onChange={(e) => setCampDate(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-card focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Time Range *</label>
                  <input
                    type="text"
                    placeholder="09:00 AM - 04:00 PM"
                    value={campTime}
                    onChange={(e) => setCampTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-card shadow font-bold"
              >
                Schedule Drive
              </button>
            </form>
          </div>

          {/* Camps List (2 Columns) */}
          <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-card shadow-sm flex flex-col space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              Active Drives ({camps.length})
            </h3>

            <div className="overflow-y-auto max-h-[400px] divide-y divide-slate-100 pr-1">
              {camps.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-400">No camps scheduled.</p>
              ) : (
                camps.map((camp) => (
                  <div key={camp.id} className="py-4 flex justify-between items-center text-xs font-semibold">
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex gap-2 items-center flex-wrap">
                        <h4 className="font-bold text-slate-900">{camp.title}</h4>
                        <span className="bg-red-50 text-primary border border-red-100 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          {camp.district}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {camp.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(camp.date).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCamp(camp.id)}
                      className="p-1.5 border border-slate-200 text-slate-400 hover:text-primary hover:bg-red-50 rounded transition-all shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UPLOAD ARTICLES */}
      {activeTab === 'articles' && (
        <div className="bg-white border border-slate-100 rounded-card p-8 shadow-sm max-w-2xl mx-auto slide-up">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 mb-5">
            Publish Awareness Content
          </h3>

          <form onSubmit={handleCreateArticle} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Article Title *</label>
              <input
                type="text"
                placeholder="e.g. Essential Nutrition Before Donation"
                value={artTitle}
                onChange={(e) => setArtTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1">Content Category *</label>
                <select
                  value={artCategory}
                  onChange={(e) => setArtCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none bg-white"
                >
                  <option value="STORY">Volunteer Success Story</option>
                  <option value="GUIDELINE">Medical Guideline</option>
                  <option value="NEWS">General News / Alerts</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Featured Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={artImage}
                  onChange={(e) => setArtImage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Content Markdown / Body *</label>
              <textarea
                placeholder="Write article details here..."
                value={artContent}
                onChange={(e) => setArtContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-card shadow font-bold"
              >
                Publish Article
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};
