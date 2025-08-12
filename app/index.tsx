import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, Text, View, StyleSheet, Pressable, Alert } from 'react-native';

type Phase = 'idle' | 'breathing' | 'hold' | 'recovery';

export default function BreathApp() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isInhaling, setIsInhaling] = useState(true);
  
  const breathTimer = useRef<NodeJS.Timeout | null>(null);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (breathTimer.current) clearInterval(breathTimer.current);
      if (holdTimer.current) clearInterval(holdTimer.current);
    };
  }, []);

  const startBreathing = () => {
    setPhase('breathing');
    setBreathCount(0);
    setIsInhaling(true);
    breathingCycle();
  };

  const breathingCycle = () => {
    breathTimer.current = setInterval(() => {
      setBreathCount(prev => {
        const newCount = prev + 1;
        
        if (newCount <= 40) {
          setIsInhaling(prev => !prev);
          return newCount;
        } else {
          if (breathTimer.current) clearInterval(breathTimer.current);
          startHoldPhase();
          return newCount;
        }
      });
    }, 3000);
  };

  const startHoldPhase = () => {
    setPhase('hold');
    setHoldTime(0);
    
    holdTimer.current = setInterval(() => {
      setHoldTime(prev => prev + 1);
    }, 1000);
  };

  const endHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    setPhase('recovery');
    
    setTimeout(() => {
      if (currentRound < 4) {
        setCurrentRound(prev => prev + 1);
        setPhase('idle');
        setBreathCount(0);
        setHoldTime(0);
      } else {
        endSession();
      }
    }, 30000);
  };

  const endSession = () => {
    setPhase('idle');
    setCurrentRound(1);
    setBreathCount(0);
    setHoldTime(0);
    
    Alert.alert('Session Complete', 'Great job! You completed all 4 rounds.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'idle':
        return 'Ready to begin';
      case 'breathing':
        return isInhaling ? 'INHALE' : 'EXHALE';
      case 'hold':
        return 'HOLD YOUR BREATH';
      case 'recovery':
        return 'RECOVERY BREATHING';
      default:
        return '';
    }
  };

  const getButtonText = () => {
    switch (phase) {
      case 'idle':
        return `Start Round ${currentRound}`;
      case 'breathing':
        return 'Breathing...';
      case 'hold':
        return 'End Hold';
      case 'recovery':
        return 'Recovery...';
      default:
        return 'Start';
    }
  };

  const handleButtonPress = () => {
    switch (phase) {
      case 'idle':
        startBreathing();
        break;
      case 'hold':
        endHold();
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Breath App</Text>
        
        <View style={styles.roundIndicator}>
          <Text style={styles.roundText}>Round {currentRound} / 4</Text>
        </View>

        <View style={styles.phaseContainer}>
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
        </View>

        {phase === 'breathing' && (
          <View style={styles.breathCounter}>
            <Text style={styles.breathText}>Breath {breathCount} / 40</Text>
          </View>
        )}

        {phase === 'hold' && (
          <View style={styles.holdTimer}>
            <Text style={styles.holdText}>Hold Time: {formatTime(holdTime)}</Text>
          </View>
        )}

        <Pressable 
          onPress={handleButtonPress}
          disabled={phase === 'breathing' || phase === 'recovery'}
          style={({ pressed }) => [
            styles.button,
            { 
              opacity: (phase === 'breathing' || phase === 'recovery') ? 0.5 : pressed ? 0.9 : 1,
              backgroundColor: phase === 'hold' ? '#FF6B6B' : '#1DB954'
            }
          ]}
        >
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </Pressable>
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
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  roundIndicator: {
    marginBottom: 20,
  },
  roundText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  phaseContainer: {
    marginBottom: 30,
    minHeight: 60,
    justifyContent: 'center',
  },
  phaseText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  breathCounter: {
    marginBottom: 20,
  },
  breathText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  holdTimer: {
    marginBottom: 20,
  },
  holdText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 40,
    marginVertical: 12,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
});