
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import type { SessionLog } from '../types';
const KEY = 'dmx_breath_sessions_v1';

export async function saveSession(session: SessionLog) {
  logger.info('storage', 'Saving session', { sessionId: session.id });
  
  const all = await getSessions();
  all.unshift(session);
  
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
    logger.info('storage', 'Session saved successfully', { 
      sessionId: session.id,
      totalSessions: all.length 
    });
  } catch (error) {
    logger.error('storage', 'Failed to save session', { 
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function getSessions(): Promise<SessionLog[]> {
  try {
    logger.debug('storage', 'Loading sessions from storage');
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      logger.debug('storage', 'No sessions found in storage');
      return [];
    }
    
    const sessions = JSON.parse(raw);
    logger.info('storage', 'Sessions loaded successfully', { count: sessions.length });
    return sessions;
  } catch (error) {
    logger.error('storage', 'Failed to load sessions', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
}

export async function clearSessions() {
  try {
    await AsyncStorage.removeItem(KEY);
    logger.info('storage', 'All sessions cleared successfully');
  } catch (error) {
    logger.error('storage', 'Failed to clear sessions', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
