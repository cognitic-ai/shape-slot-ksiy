import { View, Text, Pressable, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

function generateLevels() {
  const levels = [];
  for (let i = 1; i <= 100; i++) {
    let category = "";
    let shapes = 0;
    let shapeTypes = 3;

    if (i <= 10) {
      category = "Tiny Treasures";
      shapes = 2 + i;
      shapeTypes = 3;
    } else if (i <= 25) {
      category = "Cozy Corner";
      shapes = 12 + Math.floor((i - 10) * 0.8);
      shapeTypes = 3;
    } else if (i <= 50) {
      category = "Neat Freak";
      shapes = 24 + Math.floor((i - 25) * 0.6);
      shapeTypes = Math.min(4 + Math.floor((i - 25) / 10), 6);
    } else if (i <= 75) {
      category = "Order Master";
      shapes = 39 + Math.floor((i - 50) * 0.5);
      shapeTypes = Math.min(6 + Math.floor((i - 50) / 10), 8);
    } else {
      category = "Zen Legend";
      shapes = 52 + Math.floor((i - 75) * 0.4);
      shapeTypes = 8;
    }

    levels.push({ level: i, category, shapes, shapeTypes });
  }
  return levels;
}

const LEVELS = generateLevels();

const CATEGORY_GRADIENTS = {
  "Tiny Treasures": ["#6BCF7F", "#98D8C8"],
  "Cozy Corner": ["#89CFF0", "#A8E6CF"],
  "Neat Freak": ["#FFD93D", "#F8B195"],
  "Order Master": ["#FFA07A", "#FF8B94"],
  "Zen Legend": ["#FF6B9D", "#B4A7D6"],
};

export default function IndexRoute() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

  const loadCompletedLevels = async () => {
    try {
      const saved = await AsyncStorage.getItem("completedLevels");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompletedLevels(new Set(parsed));
      }
    } catch (error) {
      console.log("Error loading completed levels:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCompletedLevels();
    }, [])
  );

  const isLevelUnlocked = (level: number) => {
    if (level === 1) return true;
    return completedLevels.has(level - 1);
  };

  const isLevelCompleted = (level: number) => {
    return completedLevels.has(level);
  };

  // Group levels by category
  const tinyLevels = LEVELS.filter((l) => l.category === "Tiny Treasures");
  const cozyLevels = LEVELS.filter((l) => l.category === "Cozy Corner");
  const neatLevels = LEVELS.filter((l) => l.category === "Neat Freak");
  const orderLevels = LEVELS.filter((l) => l.category === "Order Master");
  const zenLevels = LEVELS.filter((l) => l.category === "Zen Legend");

  const categories = [
    { name: "Tiny Treasures", levels: tinyLevels, color: CATEGORY_GRADIENTS["Tiny Treasures"] },
    { name: "Cozy Corner", levels: cozyLevels, color: CATEGORY_GRADIENTS["Cozy Corner"] },
    { name: "Neat Freak", levels: neatLevels, color: CATEGORY_GRADIENTS["Neat Freak"] },
    { name: "Order Master", levels: orderLevels, color: CATEGORY_GRADIENTS["Order Master"] },
    { name: "Zen Legend", levels: zenLevels, color: CATEGORY_GRADIENTS["Zen Legend"] },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0a0a0a" : "#f8f9fa",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}
      >
        {/* Header */}
        <View
          style={{
            padding: 24,
            paddingTop: 40,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 48,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#1a1a1a",
              marginBottom: 8,
              letterSpacing: -1,
            }}
          >
            Tidy
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: isDark ? "#a0a0a0" : "#666666",
              marginBottom: 8,
              fontWeight: "400",
            }}
          >
            A calming puzzle game
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#808080" : "#888888",
              fontVariant: ["tabular-nums"],
            }}
          >
            {completedLevels.size}/100 levels completed
          </Text>
        </View>

        {/* Categories */}
        {categories.map((category) => (
          <View key={category.name} style={{ marginBottom: 32, width: "100%", maxWidth: 800 }}>
            {/* Category Header */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                backgroundColor: isDark ? "#151515" : "#ffffff",
                borderLeftWidth: 4,
                borderLeftColor: category.color[0],
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: isDark ? "#ffffff" : "#1a1a1a",
                  }}
                >
                  {category.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#808080" : "#888888",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  Levels {category.levels[0].level}-{category.levels[category.levels.length - 1].level}
                </Text>
              </View>
            </View>

            {/* Level List */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingTop: 16,
                gap: 12,
              }}
            >
              {category.levels.map((levelData) => {
                const unlocked = isLevelUnlocked(levelData.level);
                const completed = isLevelCompleted(levelData.level);

                const content = (
                  <Pressable
                    key={levelData.level}
                    disabled={!unlocked}
                    style={({ pressed }) => ({
                        backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                        borderRadius: 20,
                        borderCurve: "continuous",
                        padding: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: unlocked && pressed ? 0.7 : 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: unlocked ? (isDark ? 0.3 : 0.1) : 0,
                        shadowRadius: 8,
                        borderWidth: completed ? 3 : 2,
                        borderColor: completed
                          ? "#6BCF7F"
                          : pressed && unlocked
                          ? category.color[0]
                          : "transparent",
                      })}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 16,
                            borderCurve: "continuous",
                            backgroundColor: unlocked
                              ? category.color[0] + "20"
                              : isDark
                              ? "#0a0a0a"
                              : "#e0e0e0",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {completed ? (
                            <Text style={{ fontSize: 24, color: "#6BCF7F" }}>✓</Text>
                          ) : (
                            <Text
                              style={{
                                fontSize: 20,
                                fontWeight: "700",
                                color: unlocked ? category.color[0] : isDark ? "#404040" : "#c0c0c0",
                                fontVariant: ["tabular-nums"],
                              }}
                            >
                              {unlocked ? levelData.level : "🔒"}
                            </Text>
                          )}
                        </View>
                        <View style={{ gap: 4 }}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "700",
                              color: unlocked
                                ? isDark
                                  ? "#ffffff"
                                  : "#1a1a1a"
                                : isDark
                                ? "#404040"
                                : "#c0c0c0",
                            }}
                          >
                            Level {levelData.level}
                          </Text>
                          {unlocked && (
                            <View style={{ flexDirection: "row", gap: 12 }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: isDark ? "#808080" : "#888888",
                                  fontVariant: ["tabular-nums"],
                                }}
                              >
                                {levelData.shapes} bits
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: isDark ? "#808080" : "#888888",
                                  fontVariant: ["tabular-nums"],
                                }}
                              >
                                {levelData.shapeTypes} shapes
                              </Text>
                            </View>
                          )}
                        </View>
                      {unlocked && !completed && (
                        <View
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 12,
                            borderCurve: "continuous",
                            backgroundColor: category.color[0] + "20",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: category.color[0],
                            }}
                          >
                            Play
                          </Text>
                        </View>
                      )}
                      </View>
                    </Pressable>
                );

                return unlocked ? (
                  <Link
                    key={levelData.level}
                    href={{
                      pathname: "/game",
                      params: { level: levelData.level },
                    }}
                    asChild
                  >
                    {content}
                  </Link>
                ) : (
                  content
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
