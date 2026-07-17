import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Users, Calendar, MapPin, Brain, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Smart Eligibility Checker',
      description: 'Find out if you can donate blood in under 2 minutes with our safe, questionnaire-based tool.',
      icon: ShieldCheck,
      color: 'bg-red-50 text-primary border-red-100',
    },
    {
      title: 'Camp Finder & GPS Map',
      description: 'Search upcoming blood donation camps in your district and view exact locations on our interactive map.',
      icon: MapPin,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    {
      title: 'Blood Buddy Referral',
      description: 'Invite 3 friends to join the challenge, track your referral tree, and earn leaderboard points for your college.',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      title: 'Gemini AI Assistant',
      description: 'Ask questions about preparation tips, safety procedures, recovery, or myths and get instant medical guidance.',
      icon: Brain,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
  ];

  const statistics = [
    { value: '15,420+', label: 'Voluntary Donors' },
    { value: '142+', label: 'Colleges & NSS Units' },
    { value: '870+', label: 'Successful Camps' },
    { value: '25,600+', label: 'Liters Seeded' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-red-800 text-white py-20 px-4 overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-24 translate-x-24 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-950/20 rounded-full translate-y-36 -translate-x-12 blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 slide-up">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
              National Service Scheme (NSS) Collaboration
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              From Awareness <br /> to <span className="text-red-200">Lifesaving</span>.
            </h1>
            <p className="text-base text-red-100 leading-relaxed max-w-xl">
              RudhiraConnect is a full-stack platform designed to remove barriers that prevent blood donation. We guide you through eligibility, connect you to local NSS camps, and reward you for growing the donor network.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-white text-primary font-semibold rounded-card shadow-lg hover:bg-red-50 transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-primary font-semibold rounded-card shadow-lg hover:bg-red-50 transition-all"
                >
                  Register as Donor
                </Link>
              )}
              <Link
                to="/camps"
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-card hover:bg-white/10 transition-all"
              >
                Find Active Camps
              </Link>
            </div>
          </div>

          {/* Graphical Card panel */}
          <div className="hidden lg:flex justify-center items-center relative fade-in">
            <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-8 shadow-2xl max-w-sm w-full space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-full text-red-200">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">NSS Honor Roll</h3>
                  <p className="text-xs text-red-200">Leading Districts this Month</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-card border border-white/5">
                  <span className="text-xs">1. Ernakulam District</span>
                  <span className="text-xs font-bold text-red-200">120 Units</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-card border border-white/5">
                  <span className="text-xs">2. Thiruvananthapuram</span>
                  <span className="text-xs font-bold text-red-200">98 Units</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-card border border-white/5">
                  <span className="text-xs">3. Kozhikode District</span>
                  <span className="text-xs font-bold text-red-200">84 Units</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-red-200">Your donation supports regional IMA government banks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-white py-10 shadow-inner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {statistics.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NSS Alignment Info */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight border-l-4 border-primary pl-4">
              NSS Blood Buddy Challenge
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              National Service Scheme (NSS) units across the country have historically played a vital role in keeping blood banks stocked. The **Blood Buddy Challenge** empowers volunteers to invite 3 new donors to sign up. 
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              When your buddies complete a donation, your college leaderboard score goes up. Digital badges and printable appreciation certificates are issued instantly upon admin verification, validating your service hours.
            </p>
            <div>
              <Link
                to="/guidelines"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Learn donation guidelines &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-center">How It Works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-red-100 text-primary flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Register & Test</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Register as a volunteer and take the interactive eligibility questionnaire.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-red-100 text-primary flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Attend Camp</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Find an upcoming NSS camp in your district and sign up. Refreshments and certificate are provided at the site.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-red-100 text-primary flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Invite 3 Buddies</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Use your referral dashboard to invite classmates and track their contribution points.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Main Platform Features</h2>
            <p className="text-slate-500 text-sm">
              We leverage modern web technologies and AI integrations to encourage regular voluntary blood donation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 rounded-card p-6 flex flex-col space-y-4 text-left"
              >
                <div className={`p-3 rounded-xl border self-start ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">{feature.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed flex-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero CTA */}
      <section className="bg-slate-900 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl font-bold">Ready to make a difference?</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            Become a regular blood buddy. Your single donation can save up to three lives. Register today, test your eligibility, and find a camp near you.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-card transition-colors shadow-lg shadow-primary/20"
            >
              Sign Up Now
            </Link>
            <Link
              to="/guidelines"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-card transition-colors"
            >
              Read FAQs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
