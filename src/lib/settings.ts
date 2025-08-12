
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(next: Settings) {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
