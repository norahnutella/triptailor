import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Edit3, Eye, EyeOff, Heart, KeyRound, LogOut, Mail, MapPin, Save, Trash2, User } from 'lucide-react';
import { UserProfile, ViewScreen, TripData } from '../types';
import { apiRequest } from '../data/api';
import { isStrongPassword, STRONG_PASSWORD_HINT } from '../data/authStore';

interface ProfileViewProps {
  onNavigate: (screen: ViewScreen) => void;
  user: UserProfile | null;
  onUpdateUser: (updated: UserProfile) => void | Promise<void>;
  onLogout: () => void;
  onDeleteAccount: () => void | Promise<void>;
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
  onNavigate, user, onUpdateUser, onLogout, onDeleteAccount, onOpenAuth, showToast, savedItineraries, onViewSavedItinerary, onDeleteSavedItinerary,
}) => {


  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone || '');
    setAvatar(user.avatar || '');
    setIsEditingProfile(false);
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
      await onUpdateUser({ ...user, name: name.trim(), phone: phone.trim(), avatar });
      setIsEditingProfile(false);
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
    if (!isStrongPassword(newPassword)) return showToast(STRONG_PASSWORD_HINT);
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

  const deleteAccount = async () => {
    const confirmed = window.confirm('Delete your account and all saved trips, itineraries, and messages? This cannot be undone.');
    if (!confirmed) return;
    setDeletingAccount(true);
    try {
      await onDeleteAccount();
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Profile</h1><p className="text-sm text-slate-500 mt-1">Manage your account and travel preferences.</p></div>
        <button onClick={onLogout} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700"><LogOut className="w-4 h-4" />Log out</button>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5"><div><h2 className="font-bold text-slate-900">Personal details</h2><p className="text-xs text-slate-500 mt-1">Update your name, phone number, or profile photo.</p></div>{!isEditingProfile && <button onClick={() => setIsEditingProfile(true)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-700"><Edit3 className="w-4 h-4" />Edit</button>}</div>
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="relative">
            {avatar ? <img src={avatar} alt={name || 'Profile'} className="w-24 h-24 rounded-2xl object-cover border border-slate-200" /> : <div className="w-24 h-24 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center"><User className="w-8 h-8" /></div>}
            {isEditingProfile && <button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white" title="Change profile photo"><Camera className="w-4 h-4" /></button>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditingProfile} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed" />
            <label className="block text-xs font-semibold text-slate-500 mt-3 mb-1">Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditingProfile} placeholder="Add your phone number" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed" />
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600"><Mail className="w-4 h-4" />{user.email}</div>
          </div>
        </div>
        {isEditingProfile && <div className="mt-5 flex flex-wrap gap-2">
          {AVATAR_PRESETS.map((url) => <button key={url} onClick={() => setAvatar(url)} className={`rounded-xl overflow-hidden border-2 ${avatar === url ? 'border-orange-500' : 'border-transparent'}`}><img src={url} className="w-10 h-10 object-cover" /></button>)}
        </div>}
        {isEditingProfile && <div className="mt-5 flex justify-end"><button disabled={saving} onClick={saveProfile} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold disabled:opacity-60"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save profile'}</button></div>}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Password</h2><p className="text-xs text-slate-500 mt-1">Your password is hidden for security.</p></div><span className="text-sm tracking-widest text-slate-400">••••••••</span></div>
        <button onClick={() => setShowPasswordForm((v) => !v)} className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"><KeyRound className="w-4 h-4" />Change password</button>
        {showPasswordForm && <form onSubmit={changePassword} className="mt-4 grid gap-3 max-w-md">
          <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          <p className="text-[10px] text-slate-500">{STRONG_PASSWORD_HINT}</p>
          <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          <button type="button" onClick={() => setShowPasswords((v) => !v)} className="w-fit text-xs text-slate-500 inline-flex items-center gap-1">{showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showPasswords ? 'Hide passwords' : 'Show passwords'}</button>
          <button type="submit" className="w-fit px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">Update password</button>
        </form>}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-slate-900">Saved itineraries</h2><span className="text-xs text-slate-500">{savedItineraries.length} saved</span></div>
        {savedItineraries.length === 0 ? <p className="text-sm text-slate-500 py-4">No saved itineraries yet.</p> : <div className="space-y-2">{savedItineraries.map((trip) => <div key={trip.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl p-3"><button onClick={() => onViewSavedItinerary(trip)} className="text-left min-w-0"><p className="text-sm font-bold text-slate-900 truncate">{trip.title}</p><p className="text-xs text-slate-500">{trip.destination} · {trip.dates}</p></button><button onClick={() => onDeleteSavedItinerary(trip.id)} className="p-2 text-slate-400 hover:text-red-600" title="Delete itinerary"><Trash2 className="w-4 h-4" /></button></div>)}</div>}
      </section>

      <section className="border border-red-200 bg-red-50/70 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-red-900">Delete account</h2>
            <p className="text-xs text-red-800/75 mt-1">Permanently remove your account and all associated data.</p>
          </div>
          <button onClick={deleteAccount} disabled={deletingAccount} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-700 text-sm font-bold hover:bg-red-100 disabled:opacity-60 disabled:cursor-wait">
            <Trash2 className="w-4 h-4" />{deletingAccount ? 'Deleting...' : 'Delete account'}
          </button>
        </div>
      </section>
    </div>
  );
};
