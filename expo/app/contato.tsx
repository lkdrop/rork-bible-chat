import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Clock, MessageCircle } from 'lucide-react-native';

export default function ContatoScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  const handleEmail = () => {
    Linking.openURL('mailto:contato@devocioai.com?subject=Contato via App Devocio.IA');
  };

  const handleSubmit = () => {
    if (!form.nome || !form.email || !form.mensagem) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para enviar.');
      return;
    }
    // Em produção, conectar a serviço de email
    setSent(true);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color="#9E8E7E" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contato</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>SUPORTE</Text>
        <Text style={s.title}>Entre em Contato</Text>
        <Text style={s.subtitle}>Nossa equipe responde em até 24 horas úteis.</Text>

        {/* Info cards */}
        <View style={s.cards}>
          <TouchableOpacity style={s.card} onPress={handleEmail}>
            <View style={[s.cardIcon, { backgroundColor: 'rgba(197,148,58,0.12)' }]}>
              <Mail size={18} color="#C5943A" />
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle}>E-mail</Text>
              <Text style={[s.cardDesc, { color: '#C5943A' }]}>contato@devocioai.com</Text>
              <Text style={s.cardSub}>Toque para abrir</Text>
            </View>
          </TouchableOpacity>

          <View style={s.card}>
            <View style={[s.cardIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
              <Clock size={18} color="#10B981" />
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle}>Horário</Text>
              <Text style={s.cardDesc}>Seg–Sex, 9h–18h</Text>
              <Text style={s.cardSub}>Fuso horário de Brasília</Text>
            </View>
          </View>

          <View style={s.card}>
            <View style={[s.cardIcon, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
              <MessageCircle size={18} color="#8B5CF6" />
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle}>WhatsApp Business</Text>
              <Text style={s.cardDesc}>Em breve</Text>
              <Text style={s.cardSub}>Atendimento por chat</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        {sent ? (
          <View style={s.successBox}>
            <Text style={s.successIcon}>✓</Text>
            <Text style={s.successTitle}>Mensagem enviada!</Text>
            <Text style={s.successSub}>Respondemos em até 24h úteis. Que Deus abençoe!</Text>
            <TouchableOpacity onPress={() => { setSent(false); setForm({ nome: '', email: '', mensagem: '' }); }} style={s.sendAgain}>
              <Text style={s.sendAgainText}>Enviar outra mensagem</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.formBox}>
            <Text style={s.formTitle}>Envie uma mensagem</Text>

            {[
              { id: 'nome' as const, label: 'Nome', placeholder: 'Seu nome completo' },
              { id: 'email' as const, label: 'E-mail', placeholder: 'seu@email.com' },
            ].map(({ id, label, placeholder }) => (
              <View key={id} style={s.field}>
                <Text style={s.fieldLabel}>{label}</Text>
                <TextInput
                  style={s.input}
                  placeholder={placeholder}
                  placeholderTextColor="#B8A99A"
                  value={form[id]}
                  onChangeText={v => setForm(f => ({ ...f, [id]: v }))}
                  autoCapitalize={id === 'email' ? 'none' : 'words'}
                  keyboardType={id === 'email' ? 'email-address' : 'default'}
                />
              </View>
            ))}

            <View style={s.field}>
              <Text style={s.fieldLabel}>Mensagem</Text>
              <TextInput
                style={[s.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Descreva sua dúvida ou sugestão..."
                placeholderTextColor="#B8A99A"
                value={form.mensagem}
                onChangeText={v => setForm(f => ({ ...f, mensagem: v }))}
                multiline
              />
            </View>

            <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
              <Text style={s.submitBtnText}>Enviar Mensagem →</Text>
            </TouchableOpacity>

            <Text style={s.orText}>ou envie direto para <Text style={{ color: '#C5943A' }}>contato@devocioai.com</Text></Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF8F1' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, paddingTop: 56,
    borderBottomWidth: 1, borderBottomColor: 'rgba(197,148,58,0.12)',
    backgroundColor: '#FBF8F1',
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2C1810' },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  label: { fontSize: 11, fontWeight: '700', color: '#C5943A', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#2C1810', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#9E8E7E', marginBottom: 28 },
  cards: { gap: 12, marginBottom: 28 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, backgroundColor: 'rgba(197,148,58,0.06)', borderWidth: 1, borderColor: 'rgba(197,148,58,0.12)', borderRadius: 14 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 12, color: '#9E8E7E', marginBottom: 2 },
  cardDesc: { fontSize: 14, fontWeight: '600', color: '#2C1810', marginBottom: 1 },
  cardSub: { fontSize: 11, color: '#B8A99A' },
  formBox: { backgroundColor: 'rgba(197,148,58,0.06)', borderWidth: 1, borderColor: 'rgba(197,148,58,0.12)', borderRadius: 16, padding: 24 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810', marginBottom: 20 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B5C4D', marginBottom: 6 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: 'rgba(197,148,58,0.2)', borderRadius: 10, padding: 12, fontSize: 14, color: '#2C1810' },
  submitBtn: { backgroundColor: '#C5943A', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  orText: { fontSize: 12, color: '#9E8E7E', textAlign: 'center', marginTop: 14 },
  successBox: { alignItems: 'center', padding: 40, backgroundColor: 'rgba(197,148,58,0.06)', borderWidth: 1, borderColor: 'rgba(197,148,58,0.2)', borderRadius: 16 },
  successIcon: { fontSize: 32, color: '#C5943A', marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#2C1810', marginBottom: 8 },
  successSub: { fontSize: 14, color: '#9E8E7E', textAlign: 'center', marginBottom: 24, lineHeight: 21 },
  sendAgain: {},
  sendAgainText: { fontSize: 14, color: '#C5943A', fontWeight: '600' },
});
