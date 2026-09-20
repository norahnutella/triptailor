import { Collaborator, GroupMessage, UserProfile } from '../types';

const PREFIX = 'triptailor_group_messages_v2_';
const unreadKey = (id: string) => `triptailor_chat_unread_${id}`;

function read(tripId: string): GroupMessage[] {
  try { return JSON.parse(localStorage.getItem(PREFIX + tripId) || '[]'); } catch { return []; }
}
function write(tripId: string, messages: GroupMessage[]) { localStorage.setItem(PREFIX + tripId, JSON.stringify(messages)); }

export function getGroupMessages(tripId: string): GroupMessage[] { return read(tripId); }

export function sendGroupMessage({ tripId, sender, text, tag = 'general' }: { tripId: string; sender: UserProfile; text: string; tag?: GroupMessage['tag'] }) {
  const now = Date.now();
  const message: GroupMessage = {
    id: `msg-${now}`, tripId, senderId: sender.id, senderName: sender.name, senderAvatar: sender.avatar,
    senderRole: sender.role || 'Member', text: text.trim(), timestamp: now,
    timeFormatted: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), readBy: [sender.id], tag,
  };
  write(tripId, [...read(tripId), message]);
  window.dispatchEvent(new CustomEvent('triptailor_group_message'));
  return message;
}

export function markGroupMessagesAsRead(tripId: string, userId: string) {
  const messages = read(tripId).map((m) => m.readBy.includes(userId) ? m : { ...m, readBy: [...m.readBy, userId] });
  write(tripId, messages); localStorage.removeItem(unreadKey(userId));
}

export function getUnreadGroupMessagesCount(userId: string): number {
  const value = Number(localStorage.getItem(unreadKey(userId)) || 0); return Number.isFinite(value) ? value : 0;
}

export function getSquadMembers(user: UserProfile | null): Collaborator[] {
  if (!user) return [];
  return [{ id: user.id, name: user.name, avatar: user.avatar, role: user.role || 'Member', status: 'VIEWING', currentAction: 'Online', color: 'orange' }];
}
