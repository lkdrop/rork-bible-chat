import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { quizQuestions, LifeArea } from '@/constants/prayers';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

export default function QuizScreen() {
  const router = useRouter();
  const { completeQuiz } = usePrayerGuide();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<LifeArea[]>([]);
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleSelect = useCallback((area: LifeArea) => {
    setSelectedAnswers(prev => {
      const exists = prev.includes(area);
      if (exists) {
        return prev.filter(a => a !== area);
      }
      return [...prev, area];
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestion < quizQuestions.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(prev => prev + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      void completeQuiz(selectedAnswers);
      router.replace('/(tabs)/(guide)/index' as any);
    }
  }, [currentQuestion, selectedAnswers, fadeAnim, router, completeQuiz]);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(prev => prev - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [currentQuestion, fadeAnim]);

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Pergunta {currentQuestion + 1} de {quizQuestions.length}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.iconContainer}>
            <Sparkles size={40} color={Colors.accent.gold} />
          </View>

          <Text style={styles.question}>{question.question}</Text>
          <Text style={styles.subtitle}>
            Você pode selecionar múltiplas opções
          </Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id as LifeArea);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelect(option.id as LifeArea)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonBack]}
          onPress={handleBack}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft size={24} color={currentQuestion === 0 ? Colors.text.muted : Colors.primary.navy} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.navButtonNext,
            selectedAnswers.length === 0 && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedAnswers.length === 0}
        >
          <Text style={styles.navButtonText}>
            {currentQuestion === quizQuestions.length - 1 ? 'Finalizar' : 'Próximo'}
          </Text>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary.navy,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.gold,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text.light,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.accent.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary.navy,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: Colors.accent.gold,
    backgroundColor: `${Colors.accent.gold}10`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent.gold,
    borderColor: Colors.accent.gold,
  },
  checkmark: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: '700',
  },
  optionText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary.navy,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: Colors.background.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  navButtonBack: {
    width: 50,
    backgroundColor: Colors.background.cream,
  },
  navButtonNext: {
    flex: 1,
    backgroundColor: Colors.primary.navy,
  },
  navButtonDisabled: {
    backgroundColor: Colors.text.muted,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.light,
  },
});
