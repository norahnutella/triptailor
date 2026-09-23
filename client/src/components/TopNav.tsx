import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LogIn,
  Trash2,
  Plus,
  Users,
  MessageSquare,
  Printer,
} from 'lucide-react';
import { ViewScreen, UserProfile, NotificationItem } from '../types';

interface TopNavProps {
  currentScreen: ViewScreen;
  onNavigate: (screen: ViewScreen) => void;
  onOpenInvite: () => void;
  onToggleSidebar?: () => void;
  user: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  onClearNotifications: () => void;
  onSearchSubmit?: (term: string) => void;
  onOpenChat?: () => void;
  unreadChatCount?: number;
  onOpenPrint?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onNavigate,
  onOpenInvite,
  onToggleSidebar,
  user,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  notifications,
  onMarkNotificationsRead,
  onClearNotifications,
  onSearchSubmit,
  onOpenChat,
  unreadChatCount = 0,
  onOpenPrint,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery.trim());
      }
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-5 flex items-center justify-between gap-3 shrink-0 select-none z-20 sticky top-0">
      {/* Left: Mobile Toggle + Clean Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKey}
            placeholder="Search trips or places..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: New Trip, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Squad Group Chat Drawer Trigger */}
        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="Squad Chat"
            title="Open Squad Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-bold text-slate-800">Squad Chat</span>
            {unreadChatCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-orange-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadChatCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications */}
        {user && (
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <div className="flex items-center gap-2 text-xs">
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkNotificationsRead}
                        className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={onClearNotifications}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      title="Clear all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2 rounded-lg text-left text-xs bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 text-xs">{n.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Identity */}
        {user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 block truncate">{user.name}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenInvite();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-orange-600" />
                    <span>Invite Friends</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('itinerary');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>My Itinerary</span>
                  </button>

                  {onOpenPrint && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenPrint();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-orange-600" />
                      <span>Print Itinerary</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('contact');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Contact Support</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
