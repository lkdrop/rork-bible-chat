import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, RotateCcw, Trophy, Heart, Zap } from 'lucide-react-native';
import { GAME_CONFIG, SCENERY_THEMES, GAME_VERSES } from '@/constants/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ObstacleStyle = 'barrier' | 'train' | 'cone';
type CoinType = 'gold' | 'silver' | 'diamond';
type PowerType = 'shield' | 'magnet' | 'x2';
type GameState = 'menu' | 'playing' | 'gameover';

interface RunnerItem {
  id: string;
  kind: 'coin' | 'obstacle' | 'powerup';
  lane: number;
  progress: number;
  collected: boolean;
  coinType?: CoinType;
  obstacleStyle?: ObstacleStyle;
  powerType?: PowerType;
  points: number;
}

interface PerspectiveRoadLine {
  id: number;
  progress: number;
}

interface PerspectiveBuilding {
  id: number;
  side: 'left' | 'right';
  progress: number;
  height: number;
  colorIdx: number;
  windows: number;
}

const HORIZON_RATIO = GAME_CONFIG.HORIZON_Y;
const VANISH_X = SCREEN_WIDTH * GAME_CONFIG.VANISH_X;
const HORIZON_Y = SCREEN_HEIGHT * HORIZON_RATIO;
const ROAD_TOP_HALF = SCREEN_WIDTH * GAME_CONFIG.ROAD_TOP_WIDTH * 0.5;
const ROAD_BOT_HALF = SCREEN_WIDTH * GAME_CONFIG.ROAD_BOTTOM_WIDTH * 0.5;

const COIN_COLORS: Record<CoinType, string> = {
  gold: '#f1c40f',
  silver: '#bdc3c7',
  diamond: '#3498db',
};
const COIN_POINTS: Record<CoinType, number> = { gold: 10, silver: 5, diamond: 25 };

const OBSTACLE_COLORS: Record<ObstacleStyle, string> = {
  barrier: '#e74c3c',
  train: '#8e44ad',
  cone: '#e67e22',
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getLaneX(lane: number, t: number): number {
  const roadLeft = lerp(VANISH_X - ROAD_TOP_HALF, VANISH_X - ROAD_BOT_HALF, t);
  const roadRight = lerp(VANISH_X + ROAD_TOP_HALF, VANISH_X + ROAD_BOT_HALF, t);
  const roadW = roadRight - roadLeft;
  const laneW = roadW / 3;
  return roadLeft + laneW * lane + laneW / 2;
}

function getScale(t: number): number {
  return lerp(GAME_CONFIG.MIN_SCALE, GAME_CONFIG.MAX_SCALE, t);
}

function getYFromProgress(p: number): number {
  return lerp(HORIZON_Y, SCREEN_HEIGHT, p);
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();

  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerLane, setPlayerLane] = useState(1);
  const [items, setItems] = useState<RunnerItem[]>([]);
  const [shieldActive, setShieldActive] = useState(false);
  const [multiplierActive, setMultiplierActive] = useState(false);
  const [distance, setDistance] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [showVerse, setShowVerse] = useState<string | null>(null);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [roadLines, setRoadLines] = useState<PerspectiveRoadLine[]>([]);
  const [buildings, setBuildings] = useState<PerspectiveBuilding[]>([]);
  const [stars] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * HORIZON_Y,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
    }))
  );

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedUpRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const themeChangeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const distanceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(GAME_CONFIG.GAME_SPEED_INITIAL);
  const itemIdRef = useRef(0);
  const itemsRef = useRef<RunnerItem[]>([]);
  const playerLaneRef = useRef(1);
  const livesRef = useRef(3);
  const shieldRef = useRef(false);
  const multiplierRef = useRef(false);
  const scoreRef = useRef(0);
  const gameStateRef = useRef<GameState>('menu');
  const roadLineIdRef = useRef(0);
  const buildingIdRef = useRef(0);
  const roadLinesRef = useRef<PerspectiveRoadLine[]>([]);
  const buildingsRef = useRef<PerspectiveBuilding[]>([]);

  const playerBounce = useRef(new Animated.Value(0)).current;
  const shieldGlow = useRef(new Animated.Value(0)).current;
  const screenFlash = useRef(new Animated.Value(0)).current;
  const comboScale = useRef(new Animated.Value(0)).current;
  const playerScaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const shieldGlowAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const runAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const menuPulse = useRef(new Animated.Value(1)).current;

  const currentTheme = SCENERY_THEMES[currentThemeIndex];

  const COLLISION_PROGRESS = 0.72;
  const COLLISION_RANGE = 0.06;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(menuPulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(menuPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [menuPulse]);

  const startRunAnimation = useCallback(() => {
    bounceAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(playerBounce, { toValue: -5, duration: 140, useNativeDriver: true }),
        Animated.timing(playerBounce, { toValue: 0, duration: 140, useNativeDriver: true }),
      ])
    );
    bounceAnimRef.current.start();

    runAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(playerScaleAnim, { toValue: 1.04, duration: 140, useNativeDriver: true }),
        Animated.timing(playerScaleAnim, { toValue: 0.96, duration: 140, useNativeDriver: true }),
      ])
    );
    runAnimRef.current.start();
  }, [playerBounce, playerScaleAnim]);

  const flashScreen = useCallback(() => {
    screenFlash.setValue(1);
    Animated.timing(screenFlash, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  }, [screenFlash]);

  const showComboFn = useCallback((count: number) => {
    if (count >= 3) {
      comboScale.setValue(1.5);
      Animated.spring(comboScale, { toValue: 0, tension: 50, friction: 5, useNativeDriver: true }).start();
    }
  }, [comboScale]);

  const cleanupGame = useCallback(() => {
    if (gameLoopRef.current) { clearInterval(gameLoopRef.current); gameLoopRef.current = null; }
    if (spawnLoopRef.current) { clearTimeout(spawnLoopRef.current); spawnLoopRef.current = null; }
    if (speedUpRef.current) { clearInterval(speedUpRef.current); speedUpRef.current = null; }
    if (themeChangeRef.current) { clearInterval(themeChangeRef.current); themeChangeRef.current = null; }
    if (distanceRef.current) { clearInterval(distanceRef.current); distanceRef.current = null; }
    if (bounceAnimRef.current) { bounceAnimRef.current.stop(); bounceAnimRef.current = null; }
    if (shieldGlowAnimRef.current) { shieldGlowAnimRef.current.stop(); shieldGlowAnimRef.current = null; }
    if (runAnimRef.current) { runAnimRef.current.stop(); runAnimRef.current = null; }
  }, []);

  const endGame = useCallback(() => {
    gameStateRef.current = 'gameover';
    setGameState('gameover');
    cleanupGame();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setHighScore(prev => Math.max(prev, scoreRef.current));
  }, [cleanupGame]);

  const spawnInitialRoadLines = useCallback(() => {
    const lines: PerspectiveRoadLine[] = [];
    for (let i = 0; i < 12; i++) {
      lines.push({ id: roadLineIdRef.current++, progress: i / 12 });
    }
    roadLinesRef.current = lines;
    setRoadLines([...lines]);
  }, []);

  const spawnInitialBuildings = useCallback(() => {
    const blds: PerspectiveBuilding[] = [];
    for (let i = 0; i < 16; i++) {
      blds.push({
        id: buildingIdRef.current++,
        side: i % 2 === 0 ? 'left' : 'right',
        progress: i * 0.07,
        height: 40 + Math.random() * 60,
        colorIdx: Math.floor(Math.random() * 5),
        windows: Math.floor(Math.random() * 4) + 1,
      });
    }
    buildingsRef.current = blds;
    setBuildings([...blds]);
  }, []);

  const spawnItem = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    const lane = Math.floor(Math.random() * GAME_CONFIG.LANE_COUNT);
    const rand = Math.random();
    const id = `item_${itemIdRef.current++}`;

    let item: RunnerItem;
    if (rand < 0.30) {
      const styles: ObstacleStyle[] = ['barrier', 'train', 'cone'];
      item = {
        id, kind: 'obstacle', lane, progress: 0, collected: false,
        obstacleStyle: styles[Math.floor(Math.random() * styles.length)], points: 0,
      };
    } else if (rand < 0.88) {
      const coinRand = Math.random();
      const coinType: CoinType = coinRand < 0.1 ? 'diamond' : coinRand < 0.35 ? 'silver' : 'gold';
      item = {
        id, kind: 'coin', lane, progress: 0, collected: false,
        coinType, points: COIN_POINTS[coinType],
      };
    } else {
      const powers: PowerType[] = ['shield', 'magnet', 'x2'];
      item = {
        id, kind: 'powerup', lane, progress: 0, collected: false,
        powerType: powers[Math.floor(Math.random() * powers.length)], points: 0,
      };
    }

    itemsRef.current = [...itemsRef.current, item];
    setItems([...itemsRef.current]);
  }, []);

  const scheduleSpawn = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    const delay = GAME_CONFIG.SPAWN_INTERVAL_MIN +
      Math.random() * (GAME_CONFIG.SPAWN_INTERVAL_MAX - GAME_CONFIG.SPAWN_INTERVAL_MIN);
    spawnLoopRef.current = setTimeout(() => {
      spawnItem();
      if (Math.random() < 0.35) {
        setTimeout(() => spawnItem(), 250);
      }
      scheduleSpawn();
    }, delay);
  }, [spawnItem]);

  const activatePower = useCallback((powerType: PowerType) => {
    if (powerType === 'shield') {
      shieldRef.current = true;
      setShieldActive(true);
      shieldGlowAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(shieldGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(shieldGlow, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        ])
      );
      shieldGlowAnimRef.current.start();
      setTimeout(() => {
        shieldRef.current = false;
        setShieldActive(false);
        if (shieldGlowAnimRef.current) { shieldGlowAnimRef.current.stop(); shieldGlowAnimRef.current = null; }
        shieldGlow.setValue(0);
      }, 5000);
    } else if (powerType === 'x2') {
      multiplierRef.current = true;
      setMultiplierActive(true);
      setTimeout(() => {
        multiplierRef.current = false;
        setMultiplierActive(false);
      }, 6000);
    }
    const verse = GAME_VERSES[Math.floor(Math.random() * GAME_VERSES.length)];
    setShowVerse(verse);
    setTimeout(() => setShowVerse(null), 2000);
  }, [shieldGlow]);

  const handleCollect = useCallback((item: RunnerItem) => {
    if (item.kind === 'obstacle') {
      if (shieldRef.current) return;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      flashScreen();
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      setComboCount(0);
      if (newLives <= 0) endGame();
    } else if (item.kind === 'coin') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const pts = multiplierRef.current ? item.points * 2 : item.points;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setComboCount(prev => {
        const c = prev + 1;
        showComboFn(c);
        return c;
      });
    } else if (item.kind === 'powerup' && item.powerType) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      activatePower(item.powerType);
    }
  }, [flashScreen, showComboFn, endGame, activatePower]);

  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    const speed = speedRef.current * 0.006;

    const updated = itemsRef.current.map(item => {
      if (item.collected) return item;
      item.progress += speed;

      if (!item.collected &&
        item.lane === playerLaneRef.current &&
        item.progress >= COLLISION_PROGRESS - COLLISION_RANGE &&
        item.progress <= COLLISION_PROGRESS + COLLISION_RANGE) {
        item.collected = true;
        handleCollect(item);
      }
      return item;
    }).filter(item => item.progress < 1.15);

    itemsRef.current = updated;
    setItems([...updated]);

    const rlSpeed = speed * 1.2;
    const updatedLines = roadLinesRef.current.map(line => {
      line.progress += rlSpeed;
      if (line.progress > 1) line.progress -= 1;
      return line;
    });
    roadLinesRef.current = updatedLines;
    setRoadLines([...updatedLines]);

    const bldSpeed = speed * 0.8;
    const updatedBlds = buildingsRef.current.map(bld => {
      bld.progress += bldSpeed;
      if (bld.progress > 1.1) {
        bld.progress = -0.1;
        bld.height = 40 + Math.random() * 60;
        bld.colorIdx = Math.floor(Math.random() * 5);
        bld.windows = Math.floor(Math.random() * 4) + 1;
      }
      return bld;
    });
    buildingsRef.current = updatedBlds;
    setBuildings([...updatedBlds]);
  }, [handleCollect]);

  const startGame = useCallback(() => {
    cleanupGame();

    gameStateRef.current = 'playing';
    setGameState('playing');
    setScore(0);
    setLives(3);
    setPlayerLane(1);
    setComboCount(0);
    setDistance(0);
    setShieldActive(false);
    setMultiplierActive(false);
    setShowVerse(null);

    scoreRef.current = 0;
    livesRef.current = 3;
    playerLaneRef.current = 1;
    shieldRef.current = false;
    multiplierRef.current = false;
    speedRef.current = GAME_CONFIG.GAME_SPEED_INITIAL;
    itemIdRef.current = 0;
    itemsRef.current = [];
    setItems([]);

    spawnInitialRoadLines();
    spawnInitialBuildings();
    startRunAnimation();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    gameLoopRef.current = setInterval(() => { gameLoop(); }, 16);
    scheduleSpawn();

    speedUpRef.current = setInterval(() => {
      speedRef.current += GAME_CONFIG.GAME_SPEED_INCREMENT;
    }, GAME_CONFIG.SPEED_INCREASE_INTERVAL);

    distanceRef.current = setInterval(() => {
      setDistance(prev => prev + 1);
    }, 100);

    themeChangeRef.current = setInterval(() => {
      setCurrentThemeIndex(prev => (prev + 1) % SCENERY_THEMES.length);
    }, 30000);
  }, [cleanupGame, gameLoop, scheduleSpawn, startRunAnimation, spawnInitialRoadLines, spawnInitialBuildings]);

  useEffect(() => {
    return () => { cleanupGame(); };
  }, [cleanupGame]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => gameStateRef.current === 'playing',
    onMoveShouldSetPanResponder: (_, g) => gameStateRef.current === 'playing' && Math.abs(g.dx) > 8,
    onPanResponderRelease: (_, gestureState) => {
      if (gameStateRef.current !== 'playing') return;
      const { dx } = gestureState;
      if (Math.abs(dx) > GAME_CONFIG.SWIPE_THRESHOLD) {
        if (dx > 0 && playerLaneRef.current < GAME_CONFIG.LANE_COUNT - 1) {
          const nl = playerLaneRef.current + 1;
          playerLaneRef.current = nl;
          setPlayerLane(nl);
          void Haptics.selectionAsync();
        } else if (dx < 0 && playerLaneRef.current > 0) {
          const nl = playerLaneRef.current - 1;
          playerLaneRef.current = nl;
          setPlayerLane(nl);
          void Haptics.selectionAsync();
        }
      }
    },
  }), []);

  const handleLaneTap = useCallback((lane: number) => {
    if (gameStateRef.current !== 'playing') return;
    playerLaneRef.current = lane;
    setPlayerLane(lane);
    void Haptics.selectionAsync();
  }, []);

  const formatDistance = (d: number): string => {
    if (d >= 1000) return `${(d / 1000).toFixed(1)}km`;
    return `${d}m`;
  };

  const renderPerspectiveRoad = () => {
    const roadTopLeft = VANISH_X - ROAD_TOP_HALF;
    const roadTopRight = VANISH_X + ROAD_TOP_HALF;
    const roadBotLeft = VANISH_X - ROAD_BOT_HALF;
    const roadBotRight = VANISH_X + ROAD_BOT_HALF;

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[perspStyles.roadTrapezoid, {
          borderTopWidth: 0,
          borderBottomWidth: SCREEN_HEIGHT - HORIZON_Y,
          borderLeftWidth: (roadBotLeft - roadTopLeft) > 0 ? 0 : Math.abs(roadBotLeft - roadTopLeft),
          borderRightWidth: (roadTopRight - roadBotRight) > 0 ? 0 : Math.abs(roadBotRight - roadTopRight),
        }]} />

        <View style={{
          position: 'absolute',
          top: HORIZON_Y,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const t = i / 20;
            const y = getYFromProgress(t) - HORIZON_Y;
            const leftX = lerp(roadTopLeft, roadBotLeft, t);
            const rightX = lerp(roadTopRight, roadBotRight, t);
            const width = rightX - leftX;

            const lane1X = leftX + width / 3;
            const lane2X = leftX + (width * 2) / 3;
            const dashH = Math.max(2, 4 * t);
            const dashW = Math.max(1, 3 * t);
            const opacity = 0.15 + t * 0.25;

            return (
              <React.Fragment key={i}>
                <View style={{
                  position: 'absolute',
                  top: y,
                  left: lane1X - dashW / 2,
                  width: dashW,
                  height: dashH,
                  backgroundColor: `rgba(255,255,255,${opacity})`,
                  borderRadius: 1,
                }} />
                <View style={{
                  position: 'absolute',
                  top: y,
                  left: lane2X - dashW / 2,
                  width: dashW,
                  height: dashH,
                  backgroundColor: `rgba(255,255,255,${opacity})`,
                  borderRadius: 1,
                }} />
              </React.Fragment>
            );
          })}
        </View>

        {roadLines.map(line => {
          if (line.progress < 0 || line.progress > 1) return null;
          const t = line.progress;
          const y = getYFromProgress(t);
          const leftX = lerp(roadTopLeft, roadBotLeft, t);
          const rightX = lerp(roadTopRight, roadBotRight, t);
          const w = rightX - leftX;
          const h = Math.max(1, 2 * t);
          const opacity = 0.08 + t * 0.12;

          return (
            <View key={line.id} style={{
              position: 'absolute',
              top: y,
              left: leftX,
              width: w,
              height: h,
              backgroundColor: `rgba(255,255,255,${opacity})`,
            }} />
          );
        })}

        <View style={{
          position: 'absolute',
          top: HORIZON_Y,
          left: roadTopLeft,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderTopWidth: 0,
          borderBottomWidth: SCREEN_HEIGHT - HORIZON_Y,
          borderLeftWidth: 0,
          borderRightWidth: Math.abs(roadBotLeft - roadTopLeft),
          borderBottomColor: currentTheme.roadEdge + '44',
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
          borderLeftColor: 'transparent',
        }} />

        <View style={{
          position: 'absolute',
          top: HORIZON_Y,
          left: roadTopRight,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderTopWidth: 0,
          borderBottomWidth: SCREEN_HEIGHT - HORIZON_Y,
          borderLeftWidth: Math.abs(roadBotRight - roadTopRight),
          borderRightWidth: 0,
          borderBottomColor: currentTheme.roadEdge + '44',
          borderLeftColor: 'transparent',
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
        }} />
      </View>
    );
  };

  const renderBuildings = () => {
    return buildings.map(bld => {
      if (bld.progress < 0 || bld.progress > 1.05) return null;
      const t = bld.progress;
      const scale = getScale(t);
      const y = getYFromProgress(t);

      const roadLeft = lerp(VANISH_X - ROAD_TOP_HALF, VANISH_X - ROAD_BOT_HALF, t);
      const roadRight = lerp(VANISH_X + ROAD_TOP_HALF, VANISH_X + ROAD_BOT_HALF, t);

      const bldW = 25 * scale + 10;
      const bldH = bld.height * scale;
      const x = bld.side === 'left'
        ? roadLeft - bldW - 4 * scale
        : roadRight + 4 * scale;

      if (x < -40 || x > SCREEN_WIDTH + 40) return null;

      const colors = currentTheme.buildingColors;
      const color = colors[bld.colorIdx % colors.length];

      return (
        <View key={bld.id} style={{
          position: 'absolute',
          left: x,
          top: y - bldH,
          width: bldW,
          height: bldH,
          backgroundColor: color,
          borderTopLeftRadius: 2 * scale,
          borderTopRightRadius: 2 * scale,
          overflow: 'hidden',
        }}>
          {Array.from({ length: bld.windows }).map((_, wi) => (
            <View key={wi} style={{
              position: 'absolute',
              top: 4 * scale + (wi % 3) * 10 * scale,
              left: 3 * scale + Math.floor(wi / 3) * 8 * scale,
              width: 4 * scale + 2,
              height: 5 * scale + 2,
              backgroundColor: wi % 2 === 0 ? '#ffd70066' : '#ffffff11',
              borderRadius: 1,
            }} />
          ))}
        </View>
      );
    });
  };

  const renderItems = () => {
    return items.map(item => {
      if (item.collected || item.progress < 0 || item.progress > 1.1) return null;
      const t = item.progress;
      const scale = getScale(t);
      const y = getYFromProgress(t);
      const x = getLaneX(item.lane, t);

      return (
        <View key={item.id} style={{
          position: 'absolute',
          left: x - 20 * scale,
          top: y - 25 * scale,
          width: 40 * scale,
          height: 50 * scale,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: Math.floor(t * 100),
        }}>
          {item.kind === 'coin' && (
            <View style={{
              width: 24 * scale,
              height: 24 * scale,
              borderRadius: 12 * scale,
              backgroundColor: COIN_COLORS[item.coinType ?? 'gold'],
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: COIN_COLORS[item.coinType ?? 'gold'],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.7,
              shadowRadius: 6 * scale,
              elevation: 4,
            }}>
              {item.coinType === 'diamond' ? (
                <Text style={{ fontSize: 14 * scale }}>💎</Text>
              ) : (
                <Text style={{ fontSize: 11 * scale, fontWeight: '800' as const, color: 'rgba(0,0,0,0.4)' }}>$</Text>
              )}
            </View>
          )}
          {item.kind === 'obstacle' && (
            <View style={{
              width: 36 * scale,
              height: 44 * scale,
              borderRadius: 5 * scale,
              backgroundColor: OBSTACLE_COLORS[item.obstacleStyle ?? 'barrier'],
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.6,
              shadowRadius: 6 * scale,
              elevation: 5,
              overflow: 'hidden',
            }}>
              <View style={{
                position: 'absolute',
                top: 5 * scale,
                left: 0,
                right: 0,
                height: 4 * scale,
                backgroundColor: '#fff',
                opacity: 0.4,
              }} />
              <View style={{
                position: 'absolute',
                bottom: 8 * scale,
                left: 0,
                right: 0,
                height: 4 * scale,
                backgroundColor: '#fff',
                opacity: 0.3,
              }} />
              <Text style={{ fontSize: 16 * scale }}>
                {item.obstacleStyle === 'train' ? '🚂' : item.obstacleStyle === 'cone' ? '⚠️' : '🚧'}
              </Text>
            </View>
          )}
          {item.kind === 'powerup' && (
            <View style={{
              width: 32 * scale,
              height: 32 * scale,
              borderRadius: 16 * scale,
              backgroundColor: 'rgba(241,196,15,0.25)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 18 * scale }}>
                {item.powerType === 'shield' ? '🛡️' : item.powerType === 'x2' ? '✨' : '🧲'}
              </Text>
            </View>
          )}
        </View>
      );
    });
  };

  const renderPlayer = () => {
    const t = COLLISION_PROGRESS;
    const x = getLaneX(playerLane, t);
    const y = getYFromProgress(t);
    const scale = getScale(t);
    const pW = GAME_CONFIG.PLAYER_WIDTH * scale;
    const pH = GAME_CONFIG.PLAYER_HEIGHT * scale;

    return (
      <Animated.View style={{
        position: 'absolute',
        left: x - pW / 2,
        top: y - pH,
        width: pW,
        height: pH,
        zIndex: 200,
        alignItems: 'center',
        transform: [
          { translateY: playerBounce },
          { scaleY: playerScaleAnim },
        ],
      }}>
        <View style={{
          position: 'absolute',
          bottom: -3 * scale,
          width: 30 * scale,
          height: 8 * scale,
          borderRadius: 15 * scale,
          backgroundColor: shieldActive ? 'rgba(46,204,113,0.5)' : 'rgba(0,0,0,0.35)',
        }} />

        <View style={{
          width: 14 * scale,
          height: 14 * scale,
          borderRadius: 7 * scale,
          backgroundColor: '#f39c12',
          zIndex: 2,
        }} />
        <View style={{
          width: 18 * scale,
          height: 20 * scale,
          backgroundColor: '#3498db',
          borderRadius: 3 * scale,
          marginTop: 1 * scale,
          zIndex: 1,
        }} />
        <View style={{
          position: 'absolute',
          top: 15 * scale,
          left: 1 * scale,
          width: 6 * scale,
          height: 14 * scale,
          backgroundColor: '#2980b9',
          borderRadius: 3 * scale,
          transform: [{ rotate: '-25deg' }],
        }} />
        <View style={{
          position: 'absolute',
          top: 15 * scale,
          right: 1 * scale,
          width: 6 * scale,
          height: 14 * scale,
          backgroundColor: '#2980b9',
          borderRadius: 3 * scale,
          transform: [{ rotate: '25deg' }],
        }} />
        <View style={{
          position: 'absolute',
          bottom: 2 * scale,
          left: pW * 0.25,
          width: 7 * scale,
          height: 14 * scale,
          backgroundColor: '#2c3e50',
          borderRadius: 3 * scale,
          transform: [{ rotate: '-8deg' }],
        }} />
        <View style={{
          position: 'absolute',
          bottom: 2 * scale,
          right: pW * 0.25,
          width: 7 * scale,
          height: 14 * scale,
          backgroundColor: '#2c3e50',
          borderRadius: 3 * scale,
          transform: [{ rotate: '8deg' }],
        }} />

        {shieldActive && (
          <Animated.View style={{
            position: 'absolute',
            top: -6 * scale,
            left: -10 * scale,
            right: -10 * scale,
            bottom: -6 * scale,
            borderRadius: 24 * scale,
            borderWidth: 2,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46,204,113,0.15)',
            opacity: shieldGlow,
          }} />
        )}
      </Animated.View>
    );
  };

  const renderSky = () => (
    <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} pointerEvents="none">
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HORIZON_Y + 20,
        backgroundColor: currentTheme.skyTop,
      }} />
      <View style={{
        position: 'absolute',
        top: HORIZON_Y * 0.5,
        left: 0,
        right: 0,
        height: HORIZON_Y * 0.5 + 20,
        backgroundColor: currentTheme.skyBottom,
        opacity: 0.7,
      }} />
      {currentThemeIndex !== 1 && stars.map(star => (
        <View key={star.id} style={{
          position: 'absolute',
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: '#fff',
          opacity: star.opacity * 0.6,
        }} />
      ))}
      <View style={{
        position: 'absolute',
        top: HORIZON_Y - 2,
        left: 0,
        right: 0,
        height: 30,
        backgroundColor: currentTheme.ground,
      }} />
    </View>
  );

  const renderGround = () => (
    <View style={{
      position: 'absolute',
      top: HORIZON_Y,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: currentTheme.ground,
      zIndex: 1,
    }} pointerEvents="none" />
  );

  const renderHUD = () => (
    <View style={[perspStyles.hud, { top: insets.top + 8 }]}>
      <View style={perspStyles.hudScoreBox}>
        <Text style={perspStyles.hudScoreText}>{score}</Text>
        {multiplierActive && <Text style={perspStyles.hudMultiplier}>x2</Text>}
      </View>
      <View style={perspStyles.hudDistBox}>
        <Text style={perspStyles.hudDistText}>{formatDistance(distance)}</Text>
      </View>
      <View style={perspStyles.hudLivesBox}>
        {[0, 1, 2].map(i => (
          <Heart key={i} size={18}
            color={i < lives ? '#e74c3c' : '#555'}
            fill={i < lives ? '#e74c3c' : 'transparent'}
          />
        ))}
      </View>
    </View>
  );

  const renderLaneButtons = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {[0, 1, 2].map(lane => {
        const topX = getLaneX(lane, 0);
        const botX = getLaneX(lane, 1);
        const left = Math.min(topX, botX) - 30;
        const right = Math.max(topX, botX) + 30;
        return (
          <TouchableOpacity
            key={lane}
            style={{
              position: 'absolute',
              top: HORIZON_Y,
              bottom: 0,
              left: left,
              width: right - left,
              zIndex: 300,
            }}
            onPress={() => handleLaneTap(lane)}
            activeOpacity={1}
          />
        );
      })}
    </View>
  );

  const renderMenu = () => (
    <View style={perspStyles.menuContainer}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a1a' }]}>
        {stars.map(star => (
          <View key={star.id} style={{
            position: 'absolute',
            left: star.x,
            top: star.y * 2,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#fff',
            opacity: star.opacity * 0.5,
          }} />
        ))}

        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: SCREEN_HEIGHT * 0.35,
        }}>
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: SCREEN_WIDTH * 0.2,
            right: SCREEN_WIDTH * 0.2,
            height: SCREEN_HEIGHT * 0.35,
            backgroundColor: '#1a1a2e',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }} />
          <View style={{
            position: 'absolute', bottom: 0,
            left: SCREEN_WIDTH * 0.3, width: 2,
            height: SCREEN_HEIGHT * 0.35,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }} />
          <View style={{
            position: 'absolute', bottom: 0,
            left: SCREEN_WIDTH * 0.7, width: 2,
            height: SCREEN_HEIGHT * 0.35,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }} />
        </View>
      </View>

      <View style={perspStyles.menuContent}>
        <Animated.View style={[perspStyles.menuCharCircle, { transform: [{ scale: menuPulse }] }]}>
          <View style={perspStyles.menuChar}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#f39c12' }} />
            <View style={{ width: 24, height: 26, backgroundColor: '#3498db', borderRadius: 4, marginTop: 2 }} />
          </View>
        </Animated.View>

        <Text style={perspStyles.menuTitle}>Corredor da Fé</Text>
        <Text style={perspStyles.menuSubtitle}>Corra em perspectiva 2.5D!</Text>

        <View style={perspStyles.menuStats}>
          <View style={perspStyles.menuStatItem}>
            <Trophy size={20} color="#f1c40f" />
            <Text style={perspStyles.menuStatValue}>{highScore}</Text>
            <Text style={perspStyles.menuStatLabel}>Recorde</Text>
          </View>
          <View style={perspStyles.menuStatDivider} />
          <View style={perspStyles.menuStatItem}>
            <Zap size={20} color="#e67e22" />
            <Text style={perspStyles.menuStatValue}>{formatDistance(distance)}</Text>
            <Text style={perspStyles.menuStatLabel}>Distância</Text>
          </View>
        </View>

        <TouchableOpacity style={perspStyles.playButton} onPress={startGame} activeOpacity={0.85}>
          <Play size={26} color="#fff" fill="#fff" />
          <Text style={perspStyles.playButtonText}>CORRER</Text>
        </TouchableOpacity>

        <View style={perspStyles.instructionsCard}>
          <Text style={perspStyles.instructionsTitle}>Como Jogar</Text>
          <View style={perspStyles.instructionRow}>
            <Text style={perspStyles.instructionEmoji}>👆</Text>
            <Text style={perspStyles.instructionText}>Toque na faixa ou deslize</Text>
          </View>
          <View style={perspStyles.instructionRow}>
            <Text style={perspStyles.instructionEmoji}>💰</Text>
            <Text style={perspStyles.instructionText}>Colete moedas para pontuar</Text>
          </View>
          <View style={perspStyles.instructionRow}>
            <Text style={perspStyles.instructionEmoji}>🚧</Text>
            <Text style={perspStyles.instructionText}>Desvie dos obstáculos</Text>
          </View>
          <View style={perspStyles.instructionRow}>
            <Text style={perspStyles.instructionEmoji}>✨</Text>
            <Text style={perspStyles.instructionText}>Pegue power-ups especiais</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderGameOver = () => (
    <View style={perspStyles.gameOverContainer}>
      <View style={perspStyles.gameOverCard}>
        <View style={perspStyles.gameOverBadge}>
          <Text style={perspStyles.gameOverBadgeEmoji}>
            {score >= highScore && score > 0 ? '🏆' : '🏃'}
          </Text>
        </View>
        <Text style={perspStyles.gameOverTitle}>
          {score >= highScore && score > 0 ? 'Novo Recorde!' : 'Fim da Corrida!'}
        </Text>

        <View style={perspStyles.gameOverScoreRow}>
          <View style={perspStyles.gameOverScoreBox}>
            <Text style={perspStyles.gameOverScoreValue}>{score}</Text>
            <Text style={perspStyles.gameOverScoreLabel}>Pontos</Text>
          </View>
          <View style={perspStyles.gameOverDivider} />
          <View style={perspStyles.gameOverScoreBox}>
            <Text style={perspStyles.gameOverScoreValue}>{formatDistance(distance)}</Text>
            <Text style={perspStyles.gameOverScoreLabel}>Distância</Text>
          </View>
        </View>

        <View style={perspStyles.gameOverRecordRow}>
          <Trophy size={16} color="#f1c40f" />
          <Text style={perspStyles.gameOverRecordText}>Recorde: {Math.max(highScore, score)}</Text>
        </View>

        <TouchableOpacity style={perspStyles.retryButton} onPress={startGame} activeOpacity={0.85}>
          <RotateCcw size={20} color="#fff" />
          <Text style={perspStyles.retryButtonText}>Jogar Novamente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={perspStyles.backBtn} onPress={() => setGameState('menu')} activeOpacity={0.7}>
          <Text style={perspStyles.backBtnText}>Menu Principal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGame = () => (
    <View style={{ flex: 1, overflow: 'hidden' }} {...panResponder.panHandlers}>
      {renderSky()}
      {renderGround()}
      {renderPerspectiveRoad()}
      <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 5 }} pointerEvents="none">
        {renderBuildings()}
      </View>
      <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 10 }} pointerEvents="none">
        {renderItems()}
      </View>
      {renderPlayer()}
      {renderHUD()}

      {showVerse && (
        <View style={[perspStyles.versePopup, { top: insets.top + 50 }]}>
          <Text style={perspStyles.versePopupText}>{showVerse}</Text>
        </View>
      )}

      {shieldActive && !showVerse && (
        <Animated.View style={[perspStyles.shieldBanner, { opacity: shieldGlow, top: insets.top + 50 }]}>
          <Text style={perspStyles.shieldBannerText}>🛡️ ESCUDO ATIVO</Text>
        </Animated.View>
      )}

      {comboCount >= 3 && (
        <Animated.View style={[perspStyles.comboPopup, { top: insets.top + 80, transform: [{ scale: comboScale }] }]}>
          <Text style={perspStyles.comboText}>🔥 x{comboCount}</Text>
        </Animated.View>
      )}

      <Animated.View
        style={[perspStyles.screenFlash, { opacity: screenFlash }]}
        pointerEvents="none"
      />

      {renderLaneButtons()}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: gameState === 'playing' ? currentTheme.ground : '#0a0a1a' }}>
        {gameState === 'menu' && renderMenu()}
        {gameState === 'playing' && renderGame()}
        {gameState === 'gameover' && renderGameOver()}
      </View>
    </>
  );
}

const perspStyles = StyleSheet.create({
  roadTrapezoid: {
    position: 'absolute',
    top: SCREEN_HEIGHT * GAME_CONFIG.HORIZON_Y,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2a2a35',
    zIndex: 2,
  },
  hud: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 500,
  },
  hudScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  hudScoreText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#f1c40f',
  },
  hudMultiplier: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#e74c3c',
  },
  hudDistBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hudDistText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  hudLivesBox: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
  },
  versePopup: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(52,152,219,0.92)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    zIndex: 500,
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  versePopupText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
    textAlign: 'center',
  },
  shieldBanner: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(46,204,113,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    zIndex: 500,
  },
  shieldBannerText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 1,
  },
  comboPopup: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 500,
  },
  comboText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#f39c12',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  screenFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,0,0,0.3)',
    zIndex: 999,
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    zIndex: 10,
  },
  menuCharCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(52,152,219,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(52,152,219,0.35)',
  },
  menuChar: {
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 34,
    fontWeight: '900' as const,
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#8888aa',
    textAlign: 'center',
    marginBottom: 28,
  },
  menuStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginBottom: 28,
    gap: 24,
  },
  menuStatItem: {
    alignItems: 'center',
    gap: 6,
  },
  menuStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuStatValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#fff',
  },
  menuStatLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 28,
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 2,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    gap: 10,
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instructionEmoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0a0a1a',
  },
  gameOverCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gameOverBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(241,196,15,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameOverBadgeEmoji: {
    fontSize: 40,
  },
  gameOverTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: '#fff',
    marginBottom: 20,
  },
  gameOverScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  gameOverScoreBox: {
    alignItems: 'center',
    flex: 1,
  },
  gameOverScoreValue: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: '#f1c40f',
  },
  gameOverScoreLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  gameOverDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gameOverRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  gameOverRecordText: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '600' as const,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 14,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  backBtn: {
    paddingVertical: 12,
  },
  backBtnText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600' as const,
  },
});
