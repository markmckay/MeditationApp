import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, Text, View, StyleSheet, Pressable, Alert } from 'react-native';
import { logger } from '../src/lib/logger';
import { analytics } from '../src/lib/analytics';
import { performanceMonitor } from '../src/lib/performance';

type Phase = 'idle' | 'breathing' | 'hold' | 'recovery';

export default function BreathApp() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isInhaling, setIsInhaling] = useState(true);
  
  const breathTimer = useRef<NodeJS.Timeout | null>(null);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    logger.info('app', 'BreathApp component mounted');
    performanceMonitor.trackMemoryUsage();
    performanceMonitor.trackFrameRate();
    
    return () => {
      logger.info('app', 'BreathApp component unmounting');
      if (breathTimer.current) clearInterval(breathTimer.current);
      if (holdTimer.current) clearInterval(holdTimer.current);
      if (sessionId.current) {
        analytics.endSession();
      }
    };
  }, []);

  const startBreathing = () => {
    // Generate session ID if not exists
    if (!sessionId.current) {
      sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      analytics.startSession(sessionId.current, 4);
    }
    
    performanceMonitor.startTimer('breathing_round', { round: currentRound });
    analytics.trackPhaseChange('idle', 'breathing', { round: currentRound });
    
    setPhase('breathing');
    setBreathCount(0);
    setIsInhaling(true);
    
    logger.info('breathing', 'Breathing phase started', { 
      round: currentRound,
      sessionId: sessionId.current 
    });
    
    breathingCycle();
  };

  const breathingCycle = () => {
    analytics.trackBreathStart();
    
    breathTimer.current = setInterval(() => {
      setBreathCount(prev => {
        const newCount = prev + 1;
        
        if (newCount <= 40) {
          if (newCount > 1) {
            analytics.trackBreathEnd();
            analytics.trackBreathStart();
          }
          
          setIsInhaling(prev => !prev);
          logger.debug('breathing', `Breath ${newCount}/40`, { 
            isInhaling: !prev,
            round: currentRound 
          });
          return newCount;
        } else {
          analytics.trackBreathEnd();
          if (breathTimer.current) clearInterval(breathTimer.current);
          performanceMonitor.endTimer('breathing_round');
          startHoldPhase();
          return newCount;
        }
      });
    }, 3000);
  };

  const startHoldPhase = () => {
    analytics.trackPhaseChange('breathing', 'hold', { round: currentRound });
    analytics.trackHoldStart(currentRound);
    performanceMonitor.startTimer('hold_phase', { round: currentRound });
    
    setPhase('hold');
    setHoldTime(0);
    
    logger.info('breathing', 'Hold phase started', { round: currentRound });
    
    holdTimer.current = setInterval(() => {
      setHoldTime(prev => prev + 1);
    }, 1000);
  };

  const endHold = () => {
    const finalHoldTime = holdTime;
    analytics.trackHoldEnd(finalHoldTime, currentRound);
    performanceMonitor.endTimer('hold_phase');
    
    if (holdTimer.current) clearInterval(holdTimer.current);
    
    analytics.trackPhaseChange('hold', 'recovery', { 
      round: currentRound,
      holdDuration: finalHoldTime 
    });
    
    setPhase('recovery');
    
    logger.info('breathing', 'Hold phase ended', { 
      round: currentRound,
      holdDuration: finalHoldTime 
    });
    
    setTimeout(() => {
      if (currentRound < 4) {
        analytics.trackPhaseChange('recovery', 'idle', { nextRound: currentRound + 1 });
        setCurrentRound(prev => prev + 1);
        setPhase('idle');
        setBreathCount(0);
        setHoldTime(0);
        logger.info('breathing', 'Round completed, preparing for next', { 
          completedRound: currentRound,
          nextRound: currentRound + 1 
        });
      } else {
        endSession();
      }
    }, 30000);
  };

  const endSession = () => {
    const sessionData = analytics.endSession();
    const performanceData = performanceMonitor.getMetrics();
    
    setPhase('idle');
    setCurrentRound(1);
    setBreathCount(0);
    setHoldTime(0);
    sessionId.current = null;
    
    logger.info('session', 'Session completed successfully', {
      sessionData,
      performanceData
    });
    
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
    analytics.trackUserAction('button_press', { 
      phase, 
      currentRound,
      buttonText: getButtonText() 
    });
    
    switch (phase) {
      case 'idle':
        startBreathing();
        break;
      case 'hold':
        endHold();
        break;
      default:
        logger.warn('user', 'Button pressed in invalid phase', { phase });
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