import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bookmark, Share2 } from 'lucide-react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

interface VerseCardProps {
  text: string;
  reference?: string;
  onSave?: () => void;
  onShare?: () => void;
}

function VerseCardComponent({ text, reference, onSave, onShare }: VerseCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <Text style={styles.text}>"{text}"</Text>
        {reference && (
          <Text style={styles.reference}>— {reference}</Text>
        )}
        {(onSave || onShare) && (
          <View style={styles.actions}>
            {onSave && (
              <TouchableOpacity style={styles.actionBtn} onPress={onSave}>
                <Bookmark size={13} color={COLORS.gold} />
                <Text style={styles.actionText}>Salvar</Text>
              </TouchableOpacity>
            )}
            {onShare && (
              <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
                <Share2 size={13} color={COLORS.gold} />
                <Text style={styles.actionText}>Compartilhar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export const VerseCard = React.memo(VerseCardComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.gold + '10',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  accent: {
    width: 4,
    backgroundColor: COLORS.gold,
  },
  content: {
    flex: 1,
    padding: SPACING.md - 4,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
    color: '#5A4A1E',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  reference: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.gold,
    marginTop: SPACING.sm - 2,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md - 4,
    marginTop: SPACING.sm + 2,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gold + '20',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gold + '15',
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gold,
  },
});
