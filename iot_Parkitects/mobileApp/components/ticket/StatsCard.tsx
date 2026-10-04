//(Withfra.me, 2022)
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";

export default function StatsCard() {
  return (
  
      <View style={styles.welcomeCard}>
          <Text style={styles.welcomeSmall}>We're Parkitects.</Text>

          <Text style={styles.welcomeTitle}>
            How can we help?
          </Text>

          <Text style={styles.welcomeDescription}>
            Get quick answers about parking, rules,
            availability and more.
          </Text>
        </View>

  );
}

const styles = StyleSheet.create({
 
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 13,
    color: 'white',
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  value: {
    fontSize: 18,
    fontWeight: "700",
    color: 'white',
    marginLeft: 6,
  },


   welcomeCard: {
     backgroundColor: "#13384Bff",
    borderRadius: 0,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 18,
    marginTop: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  welcomeSmall: {
    fontSize: 26,
    fontWeight: "700",
    color: "#a8ddd4",
    marginBottom: 2,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  welcomeDescription: {
    fontSize: 16,
    lineHeight: 28,
    color: "#FFFFFF",
  },
});
/**
 * References
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */