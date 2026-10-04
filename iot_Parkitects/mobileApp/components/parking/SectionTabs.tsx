//(Withfra.me, 2022)
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";

const tabs = [
  { name: "Section A" },
  { name: "Section B" },
  { name: "Section C" },
  { name: "Section D" },
  { name: "Section E" },
];

type Props = {
  selectedSection: string;
  onSelectSection: (section: string) => void;
};

export default function SectionTabs({ selectedSection, onSelectSection }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((item) => {
          const active = item.name === selectedSection;

          return (
            <TouchableWithoutFeedback
              key={item.name}
              onPress={() => onSelectSection(item.name)}
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
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 8,
    marginTop: 10,
    marginBottom: 15,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  tab: {
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#E8F7F7",
  },
  text: {
    fontSize: 13,
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