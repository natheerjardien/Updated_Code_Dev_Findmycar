import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";

export default function StatsCard() {
  return (
    <View style={styles.card}>
      <View style={styles.item}>
        <Text style={styles.label}>Available</Text>

        <View style={styles.row}>
          <Feather
            name="check-circle"
            size={16}
            color={Colors.light.accent}
          />
          <Text style={styles.value}>302</Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Occupancy</Text>

        <View style={styles.row}>
          <Feather
            name="bar-chart-2"
            size={16}
            color={Colors.light.primary}
          />
          <Text style={styles.value}>76%</Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Status</Text>

        <View style={styles.row}>
          <Feather
            name="radio"
            size={16}
            color={Colors.light.success}
          />
          <Text style={styles.value}>Live</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    marginHorizontal: 20,
    marginTop: 18,

    paddingVertical: 18,

    borderRadius: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 3,
  },

  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 13,
    color: Colors.light.primary,
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  value: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginLeft: 6,
  },
});