import { View, Text, Pressable, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";

function generateLevels() {
  const levels = [];
  for (let i = 1; i <= 100; i++) {
    let category = "";
    let shapes = 0;

    if (i <= 10) {
      category = "Beginner";
      shapes = 2 + i;
    } else if (i <= 25) {
      category = "Easy";
      shapes = 12 + Math.floor((i - 10) * 0.8);
    } else if (i <= 50) {
      category = "Medium";
      shapes = 24 + Math.floor((i - 25) * 0.6);
    } else if (i <= 75) {
      category = "Hard";
      shapes = 39 + Math.floor((i - 50) * 0.5);
    } else {
      category = "Expert";
      shapes = 52 + Math.floor((i - 75) * 0.4);
    }

    levels.push({ level: i, category, shapes });
  }
  return levels;
}

const LEVELS = generateLevels();

const CATEGORY_COLORS = {
  Beginner: { light: "#6BCF7F", dark: "#5AB56E", bg: "#E8F8ED" },
  Easy: "#89CFF0",
  Medium: "#FFD93D",
  Hard: "#FFA07A",
  Expert: "#FF6B9D",
};

const CATEGORY_GRADIENTS = {
  Beginner: ["#6BCF7F", "#98D8C8"],
  Easy: ["#89CFF0", "#A8E6CF"],
  Medium: ["#FFD93D", "#F8B195"],
  Hard: ["#FFA07A", "#FF8B94"],
  Expert: ["#FF6B9D", "#B4A7D6"],
};

export default function IndexRoute() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Group levels by category
  const beginnerLevels = LEVELS.filter((l) => l.category === "Beginner");
  const easyLevels = LEVELS.filter((l) => l.category === "Easy");
  const mediumLevels = LEVELS.filter((l) => l.category === "Medium");
  const hardLevels = LEVELS.filter((l) => l.category === "Hard");
  const expertLevels = LEVELS.filter((l) => l.category === "Expert");

  const categories = [
    { name: "Beginner", levels: beginnerLevels, color: CATEGORY_GRADIENTS.Beginner },
    { name: "Easy", levels: easyLevels, color: CATEGORY_GRADIENTS.Easy },
    { name: "Medium", levels: mediumLevels, color: CATEGORY_GRADIENTS.Medium },
    { name: "Hard", levels: hardLevels, color: CATEGORY_GRADIENTS.Hard },
    { name: "Expert", levels: expertLevels, color: CATEGORY_GRADIENTS.Expert },
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
        contentContainerStyle={{ paddingBottom: 40 }}
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
            100 levels of zen
          </Text>
        </View>

        {/* Categories */}
        {categories.map((category) => (
          <View key={category.name} style={{ marginBottom: 32 }}>
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

            {/* Level Grid */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingTop: 16,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {category.levels.map((levelData) => (
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
                      width: "18%",
                      aspectRatio: 1,
                      backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                      borderRadius: 16,
                      borderCurve: "continuous",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: pressed ? 0.6 : 1,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isDark ? 0.3 : 0.08,
                      shadowRadius: 4,
                      borderWidth: 2,
                      borderColor: pressed ? category.color[0] : "transparent",
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: category.color[0],
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {levelData.level}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: isDark ? "#808080" : "#888888",
                        marginTop: 2,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {levelData.shapes}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
