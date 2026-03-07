import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

type AuthMode = 'login' | 'register' | 'forgot';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, isLoading } = useAuth();
  const { colors } = useApp();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!email.trim()) {
      setError('Digite seu email');
      return;
    }

    if (mode === 'forgot') {
      const { error: resetError } = await resetPassword(email.trim());
      if (resetError) {
        setError(resetError);
      } else {
        Alert.alert('Email Enviado', 'Verifique sua caixa de entrada para redefinir sua senha.');
        setMode('login');
      }
      return;
    }

    if (!password) {
      setError('Digite sua senha');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      const { error: signUpError } = await signUp(email.trim(), password);
      if (signUpError) {
        setError(signUpError);
      } else {
        Alert.alert(
          'Conta Criada!',
          'Verifique seu email para confirmar sua conta.',
          [{ text: 'OK', onPress: () => setMode('login') }],
        );
      }
    } else {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError);
      }
      // Navigation will be handled by the layout
    }
  }, [email, password, confirmPassword, mode, signIn, signUp, resetPassword]);

  const skipAuth = useCallback(() => {
    router.replace('/(tabs)/(home)');
  }, [router]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#C5943A', '#D4A84B', '#C5943A']}
            style={styles.iconContainer}
          >
            <BookOpen size={40} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.title, { color: colors.text }]}>Bible Chat AI</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'login' && 'Entre na sua conta'}
            {mode === 'register' && 'Crie sua conta gratuita'}
            {mode === 'forgot' && 'Recupere sua senha'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Mail size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          {mode !== 'forgot' && (
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Lock size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Senha"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Confirm Password */}
          {mode === 'register' && (
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Lock size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirmar senha"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Forgot password link */}
          {mode === 'login' && (
            <TouchableOpacity onPress={() => { setMode('forgot'); setError(null); }}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#C5943A', '#D4A84B']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {mode === 'login' && 'Entrar'}
                    {mode === 'register' && 'Criar Conta'}
                    {mode === 'forgot' && 'Enviar Email'}
                  </Text>
                  <ArrowRight size={20} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Toggle mode */}
          <View style={styles.toggleContainer}>
            {mode === 'login' && (
              <>
                <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                  Não tem uma conta?
                </Text>
                <TouchableOpacity onPress={() => { setMode('register'); setError(null); }}>
                  <Text style={[styles.toggleLink, { color: colors.primary }]}> Criar conta</Text>
                </TouchableOpacity>
              </>
            )}
            {mode === 'register' && (
              <>
                <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                  Já tem uma conta?
                </Text>
                <TouchableOpacity onPress={() => { setMode('login'); setError(null); }}>
                  <Text style={[styles.toggleLink, { color: colors.primary }]}> Entrar</Text>
                </TouchableOpacity>
              </>
            )}
            {mode === 'forgot' && (
              <TouchableOpacity onPress={() => { setMode('login'); setError(null); }}>
                <Text style={[styles.toggleLink, { color: colors.primary }]}>Voltar para login</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Skip auth */}
          <TouchableOpacity style={styles.skipButton} onPress={skipAuth}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              Continuar sem conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
