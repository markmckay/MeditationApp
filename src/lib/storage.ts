
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionLog } from '../types';
const KEY = 'dmx_breath_sessions_v1';

export async function saveSession(session: SessionLog) {
  const all = await getSessions();
  all.unshift(session);
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export async function getSessions(): Promise<SessionLog[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function clearSessions() {
  await AsyncStorage.removeItem(KEY);
}
