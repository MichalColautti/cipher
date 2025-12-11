import CheckIcon from "@/assets/icons/check.svg";
import { useTheme } from "@/contexts/themeContext";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const getContrastColor = (hexColor) => {
  if (!hexColor) return "#FFF";

  const hex = hexColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128 ? "#000000" : "#FFFFFF";
};

const ColorSelector = ({ title, palette, activeColor, onSelect, isBackground = false }) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.container}>
        <View style={styles.colorGrid}>
          {palette.map((color, index) => {
            const isSelected = (activeColor === null && index === 0) || activeColor === color;
            const iconColor = (isBackground && index === 0 && theme === 'light') ? "#000000" : getContrastColor(color);

            return (
              <TouchableOpacity
                key={`${color}-${index}`}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color,
                    borderWidth: 2,
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)'
                  },
                ]}
                onPress={() => onSelect(index === 0 ? null : color)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <CheckIcon
                    width={24}
                    height={24}
                    color={iconColor}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors, theme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 5,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.placeholder,
      marginTop: 20,
      marginBottom: 10,
      marginLeft: 5,
    },
    container: {
      backgroundColor: colors.settingsBackground,
      borderRadius: 12,
      padding: 15,
      ...(theme === "light" && {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }),
    },
    colorGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12, 
    },
    colorCircle: {
      width: 45,
      height: 45,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)", 
    },
    checkIcon: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1,
      elevation: 2,
    },
  });

export default ColorSelector;