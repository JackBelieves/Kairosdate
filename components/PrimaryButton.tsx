import { Pressable, Text, TextStyle, StyleSheet, useColorScheme, ViewStyle, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  small?: boolean;
  fullWidth?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
  iconName,
  iconPosition = "left",
  small = false,
  fullWidth = false,
}: PrimaryButtonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: theme.primary,
          borderColor: theme.primary,
        paddingVertical: small ? 6 : 8,
        paddingHorizontal: small ? 12 : 28,
        alignSelf: fullWidth ? "stretch" : "center",
         },
        style,
      ]}
    >
      <View style={styles.content}>
      {iconName && iconPosition === "left" && (
        <Ionicons
          name={iconName}
          size={small ? 14 : 20}
          color={theme.primary}
          style={{ marginRight: 8 }}
        />
      )}
      <Text
        style={[
          styles.text,
          { color: theme.primaryButtonText, fontSize: small ? 14 : 16 },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {iconName && iconPosition === "right" && (
        <Ionicons
          name={iconName}
          size={small ? 14 : 20}
          color={theme.primary}
          style={{ marginLeft: 8 }}
        />
      )}
      </View>
    </Pressable>
    
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});