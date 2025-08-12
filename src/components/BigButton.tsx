
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function BigButton({ label, onPress, color='#1DB954' }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} style={({pressed})=>[styles.button,{backgroundColor:color,opacity:pressed?0.9:1}]}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 24, paddingVertical: 28, marginVertical: 12, width: '100%', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: '700', color: 'white' }
});
