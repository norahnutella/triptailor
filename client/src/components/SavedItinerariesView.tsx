import React from 'react';
import { Calendar, ChevronRight, MapPin, Trash2, Users, Compass } from 'lucide-react';
import { SavedItinerary, ViewScreen } from '../types';

interface SavedItinerariesViewProps {
  itineraries: SavedItinerary[];
  onNavigate: (screen: ViewScreen) => void;
  onView: (trip: SavedItinerary) => void;
  onDelete: (tripId: string) => void;
}

export const SavedItinerariesView: React.FC<SavedItinerariesViewProps> = ({
  itineraries,
  onNavigate,
  onView,
  onDelete,
}) => {
  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Your saved trips</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">Itineraries</h1>
        </div>
        <button
          onClick={() => onNavigate('create')}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
        >
          Create trip
        </button>
      </div>

      {itineraries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
            <Compass className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No saved itineraries yet</h2>
          <p className="mt-1 text-sm text-slate-500">Create a trip to build your first itinerary.</p>
          <button
            onClick={() => onNavigate('create')}
            className="mt-5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            Create a trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itineraries.map((trip) => (
            <article key={trip.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 truncate">{trip.title}</h2>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.destination}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(trip.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete itinerary"
                  aria-label={`Delete ${trip.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{trip.dates}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{trip.travelersCount} travelers</span>
                <span>{trip.daysCount} days</span>
              </div>

              <button
                onClick={() => onView(trip)}
                className="mt-5 w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span>Open itinerary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
