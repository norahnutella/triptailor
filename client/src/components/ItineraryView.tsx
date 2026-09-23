import React, { useState } from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Check,
  Utensils,
  Printer,
  MessageSquare,
  Pencil,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';
import {
  ActivityItem,
  ViewScreen,
  TripData,
  UserProfile,
} from '../types';
import { INITIAL_DAYS, POD_MEMBERS, RECENT_DESTINATIONS } from '../data/mockData';
import {
  convertCostText,
  formatCurrency,
  getRatesFromINR,
} from '../data/currency';

interface ItineraryViewProps {
  onNavigate: (screen: ViewScreen, destination?: string) => void;
  onOpenInvite: () => void;
  onOpenReserve: (restaurant: string) => void;
  onOpenBill: () => void;
  onOpenAddActivity: (dayNum: number) => void;
  onOpenPrint?: () => void;
  onOpenChat?: () => void;
  unreadChatCount?: number;
  onRemoveActivity?: (activityId: string, dayNum: number) => void;
  activitiesList?: ActivityItem[];
  setActivitiesList?: React.Dispatch<
    React.SetStateAction<ActivityItem[]>
  >;
  currentTrip?: TripData;
  user?: UserProfile | null;
  onRegenerate?: () => void;
  onUpdateTrip?: (
    updates: Pick<TripData, 'title' | 'dates'>
  ) => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  onNavigate,
  onOpenInvite,
  onOpenReserve,
  onOpenAddActivity,
  onOpenPrint,
  onOpenChat,
  unreadChatCount = 0,
  onRemoveActivity,
  currentTrip,
  user,
  onRegenerate,
  onUpdateTrip,
  onSave,
  isSaved = false,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDates, setEditedDates] = useState('');
  const [currencyRates, setCurrencyRates] =
    useState<Record<string, number>>({ INR: 1 });

  React.useEffect(() => {
    let active = true;

    getRatesFromINR()
      .then((rates) => {
        if (active) {
          setCurrencyRates(rates);
        }
      })
      .catch(() => {
        if (active) {
          setCurrencyRates({ INR: 1 });
        }
      });

    return () => {
      active = false;
    };
  }, [user?.currency]);

  const daysData = currentTrip?.days?.length ? currentTrip.days : INITIAL_DAYS;
  const currentDay = daysData[selectedDayIndex] || daysData[0] || {
    dayNumber: 1,
    dateStr: 'Day 1',
    title: 'Start planning your trip',
    activities: [],
  };

  const tripTitle =
    currentTrip?.title || 'Your Trip Itinerary';

  const tripDestination =
    currentTrip?.destination || 'Goa, India';

  const tripDates =
    currentTrip?.dates || '12 Oct – 15 Oct 2025';

  const travelersCount =
    currentTrip?.travelersCount || 4;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRemove = (id: string) => {
    if (onRemoveActivity) {
      onRemoveActivity(id, selectedDayIndex + 1);
    }

    showToast('Activity removed from timeline');
  };

  const dayActivities = currentDay?.activities || [];

  const startEditing = () => {
    setEditedTitle(tripTitle);
    setEditedDates(tripDates);
    setIsEditing(true);
  };

  const saveEdits = () => {
    if (!editedTitle.trim() || !editedDates.trim()) {
      return;
    }

    onUpdateTrip?.({
      title: editedTitle.trim(),
      dates: editedDates.trim(),
    });

    setIsEditing(false);
  };

  if (!currentTrip?.id) {
    return (
      <div className="max-w-6xl mx-auto pb-16 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your itinerary is empty</h1>
          <p className="text-sm text-slate-500 mt-2">Start a new trip to build a day-by-day travel plan.</p>
          <button
            onClick={() => onNavigate('create')}
            className="mt-5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
          >
            Plan a new trip
          </button>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Suggested destinations</h2>
            <p className="text-sm text-slate-500 mt-1">Choose somewhere to start planning.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {RECENT_DESTINATIONS.map((destination) => (
              <button
                key={destination.id}
                onClick={() => onNavigate('create', destination.name)}
                className="relative h-40 rounded-2xl overflow-hidden text-left cursor-pointer group"
              >
                <img src={destination.image} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-bold text-white bg-gradient-to-t from-slate-950/80 to-transparent">{destination.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span>{tripDestination}</span>
          </div>

          {isEditing ? (
            <div className="grid gap-2 max-w-md">
              <input
                value={editedTitle}
                onChange={(event) =>
                  setEditedTitle(event.target.value)
                }
                aria-label="Trip title"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-lg font-bold text-slate-900 focus:outline-hidden focus:border-orange-500"
              />

              <input
                value={editedDates}
                onChange={(event) =>
                  setEditedDates(event.target.value)
                }
                aria-label="Trip dates"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {tripTitle}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{tripDates}</span>
            </span>

            <span>•</span>

            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{travelersCount} Travelers</span>
            </span>

            <span>•</span>

            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{daysData.length} Days</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Create a fresh order from the current stops"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          )}

          {user &&
            onUpdateTrip &&
            (isEditing ? (
              <>
                <button
                  onClick={saveEdits}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Apply edits</span>
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                  aria-label="Cancel editing"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={startEditing}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            ))}

          {user && onSave && (
            <button
              onClick={onSave}
              disabled={isSaved}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-100 disabled:text-orange-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-default flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved' : 'Save trip'}</span>
            </button>
          )}

          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="relative px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Open Squad Discussion"
            >
              <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
              <span>Squad Chat</span>

              {unreadChatCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-orange-500 text-white text-[10px] font-extrabold rounded-full animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}

          {onOpenPrint && (
            <button
              onClick={onOpenPrint}
              className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/80 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Generate and print formatted itinerary"
            >
              <Printer className="w-3.5 h-3.5 text-orange-600" />
              <span>Print Itinerary</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('create')}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {daysData.map((day, idx) => {
          const isActive = selectedDayIndex === idx;
          const acts = day.activities || [];

          return (
            <button
              key={day.dayNumber || idx}
              onClick={() => {
                setSelectedDayIndex(idx);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              <span>Day {idx + 1}</span>
              <span className="text-[11px] opacity-70 font-normal">
                ({acts.length} stops)
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-base font-bold text-slate-900">
              Day {selectedDayIndex + 1}: {currentDay.title}
            </h2>

            <span className="text-xs text-slate-500 font-medium">
              {dayActivities.length} activities scheduled
            </span>
          </div>

          <div className="space-y-3">
            {dayActivities.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <p className="text-sm text-slate-500">
                  No activities planned for this day yet.
                </p>

                <button
                  onClick={() =>
                    onOpenAddActivity(selectedDayIndex + 1)
                  }
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    Add First Stop to Day {selectedDayIndex + 1}
                  </span>
                </button>
              </div>
            ) : (
              dayActivities.map((activity, idx) => (
                <div
                  key={activity.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-4 transition-all flex gap-4 items-start"
                >
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-600">
                            {activity.time}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {activity.duration}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                          {activity.title}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(activity.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        title="Remove activity from day"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {activity.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span className="font-semibold text-slate-700">
                          {convertCostText(
                            activity.costInfo,
                            user?.currency || 'INR',
                            currencyRates
                          )}
                        </span>

                        <span>•</span>

                        <span className="text-amber-600 font-bold">
                          ★ {activity.rating || 4.8}
                        </span>
                      </div>

                      {activity.type === 'dining' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReserve(activity.title);
                          }}
                          className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Utensils className="w-3 h-3" />
                          <span>Reserve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() =>
              onOpenAddActivity(selectedDayIndex + 1)
            }
            className="w-full py-3.5 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-2xl text-xs font-bold text-slate-700 hover:text-orange-600 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-orange-600" />
            <span>
              Add Activity to Day {selectedDayIndex + 1}
            </span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trip Overview
            </h3>

            {currentTrip && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">
                    Estimated total
                  </span>

                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(
                      currentTrip.budgetTotal || 0,
                      user?.currency || 'INR',
                      currencyRates
                    )}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">
                    Per person
                  </span>

                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(
                      currentTrip.budgetPerPerson || 0,
                      user?.currency || 'INR',
                      currencyRates
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 block text-[11px]">
                  Total Days
                </span>

                <span className="text-base font-bold text-slate-900">
                  {daysData.length} Days
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 block text-[11px]">
                  Travelers
                </span>

                <span className="text-base font-bold text-slate-900">
                  {travelersCount} People
                </span>
              </div>
            </div>

            {user && onOpenChat && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Trip Crew
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenChat}
                      className="text-orange-600 font-bold hover:text-orange-700 cursor-pointer text-xs flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </button>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenChat}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-orange-50/50 transition-colors cursor-pointer border border-slate-200/60"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1.5">
                      {POD_MEMBERS.map((member) => (
                        <img
                          key={member.id}
                          src={member.avatar}
                          alt={member.name}
                          title={member.name}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-white border border-slate-200"
                        />
                      ))}
                    </div>

                    <span className="text-xs font-semibold text-slate-700">
                      {POD_MEMBERS.length} Active Squad
                    </span>
                  </div>

                  {unreadChatCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white">
                      {unreadChatCount} New
                    </span>
                  )}
                </button>
              </div>
            )}

            {onOpenPrint && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={onOpenPrint}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Generate Printable Itinerary</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};