import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckSquare,
  PhoneCall,
  Download,
  Share2,
  DollarSign,
  Compass,
} from 'lucide-react';
import { TripData, UserProfile } from '../types';

interface PrintableItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripData;
  user?: UserProfile | null;
}

export const PrintableItineraryModal: React.FC<PrintableItineraryModalProps> = ({
  isOpen,
  onClose,
  trip,
  user,
}) => {
  const [includeBudget, setIncludeBudget] = useState(true);
  const [includeEmergency, setIncludeEmergency] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  const totalActivitiesCount = trip.days.reduce(
    (acc, day) => acc + (day.activities ? day.activities.length : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Control Bar (Hidden on actual print) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Official Printable Itinerary</h2>
              <p className="text-xs text-slate-400">Formatted for print, PDF export, & offline travel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Customization toggles */}
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-300 pr-2 border-r border-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBudget}
                  onChange={(e) => setIncludeBudget(e.target.checked)}
                  className="rounded border-slate-700 text-orange-600 focus:ring-0"
                />
                <span>Budget</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEmergency}
                  onChange={(e) => setIncludeEmergency(e.target.checked)}
                  className="rounded border-slate-700 text-orange-600 focus:ring-0"
                />
                <span>Emergency</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChecklist}
                  onChange={(e) => setIncludeChecklist(e.target.checked)}
                  className="rounded border-slate-700 text-orange-600 focus:ring-0"
                />
                <span>Checklist</span>
              </label>
            </div>

            <button
              onClick={handleTriggerPrint}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-itinerary-sheet"
            className="bg-white max-w-3xl mx-auto p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 space-y-8 text-slate-900 print:shadow-none print:border-none print:p-0 print:max-w-none"
          >
            {/* Header / Brand Banner */}
            <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-orange-600 mb-1.5">
                  <Compass className="w-4 h-4" />
                  <span>TripTailor Official Itinerary Dossier</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                  {trip.title}
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{trip.destination}</span>
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-none border-slate-200">
                <div className="font-bold text-slate-900">
                  REF: <span className="font-mono text-orange-600">TT-{trip.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="text-slate-500">
                  Generated on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {user && (
                  <div className="text-slate-600">
                    Lead Traveler: <strong>{user.name}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Trip Overview Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Dates</span>
                <span className="font-bold text-slate-900">{trip.dates}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Duration</span>
                <span className="font-bold text-slate-900">{trip.days.length} Days / {Math.max(1, trip.days.length - 1)} Nights</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Travelers</span>
                <span className="font-bold text-slate-900">{trip.travelersCount} Travelers</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Planned Stops</span>
                <span className="font-bold text-slate-900">{totalActivitiesCount} Scheduled</span>
              </div>
            </div>

            {/* Basecamp / Accommodation Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
                Accommodation Basecamp
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  Heritage Portuguese Villa & Coastal Retreat
                </h4>
                <span className="text-slate-500 font-medium">Check-in: 02:00 PM • Check-out: 11:00 AM</span>
              </div>
              <p className="text-xs text-slate-500">
                Main Coastal Road, North Goa • Confirmed Reservation for {trip.travelersCount} Guests
              </p>
            </div>

            {/* Detailed Day-by-Day Schedule */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-950 pb-1 border-b border-slate-200 flex items-center justify-between">
                <span>Day-by-Day Detailed Schedule</span>
                <span className="text-xs font-normal text-slate-500">{trip.days.length} Total Days</span>
              </h2>

              {trip.days.map((day, dIdx) => (
                <div
                  key={day.dayNumber || dIdx}
                  className="space-y-3 print:break-inside-avoid"
                >
                  {/* Day Header */}
                  <div className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-between text-xs font-bold">
                    <span>
                      Day {day.dayNumber || dIdx + 1}: {day.title}
                    </span>
                    <span className="text-slate-300 font-normal">
                      {day.activities ? day.activities.length : 0} stops
                    </span>
                  </div>

                  {/* Day Activities Table / Timeline */}
                  {day.activities && day.activities.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                      {day.activities.map((act, aIdx) => (
                        <div key={act.id || aIdx} className="p-3.5 space-y-1.5 hover:bg-slate-50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-orange-600 min-w-[70px]">
                                {act.time}
                              </span>
                              <span className="font-bold text-slate-900 text-sm">
                                {act.title}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                {act.type}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-slate-700">{act.costInfo}</span>
                              <span className="text-slate-400 block text-[10px]">{act.duration}</span>
                            </div>
                          </div>

                          <p className="text-slate-600 text-xs pl-[78px] leading-relaxed">
                            {act.description}
                          </p>

                          {act.transitAfter && (
                            <div className="pl-[78px] text-[11px] text-slate-400 italic pt-1 flex items-center gap-1">
                              <span>{act.transitAfter.label}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      Free exploration time reserved for this day.
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Budget & Cost Summary */}
            {includeBudget && (
              <div className="space-y-3 print:break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-900 pb-1 border-b border-slate-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  <span>Estimated Budget Breakdown</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Group Budget</span>
                    <span className="text-lg font-bold text-slate-900">
                      ₹{trip.budgetTotal ? trip.budgetTotal.toLocaleString() : '20,000'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Covering activities, food & transit</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Per Person Allocation</span>
                    <span className="text-lg font-bold text-slate-900">
                      ₹{trip.budgetPerPerson ? trip.budgetPerPerson.toLocaleString() : '5,000'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Based on {trip.travelersCount} travelers</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Budget Tier</span>
                    <span className="text-lg font-bold text-orange-600">
                      {trip.budgetTier || 'Moderate'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Flexible pacing & dining</span>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency & Local Contacts */}
            {includeEmergency && (
              <div className="space-y-3 print:break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-900 pb-1 border-b border-slate-200 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-orange-600" />
                  <span>Essential Local Emergency Contacts</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Police</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">112 / 100</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Medical / Ambulance</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">108</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Tourist Helpline</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">1364</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Trip Support</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">+91 98765 43210</span>
                  </div>
                </div>
              </div>
            )}

            {/* Packing & Preparation Checklist */}
            {includeChecklist && (
              <div className="space-y-3 print:break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-900 pb-1 border-b border-slate-200 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-orange-600" />
                  <span>Pre-Departure Checklist</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block"></span>
                    <span>Valid Govt Photo ID</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block"></span>
                    <span>Sunscreen & Sunglasses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block"></span>
                    <span>Waterproof Phone Pouch</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block"></span>
                    <span>Power Bank & Cables</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block"></span>
                    <span>Walking Footwear</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block"></span>
                    <span>Swimwear & Quick Dry Towel</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block"></span>
                    <span>Personal First-Aid kit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block"></span>
                    <span>Cash for Local Beach Shacks</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
              <p>TripTailor AI Collaborative Travel Organizer • Keep this copy handy throughout your journey.</p>
              <p className="text-[10px]">Have a safe and unforgettable trip!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
