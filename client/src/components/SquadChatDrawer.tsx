import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Users,
  Check,
  CheckCheck,
  Sparkles,
  Compass,
  Utensils,
  AlertCircle,
  ArrowRightLeft,
} from 'lucide-react';
import { GroupMessage, UserProfile, Collaborator } from '../types';
import {
  getGroupMessages,
  sendGroupMessage,
  markGroupMessagesAsRead,
  getSquadMembers,
} from '../data/groupChatStore';

interface SquadChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSwitchUser?: (user: UserProfile) => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  tripTitle?: string;
  tripId?: string;
}

export const SquadChatDrawer: React.FC<SquadChatDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onSwitchUser,
  onOpenAuth,
  tripTitle = 'Your Goa Adventure',
  tripId = 'goa-trip',
}) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<'general' | 'itinerary' | 'dining' | 'urgent'>('general');
  const [showMemberSwitcher, setShowMemberSwitcher] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const squadMembers = getSquadMembers(user);

  // Load messages and mark as read when opened
  const refreshMessages = () => {
    const list = getGroupMessages(tripId);
    setMessages(list);
    if (user) {
      markGroupMessagesAsRead(tripId, user.id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshMessages();
    }
  }, [isOpen, tripId, user?.id]);

  // Listen for message events
  useEffect(() => {
    const handleIncoming = () => {
      const list = getGroupMessages(tripId);
      setMessages(list);
      if (isOpen && user) {
        markGroupMessagesAsRead(tripId, user.id);
      }
    };

    window.addEventListener('triptailor_group_message', handleIncoming);
    window.addEventListener('storage', handleIncoming);

    return () => {
      window.removeEventListener('triptailor_group_message', handleIncoming);
      window.removeEventListener('storage', handleIncoming);
    };
  }, [isOpen, tripId, user?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (!user) {
      if (onOpenAuth) {
        onOpenAuth('login');
      }
      return;
    }

    sendGroupMessage({
      tripId,
      sender: user,
      text: inputText,
      tag: selectedTag,
    });

    setInputText('');
  };

  const handleQuickPrompt = (text: string, tag: 'general' | 'itinerary' | 'dining' | 'urgent') => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    sendGroupMessage({
      tripId,
      sender: user,
      text,
      tag,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Squad Group Chat</h3>
                <span className="text-[10px] bg-orange-500/30 text-orange-300 font-semibold px-2 py-0.5 rounded-full border border-orange-400/20">
                  {squadMembers.length} Members
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">{tripTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Account Switcher Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 px-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {user ? (
              <>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-300"
                />
                <span className="font-semibold text-slate-800 truncate">
                  Logged in as: <strong>{user.name}</strong>
                </span>
              </>
            ) : (
              <span className="text-slate-500">Viewing as Guest (Log in to chat)</span>
            )}
          </div>

          {onSwitchUser && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMemberSwitcher(!showMemberSwitcher)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer text-[11px]"
              >
                <ArrowRightLeft className="w-3 h-3 text-orange-600" />
                <span>Switch Member</span>
              </button>

              {showMemberSwitcher && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Squad Account:
                  </div>
                  {DEMO_USERS.map((demo) => {
                    const isCurrent = user?.email.toLowerCase() === demo.email.toLowerCase();
                    return (
                      <button
                        key={demo.id}
                        onClick={() => {
                          onSwitchUser(demo);
                          setShowMemberSwitcher(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isCurrent ? 'bg-orange-50 text-orange-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img
                          src={demo.avatar}
                          alt={demo.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{demo.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{demo.role}</div>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Squad Members Avatars Row */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
            Squad:
          </span>
          {squadMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 shrink-0"
              title={`${member.name} (${member.role || 'Member'})`}
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-[11px] font-medium text-slate-700">{member.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No messages yet in this group.</p>
              <p className="text-[11px]">Send a note below to start coordinating!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = user && msg.senderId === user.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                    {!isMine && (
                      <span className="font-bold text-slate-700">{msg.senderName}</span>
                    )}
                    {msg.senderRole && !isMine && (
                      <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded font-semibold">
                        {msg.senderRole}
                      </span>
                    )}
                    <span>{msg.timeFormatted}</span>
                  </div>

                  <div className="flex items-end gap-2 max-w-[85%]">
                    {!isMine && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMine
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {/* Tag pill if set */}
                      {msg.tag && msg.tag !== 'general' && (
                        <div className="mb-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isMine
                                ? 'bg-white/10 text-orange-300'
                                : msg.tag === 'dining'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : msg.tag === 'itinerary'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {msg.tag === 'dining' && <Utensils className="w-2.5 h-2.5" />}
                            {msg.tag === 'itinerary' && <Compass className="w-2.5 h-2.5" />}
                            {msg.tag === 'urgent' && <AlertCircle className="w-2.5 h-2.5" />}
                            <span>{msg.tag.toUpperCase()}</span>
                          </span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>

                  {/* Read receipts indicator */}
                  {isMine && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 pr-1">
                      {msg.readBy.length > 1 ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-500" />
                          <span>Seen by {msg.readBy.length - 1} {msg.readBy.length - 1 === 1 ? 'member' : 'members'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 text-slate-400" />
                          <span>Delivered to squad</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Travel Prompt Buttons */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white">
          <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span>Quick Squad Updates:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { text: "Just added a new stop to our Day itinerary!", tag: 'itinerary' as const, label: 'Added stop' },
              { text: "Shall we vote on tonight's dinner spot?", tag: 'dining' as const, label: 'Vote dinner' },
              { text: "Running 15 minutes behind schedule!", tag: 'urgent' as const, label: 'Running late' },
              { text: "Ready to leave the hotel whenever you guys are!", tag: 'general' as const, label: 'Ready' },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(p.text, p.tag)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input & Tag Selector Form */}
        <div className="p-3 border-t border-slate-200 bg-white space-y-2">
          {/* Tag Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Topic:</span>
            {(['general', 'itinerary', 'dining', 'urgent'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTag(t)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  selectedTag === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={user ? "Type a message to squad..." : "Log in to post a message..."}
              disabled={!user}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 focus:bg-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !user}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
