//(Withfra.me, 2022)
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

const tabs = [
  { name: "Section A" },
  { name: "Section B" },
  { name: "Section C" },
];

export default function SectionTabs() {
  const [selected, setSelected] = React.useState(0);

  return (
    <View style={styles.container}>
      {tabs.map((item, index) => {
        const active = index === selected;

        return (
          <View key={item.name} style={styles.tabWrapper}>
            <TouchableWithoutFeedback
              onPress={() => setSelected(index)}
            >
              <View
                style={[
                  styles.tab,
                  active && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.text,
                    active && styles.activeText,
                  ]}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 8,
    marginTop: 10,
    marginBottom: 20,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
   
  },

  tabWrapper: {
    flex: 1,
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 10,
  },

  activeTab: {
    backgroundColor: "#E8F7F7",
  },

  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B8794",
  },

  activeText: {
    color: "#0B5D6B",
  },
});
/**
 * References
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */