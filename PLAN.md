# Melhorias Robustas no App de Orações


Baseado nas ideias discutidas anteriormente, vou implementar as seguintes melhorias:

---

## **Novas Funcionalidades**

### 🔥 Sistema de Streak (Sequência de Oração)
- [x] Contador visual de dias consecutivos orando com ícone de chama
- [x] Cálculo automático: se orou ontem, soma +1; se pulou um dia, reinicia
- [x] Exibição proeminente na tela principal e na aba "Mais"

### 🏆 Sistema de Conquistas
- [x] 8 conquistas desbloqueáveis baseadas no uso do app:
  - "Primeira Oração" — completar 1 oração
  - "Fogo Vivo" — 7 dias seguidos
  - "Guerreiro de Oração" — completar 10 orações
  - "Intercessor" — 30 dias de sequência
  - "Estudioso" — usar o chat bíblico 5 vezes
  - "Devoto" — completar todas as orações de uma categoria
  - "Madrugador" — orar entre 3h e 5h da manhã
  - "Coração Aberto" — favoritar 5 orações
- [x] Tela de conquistas com medalhas bloqueadas/desbloqueadas
- [x] Animação ao desbloquear uma conquista

### 📖 Versículo do Dia
- [x] Versículo diferente a cada dia na tela "Mais"
- [x] Card bonito com fundo especial e opção de compartilhar
- [x] 30 versículos rotativos pré-definidos

### 📓 Diário de Oração
- [x] Espaço para escrever anotações pessoais após cada oração
- [x] Marcar orações como "respondidas por Deus" com data
- [x] Histórico de anotações acessível pela tela "Mais"

### ⏱️ Timer de Meditação
- [x] Modo contemplativo com timer de 5, 10 ou 15 minutos
- [x] Animação visual de respiração (círculo expandindo e contraindo)
- [x] Contagem regressiva elegante
- [x] Vibração (haptics) ao finalizar

---

## **Melhorias Visuais e de UX**

### Tela Principal (Orações)
- [x] Card de streak com chama animada no topo
- [x] Micro-interações nos botões (haptics ao tocar)
- [x] Barra de progresso com animação suave

### Tela "Mais" — Redesign Completo
- [x] Dashboard com estatísticas visuais (streak, orações feitas, conquistas)
- [x] Acesso ao Diário de Oração
- [x] Versículo do dia em destaque
- [x] Acesso ao Timer de Meditação
- [x] Tela de Conquistas

### Chat Bíblico
- [x] Instrução do sistema em português para respostas mais naturais
- [x] Animação pulsante nos dots de "digitando"

---

## **Telas Novas**
- [x] **Conquistas** — grade de medalhas com progresso
- [x] **Diário** — lista de anotações por oração
- [x] **Timer** — tela de meditação com animação de respiração

---

## **Design**
- [x] Mantém a paleta atual (azul marinho + dourado + creme)
- [x] Cards com sombras suaves e bordas arredondadas
- [x] Ícones de chama e troféu para gamificação
- [x] Animações usando Animated API nativo do React Native
