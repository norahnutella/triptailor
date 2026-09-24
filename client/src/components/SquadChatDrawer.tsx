import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, MessageSquare, Send, Users, X, RefreshCw, Plus, Trash2, Pencil,
  Search, Paperclip, BarChart3, Download, MoreVertical, FileText, Check,
} from 'lucide-react';
import { UserProfile, TripChatMessage, TripMember, TripSummary } from '../types';
import {
  addTripMember, createTripPoll, deleteTrip, getTripMessages, getTrips,
  removeTripMember, searchTripTailorUsers, sendTripFile, sendTripMessage,
  updateTrip, voteTripPoll,
} from '../data/api';

interface Props { isOpen: boolean; onClose: () => void; user: UserProfile | null; onCreateChat?: () => void; }

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export const SquadChatDrawer: React.FC<Props> = ({ isOpen, onClose, user, onCreateChat }) => {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [selected, setSelected] = useState<TripSummary | null>(null);
  const [messages, setMessages] = useState<TripChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [manageMembers, setManageMembers] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<TripMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isOwner = !!selected && selected.owner.id === user?.id;

  const loadTrips = async () => {
    if (!user) return;
    setLoading(true); setError('');
    try {
      const list = await getTrips();
      setTrips(list);
      if (selected && !list.some((t) => t.id === selected.id)) {
        setSelected(null);
        setMessages([]);
        setManageMembers(false);
        setShowActions(false);
      } else if (selected) {
        setSelected(list.find((t) => t.id === selected.id) || null);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load trip chats.'); }
    finally { setLoading(false); }
  };

  const openChat = async (trip: TripSummary) => {
    setSelected(trip); setMessages([]); setLoading(true); setError('');
    setManageMembers(false); setShowActions(false); setShowPoll(false);
    try { setMessages(await getTripMessages(trip.id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load this chat.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) { setSelected(null); setMessages([]); setManageMembers(false); setShowActions(false); loadTrips(); }
  }, [isOpen, user?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!manageMembers || search.trim().length < 2) { setResults([]); return; }
    const timer = window.setTimeout(async () => {
      try {
        const found = await searchTripTailorUsers(search.trim());
        setResults(found.filter((u) => u.id !== selected?.owner.id && !selected?.members.some((m) => m.id === u.id)));
      } catch (e) { setError(e instanceof Error ? e.message : 'Unable to search users.'); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, manageMembers, selected]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !input.trim() || sending) return;
    setSending(true); setError('');
    try {
      const message = await sendTripMessage(selected.id, input.trim());
      setMessages((p) => [...p, message]); setInput('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send message.'); }
    finally { setSending(false); }
  };

  const renameChat = async () => {
    if (!selected || !newName.trim() || saving || !isOwner) return;
    setSaving(true); setError('');
    try {
      const trip = await updateTrip(selected.id, { title: newName.trim() });
      setSelected(trip as TripSummary); setNewName(''); setEditingName(false); await loadTrips();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to rename chat.'); }
    finally { setSaving(false); }
  };

  const addMember = async (member: TripMember) => {
    if (!selected || !isOwner || saving) return;
    setSaving(true); setError('');
    try {
      const trip = await addTripMember(selected.id, member.id);
      setSelected(trip as TripSummary); setSearch(''); setResults([]); await loadTrips();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to add member.'); }
    finally { setSaving(false); }
  };

  const removeMember = async (member: TripMember) => {
    if (!selected || !isOwner || saving) return;
    if (!window.confirm(`Remove ${member.name} from ${selected.title}?`)) return;
    setSaving(true); setError('');
    try {
      const trip = await removeTripMember(selected.id, member.id);
      setSelected(trip as TripSummary); await loadTrips();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to remove member.'); }
    finally { setSaving(false); }
  };

  const removeChat = async () => {
    if (!selected || !isOwner || saving) return;
    if (!window.confirm(`Delete the chat "${selected.title}"? This permanently deletes its messages and cannot be undone.`)) return;
    setSaving(true); setError('');
    try {
      await deleteTrip(selected.id);
      setSelected(null); setMessages([]); setManageMembers(false); setShowActions(false); await loadTrips();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete chat.'); }
    finally { setSaving(false); }
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selected || sending) return;
    if (file.size > MAX_FILE_SIZE) { setError('Files must be 2 MB or smaller.'); return; }
    setSending(true); setError('');
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const message = await sendTripFile(selected.id, { name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl });
      setMessages((p) => [...p, message]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to attach this file.'); }
    finally { setSending(false); }
  };

  const createPoll = async () => {
    if (!selected || !pollQuestion.trim() || saving) return;
    const options = pollOptions.map((x) => x.trim()).filter(Boolean);
    if (options.length < 2) { setError('Add at least two poll options.'); return; }
    setSaving(true); setError('');
    try {
      const message = await createTripPoll(selected.id, pollQuestion.trim(), options);
      setMessages((p) => [...p, message]); setPollQuestion(''); setPollOptions(['', '']); setShowPoll(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create poll.'); }
    finally { setSaving(false); }
  };

  const vote = async (message: TripChatMessage, optionIndex: number) => {
    if (!selected || message.kind !== 'poll') return;
    try {
      const updated = await voteTripPoll(selected.id, message.id, optionIndex);
      setMessages((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to record your vote.'); }
  };

  if (!isOpen) return null;

  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {selected && <button onClick={() => { setSelected(null); setManageMembers(false); }} className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>}
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
          <div className="min-w-0"><h3 className="font-bold text-sm truncate">{selected?.title || 'Squad Chat'}</h3><p className="text-xs text-slate-400 truncate">{selected ? `${selected.members.length + 1} members` : 'Your trip conversations'}</p></div>
        </div>
        <div className="flex items-center gap-1">
          {selected && <div className="relative"><button onClick={() => setShowActions((v) => !v)} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"><MoreVertical className="w-5 h-5" /></button>{showActions && <div className="absolute right-0 top-9 w-44 bg-white text-slate-700 rounded-xl shadow-xl border border-slate-200 p-1.5 z-50">
            {isOwner && <><button onClick={() => { setEditingName(true); setNewName(selected.title); setShowActions(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold flex items-center gap-2"><Pencil className="w-3.5 h-3.5" />Edit chat name</button><button onClick={removeChat} disabled={saving} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" />Delete chat</button></>}
            {!isOwner && <div className="px-3 py-2 text-[10px] text-slate-500">Only the trip owner can rename or delete this chat.</div>}
          </div>}</div>}
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {!selected ? <div className="flex-1 overflow-y-auto p-4 bg-slate-50/60">
        <div className="flex items-center justify-between mb-3"><div><h4 className="text-sm font-bold text-slate-900">Your trip chats</h4><p className="text-[11px] text-slate-500">Every trip has a separate conversation.</p></div><div className="flex items-center gap-1"><button onClick={onCreateChat} disabled={!onCreateChat} className="px-2.5 py-1.5 bg-orange-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"><Plus className="w-3 h-3" />New chat</button><button onClick={loadTrips} className="p-2 text-slate-500 cursor-pointer" title="Refresh chats"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div></div>
        {error && <ErrorBox message={error} />}
        {loading && !trips.length ? <div className="py-12 text-center text-xs text-slate-400">Loading chats...</div> : !trips.length ? <div className="py-12 text-center"><MessageSquare className="w-9 h-9 mx-auto text-slate-300 mb-2" /><p className="text-xs font-semibold text-slate-600">No trip chats yet.</p><p className="text-[11px] text-slate-400 mt-1">Create a trip to start one.</p></div> : <div className="space-y-2">{trips.map((trip) => <button key={trip.id} onClick={() => openChat(trip)} className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-left hover:border-orange-300 hover:bg-orange-50/40 cursor-pointer"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div><div className="flex-1 min-w-0"><div className="text-sm font-bold text-slate-900 truncate">{trip.title}</div><div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1"><Users className="w-3 h-3" />{trip.members.length + 1} members</div></div><span className="text-slate-300 text-lg">›</span></div></button>)}</div>}
      </div> : <>
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Members</span><MemberPill member={selected.owner} />{selected.members.map((m) => <MemberPill key={m.id} member={m} />)}
          <button onClick={() => setManageMembers((v) => !v)} className="ml-auto shrink-0 px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"><Users className="w-3 h-3" />Manage</button>
        </div>

        {editingName && isOwner && <div className="p-3 border-b border-slate-200 bg-white flex gap-2"><input value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg" autoFocus /><button onClick={renameChat} disabled={!newName.trim() || saving} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold">Save</button><button onClick={() => setEditingName(false)} className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold">Cancel</button></div>}

        {manageMembers && <div className="p-3 border-b border-slate-200 bg-white space-y-3"><div className="flex items-center gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search registered users..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" /></div>{isOwner && <button onClick={() => { setEditingName(true); setNewName(selected.title); }} className="px-2.5 py-2 border border-slate-200 rounded-lg text-slate-600 cursor-pointer" title="Rename chat"><Pencil className="w-3.5 h-3.5" /></button>}</div>
          {!isOwner && <div className="text-[11px] text-slate-500">Only the trip owner can manage members.</div>}
          {isOwner && results.length > 0 && <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">{results.map((u) => <button key={u.id} onClick={() => addMember(u)} className="w-full p-2.5 flex items-center gap-2 text-left hover:bg-orange-50 cursor-pointer"><img src={u.avatar} className="w-7 h-7 rounded-full object-cover" alt="" /><div className="flex-1 min-w-0"><div className="text-xs font-semibold text-slate-800 truncate">{u.name}</div><div className="text-[10px] text-slate-500 truncate">{u.email}</div></div><Plus className="w-3.5 h-3.5 text-orange-600" /></button>)}</div>}
          {isOwner && <div className="flex flex-wrap gap-2">{selected.members.map((m) => <div key={m.id} className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"><span className="text-[10px] font-semibold text-slate-700">{m.name}</span><button onClick={() => removeMember(m)} className="text-rose-500 cursor-pointer" title="Remove member"><Trash2 className="w-3 h-3" /></button></div>)}</div>}
        </div>}

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {error && <ErrorBox message={error} />}
          {loading ? <div className="py-12 text-center text-xs text-slate-400">Loading messages...</div> : !messages.length ? <div className="py-12 text-center text-slate-400"><MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" /><p className="text-xs">No messages yet.</p></div> : messages.map((m) => <MessageBubble key={m.id} message={m} currentUserId={user?.id} onVote={(index) => vote(m, index)} />)}
          <div ref={endRef} />
        </div>

        {showPoll && <div className="p-3 border-t border-slate-200 bg-white space-y-2.5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-800">Create poll</span><button onClick={() => setShowPoll(false)} className="text-slate-400"><X className="w-4 h-4" /></button></div><input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Ask your squad..." className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />{pollOptions.map((option, i) => <input key={i} value={option} onChange={(e) => setPollOptions((items) => items.map((x, j) => j === i ? e.target.value : x))} placeholder={`Option ${i + 1}`} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />)}{pollOptions.length < 6 && <button onClick={() => setPollOptions((items) => [...items, ''])} className="text-[10px] font-bold text-orange-600">+ Add option</button>}<button onClick={createPoll} disabled={saving || !pollQuestion.trim()} className="w-full py-2 bg-orange-600 text-white rounded-lg text-xs font-bold">Create Poll</button></div>}

        <form onSubmit={send} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
          <input ref={fileInputRef as any} type="file" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach file" className="w-9 h-9 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-50 cursor-pointer"><Paperclip className="w-4 h-4" /></button>
          <button type="button" onClick={() => setShowPoll((v) => !v)} title="Create poll" className={`w-9 h-9 border rounded-xl flex items-center justify-center cursor-pointer ${showPoll ? 'border-orange-300 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><BarChart3 className="w-4 h-4" /></button>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${selected.title}...`} className="flex-1 min-w-0 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500" />
          <button disabled={sending || !input.trim()} className="w-10 h-10 bg-orange-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center cursor-pointer"><Send className="w-4 h-4" /></button>
        </form>
      </>}
    </div>
  </div>;
};

const ErrorBox: React.FC<{ message: string }> = ({ message }) => <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[10px] text-red-700 font-semibold">{message}</div>;

const MemberPill: React.FC<{ member: TripMember }> = ({ member }) => <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 shrink-0"><img src={member.avatar} alt="" className="w-5 h-5 rounded-full object-cover" /><span className="text-[10px] font-medium text-slate-700">{member.name.split(' ')[0]}</span></div>;

const MessageBubble: React.FC<{ message: TripChatMessage; currentUserId?: string; onVote: (index: number) => void }> = ({ message, currentUserId, onVote }) => {
  const mine = message.sender.id === currentUserId;
  return <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
    <div className="max-w-[86%]">
      <div className={`text-[10px] font-bold mb-1 ${mine ? 'text-right text-orange-700' : 'text-slate-600'}`}>{message.sender.name}</div>
      {message.kind === 'file' && message.attachment ? <a href={message.attachment.dataUrl} download={message.attachment.name} className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl ${mine ? 'bg-orange-600 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}><FileText className="w-4 h-4 shrink-0" /><span className="min-w-0"><span className="block text-xs font-semibold truncate max-w-[190px]">{message.attachment.name}</span><span className={`block text-[9px] ${mine ? 'text-orange-100' : 'text-slate-400'}`}>{formatBytes(message.attachment.size)} · Download</span></span><Download className="w-4 h-4 shrink-0" /></a> : message.kind === 'poll' && message.poll ? <div className="bg-white border border-slate-200 rounded-2xl p-3.5 w-[260px]"><div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-orange-600" /><span className="text-xs font-bold text-slate-900">{message.poll.question}</span></div><div className="space-y-1.5">{message.poll.options.map((option, index) => <button key={index} onClick={() => onVote(index)} className={`w-full text-left px-3 py-2 rounded-lg border text-[11px] font-semibold ${message.poll?.votedOptionIndex === index ? 'border-orange-400 bg-orange-50 text-orange-800' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}><div className="flex justify-between gap-2"><span>{option.text}</span><span className="text-slate-400">{option.votes}</span></div></button>)}</div><div className="text-[9px] text-slate-400 mt-2">Your vote can be changed.</div></div> : <div className={`px-3 py-2.5 rounded-2xl text-xs ${mine ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>{message.text}</div>}
      <div className={`text-[9px] text-slate-400 mt-1 ${mine ? 'text-right' : ''}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
    </div>
  </div>;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Unable to read file.')); reader.readAsDataURL(file); });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
