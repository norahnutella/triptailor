import React, { useState } from 'react';
import {
  User,
  Mail,
  Compass,
  DollarSign,
  Heart,
  Luggage,
  Users,
  Shield,
  Check,
  RotateCw,
  LogOut,
  Camera,
  LogIn,
  Sparkles,
  ArrowLeft,
  MapPin,
  Calendar,
  Trash2,
  Eye,
} from 'lucide-react';
import { UserProfile, ViewScreen, TripData } from '../types';

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
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
];

const CUISINES = [
  'Local Street Food',
  'Seafood & Coastal',
  'Fine Dining',
  'Vegetarian & Vegan',
  'Italian',
  'Japanese & Sushi',
  'Indian Spices',
  'Mediterranean',
];

type AuthenticatedProfileViewProps = Omit<ProfileViewProps, 'user'> & { user: UserProfile };

const AuthenticatedProfileView: React.FC<AuthenticatedProfileViewProps> = ({
  onNavigate,
  user,
  onUpdateUser,
  onLogout,
  onOpenAuth,
  showToast,
  savedItineraries,
  onViewSavedItinerary,
  onDeleteSavedItinerary,
}) => {
  // Profile Form State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || 'Curious global wanderer, passionate about local food and hidden gems.');
  const [currency, setCurrency] = useState(user.currency || 'USD ($)');
  const [travelPace, setTravelPace] = useState<'Relaxed' | 'Balanced' | 'Packed'>(user.travelPace || 'Balanced');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    user.preferredCuisines || ['Local Street Food', 'Seafood & Coastal']
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      showToast('Choose an image file smaller than 5 MB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSelectedAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const toggleCuisine = (c: string) => {
    if (selectedCuisines.includes(c)) {
      setSelectedCuisines(selectedCuisines.filter((x) => x !== c));
    } else {
      setSelectedCuisines([...selectedCuisines, c]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updated: UserProfile = {
        ...user,
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        currency,
        travelPace,
        avatar: selectedAvatar,
        preferredCuisines: selectedCuisines,
      };

      await onUpdateUser(updated);
      setIsSaving(false);
      showToast('Profile and travel preferences updated successfully!');
    } catch (error) {
      setIsSaving(false);
      showToast(error instanceof Error ? error.message : 'Unable to save profile.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Traveler Profile & Preferences
            </h1>
            <p className="text-slate-600 text-sm mt-0.5">
              Customize your traveler identity, group pacing, preferred currencies, and dining tastes.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* User Hero Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group shrink-0">
          <img
            src={selectedAvatar}
            alt={name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-orange-500/30 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-1.5 rounded-xl shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">{name}</h2>
            <span className="self-center sm:self-auto px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
              {user.role || 'Trip Lead'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">{email}</p>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{bio}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
              Member since {user.joinedDate || '2024'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
              Currency: {currency}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
              Pacing: {travelPace}
            </span>
          </div>
        </div>
      </div>

      {/* Travel Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center space-y-1">
          <Luggage className="w-5 h-5 text-orange-600 mx-auto" />
          <span className="text-2xl font-extrabold text-slate-900 block">{user.tripsCount || 3}</span>
          <span className="text-xs font-semibold text-slate-500">Trips Planned</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center space-y-1">
          <Heart className="w-5 h-5 text-rose-500 mx-auto" />
          <span className="text-2xl font-extrabold text-slate-900 block">{user.savedPlacesCount || 12}</span>
          <span className="text-xs font-semibold text-slate-500">Saved Places</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center space-y-1">
          <Users className="w-5 h-5 text-blue-600 mx-auto" />
          <span className="text-2xl font-extrabold text-slate-900 block">6</span>
          <span className="text-xs font-semibold text-slate-500">Squad Companions</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center space-y-1">
          <Compass className="w-5 h-5 text-teal-600 mx-auto" />
          <span className="text-2xl font-extrabold text-slate-900 block">4</span>
          <span className="text-xs font-semibold text-slate-500">Countries Visited</span>
        </div>
      </div>

      {/* Saved Itineraries */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">My Itineraries</h2>
            <p className="text-xs text-slate-500 mt-1">Your saved trips are securely stored in your TripTailor account.</p>
          </div>
          <span className="text-xs font-bold text-slate-500">{savedItineraries.length} saved</span>
        </div>

        {savedItineraries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
              <Luggage className="w-6 h-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">No saved itineraries yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">Generate a trip and select Save Itinerary. Your complete day-by-day plan will appear here.</p>
            <button type="button" onClick={() => onNavigate('create')} className="mt-4 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl">Create a Trip</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedItineraries.map((trip) => {
              const stops = trip.days.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
              return (
                <article key={trip.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 truncate">{trip.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{trip.destination}</p>
                      </div>
                      <span className="shrink-0 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">Saved</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-slate-50 rounded-xl p-2.5"><Calendar className="w-3.5 h-3.5 text-orange-600 mb-1" /><span className="text-[10px] text-slate-500 block">Dates</span><strong className="text-[11px] text-slate-800 line-clamp-2">{trip.dates}</strong></div>
                      <div className="bg-slate-50 rounded-xl p-2.5"><Luggage className="w-3.5 h-3.5 text-orange-600 mb-1" /><span className="text-[10px] text-slate-500 block">Duration</span><strong className="text-[11px] text-slate-800">{trip.days.length} days</strong></div>
                      <div className="bg-slate-50 rounded-xl p-2.5"><Users className="w-3.5 h-3.5 text-orange-600 mb-1" /><span className="text-[10px] text-slate-500 block">Plan</span><strong className="text-[11px] text-slate-800">{trip.travelersCount} travelers</strong></div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">{stops} scheduled stops</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onDeleteSavedItinerary(trip.id)} className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                        <button type="button" onClick={() => onViewSavedItinerary(trip)} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />View</button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-600" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Short Bio & Travel Style</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 resize-none"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>Choose Profile Avatar</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {AVATAR_PRESETS.map((avUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avUrl)}
                  className={`w-12 h-12 rounded-xl overflow-hidden ring-2 transition-all cursor-pointer ${
                    selectedAvatar === avUrl
                      ? 'ring-orange-600 scale-105'
                      : 'ring-transparent hover:ring-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={avUrl} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <label className="w-12 h-12 rounded-xl border border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50 flex items-center justify-center cursor-pointer transition-colors" title="Upload a photo from your device">
                <Camera className="w-4 h-4 text-slate-500" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
              </label>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Or upload a profile photo from your device (JPG, PNG, or WebP; up to 5 MB).</p>
          </div>
        </div>

        {/* Travel Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-orange-600" />
            <span>Travel & Itinerary Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 cursor-pointer"
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>INR (₹)</option>
                <option>JPY (¥)</option>
                <option>AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Default Itinerary Pacing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Relaxed', 'Balanced', 'Packed'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTravelPace(p)}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      travelPace === p
                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dining Preferences */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Favorite Cuisines & Dining Styles
            </label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((cuisine) => {
                const isSelected = selectedCuisines.includes(cuisine);
                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleCuisine(cuisine)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 border-orange-300 text-orange-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cuisine}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            {isSaving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const GuestProfileView: React.FC<Omit<ProfileViewProps, 'user' | 'onUpdateUser' | 'onLogout' | 'savedItineraries' | 'onViewSavedItinerary' | 'onDeleteSavedItinerary'>> = ({
  onOpenAuth,
}) => (
  <div className="max-w-3xl mx-auto py-12 px-4 space-y-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
      <User className="w-8 h-8" />
    </div>
    <div className="space-y-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Sign In to Access Your Profile</h1>
      <p className="text-sm text-slate-600 max-w-md mx-auto">Create an account or log in to manage your saved travel destinations, preferences, and travel plans.</p>
    </div>
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <button onClick={() => onOpenAuth('login')} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-2"><LogIn className="w-4 h-4" /><span>Sign In</span></button>
      <button onClick={() => onOpenAuth('signup')} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer">Create Account</button>
    </div>
  </div>
);

export const ProfileView: React.FC<ProfileViewProps> = (props) => {
  if (!props.user) return <GuestProfileView onNavigate={props.onNavigate} onOpenAuth={props.onOpenAuth} showToast={props.showToast} />;
  return <AuthenticatedProfileView {...props} user={props.user} />;
};

