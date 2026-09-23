import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  Minus,
  Check,
  RotateCw,
  Clock,
  ArrowRight,
  Compass,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ViewScreen, ActivityItem } from '../types';
import {
  GeneratedPlace,
  generatePlacesForDestination,
  buildItineraryFromPlaces,
} from '../data/placesGenerator';
import { CalendarDatePicker, DateRangeSelection } from './CalendarDatePicker';
import { CURRENCY_OPTIONS } from '../data/currency';

interface TripCustomizerViewProps {
  onNavigate: (screen: ViewScreen) => void;
  onOpenInvite: () => void;
  onCreateItinerary: (tripData: {
    destination: string;
    dates: string;
    activities: ActivityItem[];
    travelers: number;
    currency: string;
    title: string;
    daysCount?: number;
  }) => void;
  initialDestination?: string;
}

const POPULAR_DESTINATIONS = [
  { name: 'Goa, India', label: 'Goa' },
  { name: 'Kyoto, Japan', label: 'Kyoto' },
  { name: 'Bali, Indonesia', label: 'Bali' },
  { name: 'Paris, France', label: 'Paris' },
  { name: 'Tokyo, Japan', label: 'Tokyo' },
  { name: 'Amalfi Coast, Italy', label: 'Amalfi' },
];

export const TripCustomizerLegacy: React.FC<TripCustomizerViewProps> = ({
  onNavigate,
  onOpenInvite,
  onCreateItinerary,
  initialDestination = 'Goa, India',
}) => {
  // 1. Text input state (typing in this field does NOT automatically generate places)
  const [destinationInput, setDestinationInput] = useState(initialDestination);

  const destinationSuggestions = POPULAR_DESTINATIONS.filter((destination) => {
    const query = destinationInput.trim().toLowerCase();
    return query.length > 0 && destination.name.toLowerCase().includes(query);
  });

  // 2. The destination for which places have actually been generated via "Search"
  const [searchedDestination, setSearchedDestination] = useState(initialDestination);

  // 3. Travel schedule & group size
  const [travelSchedule, setTravelSchedule] = useState('12 Oct – 16 Oct 2025');
  const [tripDaysCount, setTripDaysCount] = useState(5);
  const [showCalendar, setShowCalendar] = useState(true);
  const [travelers, setTravelers] = useState(4);
  const [currency, setCurrency] = useState('INR');
  const [pacing, setPacing] = useState<'Relaxed' | 'Balanced' | 'Fast'>('Balanced');

  // 4. Generated Places State (generated ONLY on pressing the Search button)
  const [places, setPlaces] = useState<GeneratedPlace[]>(() =>
    generatePlacesForDestination(initialDestination, tripDaysCount * 3)
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotification, setSearchNotification] = useState<string | null>(null);

  // 5. Custom Spot Inline Input
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<'Sightseeing' | 'Food & Dining' | 'Beach' | 'Nature' | 'Activity'>('Sightseeing');

  // 6. Loading indicator during itinerary generation
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  // Sync if initialDestination prop changes
  useEffect(() => {
    if (initialDestination && initialDestination !== searchedDestination) {
      setDestinationInput(initialDestination);
      executeSearch(initialDestination);
    }
  }, [initialDestination]);

  const showNotification = (msg: string) => {
    setSearchNotification(msg);
    setTimeout(() => setSearchNotification(null), 3000);
  };

  /**
   * CRITICAL USER DIRECTIVE:
   * Only generate ideas for a place on pressing the "search" button!
   */
  const executeSearch = (targetDestination: string) => {
    const trimmed = targetDestination.trim();
    if (!trimmed) return;

    setIsSearching(true);

    // Simulate clean, responsive feedback
    setTimeout(() => {
      const generated = generatePlacesForDestination(trimmed, tripDaysCount * 3);
      setPlaces(generated);
      setSearchedDestination(trimmed);
      setIsSearching(false);
      showNotification(`Generated ${generated.length} place ideas for ${trimmed}`);
    }, 350);
  };

  const handleSearchClick = () => {
    executeSearch(destinationInput);
  };

  const handleQuickDestinationClick = (destName: string) => {
    setDestinationInput(destName);
    executeSearch(destName);
  };

  // Toggle selection of a place
  const togglePlace = (id: string) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  // Regenerate/shuffle places for currently searched destination
  const handleRefreshPlaces = () => {
    executeSearch(searchedDestination);
  };

  const handleScheduleChange = (selection: DateRangeSelection) => {
    setTravelSchedule(selection.formattedRange);
    setTripDaysCount(selection.daysCount);
    setPlaces(generatePlacesForDestination(searchedDestination, selection.daysCount * 3));
  };

  // Add custom spot
  const handleAddCustomPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newSpot: GeneratedPlace = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      description: `Custom activity added for ${searchedDestination}.`,
      duration: '2.0 hrs',
      estCost: 'Free',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
      tags: ['Custom Stop', customCategory],
      selected: true,
    };

    setPlaces((prev) => [newSpot, ...prev]);
    setCustomName('');
    setIsAddingCustom(false);
    showNotification(`Added custom stop: "${newSpot.name}"`);
  };

  const selectedPlaces = places.filter((p) => p.selected);

  // Final submission: build itinerary and open
  const handleCreateTrip = () => {
    setIsGeneratingItinerary(true);
    setTimeout(() => {
      setIsGeneratingItinerary(false);
      const activities = buildItineraryFromPlaces(searchedDestination, selectedPlaces);
      onCreateItinerary({
        destination: searchedDestination,
        dates: travelSchedule,
        activities,
        travelers,
        currency,
        title: `Your ${searchedDestination.split(',')[0]} Trip`,
        daysCount: tripDaysCount,
      });
    }, 700);
  };

  const hasUnsearchedChanges =
    destinationInput.trim().toLowerCase() !== searchedDestination.trim().toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Toast Notification */}
      {searchNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{searchNotification}</span>
        </div>
      )}

      {/* Simple Header */}
      <div className="text-center space-y-2 pt-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Trip planner</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Plan Your Next Journey
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Type any destination and press <strong>Search</strong> to generate sights, dining, and activities.
        </p>
      </div>

      {/* Step 1: Destination Search Bar & Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-600" />
          <span>1. Where do you want to go?</span>
        </h2>

        {/* Destination Input & Dedicated Search Button */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchClick();
                  }
                }}
                placeholder="Enter destination (e.g. Kyoto, Bali, Goa, Paris, Rome)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-orange-500 focus:bg-white transition-colors"
              />
              {destinationSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="px-3.5 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Real-time suggestions</div>
                  {destinationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.name}
                      type="button"
                      onClick={() => {
                        setDestinationInput(suggestion.name);
                        executeSearch(suggestion.name);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-700 cursor-pointer"
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dedicated Search Button */}
            <button
              type="button"
              onClick={handleSearchClick}
              disabled={isSearching || !destinationInput.trim()}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
              title="Press to generate ideas for this place"
            >
              {isSearching ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          {/* Prompt when user typed something different but hasn't searched yet */}
          {hasUnsearchedChanges && destinationInput.trim().length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-orange-950 animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="truncate font-medium">
                  Press <strong>Search</strong> to generate ideas for <strong>"{destinationInput.trim()}"</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleSearchClick}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
              >
                Search Now
              </button>
            </div>
          )}

          {/* Quick Popular Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500">Popular suggestions:</span>
            {POPULAR_DESTINATIONS.map((dest) => {
              const isCurrent =
                searchedDestination.toLowerCase().includes(dest.name.split(',')[0].toLowerCase());
              return (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => handleQuickDestinationClick(dest.name)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${isCurrent
                    ? 'bg-orange-50 border-orange-300 text-orange-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {dest.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel Dates & Group Size */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                <span>Travel Dates & Schedule</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  {travelSchedule}
                </span>
                <span className="text-[11px] font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full">
                  {tripDaysCount} {tripDaysCount === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Travelers</span>
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 min-w-[65px] text-center">
                    {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelers(travelers + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="self-end">
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span>{showCalendar ? 'Hide Calendar' : 'Change Dates'}</span>
                  {showCalendar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-sm">
            <label className="text-xs font-bold text-slate-700 block mb-1">Trip budget currency</label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-orange-500"
            >
              {CURRENCY_OPTIONS.map((item) => (
                <option key={item.code} value={item.code}>{item.code} - {item.label} ({item.symbol})</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">Your estimated trip total will be shown in this currency.</p>
          </div>

          {/* Interactive Visual Calendar */}
          {showCalendar && (
            <div className="pt-2 animate-in fade-in duration-200">
              <CalendarDatePicker
                onChange={(selection: DateRangeSelection) => {
                  handleScheduleChange(selection);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Generated Ideas & Places (Generated on Search) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-orange-600" />
              <span>2. Ideas & places for {searchedDestination}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {places.length} varied sights, activities, and food spots for your {tripDaysCount}-day trip. Click any card to include or exclude it.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshPlaces}
              disabled={isSearching}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              title="Shuffle suggestions for this destination"
            >
              <RotateCw className={`w-3 h-3 text-slate-500 ${isSearching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3 text-orange-600" />
              <span>Add Custom Spot</span>
            </button>
          </div>
        </div>

        {/* Inline Add Custom Spot Form */}
        {isAddingCustom && (
          <form onSubmit={handleAddCustomPlace} className="p-3.5 bg-orange-50/50 border border-orange-200 rounded-xl space-y-3 animate-in fade-in">
            <span className="text-xs font-bold text-orange-950 block">Add your own favorite place:</span>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Old Town Secret Bakery, Sunset Point"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-orange-500"
              />
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden"
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Beach">Beach</option>
                <option value="Nature">Nature</option>
                <option value="Activity">Activity</option>
              </select>
              <button
                type="submit"
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Add Place
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Loading skeleton when searching */}
        {isSearching ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <RotateCw className="w-6 h-6 text-orange-600 animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              Generating ideas for {destinationInput.trim()}...
            </h4>
            <p className="text-xs text-slate-500">
              Finding highlights, local dining, and top attractions.
            </p>
          </div>
        ) : places.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              No ideas generated yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Type any city or region in the search box above and press <strong>Search</strong> to generate places.
            </p>
            <button
              onClick={handleSearchClick}
              className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg"
            >
              Search Ideas
            </button>
          </div>
        ) : (
          /* Places Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {places.map((place) => (
              <div
                key={place.id}
                onClick={() => togglePlace(place.id)}
                className={`group relative rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer ${place.selected
                  ? 'bg-white border-orange-400 ring-2 ring-orange-400/20 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-100 hover:bg-white'
                  }`}
              >
                <div className="space-y-2.5">
                  {/* Image and badges */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                      {place.category}
                    </span>
                    <div
                      className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${place.selected
                        ? 'bg-orange-600 text-white'
                        : 'bg-white/90 text-slate-400 border border-slate-300'
                        }`}
                    >
                      {place.selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {place.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Meta */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-3 border-t border-slate-100 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{place.duration}</span>
                  </span>
                  <span className="text-slate-700 font-bold">{place.estCost}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Summary Pill */}
        {places.length > 0 && !isSearching && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">
              <strong>{selectedPlaces.length}</strong> of {places.length} places selected for your itinerary
            </span>
            <button
              onClick={() => setPlaces(places.map((p) => ({ ...p, selected: true })))}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              Select All
            </button>
          </div>
        )}
      </div>

      {/* Step 3: Simple Trip Pace */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <span>3. Trip Pace</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'Relaxed',
              label: 'Relaxed',
              desc: '1–2 places per day with plenty of free chill time.',
            },
            {
              id: 'Balanced',
              label: 'Balanced',
              desc: '2–3 places per day. Good mix of sights & relaxing.',
            },
            {
              id: 'Fast',
              label: 'Active',
              desc: '3–4 places per day to see as much as possible.',
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPacing(item.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${pacing === item.id
                ? 'bg-orange-50/70 border-orange-400 ring-1 ring-orange-300'
                : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
            >
              <div className="font-bold text-sm text-slate-900 mb-1">{item.label}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Final Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 text-white">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold text-orange-400 block uppercase tracking-wider">
            Ready to build
          </span>
          <p className="text-sm font-semibold text-slate-200">
            {selectedPlaces.length} places selected for {searchedDestination}
          </p>
        </div>

        <button
          onClick={handleCreateTrip}
          disabled={isGeneratingItinerary || selectedPlaces.length === 0}
          className="w-full sm:w-auto px-7 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Compass className={`w-4 h-4 ${isGeneratingItinerary ? 'animate-spin' : ''}`} />
          <span>
            {isGeneratingItinerary
              ? 'Building Itinerary...'
              : `Create Itinerary (${selectedPlaces.length} Places)`}
          </span>
          {!isGeneratingItinerary && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
