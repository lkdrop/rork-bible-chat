import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Volume2, Bookmark } from 'lucide-react-native';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import type { ThemeColors } from '@/constants/colors';

interface PrayerCardProps {
  content: string;
  colors: ThemeColors;
  isSpeaking?: boolean;
  onSpeak?: () => void;
  onSave?: () => void;
}

function PrayerCardComponent({ content, colors, isSpeaking = false, onSpeak, onSave }: PrayerCardProps) {
  const accent = '#8B5CF6';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Oração</Text>
      </View>
      <Text style={[styles.text, { color: colors.text }]}>
        {content}
      </Text>
      {(onSpeak || onSave) && (
        <View style={styles.actions}>
          {onSpeak && (
            <TouchableOpacity
              style={[styles.actionBtn, isSpeaking && styles.actionBtnActive]}
              onPress={onSpeak}
            >
              <Volume2 size={13} color={isSpeaking ? '#FFF' : accent} />
              <Text style={[styles.actionText, isSpeaking && { color: '#FFF' }]}>
                {isSpeaking ? 'Parar' : 'Ouvir'}
              </Text>
            </TouchableOpacity>
          )}
          {onSave && (
            <TouchableOpacity style={styles.actionBtn} onPress={onSave}>
              <Bookmark size={13} color={accent} />
              <Text style={styles.actionText}>Salvar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export const PrayerCard = React.memo(PrayerCardComponent);

const accent = '#8B5CF6';

const styles = StyleSheet.create({
  container: {
    backgroundColor: accent + '08',
    borderRadius: RADIUS.md,
    padding: SPACING.md - 4,
    borderWidth: 1,
    borderColor: accent + '20',
    marginVertical: SPACING.xs,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    lineHeight: 23,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm + 2,
    marginTop: SPACING.sm + 2,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: accent + '15',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: accent + '15',
  },
  actionBtnActive: {
    backgroundColor: accent,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: accent,
  },
});
