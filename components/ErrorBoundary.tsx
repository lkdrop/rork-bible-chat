import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, this could send to a crash reporting service
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>🙏</Text>
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.message}>
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </Text>
          {__DEV__ && this.state.error && (
            <ScrollView style={styles.errorBox} contentContainerStyle={styles.errorBoxContent}>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
            </ScrollView>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FBF8F1',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#5A5A5E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorBox: {
    maxHeight: 120,
    width: '100%',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    marginBottom: 24,
  },
  errorBoxContent: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#C5943A',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
