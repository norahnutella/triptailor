/**
 * APPLICATION MODALS
 * =========================================================================
 * Purpose:
 *   Self-contained modal dialogs managed via the central activeModal state:
 *   - InviteFriendsModal: Pod collaboration invite via link copy or email
 *   - ReserveTableModal: Direct table hold and seating concierge for restaurants
 *   - DetailedBillModal: Category expense breakdown & live squad split
 *   - AddActivityModal: Timeline insertion for custom itinerary stops
 *   - AiConciergeModal: Autonomous conversational travel assistant
 * =========================================================================
 */

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  Users,
  Send,
  CreditCard,
  Plus,
  Compass,
} from 'lucide-react';
import { ActivityItem, UserProfile } from '../types';
import { getTrip, inviteTripMember, TripMember } from '../data/tripStore';
import { askTravelAi } from '../data/api';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  tripId?: string;
}

export const InviteFriendsModal: React.FC<InviteModalProps> = ({ isOpen, onClose, user, tripId }) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<TripMember[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  React.useEffect(() => {
    if (!isOpen || !tripId) return;
    getTrip(tripId).then((trip) => setMembers(trip.members || [])).catch(() => setMembers([]));
  }, [isOpen, tripId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const link = `${window.location.origin}/?trip=${encodeURIComponent(tripId || '')}`;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !tripId) return;
    if (email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setMessage('You are already part of this trip.');
      return;
    }
    setSending(true);
    setMessage(null);
    try {
      const trip = await inviteTripMember(tripId, email);
      setMembers(trip.members || []);
      setEmail('');
      setMessage('Member added to this trip.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to add this member.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-slate-900 text-lg">Invite Travel Companions</h3><p className="text-xs text-slate-500">Members are stored with this trip.</p></div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 uppercase tracking-wider">Trip Share Link</label>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <input readOnly value={`${window.location.origin}/?trip=${tripId || ''}`} className="bg-transparent text-xs text-slate-700 w-full outline-hidden font-mono" />
              <button onClick={handleCopy} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-1 shrink-0">{copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied' : 'Copy'}</button>
            </div>
          </div>

          <form onSubmit={handleAdd}>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 uppercase tracking-wider">Add Existing TripTailor User</label>
            <div className="flex gap-2">
              <input type="email" required placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              <button type="submit" disabled={sending} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center gap-1.5"><Send className="w-3.5 h-3.5" />{sending ? 'Adding' : 'Add'}</button>
            </div>
            {message && <p className="text-[11px] mt-2 text-slate-600">{message}</p>}
          </form>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Trip Members ({members.length})</span>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-2.5 text-xs py-2 px-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover" />
                  <div className="min-w-0 flex-1"><div className="font-semibold text-slate-800 truncate">{member.name}{member.id === user?.id ? ' (You)' : ''}</div><div className="text-[10px] text-slate-400 truncate">{member.email}</div></div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">{member.membershipRole === 'owner' ? 'Owner' : 'Member'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end"><button onClick={onClose} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl">Done</button></div>
      </div>
    </div>
  );
};

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
}

export const ReserveTableModal: React.FC<ReserveModalProps> = ({
  isOpen,
  onClose,
  restaurantName,
}) => {
  const [reserved, setReserved] = useState(false);
  const [guests, setGuests] = useState('4 Guests');
  const [time, setTime] = useState('07:30 PM');

  if (!isOpen) return null;

  const handleConfirm = () => {
    setReserved(true);
    setTimeout(() => {
      setReserved(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Reserve at {restaurantName}</h3>
              <p className="text-xs text-slate-500">TripTailor Direct Concierge Booking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {reserved ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Table Confirmed!</h4>
            <p className="text-sm text-slate-600">
              Reserved for {guests} at {time} on Oct 12. Instant confirmation sent to all 4 co-travelers.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong>High demand window:</strong> Sunset seating between 6:30 PM and 8:00 PM fills fast. Table hold guaranteed for 15 minutes.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Party Size</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option>2 Guests</option>
                  <option>4 Guests</option>
                  <option>6 Guests</option>
                  <option>8 Guests</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Seating Time</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option>01:30 PM (Lunch)</option>
                  <option>07:00 PM (Sunset)</option>
                  <option>07:30 PM</option>
                  <option>08:00 PM (Post-Sunset)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Special Requests</label>
              <input
                type="text"
                defaultValue="Cliffside outdoor table with sunset view, vegetarian options"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Confirm Reservation Hold
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DetailedBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DetailedBillModal: React.FC<DetailedBillModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Detailed Expense Breakdown</h3>
              <p className="text-xs text-slate-500">Goa Coastal Gateway • 4 Pax</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Est. Group Expense</span>
              <p className="text-2xl font-black text-slate-900">₹17,800</p>
              <span className="text-xs text-slate-500">Target Budget: ₹20,000</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Surplus Buffer</span>
              <p className="text-2xl font-black text-emerald-600">+₹2,200</p>
              <span className="text-xs text-slate-500">₹4,450 / person est.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Category Breakdown</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                  <span className="font-semibold text-slate-800">Accommodation & Stays (45%)</span>
                </div>
                <span className="font-bold text-slate-900">₹8,010</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="font-semibold text-slate-800">Dining & Shacks (28%)</span>
                </div>
                <span className="font-bold text-slate-900">₹4,984</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                  <span className="font-semibold text-slate-800">Activities & Water Sports (18%)</span>
                </div>
                <span className="font-bold text-slate-900">₹3,204</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <span className="font-semibold text-slate-800">Local Cabs & Buffer (9%)</span>
                </div>
                <span className="font-bold text-slate-900">₹1,602</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/60 text-xs text-teal-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Split bills synced in real time across all 4 Pod member bank cards.</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl"
          >
            Close Bill
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activity: ActivityItem, dayNumber: number) => void;
  dayNumber: number;
  initialActivity?: ActivityItem;
  totalDays?: number;
}

const POPULAR_ACTIVITY_PRESETS = [
  {
    title: 'Chapora Fort Sunset & Vantage Point',
    time: '05:30 PM',
    duration: '1.5 HRS',
    cost: 'Free Entry',
    tag: 'Sightseeing',
    type: 'visit' as const,
    description: 'Iconic panoramic cliff-top views overlooking Vagator beach and the Chapora river mouth.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Seafood Feast at Fisherman’s Wharf',
    time: '01:00 PM',
    duration: '2.0 HRS',
    cost: '₹1,500 for group',
    tag: 'Dining',
    type: 'dining' as const,
    description: 'Riverside dining with traditional Goan curries, butter garlic crabs, and live acoustic music.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Private Catamaran & Dolphin Watching',
    time: '10:00 AM',
    duration: '2.5 HRS',
    cost: '₹3,000 for group',
    tag: 'Water Sports',
    type: 'activity' as const,
    description: 'Scenic coastal cruise with dolphin spotting and swimming in calm emerald coves.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Fontainhas Latin Quarter Heritage Walk',
    time: '09:00 AM',
    duration: '2.0 HRS',
    cost: '₹400 for guide',
    tag: 'Sightseeing',
    type: 'visit' as const,
    description: 'Pastel-colored Portuguese colonial bungalows, artisan bakeries, and historic azulejo tiles.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
  },
];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  dayNumber,
  initialActivity,
  totalDays = 4,
}) => {
  const [selectedDay, setSelectedDay] = useState(dayNumber);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('02:00 PM');
  const [duration, setDuration] = useState('1.5 HRS');
  const [cost, setCost] = useState('₹500 for group');
  const [tag, setTag] = useState('Sightseeing');
  const [description, setDescription] = useState('');
  const [selectedImg, setSelectedImg] = useState('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80');

  // Update selected day whenever dayNumber prop changes
  React.useEffect(() => {
    setSelectedDay(dayNumber);
    setTitle(initialActivity?.title || '');
    setTime(initialActivity?.time || '02:00 PM');
    setDuration(initialActivity?.duration || '1.5 HRS');
    setCost(initialActivity?.costInfo || '₹500 for group');
    setTag(initialActivity?.categoryTag || 'Sightseeing');
    setDescription(initialActivity?.description || '');
    setSelectedImg(initialActivity?.image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80');
  }, [dayNumber, initialActivity, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof POPULAR_ACTIVITY_PRESETS[0]) => {
    setTitle(preset.title);
    setTime(preset.time);
    setDuration(preset.duration);
    setCost(preset.cost);
    setTag(preset.tag);
    setDescription(preset.description);
    setSelectedImg(preset.image);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let actType: 'visit' | 'beach' | 'dining' | 'activity' = 'activity';
    if (tag === 'Dining') actType = 'dining';
    else if (tag === 'Beach Relax') actType = 'beach';
    else if (tag === 'Sightseeing') actType = 'visit';

    const newActivity: ActivityItem = {
      id: initialActivity?.id || `custom-act-${Date.now()}`,
      orderNumber: 99,
      time,
      duration,
      title: title.trim(),
      type: actType,
      description: description.trim() || 'Custom scheduled stop curated for the group itinerary.',
      costInfo: cost,
      rating: 4.8,
      reviewCount: '120',
      highlightNote: 'Added by squad',
      tags: [tag, 'Squad Curated'],
      image: selectedImg,
    };

    onAdd(newActivity, selectedDay);
    onClose();
  };

  const daysOptions = Array.from({ length: Math.max(totalDays, selectedDay, 1) }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{initialActivity ? 'Edit Activity' : 'Add Activity to Itinerary'}</h3>
              <p className="text-xs text-slate-500">{initialActivity ? 'Update the stop and its estimated cost' : 'Insert custom waypoint or curated stop into timeline'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Curated Suggestions:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {POPULAR_ACTIVITY_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-left transition-all cursor-pointer text-xs group"
              >
                <div className="font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600">
                  {preset.title}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span>{preset.time}</span>
                  <span>•</span>
                  <span>{preset.cost}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-3.5">
          {/* Day Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Day in Itinerary
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-hidden focus:border-orange-500 focus:bg-white cursor-pointer"
            >
              {daysOptions.map((d) => (
                <option key={d} value={d}>
                  Day {d} Timeline
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Activity / Stop Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapora Fort Sunset, Curlies Shack, Kayaking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cost Info</label>
              <input
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option>Sightseeing</option>
                <option>Dining</option>
                <option>Beach Relax</option>
                <option>Water Sports</option>
                <option>Nightlife</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Why this spot is recommended for the squad..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Will be added to <strong>Day {selectedDay}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{initialActivity ? 'Save Activity Changes' : 'Add to Itinerary'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AiConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: string;
  dates?: string;
  travelers?: number;
  currency?: string;
}

export const AiConciergeModal: React.FC<AiConciergeModalProps> = ({ isOpen, onClose, destination = '', dates = '', travelers = 1, currency = 'INR' }) => {
  const [query, setQuery] = useState('');
  const [working, setWorking] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Ask for places, activities, food, or a day-by-day itinerary for this trip.',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || working) return;

    const userText = query.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setQuery('');

    setWorking(true);
    try {
      const result = await askTravelAi({ destination, dates, travelers, currency, request: userText });
      setMessages((prev) => [...prev, { sender: 'ai', text: formatTravelResult(result) }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ai', text: error instanceof Error ? error.message : 'Travel suggestions are unavailable right now.' }]);
    } finally { setWorking(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-base">Travel suggestions</h3>
              </div>
              <p className="text-xs text-slate-500">Powered by OpenAI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  TT
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-[80%] leading-relaxed ${m.sender === 'user'
                  ? 'bg-orange-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                  }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick query pills */}
        <div className="py-2 flex gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => {
              setQuery('Suggest sunset beach shacks near Vagator');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full shrink-0"
          >
            Vagator sunset spots
          </button>
          <button
            onClick={() => {
              setQuery('Can we fit scuba diving on Day 2?');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full shrink-0"
          >
            Scuba diving feasibility
          </button>
          <button
            onClick={() => {
              setQuery('How is our remaining budget looking?');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full shrink-0"
          >
            Budget check
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="pt-2 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            placeholder="Ask AI concierge to adjust timeline, suggest dining..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600"
          />
          <button
            type="submit"
            disabled={working}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            {working ? 'Thinking...' : 'Ask'}
          </button>
        </form>
      </div>
    </div>
  );
};

function formatTravelResult(result: Record<string, unknown>): string {
  const sections: string[] = [];
  if (typeof result.summary === 'string') sections.push(result.summary);
  for (const key of ['places', 'activities', 'food', 'itinerary']) {
    const value = result[key];
    if (Array.isArray(value) && value.length) {
      sections.push(`${key[0].toUpperCase()}${key.slice(1)}:\n${value.map((item) => typeof item === 'string' ? `- ${item}` : `- ${JSON.stringify(item)}`).join('\n')}`);
    }
  }
  return sections.join('\n\n') || 'No suggestions were returned. Try asking for a specific place, activity, meal, or itinerary day.';
}
