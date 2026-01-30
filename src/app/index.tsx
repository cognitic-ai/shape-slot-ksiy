import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const LEVELS = [
  { level: 1, shapes: 3, title: "Gentle Start" },
  { level: 2, shapes: 5, title: "Getting Cozy" },
  { level: 3, shapes: 8, title: "Finding Peace" },
  { level: 4, shapes: 12, title: "Deep Focus" },
  { level: 5, shapes: 16, title: "Zen Master" },
];

export default function IndexRoute() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0a0a0a" : "#f8f9fa",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          flex: 1,
          padding: 24,
          paddingTop: 60,
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
            marginBottom: 48,
            fontWeight: "400",
          }}
        >
          A calming puzzle game
        </Text>

        <View
          style={{
            gap: 16,
            width: "100%",
            maxWidth: 400,
          }}
        >
          {LEVELS.map((levelData) => (
            <Link
              key={levelData.level}
              href={{
                pathname: "/game",
                params: { level: levelData.level },
              }}
              asChild
            >
              <Pressable
                style={({ pressed }) => ({
                  backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                  padding: 20,
                  borderRadius: 20,
                  borderCurve: "continuous",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 8,
                })}
              >
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      color: isDark ? "#ffffff" : "#1a1a1a",
                    }}
                  >
                    Level {levelData.level}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      color: isDark ? "#808080" : "#888888",
                    }}
                  >
                    {levelData.title}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: isDark ? "#2a2a2a" : "#f0f0f0",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    borderCurve: "continuous",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: isDark ? "#a0a0a0" : "#666666",
                      fontWeight: "500",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {levelData.shapes} shapes
                  </Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </View>
  );
}
