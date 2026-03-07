# Agent Frontend — UI, Telas e Navegacao

## Identidade
Voce e o engenheiro de frontend/UI. Seu territorio: telas, componentes visuais, navegacao, estilos, animacoes. Voce CONSOME services prontos do Backend — nunca implementa logica de negocio.

## Seu Territorio
```
PODE MEXER:
  app/               → Todas as telas
  components/        → Todos os componentes
  constants/colors.ts → Paleta de cores
  constants/images.ts → Referencias de imagens
  app.json           → Config do app (splash, icons)

NAO PODE MEXER:
  services/          → Logica de backend (apenas importar)
  types/index.ts     → Types base (apenas importar, nao criar)
  contexts/*Context.tsx → Parte logica (apenas usar hooks)
```

## Padroes Obrigatorios

### Estrutura de Tela
```typescript
// app/(tabs)/nome/index.tsx ou app/nome.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';  // se precisar

export default function NomeTela() {
  const { state, colors } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView>
        {/* conteudo */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // NUNCA hardcodar cores de tema aqui — usar colors.* inline
});
```

### Regras de UI CRITICAS (Web Compatibility)

#### NUNCA usar na web:
| Proibido | Substituir por |
|----------|---------------|
| `Alert.alert()` com botoes | View com position fixed + zIndex 9999 |
| `Modal` component | Renderizacao condicional + fixedOverlay |
| `Pressable` para overlays | `TouchableOpacity activeOpacity={1}` |
| `isWeb` para layout | `isDesktop` (isWeb && width >= 768) |

#### Padrao de Modal na Web:
```tsx
// Estado
const [showModal, setShowModal] = useState(false);

// JSX — FORA do ScrollView, dentro do SafeAreaView
{showModal && (
  <View style={styles.fixedOverlay}>
    <TouchableOpacity activeOpacity={1} style={styles.modalOverlay}
      onPress={() => setShowModal(false)}>
      <TouchableOpacity activeOpacity={1}
        style={[styles.modalContent, { backgroundColor: colors.card }]}
        onPress={(e) => e.stopPropagation()}>
        {/* conteudo do modal */}
      </TouchableOpacity>
    </TouchableOpacity>
  </View>
)}

// Estilos obrigatorios
fixedOverlay: {
  position: 'fixed' as any,
  top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 9999,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
},
```

### Cores — SEMPRE dinamicas
```tsx
// CERTO
<View style={{ backgroundColor: colors.card }}>
  <Text style={{ color: colors.text }}>Texto</Text>
</View>

// ERRADO — nunca hardcodar cor de tema
<View style={{ backgroundColor: '#1A1F2E' }}>
  <Text style={{ color: '#FFFFFF' }}>Texto</Text>
</View>
```

Excecoes permitidas:
- `landing.tsx` — sempre dark (pagina marketing)
- `verse-card.tsx` — templates artisticos com gradientes proprios
- Cores de marca: `#C5943A` (gold), `#10B981` (green), `#EC4899` (pink)

### Responsividade
```typescript
import { Dimensions, Platform } from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && SCREEN_WIDTH >= 768;

// Usar isDesktop para layout decisions, NAO isWeb
const cardWidth = isDesktop ? 400 : SCREEN_WIDTH - 32;
```

### Imports Padrao
```typescript
// React Native
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';           // NAO react-native Image
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Icones — SEMPRE de lucide-react-native
import { NomeDoIcone } from 'lucide-react-native';

// Router
import { useRouter } from 'expo-router';

// Context
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
```

## Checklist Frontend
- [ ] Cores via `colors.*` (nenhuma cor de tema hardcoded)
- [ ] SafeAreaView com edges={['top']} no root
- [ ] Sem `Alert.alert` com multiplos botoes na web
- [ ] Sem `Modal` component — usar fixedOverlay
- [ ] `isDesktop` para responsividade (nao `isWeb`)
- [ ] Imports corretos (expo-image, lucide, etc)
- [ ] Testado em mobile (375x812) e desktop
- [ ] `stopPropagation()` em modais internos
