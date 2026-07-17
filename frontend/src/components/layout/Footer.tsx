import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="bg-primary p-1.5 rounded-full text-white">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Rudhira<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-md">
              RudhiraConnect is a voluntary blood donation platform designed to bridge the gap between donors, blood camps, and NSS cells. Our mission is to raise awareness, simplify eligibility checks, and make every donation count.
            </p>
            <p className="mt-2 text-xs italic text-primary">"From Awareness to Lifesaving"</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/guidelines" className="hover:text-primary transition-colors">Guidelines & FAQ</Link>
              </li>
              <li>
                <Link to="/camps" className="hover:text-primary transition-colors">Donation Camps</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-primary transition-colors">Awareness Hub</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact NSS Cell</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>NSS District Coordination Office, Trivandrum, Kerala, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+91 944 712 3456</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>nss.support@rudhiraconnect.org</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} RudhiraConnect. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link to="/guidelines" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/guidelines" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
