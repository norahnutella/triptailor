import React from 'react';
import {
  LayoutDashboard,
  Luggage,
  Compass,
  Plus,
  User,
  MessageSquare,
  Settings,
  LogIn,
} from 'lucide-react';
import { ViewScreen, UserProfile } from '../types';

interface SidebarProps {
  currentScreen: ViewScreen;
  onNavigate: (screen: ViewScreen) => void;
  user: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenChat?: () => void;
  unreadChatCount?: number;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  user,
  onOpenAuth,
  onOpenChat,
  unreadChatCount = 0,
  className = '',
}) => {
  return (
    <aside
      id="workspace-sidebar"
      className={`w-56 bg-white border-r border-slate-200 flex flex-col justify-between p-3 shrink-0 select-none ${className}`}
    >
      {/* Brand & Navigation */}
      <div className="space-y-5">
        {/* Brand Lockup */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer py-1 px-2"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight">
            TripTailor
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1.5">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              currentScreen === 'dashboard'
                ? 'bg-orange-50 text-orange-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          {user && (
            <>
                        <button
                          onClick={() => onNavigate('itinerary')}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                            currentScreen === 'itinerary'
                              ? 'bg-orange-50 text-orange-900'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <Luggage className="w-4 h-4 shrink-0" />
                          <span>Itinerary</span>
                        </button>

                        {onOpenChat && (
                          <button
                            onClick={onOpenChat}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-orange-50/70 hover:text-orange-700 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-4 h-4 text-orange-600 shrink-0" />
                              <span>Squad Chat</span>
                            </div>
                            {unreadChatCount > 0 && (
                              <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] font-extrabold rounded-full">
                                {unreadChatCount}
                              </span>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => onNavigate('profile')}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                            currentScreen === 'profile'
                              ? 'bg-orange-50 text-orange-900'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <User className="w-4 h-4 shrink-0" />
                          <span>Profile</span>
                        </button>

            </>
          )}

          <button
            onClick={() => onNavigate('contact')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              currentScreen === 'contact'
                ? 'bg-orange-50 text-orange-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Contact</span>
          </button>

          {user && (
            <div className="pt-2">
            <button
              onClick={() => onNavigate('create')}
              className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs ${
                currentScreen === 'create'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>New Trip</span>
            </button>
            </div>
          )}
        </nav>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-slate-100">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('profile')}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="View Profile"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};
