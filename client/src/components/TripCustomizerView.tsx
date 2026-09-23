import React, { useEffect, useState } from 'react';
import { MessageSquare, Search, Plus, X, Check, RotateCw } from 'lucide-react';
import { ViewScreen, ActivityItem, TripMember } from '../types';
import { createTripChat, searchTripTailorUsers } from '../data/api';
import { TripCustomizerLegacy } from './TripCustomizerLegacy';

interface Props {
  onNavigate: (screen: ViewScreen) => void;
  onOpenInvite: () => void;
  onCreateItinerary: (tripData: { destination: string; dates: string; activities: ActivityItem[]; travelers: number; currency: string; title: string; daysCount?: number; tripId: string; members: TripMember[] }) => void;
  initialDestination?: string;
}

export const TripCustomizerView: React.FC<Props> = ({ onNavigate, onOpenInvite, onCreateItinerary, initialDestination }) => {
  const [setup, setSetup] = useState(true);
  const [destination, setDestination] = useState(initialDestination || '');
  const [destinationStepComplete, setDestinationStepComplete] = useState(false);
  const [name, setName] = useState('');
  const [tripId, setTripId] = useState('');
  const [members, setMembers] = useState<TripMember[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TripMember[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const defaultTripTitle = (dest: string) => {
    const base = dest.split(',')[0].trim() || 'Trip';
    return `Your ${base} Trip`;
  };

  const continueToChatPrompt = () => {
    const trimmed = destination.trim();
    if (!trimmed) {
      setError('Choose a destination before continuing.');
      return;
    }

    setError('');
    setDestinationStepComplete(true);
  };

  const handleChatChoice = (shouldCreateChat: boolean) => {
    const trimmed = destination.trim();
    if (!trimmed) {
      setError('Choose a destination before continuing.');
      return;
    }

    setError('');

    if (!shouldCreateChat) {
      setName(defaultTripTitle(trimmed));
      setSetup(false);
      return;
    }

    setName(defaultTripTitle(trimmed));
  };

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try { setResults((await searchTripTailorUsers(query.trim())).filter((u) => !members.some((m) => m.id === u.id))); }
      catch (e) { setError(e instanceof Error ? e.message : 'Unable to search users.'); }
      finally { setSearching(false); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, members]);

  useEffect(() => {
    if (initialDestination && !destination) {
      setDestination(initialDestination);
    }
  }, [initialDestination, destination]);

  const createChat = async () => {
    const tripName = name.trim() || defaultTripTitle(destination);
    if (!tripName.trim()) { setError('Enter a trip name first.'); return; }
    setCreating(true); setError('');
    try {
      const trip = await createTripChat(tripName, members.map((m) => m.id));
      setTripId(trip.id || `trip-${Date.now()}`);
      setMembers(trip.members || members);
      setName(tripName);
      setSetup(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create the trip chat.'); }
    finally { setCreating(false); }
  };

  if (!setup) return <TripCustomizerLegacy
    onNavigate={onNavigate}
    onOpenInvite={onOpenInvite}
    initialDestination={destination || initialDestination}
    onCreateItinerary={(data) => onCreateItinerary({
      ...data,
      title: name.trim() || defaultTripTitle(data.destination || destination),
      tripId: tripId || `trip-${Date.now()}`,
      members: tripId ? members : [],
    })}
  />;

  if (!destinationStepComplete) {
    return <div className="max-w-2xl mx-auto pb-20">
      <div className="text-center pt-4 mb-8"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">New trip</span><h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">Start with your destination</h1><p className="text-sm text-slate-600 max-w-xl mx-auto mt-2">Tell us where you want to go, then decide whether you want a trip chat before planning.</p></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">1. Destination</label>
          <input value={destination} onChange={(e) => { setDestination(e.target.value); if (error) setError(''); }} placeholder="e.g. Goa, India" maxLength={120} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-orange-500 focus:bg-white" />
        </div>
        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">{error}</div>}
        <div className="pt-3 border-t border-slate-100 flex justify-between">
          <button onClick={() => onNavigate('dashboard')} className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
          <button onClick={continueToChatPrompt} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">Continue</button>
        </div>
      </div>
    </div>;
  }

  if (destinationStepComplete && !name.trim() && !tripId) {
    return <div className="max-w-2xl mx-auto pb-20">
      <div className="text-center pt-4 mb-8"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">New trip</span><h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">Create a trip chat?</h1><p className="text-sm text-slate-600 max-w-xl mx-auto mt-2">You’re planning for {destination.trim()}.</p></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="grid sm:grid-cols-2 gap-3">
          <button onClick={() => handleChatChoice(true)} className="p-4 rounded-2xl border border-orange-200 bg-orange-50 text-left hover:bg-orange-100 transition-colors cursor-pointer">
            <div className="text-lg font-bold text-orange-900">Yes, create a chat</div>
            <div className="text-xs text-orange-700 mt-1">Build the trip together with your group.</div>
          </button>
          <button onClick={() => handleChatChoice(false)} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-left hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="text-lg font-bold text-slate-900">No, continue planning</div>
            <div className="text-xs text-slate-600 mt-1">Skip the chat and keep planning the itinerary.</div>
          </button>
        </div>
        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">{error}</div>}
        <div className="pt-3 border-t border-slate-100 flex justify-between">
          <button onClick={() => { setDestinationStepComplete(false); setError(''); }} className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Back</button>
          <button onClick={() => handleChatChoice(false)} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer">Continue planning</button>
        </div>
      </div>
    </div>;
  }

  return <div className="max-w-3xl mx-auto pb-20">
    <div className="text-center pt-4 mb-8"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">New trip</span><h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">Create your trip squad</h1><p className="text-sm text-slate-600 max-w-xl mx-auto mt-2">Destination: <span className="font-semibold text-slate-900">{destination.trim() || 'Not set'}</span></p></div>
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
      <div><label className="text-xs font-bold text-slate-700 block mb-2">1. Trip name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goa Summer Adventure" maxLength={120} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-orange-500 focus:bg-white" /></div>
      <div><label className="text-xs font-bold text-slate-700 block mb-2">2. Add verified TripTailor users <span className="font-normal text-slate-400">(optional)</span></label><div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500 focus:bg-white" /></div>{searching && <p className="text-[11px] text-slate-400 mt-2">Searching registered TripTailor users...</p>}
        {results.length > 0 && <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">{results.map((u) => <button key={u.id} onClick={() => { setMembers((p) => [...p, u]); setQuery(''); setResults([]); }} className="w-full flex items-center gap-3 p-3 text-left hover:bg-orange-50 cursor-pointer"><img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover" /><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-slate-900">{u.name}</div><div className="text-[11px] text-slate-500">{u.email}</div></div><Plus className="w-4 h-4 text-orange-600" /></button>)}</div>}
        {members.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{members.map((u) => <div key={u.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-orange-50 border border-orange-100 rounded-full"><img src={u.avatar} alt="" className="w-5 h-5 rounded-full object-cover" /><span className="text-[11px] font-semibold text-orange-900">{u.name}</span><button onClick={() => setMembers((p) => p.filter((m) => m.id !== u.id))} className="text-orange-500 cursor-pointer"><X className="w-3 h-3" /></button></div>)}</div>}
      </div>
      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">{error}</div>}
      <div className="pt-3 border-t border-slate-100 flex justify-between"><button onClick={() => { setDestinationStepComplete(false); setError(''); }} className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Back</button><button disabled={creating || !name.trim()} onClick={createChat} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">{creating ? <RotateCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}{creating ? 'Creating chat...' : 'Create Chat & Continue'}</button></div>
    </div>
  </div>;
};
