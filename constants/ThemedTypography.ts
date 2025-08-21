import { Platform, TextStyle } from "react-native";
import { Colors } from "./Colors";
import { red } from "react-native-reanimated/lib/typescript/Colors";

const fontFamily = Platform.select({
  ios: "Inter",
  android: "Inter",
  default: "Inter, sans-serif", // web fallback
});

type TypographyStyles = {
  [key: string]: TextStyle;
};

export const getTypography = (colorScheme: "light" | "dark") : TypographyStyles => {
  const theme = Colors[colorScheme];

  return {
    headlineLarge: {
      fontFamily,
      fontSize: 32,
      fontWeight: "bold",
      color: theme.text,
    },
    headlineMedium: {
      fontFamily,
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    headlineSmall: {
      fontFamily,
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
    },
    headlineTeeny: {
      fontFamily,
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    titleLarge: {
      fontFamily,
      fontSize:18,
      fontWeight: "600",
      color: theme.text,
    },
    titleMedium: {
      fontFamily,
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 24,
      color: theme.text,
    },
    titleSmall: {
      fontFamily,
      fontSize: 15,
      fontWeight: "600",
      color: theme.text,
    },
   
    sectionTitle: {
      fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color:theme.text,
    },
    sectionCaption: {
      fontFamily,
      fontSize: 12,
      fontWeight: "600",
      color:theme.caption,
    },
    inputLabel: {
      fontFamily,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.5,
      color: theme.text,
    },
    listLabel: {
      fontFamily,
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
    errorMessage: {
      fontFamily,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.1,
      color: theme.error,
    },

  };
};