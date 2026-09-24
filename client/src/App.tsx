import React, { useState, useEffect } from 'react';
import { ViewScreen, ActivityItem, UserProfile, NotificationItem, TripData, DayItinerary, SavedItinerary, TripMember } from './types';
import { EMPTY_TRIP } from './data/mockData';
import {
  getActiveUser, updateUserProfile, deleteUserAccount, logoutUser, getNotifications, restoreSession,
  markNotificationsAsRead, clearAllNotifications,
} from './data/authStore';
import { getUnreadGroupMessagesCount } from './data/groupChatStore';
import { getSavedItineraries, saveItinerary, deleteItinerary } from './data/itineraryStore';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { TripCustomizerView } from './components/TripCustomizerView';
import { ItineraryView } from './components/ItineraryView';
import { ProfileView } from './components/ProfileView';
import { ContactView } from './components/ContactView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SquadChatDrawer } from './components/SquadChatDrawer';
import { PrintableItineraryModal } from './components/PrintableItineraryModal';
import { AiConciergeModal, InviteFriendsModal, ReserveTableModal, DetailedBillModal, AddActivityModal } from './components/Modals';

type ActiveModal =
  | { type: 'invite' }
  | { type: 'reserve'; restaurant: string }
  | { type: 'bill' }
  | { type: 'addActivity'; dayNumber: number }
  | { type: 'editActivity'; dayNumber: number; activity: ActivityItem }
  | { type: 'ai' }
  | null;

const getActivityCost = (costInfo: string): number => {
  const values = costInfo.match(/\d[\d,]*(?:\.\d+)?/g);
  if (!values) return 0;
  return Number(values[0].replace(/,/g, '')) || 0;
};

const getBudgetForDays = (days: DayItinerary[], travelers: number, daysCount: number) => {
  const activityCost = days.reduce(
    (total, day) => total + day.activities.reduce((dayTotal, activity) => {
      const cost = getActivityCost(activity.costInfo);
      const isGroupCost = /for group|group cost|per group/i.test(activity.costInfo);
      return dayTotal + (isGroupCost ? cost : cost * travelers);
    }, 0),
    0,
  );
  const baseCost = travelers * (daysCount * 1150);
  const total = baseCost + activityCost;

  return { total, perPerson: total / Math.max(1, travelers) };
};

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>('dashboard');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(() => getActiveUser());
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotifications());
  const [currentTrip, setCurrentTrip] = useState<TripData>(EMPTY_TRIP);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isCurrentTripSaved, setIsCurrentTripSaved] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(() => user ? getUnreadGroupMessagesCount(user.id) : 0);
  const [modalState, setModalState] = useState<ActiveModal>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3400);
  };

  useEffect(() => {
    restoreSession().then((active) => {
      if (active) setUser(active);
    });
  }, []);

  useEffect(() => {
    const handleMessageEvent = () => setUnreadChatCount(user ? getUnreadGroupMessagesCount(user.id) : 0);
    window.addEventListener('triptailor_group_message', handleMessageEvent);
    return () => window.removeEventListener('triptailor_group_message', handleMessageEvent);
  }, [user?.id]);

  useEffect(() => {
    const syncNavigationFromHistory = () => {
      const params = new URL(window.location.href).searchParams;
      const nextScreen = params.get('screen') as ViewScreen | null;
      const validScreens: ViewScreen[] = ['dashboard', 'create', 'itinerary', 'profile', 'contact'];

      if (nextScreen && validScreens.includes(nextScreen)) {
        const nextDestination = params.get('destination') || undefined;
        if (nextDestination) {
          setSelectedDestination(nextDestination);
        }
        setCurrentScreen(nextScreen);
      }
    };

    const initialScreen = new URL(window.location.href).searchParams.get('screen') as ViewScreen | null;
    if (!initialScreen) {
      window.history.replaceState({ screen: 'dashboard' }, '', `${window.location.pathname}?screen=dashboard`);
    }

    window.addEventListener('popstate', syncNavigationFromHistory);
    syncNavigationFromHistory();

    return () => window.removeEventListener('popstate', syncNavigationFromHistory);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setSavedItineraries([]);
      setIsCurrentTripSaved(false);
      return;
    }
    getSavedItineraries(user.id).then((items) => {
      if (!cancelled) {
        setSavedItineraries(items);
        setIsCurrentTripSaved(items.some((item) => item.id === currentTrip.id));
      }
    }).catch(() => {
      if (!cancelled) showToast('Could not load saved itineraries. Check your connection.');
    });
    return () => { cancelled = true; };
  }, [user?.id, currentTrip.id]);

  const handleCreateItinerary = (tripData: { destination: string; dates: string; activities: ActivityItem[]; travelers: number; currency: string; title: string; daysCount?: number; tripId: string; members: TripMember[] }) => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      showToast('Please log in or sign up before generating an itinerary.');
      return;
    }
    const safeTripId = tripData.tripId || `trip-${Date.now()}`;
    const destShort = tripData.destination.split(',')[0];
    const daysCount = tripData.daysCount || 4;
    const dayTitles = [
      `${destShort} Highlights & Landmark Walk`, `Scenic Sights & Coastal Dining`,
      `Cultural Exploration & Heritage`, `Local Artisans & Sunset Vistas`,
      `Hidden Gems & Tasting Tour`, `Nature Trek & Relaxation`, `Grand Farewell Celebration`,
    ];
    const days: DayItinerary[] = [];
    for (let i = 1; i <= daysCount; i++) {
      const title = dayTitles[(i - 1) % dayTitles.length];
      const startIdx = ((i - 1) * 2) % Math.max(1, tripData.activities.length);
      const dayActs = tripData.activities.slice(startIdx, startIdx + 3);
      days.push({ dayNumber: i, dateStr: `Day ${i} • ${title}`, title, activities: dayActs.length > 0 ? dayActs : tripData.activities.slice(0, 2) });
    }
    const budget = getBudgetForDays(days, tripData.travelers, daysCount);
    const newTrip: TripData = {
      id: safeTripId, members: tripData.members, title: tripData.title, destination: tripData.destination, dates: tripData.dates,
      currency: tripData.currency,
      daysCount, travelersCount: tripData.travelers, budgetTotal: budget.total,
      budgetPerPerson: budget.perPerson, budgetTier: 'Moderate', tags: [destShort.toUpperCase(), `${daysCount} DAYS`, 'CALENDAR CURATED'], days,
    };
    setCurrentTrip(newTrip);
    setActivities(days[0]?.activities || []);
    setIsCurrentTripSaved(false);
    setCurrentScreen('itinerary');
    showToast(`Itinerary generated for ${tripData.destination} (${daysCount} days)!`);
  };

  const handleAddActivity = (newAct: ActivityItem, targetDay: number = 1) => {
    setCurrentTrip((prev) => {
      const days = prev.days.map((day) => {
        const activities = (day.activities || []).filter((activity) => activity.id !== newAct.id);
        return day.dayNumber === targetDay ? { ...day, activities: [...activities, newAct] } : { ...day, activities };
      });
      const budget = getBudgetForDays(days, prev.travelersCount, prev.daysCount);
      return { ...prev, days, budgetTotal: budget.total, budgetPerPerson: budget.perPerson };
    });
    setActivities((prev) => [...prev, newAct]);
    setIsCurrentTripSaved(false);
    showToast(`Added "${newAct.title}" to Day ${targetDay} itinerary!`);
  };

  const handleRemoveActivity = (activityId: string, dayNumber: number) => {
    setCurrentTrip((prev) => {
      const days = prev.days.map((day) => day.dayNumber === dayNumber ? { ...day, activities: (day.activities || []).filter((a) => a.id !== activityId) } : day);
      const budget = getBudgetForDays(days, prev.travelersCount, prev.daysCount);
      return { ...prev, days, budgetTotal: budget.total, budgetPerPerson: budget.perPerson };
    });
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    setIsCurrentTripSaved(false);
    showToast('Activity removed from timeline');
  };

  const handleRegenerateItinerary = () => {
    setCurrentTrip((prev) => {
      const days = prev.days.map((day) => {
        if (day.activities.length < 2) return day;

        const midpoint = Math.ceil(day.activities.length / 2);
        const reordered = [...day.activities.slice(midpoint), ...day.activities.slice(0, midpoint)];
        return {
          ...day,
          activities: reordered.map((activity, index) => ({
            ...activity,
            orderNumber: index + 1,
          })),
        };
      });

      setActivities(days[0]?.activities || []);
      return { ...prev, days };
    });
    setIsCurrentTripSaved(false);
    showToast('A fresh itinerary order is ready to review.');
  };

  const handleUpdateTrip = (updates: Pick<TripData, 'title' | 'dates'>) => {
    setCurrentTrip((prev) => ({ ...prev, ...updates }));
    setIsCurrentTripSaved(false);
    showToast('Itinerary details updated. Save it again to update your saved copy.');
  };

  const handleSaveTrip = async () => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      showToast('Please log in to save an itinerary.');
      return;
    }
    try {
      await saveItinerary(user.id, currentTrip);
      setSavedItineraries(await getSavedItineraries(user.id));
      setIsCurrentTripSaved(true);
      showToast('Itinerary saved to My Itineraries.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save itinerary.');
    }
  };

  const handleViewSavedItinerary = (trip: TripData) => {
    setCurrentTrip(trip);
    setActivities(trip.days[0]?.activities || []);
    setIsCurrentTripSaved(true);
    setCurrentScreen('itinerary');
    showToast(`Opened "${trip.title}".`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSavedItinerary = async (tripId: string) => {
    if (!user) return;
    const trip = savedItineraries.find((item) => item.id === tripId);
    const confirmed = window.confirm(`Are you sure you want to delete "${trip?.title || 'this itinerary'}"?`);
    if (!confirmed) return;
    try {
      const remaining = await deleteItinerary(user.id, tripId);
      setSavedItineraries(remaining);
      if (currentTrip.id === tripId) {
        const nextTrip = remaining[0];
        if (nextTrip) {
          setCurrentTrip(nextTrip);
          setActivities(nextTrip.days[0]?.activities || []);
          setIsCurrentTripSaved(true);
        } else {
          setCurrentTrip(EMPTY_TRIP);
          setActivities([]);
          setIsCurrentTripSaved(false);
        }
      }
      showToast('Itinerary deleted successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to delete itinerary.');
    }
  };

  const handleNavigate = (screen: ViewScreen, destination?: string) => {
    if (screen === 'create' && !user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      showToast('Please log in or sign up before creating a trip.');
      return;
    }

    if (destination) {
      setSelectedDestination(destination);
    }

    setCurrentScreen(screen);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const url = new URL(window.location.href);
    url.searchParams.set('screen', screen);

    if (destination) {
      url.searchParams.set('destination', destination);
    } else {
      url.searchParams.delete('destination');
    }

    window.history.pushState({ screen, destination }, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const handleOpenInvite = () => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      showToast('Please log in to invite friends to your travel squad.');
      return;
    }
    setModalState({ type: 'invite' });
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile, message: string) => {
    setUser(authenticatedUser);
    getSavedItineraries(authenticatedUser.id).then(setSavedItineraries).catch(() => setSavedItineraries([]));
    setUnreadChatCount(getUnreadGroupMessagesCount(authenticatedUser.id));
    showToast(message);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setSavedItineraries([]);
    setUnreadChatCount(0);
    setCurrentScreen('dashboard');
    showToast('Signed out of TripTailor.');
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount();
      setUser(null);
      setSavedItineraries([]);
      setCurrentTrip(EMPTY_TRIP);
      setCurrentScreen('dashboard');
      showToast('Account deleted.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to delete account.');
      throw error;
    }
  };

  const handleUpdateUser = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await updateUserProfile(updates);
      setUser(updated);
      showToast('Profile & preferences saved!');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save profile.');
    }
  };

  const handleMarkNotificationsRead = () => { setNotifications(markNotificationsAsRead()); showToast('All notifications marked as read.'); };
  const handleClearNotifications = () => { setNotifications(clearAllNotifications()); showToast('Cleared notifications.'); };
  const handleSearchSubmit = (term: string) => { setSelectedDestination(term); setCurrentScreen('create'); };

  return (
    <div className="min-h-screen bg-[#f2efe8] text-[#26352f] font-sans flex flex-col antialiased selection:bg-orange-500/20">
      {toastMessage && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span>{toastMessage}</span></div>}
      <div className="flex-1 flex min-h-screen overflow-hidden">
        <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} user={user} onOpenProfile={() => setCurrentScreen('profile')} onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} onOpenChat={user ? () => setIsChatDrawerOpen(true) : undefined} unreadChatCount={unreadChatCount} className="hidden lg:flex" />
        {mobileSidebarOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileSidebarOpen(false)} /><Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} user={user} onOpenProfile={() => { setMobileSidebarOpen(false); setCurrentScreen('profile'); }} onOpenAuth={(mode) => { setMobileSidebarOpen(false); setAuthModal({ isOpen: true, mode }); }} onOpenChat={user ? () => { setMobileSidebarOpen(false); setIsChatDrawerOpen(true); } : undefined} unreadChatCount={unreadChatCount} className="relative z-10 w-72 h-full" /></div>}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <TopNav currentScreen={currentScreen} onNavigate={handleNavigate} onOpenInvite={handleOpenInvite} onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} user={user} onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} onOpenProfile={() => setCurrentScreen('profile')} onLogout={handleLogout} notifications={notifications} onMarkNotificationsRead={handleMarkNotificationsRead} onClearNotifications={handleClearNotifications} onSearchSubmit={handleSearchSubmit} onOpenChat={user ? () => setIsChatDrawerOpen(true) : undefined} unreadChatCount={unreadChatCount} onOpenPrint={() => setIsPrintModalOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {currentScreen === 'dashboard' && <DashboardView onNavigate={handleNavigate} user={user} onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} />}
            {currentScreen === 'create' && <TripCustomizerView onNavigate={handleNavigate} onOpenInvite={handleOpenInvite} onCreateItinerary={handleCreateItinerary} initialDestination={selectedDestination} />}
            {currentScreen === 'itinerary' && <ItineraryView onNavigate={handleNavigate} onOpenInvite={handleOpenInvite} onOpenReserve={(restaurant) => setModalState({ type: 'reserve', restaurant })} onOpenBill={() => setModalState({ type: 'bill' })} onOpenAddActivity={(dayNumber) => setModalState({ type: 'addActivity', dayNumber })} onOpenEditActivity={(activity, dayNumber) => setModalState({ type: 'editActivity', activity, dayNumber })} onOpenAi={() => setModalState({ type: 'ai' })} onOpenPrint={user ? () => setIsPrintModalOpen(true) : undefined} onOpenChat={user ? () => setIsChatDrawerOpen(true) : undefined} unreadChatCount={unreadChatCount} onRemoveActivity={handleRemoveActivity} currentTrip={currentTrip} user={user} onRegenerate={handleRegenerateItinerary} onUpdateTrip={handleUpdateTrip} onSave={handleSaveTrip} isSaved={isCurrentTripSaved} />}
            {currentScreen === 'profile' && <ProfileView onNavigate={handleNavigate} user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} showToast={showToast} savedItineraries={savedItineraries} onViewSavedItinerary={handleViewSavedItinerary} onDeleteSavedItinerary={handleDeleteSavedItinerary} />}
            {currentScreen === 'contact' && <ContactView onNavigate={handleNavigate} user={user} />}
          </main>
        </div>
      </div>
      <SquadChatDrawer isOpen={isChatDrawerOpen} onClose={() => { setIsChatDrawerOpen(false); setUnreadChatCount(user ? getUnreadGroupMessagesCount(user.id) : 0); }} onCreateChat={() => { setIsChatDrawerOpen(false); handleNavigate('create'); }} user={user} />
      <PrintableItineraryModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} trip={currentTrip} user={user} />
      <AiConciergeModal isOpen={modalState?.type === 'ai'} onClose={() => setModalState(null)} destination={currentTrip.destination} dates={currentTrip.dates} travelers={currentTrip.travelersCount} currency={currentTrip.currency} />
      <AuthModal isOpen={authModal.isOpen} onClose={() => setAuthModal({ ...authModal, isOpen: false })} initialMode={authModal.mode} onSuccess={handleAuthSuccess} />
      {user && <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />}
      <InviteFriendsModal isOpen={modalState?.type === 'invite'} onClose={() => setModalState(null)} user={user} />
      <ReserveTableModal isOpen={modalState?.type === 'reserve'} onClose={() => setModalState(null)} restaurantName={modalState?.type === 'reserve' ? modalState.restaurant : ''} />
      <DetailedBillModal isOpen={modalState?.type === 'bill'} onClose={() => setModalState(null)} />
      <AddActivityModal isOpen={modalState?.type === 'addActivity' || modalState?.type === 'editActivity'} onClose={() => setModalState(null)} onAdd={handleAddActivity} dayNumber={modalState?.type === 'addActivity' || modalState?.type === 'editActivity' ? modalState.dayNumber : 1} initialActivity={modalState?.type === 'editActivity' ? modalState.activity : undefined} totalDays={currentTrip.days.length} />
    </div>
  );
}

export default App;
