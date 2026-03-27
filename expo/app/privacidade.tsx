import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacidadeScreen() {
  const router = useRouter();

  const sections = [
    { title: '1. Controlador dos Dados', content: 'LRS NEGOCIOS LTDA (CNPJ 46.146.933/0001-92), operando como Devocio.IA. Contato DPO: contato@devocioai.com.' },
    { title: '2. Dados Coletados', content: 'Coletamos: dados de cadastro (nome, e-mail), dados espirituais (devocionais lidos, versículos favoritados — apenas para personalizar sua experiência), dados de uso e dados técnicos. Nunca coletamos dados sensíveis além do que você voluntariamente compartilha.' },
    { title: '3. Uso dos Dados', content: 'Usamos seus dados para: personalizar devocionais e planos de leitura, conectar você com a comunidade, melhorar o serviço, processar pagamentos e enviar notificações de acordo com suas preferências.' },
    { title: '4. Base Legal (LGPD)', content: 'Execução de contrato (fornecer o serviço), legítimo interesse (personalização e segurança), consentimento (notificações e marketing — revogável a qualquer momento) e obrigação legal.' },
    { title: '5. Dados Espirituais', content: 'Seus dados de uso espiritual (devocionais lidos, orações, favoritos) são tratados com especial cuidado. Nunca são vendidos ou compartilhados. São usados exclusivamente para personalizar sua jornada no aplicativo.' },
    { title: '6. Compartilhamento', content: 'Compartilhamos apenas com: provedores de infraestrutura (Supabase, Vercel), processadores de pagamento e autoridades públicas quando exigido por lei. Nunca vendemos seus dados.' },
    { title: '7. Seus Direitos (LGPD)', content: 'Você pode acessar, corrigir, deletar, portar seus dados e revogar consentimento a qualquer momento em Configurações do app. Para outras solicitações: contato@devocioai.com.' },
    { title: '8. Retenção', content: 'Dados mantidos enquanto conta estiver ativa. Após exclusão da conta, dados são removidos em até 90 dias, exceto obrigações legais.' },
    { title: '9. Segurança', content: 'Criptografia TLS em trânsito, acesso restrito a dados, monitoramento contínuo e backups regulares. Tratamos sua fé com respeito e sua privacidade com seriedade.' },
    { title: '10. Cookies e Rastreamento', content: 'Usamos apenas cookies essenciais para o funcionamento e analíticos para melhorar o produto. Nenhum rastreamento para fins publicitários de terceiros.' },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color="#9E8E7E" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacidade</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.label}>LEGAL</Text>
        <Text style={s.title}>Política de Privacidade</Text>
        <Text style={s.subtitle}>Última atualização: 11 de março de 2026 · Conformidade LGPD (Lei 13.709/2018)</Text>

        {sections.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={s.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={s.contactBox}>
          <Text style={s.contactLabel}>Encarregado de Proteção de Dados (DPO)</Text>
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
