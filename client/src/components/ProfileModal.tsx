import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Camera,
  Compass,
  Check,
  Luggage,
  Bookmark,
  Calendar,
  LogOut,
  Save,
  Clock,
  Sparkles,
  Shield,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_PRESETS } from '../data/authStore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onSwitchUser: (newUser: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onSwitchUser,
}) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [travelPace, setTravelPace] = useState<'Relaxed' | 'Balanced' | 'Packed'>(
    user.travelPace || 'Balanced'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      avatar,
      travelPace,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-300">
              <User className="w-4 h-4 text-orange-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Account & Travel Profile</h2>
              <span className="text-[10px] text-slate-400 block">Manage preferences and travel squad identity</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile preferences successfully saved!</span>
            </div>
          )}

          {/* User Hero Preview & Avatar Selection */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">{name}</h3>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{user.email}</span>
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60">
                  {role}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  Member since {user.joinedDate || '2024'}
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Select Profile Avatar</span>
              <span className="text-[10px] text-slate-400 font-normal">Instant preview</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(p.url)}
                  className={`p-1 rounded-2xl transition-all border cursor-pointer ${avatar === p.url
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                  title={p.label}
                >
                  <img
                    src={p.url}
                    alt={p.label}
                    className="w-full h-10 rounded-xl object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields: Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:bg-white focus:border-slate-900 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trip Persona / Role
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Foodie, Navigator"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:bg-white focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Travel Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What gets you excited when traveling?"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:bg-white focus:border-slate-900 transition-all resize-none"
            />
          </div>

          {/* Travel Preference: Pace */}
          <div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Travel Pace
              </label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {(['Relaxed', 'Balanced', 'Packed'] as const).map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => setTravelPace(pace)}
                    className={`py-2 rounded-xl font-bold transition-all border text-center cursor-pointer ${travelPace === pace
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {pace}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-base font-extrabold text-slate-900 block">{user.tripsCount || 2}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Trips Planned</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-base font-extrabold text-slate-900 block">{user.savedPlacesCount || 14}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Saved Places</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-base font-extrabold text-emerald-600 block">Verified</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Status</span>
            </div>
          </div>

          {/* Switch Demo Persona */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Quick Switch Demo Persona
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    onSwitchUser(demo);
                    setName(demo.name);
                    setRole(demo.role);
                    setAvatar(demo.avatar);
                    setBio(demo.bio || '');
                  }}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${user.id === demo.id
                      ? 'border-orange-500 bg-orange-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <img
                    src={demo.avatar}
                    alt={demo.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-slate-900 block truncate">
                      {demo.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {demo.role.split(' ')[0]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions: Save & Logout */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Log Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
