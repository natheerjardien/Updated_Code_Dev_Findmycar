//(Withfra.me, 2022)
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';

type AlertType = 'info' | 'warning' | 'error' | 'success';

type AlertBannerProps = {
  title: string;
  message: string;
  type?: AlertType;
  icon?: keyof typeof FeatherIcon.glyphMap;
  onDismiss: () => void;
};

export default function AlertBanner({
  title,
  message,
  type = 'info',
  icon,
  onDismiss,
}: AlertBannerProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          iconBg: '#FEE2E2',
          iconColor: '#EF4444',
          defaultIcon: 'alert-triangle' as const,
        };
      case 'warning':
        return {
          iconBg: '#FEF3C7',
          iconColor: '#F59E0B',
          defaultIcon: 'alert-circle' as const,
        };
      case 'success':
        return {
          iconBg: '#DCFCE7',
          iconColor: '#16A34A',
          defaultIcon: 'check-circle' as const,
        };
      default:
        return {
          iconBg: '#E0F2FE',
          iconColor: '#0D5265',
          defaultIcon: 'bell' as const,
        };
    }
  };

  const styleConfig = getTypeStyles();
  const iconName = icon || styleConfig.defaultIcon;

  return (
    <View style={styles.alert}>
      {/* ICON BADGE */}
      <View style={[styles.alertIconBadge, { backgroundColor: styleConfig.iconBg }]}>
        <FeatherIcon
          name={iconName}
          size={18}
          color={styleConfig.iconColor}
        />
      </View>

      {/* TEXT CONTENT */}
      <View style={styles.alertBody}>
        <Text style={styles.alertTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.alertMessage}>
          {message}
        </Text>
      </View>

      {/* DISMISS BUTTON */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onDismiss}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <FeatherIcon
          name="x"
          size={18}
          color="#94A3B8"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    position: 'relative',
    top: 1,
    left: 40,
    right: 16,
     width:'80%',
height:'10%',
   
     flexDirection: 'row',
    
    backgroundColor: '#FFFFFF',

    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  alertIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  alertBody: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },

  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },

  alertMessage: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },

  closeButton: {
    padding: 2,
    marginTop: 2,
  },
});
/**
 * References
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */