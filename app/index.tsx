import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import * as Speech from 'expo-speech';
import BigButton from '../src/components/BigButton';
import { loadSettings, saveSettings, DEFAULTS, type Settings } from '../src/lib/settings';
import { getSessions, saveSession, clearSessions } from '../src/lib/storage';
import type { SessionLog, RoundLog } from '../src/types';

export default function App() {
  useKeepAwake();
  const [phase, setPhase] = useState('idle');
  const [breathCount, setBreathCount] = useState(0);
  const [holdMs, setHoldMs] = useState(0);
  const [rounds, setRounds] = useState<RoundLog[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  const inhaleRef = useRef<Audio.Sound | null>(null);
  const exhaleRef = useRef<Audio.Sound | null>(null);
  const ambientRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadSettings().then(setSettings);
    (async () => {
      try {
        inhaleRef.current = new Audio.Sound();
        await inhaleRef.current.loadAsync(require('../assets/sounds/inhale.wav'));
        exhaleRef.current = new Audio.Sound();
        await exhaleRef.current.loadAsync(require('../assets/sounds/exhale.wav'));
        ambientRef.current = new Audio.Sound();
        await ambientRef.current.loadAsync(require('../assets/sounds/ambient.wav'), { 
          isLooping: true, 
          volume: DEFAULTS.bgmVolume 
        });
      } catch (error) {
        console.log('Audio loading error:', error);
      }
    })();
  }, []);

  const startBreathing = () => {
    setPhase('breathing');
    setBreathCount(0);
    inhaleRef.current?.replayAsync();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.phaseText}>{phase.toUpperCase()}</Text>
        {phase === 'breathing' && (
          <Text style={styles.breathText}>
            Breath {breathCount} / {settings.breathsPerRound}
          </Text>
        )}
        <BigButton label="Start Round" onPress={startBreathing} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  phaseText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  breathText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
});