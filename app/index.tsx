import React, { useState } from 'react';
import { SafeAreaView, Text, View, StyleSheet, Pressable } from 'react-native';

export default function App() {
  const [phase, setPhase] = useState('idle');
  const [breathCount, setBreathCount] = useState(0);

  const startBreathing = () => {
    setPhase('breathing');
    setBreathCount(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Breath App</Text>
        <Text style={styles.phaseText}>{phase.toUpperCase()}</Text>
        {phase === 'breathing' && (
          <Text style={styles.breathText}>
            Breath {breathCount} / 40
          </Text>
        )}
        <Pressable 
          onPress={startBreathing} 
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.9 : 1 }
          ]}
        >
          <Text style={styles.buttonText}>Start Round</Text>
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
  button: {
    backgroundColor: '#1DB954',
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