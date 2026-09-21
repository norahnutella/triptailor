import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageSquare, Send, Users, X, RefreshCw, UserPlus, Search, Check } from 'lucide-react';
import { UserProfile, TripChatMessage, TripMember, TripSummary } from '../types';
import { addTripMember, getTripMessages, getTrips, searchTripTailorUsers, sendTripMessage } from '../data/api';

interface Props { isOpen: boolean; onClose: () => void; user: UserProfile | null; }

export const SquadChatDrawer: React.FC<Props> = ({ isOpen, onClose, user }) => {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [selected, setSelected] = useState<TripSummary | null>(null);
  const [messages, setMessages] = useState<TripChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState<TripMember[]>([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [addingMemberId, setAddingMemberId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadTrips = async () => {
    if (!user) return;
    setLoading(true); setError('');
    try {
      const list = await getTrips();
      setTrips(list);
      if (selected) setSelected(list.find((t) => t.id === selected.id) || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load trip chats.');
    } finally { setLoading(false); }
  };

  const openChat = async (trip: TripSummary) => {
    setSelected(trip); setMessages([]); setLoading(true); setError(''); setShowAddMembers(false);
    try { setMessages(await getTripMessages(trip.id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load this chat.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) { setSelected(null); setMessages([]); setShowAddMembers(false); loadTrips(); } }, [isOpen, user?.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!showAddMembers || memberSearch.trim().length < 2) { setMemberResults([]); return; }
    const timer = window.setTimeout(async () => {
      setSearchingMembers(true);
      try { setMemberResults(await searchTripTailorUsers(memberSearch.trim())); }
      catch (e) { setError(e instanceof Error ? e.message : 'Unable to search users.'); }
      finally { setSearchingMembers(false); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [memberSearch, showAddMembers]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected || !input.trim() || sending) return;
    setSending(true); setError('');
    try {
      const message = await sendTripMessage(selected.id, input.trim());
      setMessages((p) => [...p, message]);
      setInput('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send message.'); }
    finally { setSending(false); }
  };

  const handleAddMember = async (member: TripMember) => {
    if (!selected || addingMemberId) return;
    if (member.id === selected.owner.id || selected.members.some((m) => m.id === member.id)) return;
    setAddingMemberId(member.id); setError('');
    try {
      const updated = await addTripMember(selected.id, member.id);
      const next = trips.map((trip) => trip.id === updated.id ? { ...trip, ...updated } : trip);
      setTrips(next);
      setSelected(next.find((trip) => trip.id === updated.id) || null);
      setMemberResults((results) => results.filter((result) => result.id !== member.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add this member.');
    } finally { setAddingMemberId(null); }
  };

  if (!isOpen) return null;

  const isOwner = !!selected && selected.owner.id === user?.id;
  const existingMemberIds = new Set([selected?.owner.id, ...(selected?.members || []).map((m) => m.id)]);

  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {selected && <button onClick={() => { setSelected(null); setShowAddMembers(false); }} className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>}
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
          <div className="min-w-0"><h3 className="font-bold text-sm truncate">{selected?.title || 'Squad Chat'}</h3><p className="text-xs text-slate-400 truncate">{selected ? `${selected.members.length + 1} members` : 'Your trip conversations'}</p></div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
      </div>

      {!selected ? <div className="flex-1 overflow-y-auto p-4 bg-slate-50/60">
        <div className="flex items-center justify-between mb-3"><div><h4 className="text-sm font-bold text-slate-900">Your trip chats</h4><p className="text-[11px] text-slate-500">Each trip has its own separate chat.</p></div><button onClick={loadTrips} className="p-2 text-slate-500 cursor-pointer"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
        {error && <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{error}</div>}
        {loading && !trips.length ? <div className="py-12 text-center text-xs text-slate-400">Loading chats...</div> : !trips.length ? <div className="py-12 text-center"><MessageSquare className="w-9 h-9 mx-auto text-slate-300 mb-2" /><p className="text-xs font-semibold text-slate-600">No trip chats yet.</p><p className="text-[11px] text-slate-400 mt-1">Create a trip to start one.</p></div> : <div className="space-y-2">{trips.map((trip) => <button key={trip.id} onClick={() => openChat(trip)} className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-left hover:border-orange-300 hover:bg-orange-50/40 cursor-pointer"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div><div className="flex-1 min-w-0"><div className="text-sm font-bold text-slate-900 truncate">{trip.title}</div><div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1"><Users className="w-3 h-3" />{trip.members.length + 1} members</div></div><span className="text-slate-300 text-lg">›</span></div></button>)}</div>}
      </div> : <>
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Squad</span>
          <MemberPill member={selected.owner} />
          {selected.members.map((m) => <MemberPill key={m.id} member={m} />)}
          {isOwner && <button type="button" onClick={() => setShowAddMembers((v) => !v)} className="ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold hover:bg-orange-100 cursor-pointer"><UserPlus className="w-3 h-3" />Add Members</button>}
        </div>

        {showAddMembers && isOwner && <div className="px-4 py-3 border-b border-slate-200 bg-white space-y-2.5">
          <div className="flex items-center justify-between"><div><h4 className="text-xs font-bold text-slate-900">Add TripTailor Users</h4><p className="text-[10px] text-slate-500">Search registered users by name or email.</p></div><button type="button" onClick={() => setShowAddMembers(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button></div>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input autoFocus value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Search name or email..." className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500" /></div>
          {searchingMembers && <div className="text-[10px] text-slate-400">Searching...</div>}
          {!searchingMembers && memberSearch.trim().length >= 2 && !memberResults.length && <div className="text-[10px] text-slate-400">No registered users found.</div>}
          {memberResults.length > 0 && <div className="max-h-40 overflow-y-auto space-y-1">{memberResults.map((member) => {
            const alreadyAdded = existingMemberIds.has(member.id);
            return <div key={member.id} className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-slate-50">
              <img src={member.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              <div className="min-w-0 flex-1"><div className="text-xs font-semibold text-slate-800 truncate">{member.name}</div><div className="text-[10px] text-slate-400 truncate">{member.email}</div></div>
              {alreadyAdded ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><Check className="w-3 h-3" />Added</span> : <button type="button" onClick={() => handleAddMember(member)} disabled={!!addingMemberId} className="px-2.5 py-1.5 rounded-lg bg-orange-600 text-white text-[10px] font-bold disabled:opacity-50 cursor-pointer">{addingMemberId === member.id ? 'Adding...' : 'Add'}</button>}
            </div>;
          })}</div>}
        </div>}

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">{error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{error}</div>}{loading ? <div className="py-12 text-center text-xs text-slate-400">Loading messages...</div> : !messages.length ? <div className="py-12 text-center text-slate-400"><MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" /><p className="text-xs">No messages yet.</p></div> : messages.map((m) => { const mine = m.sender.id === user?.id; return <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className="max-w-[82%]">{!mine && <div className="text-[10px] font-bold text-slate-500 mb-1">{m.sender.name}</div>}<div className={`px-3 py-2.5 rounded-2xl text-xs ${mine ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>{m.text}</div><div className="text-[9px] text-slate-400 mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div></div></div>; })}<div ref={endRef} /></div>
        <form onSubmit={send} className="p-3 border-t border-slate-200 flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${selected.title}...`} className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500" /><button disabled={sending || !input.trim()} className="w-10 h-10 bg-orange-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center cursor-pointer"><Send className="w-4 h-4" /></button></form>
      </>}
    </div>
  </div>;
};

const MemberPill: React.FC<{ member: TripMember }> = ({ member }) => <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 shrink-0"><img src={member.avatar} alt="" className="w-5 h-5 rounded-full object-cover" /><span className="text-[10px] font-medium text-slate-700">{member.name.split(' ')[0]}</span></div>;
