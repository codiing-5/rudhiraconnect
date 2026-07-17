import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Calendar, Clock, MapPin, Building, Search, CheckCircle, Info, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Camp {
  id: string;
  title: string;
  description: string;
  location: string;
  district: string;
  date: string;
  time: string;
  organizer: string;
  latitude: number;
  longitude: number;
}

interface Registration {
  id: string;
  campId: string;
}

export const Camps: React.FC = () => {
  const { user } = useAuth();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const districts = [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ];

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const campUrl = selectedDistrict ? `/camps?district=${selectedDistrict}` : '/camps';
      const res = await api.get(campUrl);
      setCamps(res.data);

      if (user) {
        const regRes = await api.get('/camps/my-registrations');
        setMyRegistrations(regRes.data);
      }
    } catch (error) {
      console.error('Error fetching camps data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [selectedDistrict, user]);

  const handleRegisterCamp = async (campId: string) => {
    if (!user) return;
    try {
      setMessage(null);
      const res = await api.post(`/camps/${campId}/register`);
      setMessage({ text: res.data.message, type: 'success' });
      // Update registrations
      setMyRegistrations([...myRegistrations, { id: res.data.registration.id, campId }]);
    } catch (error: any) {
      console.error('Camp registration error:', error);
      setMessage({
        text: error.response?.data?.message || 'Could not register for this camp.',
        type: 'error',
      });
    }
  };

  const isRegistered = (campId: string) => {
    return myRegistrations.some((r) => r.campId === campId);
  };

  // Search logic
  const filteredCamps = camps.filter(
    (camp) =>
      camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blood Donation Camps</h1>
        <p className="text-slate-500 text-sm">
          Browse upcoming camps, register for events, and view camp locations using our interactive district planner.
        </p>
      </div>

      {/* Grid: SVG Map and Search Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Map */}
        <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm flex flex-col space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Filter by Map Location</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Click a district on the regional map to filter camps instantly.</p>
          </div>

          {/* Interactive SVG Diagram */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-center items-center relative overflow-hidden aspect-[4/5] min-h-[300px]">
            <svg viewBox="0 0 200 250" className="w-full h-full max-h-[350px]">
              {/* Regional Districts (Mock Shapes of Kerala Coastline Districts) */}
              {/* Kasaragod */}
              <path
                d="M 30,20 L 45,25 L 40,35 L 25,30 Z"
                fill={selectedDistrict === 'Kasaragod' ? '#DC2626' : '#FCA5A5'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Kasaragod' ? '' : 'Kasaragod')}
              />
              <text x="35" y="27" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">KSG</text>

              {/* Kannur */}
              <path
                d="M 40,35 L 60,40 L 55,55 L 35,50 Z"
                fill={selectedDistrict === 'Kannur' ? '#DC2626' : '#FECACA'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Kannur' ? '' : 'Kannur')}
              />
              <text x="44" y="47" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">KNR</text>

              {/* Wayanad */}
              <path
                d="M 60,40 L 80,45 L 85,58 L 55,55 Z"
                fill={selectedDistrict === 'Wayanad' ? '#DC2626' : '#FEE2E2'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Wayanad' ? '' : 'Wayanad')}
              />
              <text x="66" y="52" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">WYD</text>

              {/* Kozhikode */}
              <path
                d="M 35,50 L 55,55 L 60,75 L 40,70 Z"
                fill={selectedDistrict === 'Kozhikode' ? '#DC2626' : '#FECACA'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Kozhikode' ? '' : 'Kozhikode')}
              />
              <text x="42" y="65" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">KKD</text>

              {/* Malappuram */}
              <path
                d="M 55,55 L 85,58 L 80,85 L 50,80 Z"
                fill={selectedDistrict === 'Malappuram' ? '#DC2626' : '#FCA5A5'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Malappuram' ? '' : 'Malappuram')}
              />
              <text x="60" y="73" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">MLP</text>

              {/* Thrissur */}
              <path
                d="M 50,80 L 80,85 L 75,110 L 45,105 Z"
                fill={selectedDistrict === 'Thrissur' ? '#DC2626' : '#FECACA'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Thrissur' ? '' : 'Thrissur')}
              />
              <text x="56" y="98" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">TCR</text>

              {/* Ernakulam */}
              <path
                d="M 45,105 L 75,110 L 80,135 L 50,130 Z"
                fill={selectedDistrict === 'Ernakulam' ? '#DC2626' : '#F87171'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Ernakulam' ? '' : 'Ernakulam')}
              />
              <text x="56" y="125" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">EKM</text>

              {/* Idukki */}
              <path
                d="M 75,110 L 115,115 L 110,145 L 80,135 Z"
                fill={selectedDistrict === 'Idukki' ? '#DC2626' : '#FEE2E2'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Idukki' ? '' : 'Idukki')}
              />
              <text x="90" y="132" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">IDK</text>

              {/* Kottayam */}
              <path
                d="M 50,130 L 80,135 L 85,160 L 55,155 Z"
                fill={selectedDistrict === 'Kottayam' ? '#DC2626' : '#FECACA'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Kottayam' ? '' : 'Kottayam')}
              />
              <text x="60" y="148" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">KTM</text>

              {/* Alappuzha */}
              <path
                d="M 42,150 L 55,155 L 60,185 L 47,180 Z"
                fill={selectedDistrict === 'Alappuzha' ? '#DC2626' : '#FCA5A5'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Alappuzha' ? '' : 'Alappuzha')}
              />
              <text x="46" y="170" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">ALP</text>

              {/* Kollam */}
              <path
                d="M 55,185 L 80,190 L 85,215 L 60,210 Z"
                fill={selectedDistrict === 'Kollam' ? '#DC2626' : '#FECACA'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Kollam' ? '' : 'Kollam')}
              />
              <text x="66" y="202" fill="#1E293B" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">KLM</text>

              {/* Thiruvananthapuram */}
              <path
                d="M 60,210 L 85,215 L 90,240 L 70,240 Z"
                fill={selectedDistrict === 'Thiruvananthapuram' ? '#DC2626' : '#EF4444'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-85 transition-all"
                onClick={() => setSelectedDistrict(selectedDistrict === 'Thiruvananthapuram' ? '' : 'Thiruvananthapuram')}
              />
              <text x="70" y="230" fill="#FFFFFF" fontSize="6" fontWeight="bold" className="pointer-events-none select-none">TVM</text>
            </svg>

            {/* Clear Button */}
            {selectedDistrict && (
              <button
                onClick={() => setSelectedDistrict('')}
                className="absolute bottom-2 right-2 px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-semibold text-slate-600 hover:bg-slate-50 shadow-sm"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Camps List & Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Inputs */}
          <div className="bg-white border border-slate-100 rounded-card p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search camps by title, site location, or coordinator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* District Dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-slate-200 rounded-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback messages */}
          {message && (
            <div
              className={`p-3 rounded-card text-xs border flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : 'bg-red-50 border-red-100 text-primary'
              }`}
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Guidelines notice */}
          <div className="bg-red-50 border border-red-100 rounded-card p-4 text-xs text-primary flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Before Registering:</p>
              <p className="text-slate-600 mt-0.5">
                Volunteers are requested to take the interactive **Eligibility Checker** prior to registration to ensure they fulfill age, weight, and interval conditions.
              </p>
            </div>
          </div>

          {/* Camps display list */}
          {loading ? (
            <div className="bg-white border border-slate-100 rounded-card p-12 text-center shadow-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="text-xs text-slate-500 mt-2 font-semibold">Loading camps...</p>
            </div>
          ) : filteredCamps.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-card p-12 text-center shadow-sm">
              <Calendar className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 mt-2">No camps found</p>
              <p className="text-xs text-slate-400 mt-1">Try changing your search keywords or clearing map selections.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCamps.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white border border-slate-100 hover:border-slate-200 rounded-card p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 transition-all"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="bg-red-50 text-primary border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded">
                        {camp.district}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Building className="h-3 w-3" /> {camp.organizer}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{camp.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{camp.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{new Date(camp.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{camp.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium">{camp.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col justify-end items-center md:items-end gap-3 self-center md:self-stretch">
                    {user ? (
                      isRegistered(camp.id) ? (
                        <div className="flex items-center gap-1.5 px-4 py-2 border border-emerald-100 bg-emerald-50 text-emerald-800 rounded-card text-xs font-semibold select-none">
                          <CheckCircle className="h-4 w-4" />
                          Registered
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegisterCamp(camp.id)}
                          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-card text-xs font-semibold transition-colors shadow-sm"
                        >
                          Register for Camp
                        </button>
                      )
                    ) : (
                      <Link
                        to="/login"
                        className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-card text-xs font-semibold transition-all"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Login to Register
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
