import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  ChevronRight,
  Plus,
  Compass,
  Check,
  Sparkles,
  Users,
  Search,
} from 'lucide-react';
import { TripData, ViewScreen, UserProfile } from '../types';
import { RECENT_DESTINATIONS, SAVED_PLACES } from '../data/mockData';

interface DashboardViewProps {
  onNavigate: (screen: ViewScreen, initialDestination?: string) => void;
  user?: UserProfile | null;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  currentTrip?: TripData;
  savedItineraries?: TripData[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  user,
  onOpenAuth,
  currentTrip,
  savedItineraries = [],
}) => {
  const [destinationInput, setDestinationInput] = useState('');
  const [pinnedPlaces, setPinnedPlaces] = useState<string[]>(['sp-1', 'sp-2', 'sp-3']);
  const [notification, setNotification] = useState<string | null>(null);

  const displayName = user ? user.name.split(' ')[0] : 'Explorer';
  const hasActiveTrip = Boolean(currentTrip?.id && currentTrip.days?.length);
  const hasSavedTrips = savedItineraries.length > 0;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSearchSubmit = () => {
    onNavigate('create', destinationInput.trim() || undefined);
  };

  const handleQuickSearch = (dest: string) => {
    onNavigate('create', dest);
  };

  const togglePin = (placeId: string, placeName: string) => {
    if (pinnedPlaces.includes(placeId)) {
      setPinnedPlaces(pinnedPlaces.filter((id) => id !== placeId));
      showToast(`Removed "${placeName}" from saved places`);
    } else {
      setPinnedPlaces([...pinnedPlaces, placeId]);
      showToast(`Saved "${placeName}" to wishlist`);
    }
  };

  if (!user) {
    const features = [
      { icon: Sparkles, title: 'Personalised planning', description: 'Tell TripTailor your destination, dates, budget and interests to shape a trip around you.' },
      { icon: Users, title: 'Plan together', description: 'Invite friends, discuss ideas and vote on places before finalising your shared itinerary.' },
      { icon: Compass, title: 'Discover more', description: 'Explore attractions, food spots, hotels, shopping and activities in one organised experience.' },
    ];

    const steps = [
      ['01', 'Tell us your trip', 'Choose where you want to go, when you are travelling and what you enjoy.'],
      ['02', 'Explore & collaborate', 'Compare recommendations, share ideas and make decisions with your group.'],
      ['03', 'Get your itinerary', 'Turn your choices into a practical day-by-day travel plan with budget visibility.'],
    ];

    const destinations = [
      { name: 'Goa', subtitle: 'Beaches & nightlife', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&auto=format&fit=crop&q=85' },
      { name: 'Kyoto', subtitle: 'Culture & tradition', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&auto=format&fit=crop&q=85' },
      { name: 'Bali', subtitle: 'Nature & adventure', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&auto=format&fit=crop&q=85' },
      { name: 'Paris', subtitle: 'Art & city escapes', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&auto=format&fit=crop&q=85' },
    ];

    return (
      <div className="max-w-7xl mx-auto pb-12 sm:pb-16 space-y-14">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] min-h-[500px] flex items-end shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&auto=format&fit=crop&q=90"
            alt="Scenic travel destination"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/10" />
          <div className="relative z-10 w-full p-7 sm:p-10 lg:p-14">
            <div className="max-w-2xl space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" /> Travel planning, reimagined
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">
                Plan less. <span className="text-orange-300">Experience more.</span>
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-white/85 max-w-xl">
                TripTailor brings travel discovery, group decisions, personalised recommendations, budgeting and day-by-day itineraries into one place.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => onOpenAuth?.('signup')}
                  className="px-5 py-3 bg-orange-500 hover:bg-orange-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2"
                >
                  Start planning free <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth?.('login')}
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer backdrop-blur-sm"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* What TripTailor does */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">Why TripTailor?</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">Everything you need to turn ideas into a real trip.</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">Stop jumping between maps, review pages, chat groups and notes. TripTailor connects the planning process from first idea to final itinerary.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-[2rem] bg-slate-900 px-6 py-9 sm:px-10 sm:py-11 text-white overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative z-10">
            <div className="text-center max-w-xl mx-auto mb-9">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-300">How it works</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">From “Where should we go?” to “Let’s go.”</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {steps.map(([number, title, description], index) => (
                <div key={number} className="relative text-center md:text-left">
                  <div className="text-4xl font-black text-orange-400/80 mb-3">{number}</div>
                  <h3 className="font-bold text-base">{title}</h3>
                  <p className="text-xs leading-relaxed text-slate-300 mt-2">{description}</p>
                  {index < steps.length - 1 && <ChevronRight className="hidden md:block absolute right-0 top-8 w-5 h-5 text-slate-600" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Destination inspiration */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">Get inspired</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">Where will you go next?</h2>
            </div>
            <button onClick={() => onOpenAuth?.('signup')} className="hidden sm:flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer">
              Explore with TripTailor <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {destinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => onOpenAuth?.('signup')}
                className="group relative h-56 sm:h-64 rounded-2xl overflow-hidden text-left cursor-pointer"
              >
                <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-extrabold text-lg">{dest.name}</h3>
                  <p className="text-[11px] text-white/75 mt-0.5">{dest.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center px-5 py-4 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your next adventure starts here.</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">Create an account to build personalised itineraries, save your favourite plans and collaborate with your travel group.</p>
          <button onClick={() => onOpenAuth?.('signup')} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-md">
            Create your TripTailor account
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Clean Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Welcome back, {displayName}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Where would you like to travel next?
          </h1>
          <p className="text-slate-600 text-sm">
            Enter a destination and we'll automatically generate sights, dining, and a day-by-day plan.
          </p>
        </div>

        {/* Simple Search Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="e.g. Kyoto, Bali, Goa, Paris, Rome..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-orange-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
          </div>

          <button
            onClick={handleSearchSubmit}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-xs shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Ideas</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Quick ideas:</span>
          {['Goa', 'Kyoto', 'Bali', 'Paris', 'Amalfi Coast', 'Tokyo'].map((dest) => (
            <button
              key={dest}
              onClick={() => handleQuickSearch(dest)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Your Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Trips</h2>
          <button
            onClick={() => onNavigate('create')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>
        </div>

        {!hasActiveTrip && !hasSavedTrips ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center shadow-xs">
            <p className="text-base font-bold text-slate-900">No trips yet</p>
            <p className="text-sm text-slate-500 mt-2">Your itinerary hub is empty until you create a new plan.</p>
            <button
              onClick={() => onNavigate('create')}
              className="mt-4 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Plan your first trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hasActiveTrip && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80"
                    alt={currentTrip?.destination || 'Trip'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-slate-800">
                    Active Itinerary
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{currentTrip?.title || 'Current Trip'}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{currentTrip?.dates || 'Choose dates'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{currentTrip?.travelersCount || 1} Traveler{(currentTrip?.travelersCount || 1) === 1 ? '' : 's'}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('itinerary')}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Open Itinerary</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!hasActiveTrip && hasSavedTrips && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-center text-center min-h-64 shadow-xs">
                <div>
                  <p className="text-base font-bold text-slate-900">Saved trips are ready</p>
                  <p className="text-sm text-slate-500 mt-2">Open a saved itinerary from your profile to continue planning.</p>
                </div>
              </div>
            )}

            <div
              onClick={() => onNavigate('create')}
              className="bg-slate-50 hover:bg-orange-50/50 border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all min-h-64"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-orange-600 shadow-xs">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Plan a New Journey</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Pick dates, choose places, and let us build your day-by-day plan automatically.
                </p>
              </div>
              <span className="px-4 py-2 bg-white text-orange-600 text-xs font-bold rounded-xl border border-slate-200 shadow-xs">
                Start Planning →
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Popular Destinations Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Popular Destinations</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECENT_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="relative h-36">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {dest.temp}
                </div>
              </div>

              <div className="p-3.5 space-y-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{dest.name}</h4>
                  <p className="text-xs text-slate-500">{dest.country}</p>
                </div>

                <button
                  onClick={() => onNavigate('create', dest.name)}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Plan Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Places */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Saved Places</h2>
          <span className="text-xs text-slate-500 font-medium">
            {pinnedPlaces.length} spots saved
          </span>
        </div>

        {pinnedPlaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center shadow-xs">
            <p className="text-base font-bold text-slate-900">No saved places yet</p>
            <p className="text-sm text-slate-500 mt-2">Pin destinations you like to keep them handy later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SAVED_PLACES.slice(0, 3).map((place) => {
              const isPinned = pinnedPlaces.includes(place.id);
              return (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center gap-3 shadow-xs"
                >
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{place.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{place.location}</p>
                    <span className="text-[10px] font-semibold text-orange-600 block mt-0.5">
                      {place.tag}
                    </span>
                  </div>
                  <button
                    onClick={() => togglePin(place.id, place.name)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${isPinned
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    title={isPinned ? 'Remove from saved' : 'Save'}
                  >
                    {isPinned ? 'Saved' : '+ Save'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
