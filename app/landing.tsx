import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  MessageCircle,
  Sparkles,
  Flame,
  Users,
  Heart,
  Target,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Zap,
  Shield,
  Crown,
  HelpCircle,
  Quote,
  Menu,
  X,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MAX_W = 960;
const isDesktop = isWeb && SCREEN_WIDTH >= 768;

// ═══════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════

const FEATURES = [
  {
    icon: MessageCircle,
    title: 'Gabriel \u2014 IA Espiritual',
    desc: 'Tire duvidas biblicas, peca conselhos e aprofunde sua fe com um guia que entende as Escrituras.',
    colors: ['#8B5CF6', '#3B82F6'] as [string, string],
  },
  {
    icon: BookOpen,
    title: 'Devocionais com IA',
    desc: 'Reflexoes personalizadas geradas diariamente para o seu momento de vida e necessidade espiritual.',
    colors: ['#C5943A', '#E8A94A'] as [string, string],
  },
  {
    icon: Flame,
    title: 'Jornada de 28 Dias',
    desc: 'Transforme seus habitos espirituais com uma jornada guiada de oracao, leitura e reflexao.',
    colors: ['#EF4444', '#C5943A'] as [string, string],
  },
  {
    icon: Users,
    title: 'Comunidade de Fe',
    desc: 'Conecte-se com outros cristaos, compartilhe oracoes e cresca junto em grupos.',
    colors: ['#6366F1', '#8B5CF6'] as [string, string],
  },
  {
    icon: Heart,
    title: 'Oracoes Guiadas',
    desc: 'Momentos de oracao e meditacao biblica para nutrir sua alma a qualquer hora do dia.',
    colors: ['#F59E0B', '#C5943A'] as [string, string],
  },
  {
    icon: Target,
    title: 'Desafios & Sequencias',
    desc: 'Mantenha sua sequencia, complete desafios diarios e acompanhe seu crescimento espiritual.',
    colors: ['#C5943A', '#8B5CF6'] as [string, string],
  },
];

const TESTIMONIALS = [
  {
    name: 'Ana Clara',
    role: 'Pedagoga \u2022 Sao Paulo',
    text: 'O Gabriel mudou minha forma de ler a Biblia. Agora entendo o contexto de cada versiculo e aplico no meu dia a dia. E como ter um mentor espiritual 24h.',
    initials: 'AC',
    stars: 5,
  },
  {
    name: 'Lucas Ferreira',
    role: 'Engenheiro \u2022 Belo Horizonte',
    text: 'A jornada de 28 dias e incrivel! Nunca consegui manter uma rotina devocional ate encontrar esse app. Ja estou no dia 21 e nao pretendo parar.',
    initials: 'LF',
    stars: 5,
  },
  {
    name: 'Maria Eduarda',
    role: 'Estudante \u2022 Curitiba',
    text: 'Os devocionais personalizados com IA sao perfeitos pra mim. Cada reflexao parece feita sob medida para o que estou vivendo. Recomendo demais!',
    initials: 'ME',
    stars: 5,
  },
  {
    name: 'Pastor Ricardo',
    role: 'Lider \u2022 Recife',
    text: 'Uso o Devocio.IA como apoio no meu ministerio. A ferramenta complementa o estudo biblico e os membros da igreja adoraram a comunidade online.',
    initials: 'PR',
    stars: 5,
  },
];

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mes',
    desc: 'Tudo para comecar sua jornada',
    features: [
      'Biblia completa com leitura de texto',
      '5 perguntas ao Gabriel por dia',
      'Devocional diario basico',
      'Versiculo do dia',
      'Maratonas de leitura biblica',
      'Planos de estudo (texto)',
      '2 audios gratis por dia',
      'Sequencia de dias e desafios',
      'Palavra profetica — 1/dia',
      'Gerador de conteudo — 2/dia',
    ],
    cta: 'Comecar Gratis',
    featured: false,
  },
  {
    name: 'Premium',
    price: 'R$ 9,90',
    period: '/mes',
    desc: 'Experiencia completa de fe',
    features: [
      'Tudo do plano gratuito',
      'Chat com Gabriel — 30 msgs/dia',
      'Audio narrado com voz IA (ElevenLabs)',
      'Gerador de imagens IA — 3/dia',
      'Vigilia IA 21 dias completa',
      'Jornada 28 dias completa',
      'Palavra profetica — 3/dia',
      'Calendario de conteudo 30 dias',
      'Gerador de hashtags e bio',
      'Todos os planos de estudo',
      'Suporte prioritario',
    ],
    cta: 'Assinar Premium',
    featured: true,
  },
];

const FAQS = [
  {
    q: 'O Gabriel substitui um pastor ou lider espiritual?',
    a: 'Nao. O Gabriel e uma ferramenta de apoio que usa inteligencia artificial treinada nas Escrituras. Ele complementa sua vida na igreja, mas nunca substitui o acompanhamento pastoral humano.',
  },
  {
    q: 'Posso usar o app offline?',
    a: 'Atualmente o app precisa de conexao com a internet para funcionar. Estamos trabalhando em um modo offline para breve.',
  },
  {
    q: 'Como funciona a jornada de 28 dias?',
    a: 'Sao 28 dias de leituras, reflexoes e desafios diarios que guiam voce em uma transformacao espiritual completa. Cada dia leva cerca de 15 minutos.',
  },
  {
    q: 'Posso cancelar o plano Premium a qualquer momento?',
    a: 'Sim! Voce pode cancelar quando quiser, sem multa. O acesso continua ate o fim do periodo pago.',
  },
  {
    q: 'O app e de qual denominacao?',
    a: 'O Devocio.IA e interdenominacional. Usamos as Escrituras como base e respeitamos todas as tradicoes cristas.',
  },
  {
    q: 'Meus dados estao seguros?',
    a: 'Sim. Utilizamos criptografia de ponta a ponta e seguimos as melhores praticas de seguranca. Seus dados nunca sao compartilhados com terceiros.',
  },
];

// ═══════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════

export default function LandingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    const f1 = Animated.loop(Animated.sequence([
      Animated.timing(floatAnim1, { toValue: -8, duration: 1500, useNativeDriver: true }),
      Animated.timing(floatAnim1, { toValue: 0, duration: 1500, useNativeDriver: true }),
    ]));
    const f2 = Animated.loop(Animated.sequence([
      Animated.timing(floatAnim2, { toValue: 8, duration: 1750, useNativeDriver: true }),
      Animated.timing(floatAnim2, { toValue: 0, duration: 1750, useNativeDriver: true }),
    ]));
    f1.start();
    f2.start();
    return () => { f1.stop(); f2.stop(); };
  }, [fadeAnim, slideAnim, floatAnim1, floatAnim2]);

  const goToAuth = () => router.push('/auth');

  const wrap = isDesktop ? { maxWidth: MAX_W, width: '100%' as const, alignSelf: 'center' as const } : {};
  const cardW = isDesktop
    ? Math.min(MAX_W - 64, SCREEN_WIDTH - 64)
    : SCREEN_WIDTH - 32;
  const isMobile = !isDesktop;

  return (
    <View style={s.container}>
      {/* ═══════ HEADER / NAVBAR ═══════ */}
      <View style={s.navbar}>
        <View style={[s.navbarInner, wrap]}>
          <View style={s.navBrand}>
            <LinearGradient colors={['#C5943A', '#D4A84B']} style={s.navLogo}>
              <BookOpen size={16} color="#FBF8F1" />
            </LinearGradient>
            <Text style={s.navLogoText}>Devocio<Text style={s.navLogoIA}>.IA</Text></Text>
          </View>

          {!isMobile && (
            <View style={s.navLinks}>
              <Text style={s.navLink}>Recursos</Text>
              <Text style={s.navLink}>Depoimentos</Text>
              <Text style={s.navLink}>Planos</Text>
              <Text style={s.navLink}>FAQ</Text>
            </View>
          )}

          <View style={s.navRight}>
            {!isMobile && (
              <TouchableOpacity onPress={goToAuth} activeOpacity={0.8}>
                <Text style={s.navEntrar}>Entrar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={goToAuth} activeOpacity={0.85} style={s.navCtaBtn}>
              <LinearGradient colors={['#C5943A', '#D4A84B']} style={s.navCtaInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={s.navCtaText}>{isMobile ? 'Comecar' : 'Comecar Gratis'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            {isMobile && (
              <TouchableOpacity onPress={() => setMobileMenu(!mobileMenu)} style={s.navMenuBtn}>
                {mobileMenu ? <X size={22} color="#2C1810" /> : <Menu size={22} color="#2C1810" />}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Mobile dropdown menu */}
        {isMobile && mobileMenu && (
          <View style={s.mobileDropdown}>
            {['Recursos', 'Depoimentos', 'Planos', 'FAQ'].map(label => (
              <TouchableOpacity key={label} style={s.mobileDropItem} onPress={() => setMobileMenu(false)}>
                <Text style={s.mobileDropText}>{label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.mobileDropItem} onPress={() => { setMobileMenu(false); goToAuth(); }}>
              <Text style={[s.mobileDropText, { color: '#C5943A' }]}>Entrar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, isWeb && { alignItems: 'center' }]}>

        {/* ═══════ HERO ═══════ */}
        <Animated.View style={[s.heroWrap, wrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.heroRow}>
            {/* Left: text content */}
            <View style={s.heroLeft}>
              {/* Badge */}
              <View style={s.badge}>
                <Sparkles size={14} color="#C5943A" />
                <Text style={s.badgeText}>IA Espiritual #1 do Brasil</Text>
              </View>

              {/* Headline */}
              <Text style={s.heroTitle}>
                Sua fe, <Text style={s.heroGold}>transformada</Text> pela Palavra
              </Text>

              {/* Subtitle */}
              <Text style={s.heroSub}>
                Conheca o <Text style={s.heroBold}>Gabriel</Text> — seu guia espiritual com IA. Devocionais personalizados, jornada de 28 dias, comunidade de oracao e muito mais.
              </Text>

              {/* CTAs */}
              <View style={s.heroCtas}>
                <TouchableOpacity onPress={goToAuth} activeOpacity={0.85} style={s.ctaPrimary}>
                  <LinearGradient colors={['#C5943A', '#D4A84B']} style={s.ctaPrimaryInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={s.ctaPrimaryText}>Comecar Gratis</Text>
                    <ArrowRight size={18} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={s.ctaOutline} onPress={goToAuth} activeOpacity={0.8}>
                  <Text style={s.ctaOutlineText}>Ver Recursos</Text>
                </TouchableOpacity>
              </View>

              {/* Social proof */}
              <View style={s.proof}>
                <View style={s.avatarStack}>
                  {['#8B5CF6', '#3B82F6', '#10B981', '#C5943A', '#EF4444'].map((c, i) => (
                    <LinearGradient key={i} colors={[c, c + 'CC']} style={[s.avatar, { marginLeft: i === 0 ? 0 : -8, zIndex: 5 - i }]} />
                  ))}
                </View>
                <Text style={s.proofText}><Text style={s.proofBold}>+1.200</Text> na jornada</Text>
                <View style={s.proofDot} />
                <View style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} color="#C5943A" fill="#C5943A" />)}
                </View>
                <Text style={s.proofText}>4.9/5</Text>
              </View>
            </View>

            {/* Right: phone mockup */}
            {!isMobile && (
              <View style={s.heroRight}>
                <View style={s.phoneMockup}>
                  {/* Phone notch */}
                  <View style={s.phoneNotch} />
                  {/* Phone screen content */}
                  <View style={s.phoneScreen}>
                    <View style={s.phoneStatusBar}>
                      <Text style={s.phoneTime}>9:41</Text>
                    </View>
                    <View style={s.phoneGreeting}>
                      <Text style={s.phoneGreetText}>Shalom, usuario</Text>
                      <Text style={s.phoneGreetSub}>O que deseja explorar hoje?</Text>
                    </View>
                    <View style={s.phoneCard1}>
                      <LinearGradient colors={['#C5943A', '#D4A84B']} style={s.phoneCardGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <BookOpen size={18} color="#FFF" />
                        <Text style={s.phoneCardTitle}>Devocional do Dia</Text>
                        <Text style={s.phoneCardSub}>Reflexao personalizada com IA</Text>
                      </LinearGradient>
                    </View>
                    <View style={s.phoneCard2}>
                      <View style={s.phoneCard2Inner}>
                        <Flame size={16} color="#EF4444" />
                        <View style={{ flex: 1 }}>
                          <Text style={s.phoneCard2Title}>Jornada de 28 Dias</Text>
                          <View style={s.phoneProgressBar}>
                            <View style={s.phoneProgressFill} />
                          </View>
                        </View>
                        <Text style={s.phoneCard2Pct}>67%</Text>
                      </View>
                    </View>
                    <View style={s.phoneCard2}>
                      <View style={s.phoneCard2Inner}>
                        <MessageCircle size={16} color="#8B5CF6" />
                        <View style={{ flex: 1 }}>
                          <Text style={s.phoneCard2Title}>Chat com Gabriel</Text>
                          <Text style={s.phoneCard2Sub}>Tire duvidas biblicas</Text>
                        </View>
                        <ChevronDown size={16} color="#9E8E7E" style={{ transform: [{ rotate: '-90deg' }] }} />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Floating cards */}
                <Animated.View style={[s.floatCard, s.floatLeft, { transform: [{ translateY: floatAnim1 }] }]}>
                  <View style={[s.floatIcon, { backgroundColor: 'rgba(197,148,58,0.15)' }]}>
                    <Zap size={18} color="#C5943A" />
                  </View>
                  <View>
                    <Text style={s.floatTitle}>Devocional pronto!</Text>
                    <Text style={s.floatSub}>Gerado com IA</Text>
                  </View>
                </Animated.View>

                <Animated.View style={[s.floatCard, s.floatRight, { transform: [{ translateY: floatAnim2 }] }]}>
                  <View style={[s.floatIcon, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                    <Shield size={18} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={s.floatTitle}>Dia 47 &#10003;</Text>
                    <Text style={s.floatSub}>Jornada de 28 dias</Text>
                  </View>
                </Animated.View>
              </View>
            )}
          </View>

          {/* Mobile floating cards */}
          {isMobile && (
            <View style={s.floatsMobile}>
              <Animated.View style={[s.floatCard, { transform: [{ translateY: floatAnim1 }] }]}>
                <View style={[s.floatIcon, { backgroundColor: 'rgba(197,148,58,0.15)' }]}>
                  <Zap size={18} color="#C5943A" />
                </View>
                <View>
                  <Text style={s.floatTitle}>Devocional pronto!</Text>
                  <Text style={s.floatSub}>Gerado com IA</Text>
                </View>
              </Animated.View>

              <Animated.View style={[s.floatCard, { alignSelf: 'flex-end', transform: [{ translateY: floatAnim2 }] }]}>
                <View style={[s.floatIcon, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                  <Shield size={18} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={s.floatTitle}>Dia 47 &#10003;</Text>
                  <Text style={s.floatSub}>Jornada de 28 dias</Text>
                </View>
              </Animated.View>
            </View>
          )}
        </Animated.View>

        {/* ═══════ FEATURES ═══════ */}
        <View style={[s.section, wrap]}>
          <View style={s.sectionCenter}>
            <View style={s.badge}>
              <Sparkles size={14} color="#8B5CF6" />
              <Text style={[s.badgeText, { color: '#8B5CF6' }]}>Recursos Poderosos</Text>
            </View>
            <Text style={s.sectionTitle}>
              Tudo para sua <Text style={s.heroGold}>vida espiritual</Text>
            </Text>
            <Text style={s.sectionSub}>
              Recursos poderosos reunidos em um so lugar para fortalecer sua fe todos os dias.
            </Text>
          </View>

          <View style={isMobile ? s.gridMobile : s.grid3}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[s.featureCard, isMobile && s.featureCardMobile, { width: isDesktop ? (Math.min(MAX_W, SCREEN_WIDTH) - 64 - 24) / 3 : '100%' as any }]}>
                {isMobile ? (
                  <View style={s.featureRowMobile}>
                    <LinearGradient colors={f.colors} style={s.featureIconBorder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <View style={s.featureIconInner}>
                        <f.icon size={22} color="#6B5C4D" />
                      </View>
                    </LinearGradient>
                    <View style={s.featureTextMobile}>
                      <Text style={s.featureTitle}>{f.title}</Text>
                      <Text style={s.featureDesc}>{f.desc}</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <LinearGradient colors={f.colors} style={s.featureIconBorder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <View style={s.featureIconInner}>
                        <f.icon size={22} color="#6B5C4D" />
                      </View>
                    </LinearGradient>
                    <Text style={s.featureTitle}>{f.title}</Text>
                    <Text style={s.featureDesc}>{f.desc}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <View style={[s.sectionAlt, wrap]}>
          <View style={s.sectionCenter}>
            <Text style={s.sectionTitle}>
              Vidas <Text style={s.heroGold}>transformadas</Text>
            </Text>
            <Text style={s.sectionSub}>
              Veja o que nossa comunidade diz sobre a experiencia com o Devocio.IA.
            </Text>
          </View>

          <View style={s.grid2}>
            {TESTIMONIALS.map((t, i) => (
              <View key={i} style={[s.testimonialCard, { width: isDesktop ? (Math.min(MAX_W, SCREEN_WIDTH) - 64 - 12) / 2 : cardW }]}>
                <Quote size={32} color="rgba(197,148,58,0.1)" style={{ position: 'absolute', top: 16, right: 16 }} />
                <View style={s.starsRow2}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} color="#C5943A" fill="#C5943A" />
                  ))}
                </View>
                <Text style={s.testimonialText}>&ldquo;{t.text}&rdquo;</Text>
                <View style={s.testimonialFooter}>
                  <LinearGradient colors={['#C5943A', '#D4A84B']} style={s.testimonialAvatar}>
                    <Text style={s.testimonialInitials}>{t.initials}</Text>
                  </LinearGradient>
                  <View>
                    <Text style={s.testimonialName}>{t.name}</Text>
                    <Text style={s.testimonialRole}>{t.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ═══════ PRICING ═══════ */}
        <View style={[s.section, wrap]}>
          <View style={s.sectionCenter}>
            <View style={s.badge}>
              <Sparkles size={14} color="#C5943A" />
              <Text style={s.badgeText}>Planos Acessiveis</Text>
            </View>
            <Text style={s.sectionTitle}>
              Invista na sua <Text style={s.heroGold}>vida espiritual</Text>
            </Text>
            <Text style={s.sectionSub}>
              Escolha o plano ideal para aprofundar sua caminhada com Deus.
            </Text>
          </View>

          <View style={s.grid2}>
            {PLANS.map((plan, i) => (
              <View key={i} style={[
                s.planCard,
                { width: isDesktop ? (Math.min(MAX_W, SCREEN_WIDTH) - 64 - 12) / 2 : cardW },
                plan.featured && s.planFeatured,
              ]}>
                {plan.featured && (
                  <View style={s.planBadge}>
                    <Crown size={14} color="#FBF8F1" />
                    <Text style={s.planBadgeText}>Mais popular</Text>
                  </View>
                )}

                <Text style={s.planName}>{plan.name}</Text>
                <Text style={s.planDesc}>{plan.desc}</Text>

                <View style={s.planPriceRow}>
                  <Text style={s.planPrice}>{plan.price}</Text>
                  <Text style={s.planPeriod}>{plan.period}</Text>
                </View>

                <View style={s.planFeatures}>
                  {plan.features.map((f, j) => (
                    <View key={j} style={s.planFeatureRow}>
                      <View style={[s.planCheckCircle, { backgroundColor: plan.featured ? 'rgba(197,148,58,0.2)' : 'rgba(139,92,246,0.2)' }]}>
                        <Check size={11} color={plan.featured ? '#C5943A' : '#8B5CF6'} />
                      </View>
                      <Text style={s.planFeatureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={goToAuth}
                  activeOpacity={0.85}
                  style={plan.featured ? s.planCtaFilled : s.planCtaOutline2}
                >
                  {plan.featured ? (
                    <LinearGradient colors={['#C5943A', '#D4A84B']} style={s.planCtaFilledInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Text style={s.planCtaFilledText}>{plan.cta}</Text>
                      <ArrowRight size={16} color="#FFF" />
                    </LinearGradient>
                  ) : (
                    <Text style={s.planCtaOutlineText2}>{plan.cta}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={s.priceTrust}>
            Cancele a qualquer momento &bull; Sem fidelidade &bull; Pagamento seguro
          </Text>
        </View>

        {/* ═══════ FAQ ═══════ */}
        <View style={[s.sectionAlt, wrap]}>
          <View style={s.sectionCenter}>
            <View style={[s.badge, { borderColor: 'rgba(197,148,58,0.1)', backgroundColor: 'rgba(197,148,58,0.04)' }]}>
              <HelpCircle size={14} color="#6B5C4D" />
              <Text style={[s.badgeText, { color: '#6B5C4D' }]}>Tire suas duvidas</Text>
            </View>
            <Text style={s.sectionTitle}>
              Perguntas <Text style={s.heroGold}>frequentes</Text>
            </Text>
          </View>

          <View style={{ maxWidth: 600, width: '100%', alignSelf: 'center' }}>
            {FAQS.map((faq, i) => (
              <TouchableOpacity
                key={i}
                style={[s.faqCard, openFaq === i && s.faqOpen]}
                onPress={() => setOpenFaq(openFaq === i ? null : i)}
                activeOpacity={0.8}
              >
                <View style={s.faqHeader}>
                  <Text style={s.faqQ}>{faq.q}</Text>
                  {openFaq === i ? <ChevronUp size={18} color="#C5943A" /> : <ChevronDown size={18} color="#6B7280" />}
                </View>
                {openFaq === i && <Text style={s.faqA}>{faq.a}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══════ CTA FINAL ═══════ */}
        <View style={[s.ctaSection, wrap]}>
          <LinearGradient colors={['rgba(197,148,58,0.08)', '#FBF8F1', 'rgba(197,148,58,0.06)']} style={s.ctaFinalBox}>
            <Text style={s.ctaFinalTitle}>
              Comece sua jornada <Text style={s.heroGold}>hoje</Text>
            </Text>
            <Text style={s.ctaFinalVerse}>
              &ldquo;Lampada para os meus pes e a tua palavra, e luz para o meu caminho.&rdquo;
            </Text>
            <Text style={s.ctaFinalRef}>&mdash; Salmos 119:105</Text>

            <TouchableOpacity onPress={goToAuth} activeOpacity={0.85} style={s.ctaFinalBtn}>
              <LinearGradient colors={['#C5943A', '#D4A84B']} style={s.ctaFinalBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={s.ctaFinalBtnText}>Comecar Gratis</Text>
                <ArrowRight size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ═══════ FOOTER ═══════ */}
        <View style={[s.footer, wrap]}>
          <View style={s.footerTop}>
            <View style={s.footerBrand}>
              <View style={s.footerLogoRow}>
                <LinearGradient colors={['#C5943A', '#D4A84B']} style={s.footerLogoIcon}>
                  <BookOpen size={16} color="#FBF8F1" />
                </LinearGradient>
                <Text style={s.footerLogoText}>Devocio<Text style={s.footerLogoIA}>.IA</Text></Text>
              </View>
              <Text style={s.footerDesc}>
                Sua fe, guiada pela Palavra de Deus. Devocionais com IA, comunidade de oracao e jornada de transformacao espiritual.
              </Text>
            </View>

            <View style={s.footerCols}>
              <View style={s.footerCol}>
                <Text style={s.footerColTitle}>PRODUTO</Text>
                {['Recursos', 'Planos', 'FAQ', 'Blog'].map(l => (
                  <Text key={l} style={s.footerLink}>{l}</Text>
                ))}
              </View>
              <View style={s.footerCol}>
                <Text style={s.footerColTitle}>LEGAL</Text>
                {['Termos de Uso', 'Privacidade', 'Cookies', 'Contato'].map(l => (
                  <Text key={l} style={s.footerLink}>{l}</Text>
                ))}
              </View>
            </View>
          </View>

          <View style={s.footerDivider} />
          <View style={s.footerBottom}>
            <Text style={s.footerCopy}>&copy; 2025 Devocio.IA. Todos os direitos reservados. · Jm Digital Negocios LTDA — CNPJ: 61.486.561/0001-37</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Text style={[s.footerCopy, { color: '#C5943A' }]}>contato@devocioai.com</Text>
              <Text style={s.footerCopy}>Feito com &#10084;&#65039; e fé</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF8F1' },
  scroll: { paddingBottom: 0 },

  // ─── NAVBAR ───
  navbar: {
    backgroundColor: 'rgba(251,248,241,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197,148,58,0.12)',
    ...(isWeb ? { position: 'sticky' as any, top: 0, zIndex: 100, backdropFilter: 'blur(12px)' as any, WebkitBackdropFilter: 'blur(12px)' as any } : {}),
  },
  navbarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: MAX_W,
    width: '100%',
    alignSelf: 'center',
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navLogo: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  navLogoText: { fontSize: 18, fontWeight: '800', color: '#2C1810' },
  navLogoIA: { color: '#C5943A', fontWeight: '800' },
  navLinks: { flexDirection: 'row', gap: 28 },
  navLink: { fontSize: 14, color: '#6B5C4D', fontWeight: '500' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navEntrar: { fontSize: 14, color: '#2C1810', fontWeight: '600' },
  navCtaBtn: { borderRadius: 12, overflow: 'hidden' },
  navCtaInner: { paddingHorizontal: 18, paddingVertical: 10 },
  navCtaText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  navMenuBtn: { padding: 4 },
  mobileDropdown: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197,148,58,0.12)',
  },
  mobileDropItem: { paddingVertical: 12 },
  mobileDropText: { fontSize: 15, color: '#2C1810', fontWeight: '500' },

  // ─── HERO ───
  heroWrap: { paddingTop: isDesktop ? 48 : 24, paddingBottom: 20, paddingHorizontal: isDesktop ? 24 : 16 },
  heroRow: {
    flexDirection: isDesktop ? 'row' : 'column',
    alignItems: isDesktop ? 'center' : 'stretch',
    gap: isDesktop ? 40 : 0,
  },
  heroLeft: { flex: 1 },
  heroRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 400,
    paddingHorizontal: 40,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(197,148,58,0.3)', backgroundColor: 'rgba(197,148,58,0.1)',
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginBottom: 24,
  },
  badgeText: { color: '#C5943A', fontSize: 13, fontWeight: '600' },

  heroTitle: { fontSize: isDesktop ? 46 : 28, fontWeight: '900', color: '#2C1810', lineHeight: isDesktop ? 54 : 36, marginBottom: 16, letterSpacing: -1 },
  heroGold: { color: '#D4A84B' },
  heroSub: { fontSize: isDesktop ? 16 : 15, color: '#6B5C4D', lineHeight: 24, marginBottom: 28, maxWidth: isDesktop ? 520 : SCREEN_WIDTH - 32 },
  heroBold: { fontWeight: '700', color: '#2C1810' },

  heroCtas: { flexDirection: isDesktop ? 'row' : 'column', gap: 12, marginBottom: 28, alignItems: isDesktop ? 'center' : 'stretch' as const },
  ctaPrimary: { borderRadius: 16, overflow: 'hidden', alignSelf: isDesktop ? 'flex-start' : 'stretch' as any },
  ctaPrimaryInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: isDesktop ? 28 : 20 },
  ctaPrimaryText: { color: '#FFF', fontSize: isDesktop ? 17 : 16, fontWeight: '700' },
  ctaOutline: { paddingVertical: 14, paddingHorizontal: isDesktop ? 28 : 20, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(197,148,58,0.35)', alignItems: 'center' as const, alignSelf: isDesktop ? 'flex-start' : 'stretch' as any },
  ctaOutlineText: { color: '#C5943A', fontSize: isDesktop ? 16 : 15, fontWeight: '600' },

  // Social proof
  proof: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  avatarStack: { flexDirection: 'row' },
  avatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#FBF8F1' },
  proofText: { color: '#6B5C4D', fontSize: 13 },
  proofBold: { fontWeight: '700', color: '#2C1810' },
  proofDot: { width: 1, height: 14, backgroundColor: '#E8E2D5' },
  starsRow: { flexDirection: 'row', gap: 2 },

  // Phone mockup
  phoneMockup: {
    width: 240,
    height: 390,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#E8E2D5',
    overflow: 'hidden',
    position: 'relative',
  },
  phoneNotch: {
    width: 100,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FBF8F1',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  phoneStatusBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  phoneTime: { color: '#2C1810', fontSize: 13, fontWeight: '600' },
  phoneGreeting: { marginBottom: 20 },
  phoneGreetText: { color: '#2C1810', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  phoneGreetSub: { color: '#9E8E7E', fontSize: 12 },
  phoneCard1: { marginBottom: 12, borderRadius: 16, overflow: 'hidden' },
  phoneCardGrad: { padding: 16, gap: 6 },
  phoneCardTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  phoneCardSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  phoneCard2: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(197,148,58,0.12)',
  },
  phoneCard2Inner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phoneCard2Title: { color: '#2C1810', fontSize: 12, fontWeight: '600' },
  phoneCard2Sub: { color: '#9E8E7E', fontSize: 10, marginTop: 2 },
  phoneCard2Pct: { color: '#C5943A', fontSize: 13, fontWeight: '700' },
  phoneProgressBar: { height: 4, backgroundColor: 'rgba(197,148,58,0.1)', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  phoneProgressFill: { width: '67%', height: '100%', backgroundColor: '#EF4444', borderRadius: 2 },

  // Floating cards
  floatsMobile: { marginTop: 32, gap: 10, maxWidth: 320 },
  floatCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(197,148,58,0.12)',
  },
  floatLeft: {
    position: 'absolute',
    left: -10,
    top: 60,
  },
  floatRight: {
    position: 'absolute',
    right: -10,
    bottom: 50,
  },
  floatIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  floatTitle: { color: '#2C1810', fontSize: 13, fontWeight: '600' },
  floatSub: { color: '#9E8E7E', fontSize: 12, marginTop: 1 },

  // ─── SECTIONS ───
  section: { paddingHorizontal: isDesktop ? 20 : 16, paddingVertical: isDesktop ? 56 : 36 },
  sectionAlt: { paddingHorizontal: isDesktop ? 20 : 16, paddingVertical: isDesktop ? 56 : 36, backgroundColor: 'rgba(197,148,58,0.04)' },
  sectionCenter: { alignItems: 'center', marginBottom: 32 },
  sectionTitle: { fontSize: isDesktop ? 36 : 22, fontWeight: '800', color: '#2C1810', textAlign: 'center', lineHeight: isDesktop ? 44 : 30, marginBottom: 10 },
  sectionSub: { fontSize: isDesktop ? 15 : 14, color: '#6B5C4D', textAlign: 'center', lineHeight: 22, maxWidth: isDesktop ? 480 : 'auto' as any },

  // ─── FEATURES ───
  grid3: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  gridMobile: { gap: 10 },
  featureCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: isDesktop ? 24 : 16,
    borderWidth: 1, borderColor: 'rgba(197,148,58,0.12)',
    minWidth: 140,
  },
  featureCardMobile: { borderRadius: 16, padding: 14 },
  featureRowMobile: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  featureTextMobile: { flex: 1 },
  featureIconBorder: { width: 48, height: 48, borderRadius: 14, padding: 1, marginBottom: isDesktop ? 16 : 0 },
  featureIconInner: { flex: 1, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: isDesktop ? 16 : 15, fontWeight: '700', color: '#2C1810', marginBottom: 4 },
  featureDesc: { fontSize: 13, color: '#6B5C4D', lineHeight: 19 },

  // ─── TESTIMONIALS ───
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  starsRow2: { flexDirection: 'row', gap: 2, marginBottom: 14 },
  testimonialCard: {
    backgroundColor: '#FFFFFF', borderRadius: isDesktop ? 20 : 16, padding: isDesktop ? 24 : 18,
    borderWidth: 1, borderColor: 'rgba(197,148,58,0.12)',
    minWidth: isDesktop ? 260 : 0, position: 'relative',
  },
  testimonialText: { fontSize: 14, color: '#2C1810', lineHeight: 23, marginBottom: 20 },
  testimonialFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testimonialAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  testimonialInitials: { color: '#FBF8F1', fontSize: 13, fontWeight: '700' },
  testimonialName: { fontSize: 14, fontWeight: '600', color: '#2C1810' },
  testimonialRole: { fontSize: 12, color: '#9E8E7E', marginTop: 2 },

  // ─── PRICING ───
  planCard: {
    backgroundColor: '#FFFFFF', borderRadius: isDesktop ? 24 : 20, padding: isDesktop ? 32 : 20,
    borderWidth: 1, borderColor: 'rgba(197,148,58,0.12)',
    minWidth: isDesktop ? 260 : 0, position: 'relative',
  },
  planFeatured: {
    borderWidth: 2, borderColor: 'rgba(197,148,58,0.4)',
    paddingTop: isDesktop ? 40 : 36,
  },
  planBadge: {
    position: 'absolute', top: -14, left: '50%',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#C5943A', transform: [{ translateX: -60 }],
  },
  planBadgeText: { color: '#FBF8F1', fontSize: 13, fontWeight: '700' },
  planName: { fontSize: 22, fontWeight: '800', color: '#2C1810', marginBottom: 4 },
  planDesc: { fontSize: 13, color: '#6B5C4D', marginBottom: 20 },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
  planPrice: { fontSize: isDesktop ? 42 : 34, fontWeight: '900', color: '#2C1810' },
  planPeriod: { fontSize: 16, color: '#9E8E7E', marginLeft: 4 },
  planFeatures: { gap: 14, marginBottom: 28 },
  planFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planCheckCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  planFeatureText: { fontSize: 14, color: '#4A3728', flex: 1 },
  planCtaFilled: { borderRadius: 16, overflow: 'hidden' },
  planCtaFilledInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  planCtaFilledText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  planCtaOutline2: { borderWidth: 1.5, borderColor: 'rgba(197,148,58,0.35)', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  planCtaOutlineText2: { color: '#C5943A', fontSize: 16, fontWeight: '700' },
  priceTrust: { fontSize: 13, color: '#9E8E7E', textAlign: 'center', marginTop: 16 },

  // ─── FAQ ───
  faqCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18,
    marginBottom: 8, borderWidth: 1, borderColor: 'rgba(197,148,58,0.12)',
  },
  faqOpen: { borderColor: 'rgba(197,148,58,0.2)' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 15, fontWeight: '600', color: '#2C1810', flex: 1, paddingRight: 12 },
  faqA: { fontSize: 14, color: '#6B5C4D', lineHeight: 22, marginTop: 12 },

  // ─── CTA FINAL ───
  ctaSection: { paddingHorizontal: isDesktop ? 20 : 16, paddingVertical: isDesktop ? 40 : 28 },
  ctaFinalBox: { borderRadius: isDesktop ? 28 : 20, padding: isDesktop ? 56 : 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(197,148,58,0.12)', overflow: 'hidden' },
  ctaFinalTitle: { fontSize: isDesktop ? 36 : 22, fontWeight: '800', color: '#2C1810', textAlign: 'center', marginBottom: 16 },
  ctaFinalVerse: { fontSize: isDesktop ? 16 : 14, color: '#6B5C4D', textAlign: 'center', lineHeight: 24, fontStyle: 'italic', marginBottom: 4, maxWidth: isDesktop ? 480 : 'auto' as any },
  ctaFinalRef: { fontSize: 13, color: '#9E8E7E', marginBottom: 28 },
  ctaFinalBtn: { borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 300 },
  ctaFinalBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18 },
  ctaFinalBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

  // ─── FOOTER ───
  footer: { paddingHorizontal: isDesktop ? 20 : 16, paddingTop: isDesktop ? 48 : 32, paddingBottom: isDesktop ? 32 : 24, borderTopWidth: 1, borderTopColor: 'rgba(197,148,58,0.12)' },
  footerTop: { flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 32 : 20 },
  footerBrand: { flex: isDesktop ? 2 : 1 },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  footerLogoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  footerLogoText: { fontSize: 18, fontWeight: '800', color: '#2C1810' },
  footerLogoIA: { color: '#C5943A', fontWeight: '800' },
  footerDesc: { fontSize: 13, color: '#9E8E7E', lineHeight: 20, maxWidth: 320, marginBottom: 16 },
  footerCols: { flexDirection: 'row', gap: isDesktop ? 40 : 20 },
  footerCol: { gap: 10 },
  footerColTitle: { fontSize: 12, fontWeight: '700', color: '#6B5C4D', letterSpacing: 1, marginBottom: 4 },
  footerLink: { fontSize: 13, color: '#9E8E7E' },
  footerDivider: { height: 1, backgroundColor: 'rgba(197,148,58,0.12)', marginVertical: 24 },
  footerBottom: { flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'center' : 'flex-start', gap: 8 },
  footerCopy: { fontSize: 13, color: '#9E8E7E' },
});
