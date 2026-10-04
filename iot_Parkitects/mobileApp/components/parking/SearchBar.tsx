 //(Withfra.me, 2022)
 import React from 'react';
 import {
 StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
 } from 'react-native';

 import {Feather} from '@expo/vector-icons';

import { Colors } from
'@/constants/theme';
import { Radius } from
'@/constants/radius';
import { Spacing } from
'@/constants/spacing';

 export default function SearchBar() {
    return (
        <View style={styles.search}>
            <TextInput
            placeholder="Search parking bay..."
            placeholderTextColor={Colors.light.muted}
            style={styles.searchInput}
        />

        <View style={styles.searchFloating}>
            <TouchableOpacity>
                <View style={styles.searchButton}>
                    <Feather
                    name="search"
                    size={20}
                    color = "grey"
                />
                </View>
            </TouchableOpacity>
        </View>
           </View>
    );
 }

 const styles = StyleSheet.create({
 search: {
    position: 'relative',
    marginHorizontal:Spacing.lg,
    marginBottom: Spacing.lg,
 },

 searchInput: {
    height: 56,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: Spacing.md,
    color: Colors.light.heading,
    fontSize: 18,
    borderRadius: Radius.pill,
  },
  searchFloating: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },


 searchButton: {
    alignSelf: 'center',
    width: 44,
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
/**
 * References
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */