import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Eye, EyeOff, Heart, KeyRound, LogOut, Mail, MapPin, Save, Trash2, User } from 'lucide-react';
import { UserProfile, ViewScreen, TripData } from '../types';
import { SAVED_PLACES } from '../data/mockData';
import { apiRequest } from '../data/api';
import { CURRENCY_OPTIONS } from '../data/currency';

interface ProfileViewProps {
  onNavigate: (screen: ViewScreen) => void;
  user: UserProfile | null;
  onUpdateUser: (updated: UserProfile) => void | Promise<void>;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  showToast: (msg: string) => void;
  savedItineraries: TripData[];
  onViewSavedItinerary: (trip: TripData) => void;
  onDeleteSavedItinerary: (tripId: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate, user, onUpdateUser, onLogout, onOpenAuth, showToast, savedItineraries, onViewSavedItinerary, onDeleteSavedItinerary,
}) => {


  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setAvatar(user.avatar || AVATAR_PRESETS[0]);
    setCurrency(user.currency || 'INR');
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 mx-auto flex items-center justify-center"><User /></div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your Profile</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage your profile and saved trips.</p>
        <button onClick={() => onOpenAuth('login')} className="mt-6 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold">Sign in</button>
      </div>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      await onUpdateUser({ ...user, name: name.trim(), avatar, currency });
      showToast('Profile updated.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      showToast('Choose an image smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) return showToast('New password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return showToast('New passwords do not match.');
    try {
      await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowPasswordForm(false);
      showToast('Password changed successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to change password.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Profile</h1><p className="text-sm text-slate-500 mt-1">Manage your account and travel preferences.</p></div>
        <button onClick={onLogout} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700"><LogOut className="w-4 h-4" />Log out</button>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="relative">
            <img src={avatar} alt={name} className="w-24 h-24 rounded-2xl object-cover border border-slate-200" />
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white" title="Change profile photo"><Camera className="w-4 h-4" /></button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-500" />
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600"><Mail className="w-4 h-4" />{user.email}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {AVATAR_PRESETS.map((url) => <button key={url} onClick={() => setAvatar(url)} className={`rounded-xl overflow-hidden border-2 ${avatar === url ? 'border-orange-500' : 'border-transparent'}`}><img src={url} className="w-10 h-10 object-cover" /></button>)}
        </div>
        <div className="mt-5 flex justify-end"><button disabled={saving} onClick={saveProfile} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold disabled:opacity-60"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save profile'}</button></div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Password</h2><p className="text-xs text-slate-500 mt-1">Your password is hidden for security.</p></div><span className="text-sm tracking-widest text-slate-400">••••••••</span></div>
        <button onClick={() => setShowPasswordForm((v) => !v)} className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"><KeyRound className="w-4 h-4" />Change password</button>
        {showPasswordForm && <form onSubmit={changePassword} className="mt-4 grid gap-3 max-w-md">
          <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          <button type="button" onClick={() => setShowPasswords((v) => !v)} className="w-fit text-xs text-slate-500 inline-flex items-center gap-1">{showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showPasswords ? 'Hide passwords' : 'Show passwords'}</button>
          <button type="submit" className="w-fit px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">Update password</button>
        </form>}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="font-bold text-slate-900">Currency preference</h2>
        <p className="text-xs text-slate-500 mt-1">Itinerary budgets will use this currency.</p>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-4 w-full max-w-sm px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
          {CURRENCY_OPTIONS.map((item) => <option key={item.code} value={item.code}>{item.code} — {item.label} ({item.symbol})</option>)}
        </select>
        <button onClick={saveProfile} disabled={saving} className="mt-3 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold">Save currency</button>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-slate-900">Saved places</h2><span className="text-xs text-slate-500">{SAVED_PLACES.length} places</span></div>
        <div className="grid sm:grid-cols-3 gap-3">
          {SAVED_PLACES.map((place) => <div key={place.id} className="border border-slate-200 rounded-xl overflow-hidden"><img src={place.image} alt={place.name} className="w-full h-28 object-cover" /><div className="p-3"><p className="text-sm font-bold text-slate-900">{place.name}</p><p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{place.location}</p></div></div>)}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-slate-900">Saved itineraries</h2><span className="text-xs text-slate-500">{savedItineraries.length} saved</span></div>
        {savedItineraries.length === 0 ? <p className="text-sm text-slate-500 py-4">No saved itineraries yet.</p> : <div className="space-y-2">{savedItineraries.map((trip) => <div key={trip.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl p-3"><button onClick={() => onViewSavedItinerary(trip)} className="text-left min-w-0"><p className="text-sm font-bold text-slate-900 truncate">{trip.title}</p><p className="text-xs text-slate-500">{trip.destination} · {trip.dates}</p></button><button onClick={() => onDeleteSavedItinerary(trip.id)} className="p-2 text-slate-400 hover:text-red-600" title="Delete itinerary"><Trash2 className="w-4 h-4" /></button></div>)}</div>}
      </section>
    </div>
  );
};
