
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

export type Settings = {
  breathsPerRound: number;
  breathMs: number;
  cueSeconds: number;
  bgmEnabled: boolean;
  bgmVolume: number;
  sfxVolume: number;
  roundsPlanned: number;
};

const KEY = 'dmx_breath_settings_v1';

export const DEFAULTS: Settings = {
  breathsPerRound: 40,
  breathMs: 3000,
  cueSeconds: 30,
  bgmEnabled: true,
  bgmVolume: 0.4,
  sfxVolume: 0.8,
  roundsPlanned: 4,
};

export async function loadSettings(): Promise<Settings> {
  try {
    logger.debug('settings', 'Loading settings from storage');
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      logger.info('settings', 'No saved settings found, using defaults');
      return DEFAULTS;
    }
    
    const settings = { ...DEFAULTS, ...JSON.parse(raw) };
    logger.info('settings', 'Settings loaded successfully', settings);
    return settings;
  } catch (error) {
    logger.error('settings', 'Failed to load settings, using defaults', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return DEFAULTS;
  }
}

export async function saveSettings(next: Settings) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    logger.info('settings', 'Settings saved successfully', next);
  } catch (error) {
    logger.error('settings', 'Failed to save settings', { 
      settings: next,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
