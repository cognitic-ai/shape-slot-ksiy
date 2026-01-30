import { View, Text, useWindowDimensions, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useEffect, useState, useRef } from "react";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

type ShapeType = "circle" | "rectangle" | "hexagon" | "triangle" | "diamond" | "star" | "pentagon" | "octagon";

interface Shape {
  id: string;
  type: ShapeType;
  color: string;
  size: number;
  slotX: number;
  slotY: number;
  currentX: number;
  currentY: number;
  isPlaced: boolean;
}

const COLORS = [
  "#FF6B9D", "#C44569", "#FFA07A", "#98D8C8", "#6BCF7F", "#A8E6CF",
  "#FFD93D", "#95E1D3", "#B4A7D6", "#F8B195", "#89CFF0", "#F6C6EA",
  "#FF8B94", "#A8E6CF", "#FFD3B6", "#FFAAA5", "#FF8C94", "#C7CEEA",
  "#FFDAC1", "#B5EAD7", "#E2F0CB", "#C7CEEA", "#FFB7B2", "#FFDFD3",
];

const springConfig = {
  damping: 20,
  stiffness: 300,
};

const snapSpringConfig = {
  damping: 15,
  stiffness: 200,
};

function generateLevel(level: number, width: number, height: number): Shape[] {
  const shapes: Shape[] = [];
  let shapeCount: number;
  let baseSize: number;

  // Progressive difficulty scaling
  if (level <= 10) {
    shapeCount = 2 + level;
    baseSize = Math.max(45, 85 - level * 3);
  } else if (level <= 25) {
    shapeCount = 12 + Math.floor((level - 10) * 0.8);
    baseSize = Math.max(35, 55 - (level - 10) * 1);
  } else if (level <= 50) {
    shapeCount = 24 + Math.floor((level - 25) * 0.6);
    baseSize = Math.max(30, 45 - (level - 25) * 0.3);
  } else if (level <= 75) {
    shapeCount = 39 + Math.floor((level - 50) * 0.5);
    baseSize = Math.max(25, 38 - (level - 50) * 0.2);
  } else {
    shapeCount = 52 + Math.floor((level - 75) * 0.4);
    baseSize = Math.max(22, 32 - (level - 75) * 0.15);
  }

  const types: ShapeType[] = ["circle", "rectangle", "hexagon", "triangle", "diamond", "star", "pentagon", "octagon"];
  const availableTypes = types.slice(0, Math.min(3 + Math.floor(level / 15), types.length));

  const padding = 60;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  // Generate slot positions in a grid
  const cols = Math.ceil(Math.sqrt(shapeCount * 1.2));
  const rows = Math.ceil(shapeCount / cols);
  const cellWidth = usableWidth / cols;
  const cellHeight = usableHeight / rows;

  for (let i = 0; i < shapeCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const slotX = padding + col * cellWidth + cellWidth / 2 - baseSize / 2;
    const slotY = padding + row * cellHeight + cellHeight / 2 - baseSize / 2;

    // Random starting position
    const currentX = Math.random() * (width - baseSize - 40) + 20;
    const currentY = Math.random() * (height - baseSize - 40) + 20;

    shapes.push({
      id: `shape-${i}`,
      type: availableTypes[i % availableTypes.length],
      color: COLORS[i % COLORS.length],
      size: baseSize,
      slotX,
      slotY,
      currentX,
      currentY,
      isPlaced: false,
    });
  }

  return shapes;
}

function ShapeComponent({
  shape,
  onPositionUpdate,
  onSnapToSlot,
  onDragStart,
  allShapes,
  zIndex,
}: {
  shape: Shape;
  onPositionUpdate: (id: string, x: number, y: number) => void;
  onSnapToSlot: (id: string) => void;
  onDragStart: (id: string) => void;
  allShapes: Shape[];
  zIndex: number;
}) {
  const translateX = useSharedValue(shape.currentX);
  const translateY = useSharedValue(shape.currentY);
  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(shape.currentX, springConfig);
    translateY.value = withSpring(shape.currentY, springConfig);
  }, [shape.currentX, shape.currentY]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      scale.value = withSpring(1.1);
      runOnJS(onDragStart)(shape.id);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((event) => {
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      const finalX = translateX.value;
      const finalY = translateY.value;

      // Check if near slot
      const distanceToSlot = Math.sqrt(
        Math.pow(finalX - shape.slotX, 2) + Math.pow(finalY - shape.slotY, 2)
      );

      if (distanceToSlot < 30) {
        // Snap to slot
        translateX.value = withSpring(shape.slotX, snapSpringConfig);
        translateY.value = withSpring(shape.slotY, snapSpringConfig);
        runOnJS(onSnapToSlot)(shape.id);
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
      } else {
        runOnJS(onPositionUpdate)(shape.id, finalX, finalY);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const renderShape = () => {
    const baseStyle = {
      width: shape.size,
      height: shape.size,
      backgroundColor: shape.color,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    };

    switch (shape.type) {
      case "circle":
        return <View style={{ ...baseStyle, borderRadius: shape.size / 2 }} />;
      case "rectangle":
        return <View style={{ ...baseStyle, borderRadius: 20, borderCurve: "continuous" }} />;
      case "hexagon":
        return <View style={{ ...baseStyle, borderRadius: 16, borderCurve: "continuous", transform: [{ rotate: "30deg" }] }} />;
      case "triangle":
        return <View style={{ ...baseStyle, borderRadius: 12, borderCurve: "continuous", transform: [{ rotate: "45deg" }] }} />;
      case "diamond":
        return <View style={{ ...baseStyle, borderRadius: 8, borderCurve: "continuous", transform: [{ rotate: "45deg" }] }} />;
      case "star":
        return <View style={{ ...baseStyle, borderRadius: 14, borderCurve: "continuous", transform: [{ rotate: "22.5deg" }] }} />;
      case "pentagon":
        return <View style={{ ...baseStyle, borderRadius: 18, borderCurve: "continuous", transform: [{ rotate: "36deg" }] }} />;
      case "octagon":
        return <View style={{ ...baseStyle, borderRadius: 10, borderCurve: "continuous", transform: [{ rotate: "22.5deg" }] }} />;
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ position: "absolute", zIndex }, animatedStyle]}>
        {renderShape()}
      </Animated.View>
    </GestureDetector>
  );
}

function SlotComponent({ shape }: { shape: Shape }) {
  const baseStyle = {
    position: "absolute" as const,
    left: shape.slotX,
    top: shape.slotY,
    width: shape.size,
    height: shape.size,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderStyle: "dashed" as const,
  };

  const getRotation = () => {
    switch (shape.type) {
      case "hexagon": return "30deg";
      case "triangle": return "45deg";
      case "diamond": return "45deg";
      case "star": return "22.5deg";
      case "pentagon": return "36deg";
      case "octagon": return "22.5deg";
      default: return "0deg";
    }
  };

  const getBorderRadius = () => {
    switch (shape.type) {
      case "circle": return shape.size / 2;
      case "rectangle": return 20;
      case "hexagon": return 16;
      case "triangle": return 12;
      case "diamond": return 8;
      case "star": return 14;
      case "pentagon": return 18;
      case "octagon": return 10;
    }
  };

  return (
    <View
      style={{
        ...baseStyle,
        borderRadius: getBorderRadius(),
        borderCurve: "continuous",
        transform: [{ rotate: getRotation() }],
      }}
    />
  );
}

export default function GameRoute() {
  const { level } = useLocalSearchParams<{ level: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [draggedShapeId, setDraggedShapeId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const gameHeight = height - insets.top - insets.bottom - 100;
    const initialShapes = generateLevel(parseInt(level || "1"), width, gameHeight);
    setShapes(initialShapes);
    setIsComplete(false);
    setCompletedCount(0);

    // Load sound
    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [level, width, height]);

  useEffect(() => {
    const placedCount = shapes.filter((s) => s.isPlaced).length;
    setCompletedCount(placedCount);

    if (placedCount === shapes.length && shapes.length > 0 && !isComplete) {
      setIsComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [shapes, isComplete]);

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" },
        { shouldPlay: false }
      );
      soundRef.current = sound;
    } catch (error) {
      console.log("Sound loading error:", error);
    }
  };

  const playSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  const handlePositionUpdate = (id: string, x: number, y: number) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, currentX: x, currentY: y } : s))
    );
  };

  const handleSnapToSlot = (id: string) => {
    playSound();

    setShapes((prev) => {
      const newShapes = prev.map((s) => {
        if (s.id === id) {
          return { ...s, currentX: s.slotX, currentY: s.slotY, isPlaced: true };
        }
        return s;
      });

      // Displace overlapping shapes
      const snappedShape = newShapes.find((s) => s.id === id)!;
      return newShapes.map((s) => {
        if (s.id !== id && !s.isPlaced) {
          const dx = s.currentX - snappedShape.slotX;
          const dy = s.currentY - snappedShape.slotY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < snappedShape.size * 1.2) {
            // Displace this shape
            const angle = Math.atan2(dy, dx);
            const pushDistance = 60;
            return {
              ...s,
              currentX: s.currentX + Math.cos(angle) * pushDistance,
              currentY: s.currentY + Math.sin(angle) * pushDistance,
            };
          }
        }
        return s;
      });
    });
  };

  const handleDragStart = (id: string) => {
    setDraggedShapeId(id);
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPlaced: false } : s))
    );
  };

  const handleNextLevel = () => {
    const nextLevel = parseInt(level || "1") + 1;
    if (nextLevel <= 100) {
      router.push({ pathname: "/game", params: { level: nextLevel } });
    } else {
      router.push("/");
    }
  };

  const handleRestart = () => {
    const gameHeight = height - insets.top - insets.bottom - 100;
    const newShapes = generateLevel(parseInt(level || "1"), width, gameHeight);
    setShapes(newShapes);
    setIsComplete(false);
    setCompletedCount(0);
  };

  const handleHome = () => {
    router.push("/");
  };

  const gameHeight = height - insets.top - insets.bottom - 100;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#0a0a0a" : "#f8f9fa",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Text style={{ fontSize: 16, color: isDark ? "#ffffff" : "#1a1a1a" }}>
              ← Back
            </Text>
          </Pressable>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: isDark ? "#ffffff" : "#1a1a1a",
            }}
          >
            Level {level}
          </Text>
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              borderCurve: "continuous",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#a0a0a0" : "#666666",
                fontVariant: ["tabular-nums"],
              }}
            >
              {completedCount}/{shapes.length}
            </Text>
          </View>
        </View>

        {/* Game Area */}
        <View style={{ flex: 1, position: "relative" }}>
          {/* Slots */}
          {shapes.map((shape) => (
            <SlotComponent key={`slot-${shape.id}`} shape={shape} />
          ))}

          {/* Shapes */}
          {shapes.map((shape, index) => (
            <ShapeComponent
              key={shape.id}
              shape={shape}
              onPositionUpdate={handlePositionUpdate}
              onSnapToSlot={handleSnapToSlot}
              onDragStart={handleDragStart}
              allShapes={shapes}
              zIndex={draggedShapeId === shape.id ? 1000 : index}
            />
          ))}
        </View>

        {/* Completion Modal */}
        {isComplete && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                padding: 40,
                borderRadius: 30,
                borderCurve: "continuous",
                alignItems: "center",
                gap: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: isDark ? "#ffffff" : "#1a1a1a",
                }}
              >
                Level Complete!
              </Text>
              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <Pressable
                  onPress={handleHome}
                  style={({ pressed }) => ({
                    backgroundColor: isDark ? "#2a2a2a" : "#f0f0f0",
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 16,
                    borderCurve: "continuous",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: isDark ? "#ffffff" : "#1a1a1a",
                    }}
                  >
                    Home
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleRestart}
                  style={({ pressed }) => ({
                    backgroundColor: isDark ? "#2a2a2a" : "#f0f0f0",
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 16,
                    borderCurve: "continuous",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: isDark ? "#ffffff" : "#1a1a1a",
                    }}
                  >
                    Restart
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleNextLevel}
                  style={({ pressed }) => ({
                    backgroundColor: "#6BCF7F",
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 16,
                    borderCurve: "continuous",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    {parseInt(level || "1") === 100 ? "Finish" : "Next Level"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}
