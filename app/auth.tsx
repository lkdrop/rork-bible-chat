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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, CheckCircle } from 'lucide-react-native';
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

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
        setSuccessMsg('Email de recuperação enviado! Verifique sua caixa de entrada.');
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
        setSentEmail(email.trim());
        setEmailSent(true);
      }
    } else {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError);
      } else {
        router.replace('/(tabs)/(home)');
      }
    }
  }, [email, password, confirmPassword, mode, signIn, signUp, resetPassword]);

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email Confirmation Screen */}
        {emailSent ? (
          <View style={styles.emailSentContainer}>
            <View style={[styles.emailSentIcon, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
              <CheckCircle size={48} color="#22C55E" />
            </View>
            <Text style={[styles.emailSentTitle, { color: colors.text }]}>
              Email de confirmação enviado!
            </Text>
            <Text style={[styles.emailSentDesc, { color: colors.textSecondary }]}>
              Enviamos um link de confirmação para:
            </Text>
            <View style={[styles.emailBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Mail size={16} color="#C5943A" />
              <Text style={[styles.emailBadgeText, { color: colors.text }]}>{sentEmail}</Text>
            </View>
            <Text style={[styles.emailSentHint, { color: colors.textMuted }]}>
              Verifique sua caixa de entrada e spam. Clique no link para ativar sua conta.
            </Text>
            <TouchableOpacity
              style={styles.emailSentButton}
              onPress={() => {
                setEmailSent(false);
                setMode('login');
                setPassword('');
                setConfirmPassword('');
                setError(null);
              }}
            >
              <LinearGradient
                colors={['#C5943A', '#D4A84B']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitText}>Ir para Login</Text>
                <ArrowRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
        <>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#C5943A', '#D4A84B', '#C5943A']}
            style={styles.iconContainer}
          >
            <BookOpen size={40} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.title, { color: colors.text }]}>Devocio</Text>
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

          {/* Success */}
          {successMsg && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMsg}</Text>
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
            <TouchableOpacity onPress={() => switchMode('forgot')}>
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
                <TouchableOpacity onPress={() => switchMode('register')}>
                  <Text style={[styles.toggleLink, { color: colors.primary }]}> Criar conta</Text>
                </TouchableOpacity>
              </>
            )}
            {mode === 'register' && (
              <>
                <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                  Já tem uma conta?
                </Text>
                <TouchableOpacity onPress={() => switchMode('login')}>
                  <Text style={[styles.toggleLink, { color: colors.primary }]}> Entrar</Text>
                </TouchableOpacity>
              </>
            )}
            {mode === 'forgot' && (
              <TouchableOpacity onPress={() => switchMode('login')}>
                <Text style={[styles.toggleLink, { color: colors.primary }]}>Voltar para login</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Termos */}
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade
          </Text>
        </View>
        </>
        )}
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
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderRadius: 10,
    padding: 12,
  },
  successText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  emailSentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emailSentIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emailSentTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailSentDesc: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  emailBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emailSentHint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  emailSentButton: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
});
