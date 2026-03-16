import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function TermosScreen() {
  const router = useRouter();

  const sections = [
    { title: '1. Aceitação dos Termos', content: 'Ao acessar e usar o Devocio.IA, você concorda com estes Termos de Uso. O serviço é operado por LRS NEGOCIOS LTDA (CNPJ 46.146.933/0001-92).' },
    { title: '2. Descrição do Serviço', content: 'O Devocio.IA é uma plataforma digital de devocionais cristãos com inteligência artificial, estudo bíblico, comunidade de oração e ferramentas de crescimento espiritual.' },
    { title: '3. Sua Conta', content: 'Você é responsável pela segurança de suas credenciais e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente em caso de uso não autorizado.' },
    { title: '4. Uso Aceitável', content: 'É proibido: violar leis aplicáveis, publicar conteúdo prejudicial ou contrário à fé cristã, assediar outros membros, tentar acessar sistemas não autorizados ou usar o serviço para spam.' },
    { title: '5. Conteúdo do Usuário', content: 'Você mantém a propriedade do conteúdo que posta. Ao publicar, concede ao Devocio.IA licença para exibir esse conteúdo na plataforma. Conteúdo inadequado será removido.' },
    { title: '6. Planos e Pagamentos', content: 'Oferecemos planos gratuito e pagos. Cobranças conforme descrito no aplicativo. Pagamentos processados com segurança. Cancelamento a qualquer momento, sem multa.' },
    { title: '7. Limitação de Responsabilidade', content: 'O serviço é fornecido "como está". O Devocio.IA não se responsabiliza por interpretações teológicas específicas. Consulte sempre seu líder espiritual para questões doutrinais.' },
    { title: '8. Contato', content: 'contato@devocioai.com\nLRS NEGOCIOS LTDA · CNPJ 46.146.933/0001-92' },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color="#9E8E7E" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Termos de Uso</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.label}>LEGAL</Text>
        <Text style={s.title}>Termos de Uso</Text>
        <Text style={s.subtitle}>Última atualização: 11 de março de 2026</Text>

        {sections.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={s.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={s.contactBox}>
          <Text style={s.contactLabel}>Dúvidas legais?</Text>
          <Text style={s.contactEmail}>contato@devocioai.com</Text>
          <Text style={s.contactSub}>LRS NEGOCIOS LTDA · CNPJ 46.146.933/0001-92</Text>
        </View>
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
  subtitle: { fontSize: 13, color: '#9E8E7E', marginBottom: 36 },
  section: { marginBottom: 28, paddingBottom: 28, borderBottomWidth: 1, borderBottomColor: 'rgba(197,148,58,0.12)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2C1810', marginBottom: 10 },
  sectionContent: { fontSize: 14, color: '#6B5C4D', lineHeight: 22 },
  contactBox: {
    marginTop: 16, padding: 20, backgroundColor: 'rgba(197,148,58,0.08)',
    borderWidth: 1, borderColor: 'rgba(197,148,58,0.2)', borderRadius: 12,
  },
  contactLabel: { fontSize: 13, color: '#9E8E7E', marginBottom: 6 },
  contactEmail: { fontSize: 15, fontWeight: '700', color: '#C5943A', marginBottom: 4 },
  contactSub: { fontSize: 12, color: '#9E8E7E' },
});
