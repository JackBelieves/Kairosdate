import { getTypography } from "@/constants/ThemedTypography";
import { useColorScheme, View, StyleSheet , Text, Modal, TouchableOpacity} from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import SecondaryButton from "./SecondaryButton";
import PrimaryButton from "./PrimaryButton";

type AlertProps = {
  visible: boolean;
  msg?: string;
  msgType?: string;
  onClose: () => void;
  primaryText?: string;
  primaryAction?: () => void;
  secondaryText?: string;
  secondaryAction?: () => void;
};

export default function AlertModal({
  visible,
  msg,
  msgType,
  onClose,
  primaryText = 'Save',
  primaryAction,
  secondaryText = 'Cancel',
  secondaryAction,
}: AlertProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const typography = getTypography(scheme ?? "light");
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
         <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={[typography.headlineMedium, { color: theme.text }]}>{msgType}</Text>
                <Text style={[typography.labelMedium, { textAlign:'center', marginTop:15 }]}>{msg}</Text>

                {(primaryAction || secondaryAction) && (
                <View style={styles.buttonContainer}>
                        {secondaryText && secondaryAction && (
                          <SecondaryButton title={secondaryText} onPress={secondaryAction} style={styles.button} />
                        )}
                        {primaryText && primaryAction && (
                          <PrimaryButton title={primaryText} onPress={primaryAction} style={styles.button} />
                        )}
                </View>
                )}
            </View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
     modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
    },
});