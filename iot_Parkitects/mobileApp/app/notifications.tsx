import React, { useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FeatherIcon from '@expo/vector-icons/Feather';
import {auth} from '../config/firebaseConfig'
import { registerForPushNotificationsAsync } from '@/utils/pushNotifications';

type NotificationType = 'complaint' | 'info' | 'reminder' | 'alert';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  ticketId?: number;
}

export default function NotificationsScreen() {
  const router = useRouter();

  const isParked = true;
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [complaintFixed, setComplaintFixed] = useState(false);
  const [submitting, setSubmitting] = useState(false);



  // gets the driver's own tickets that and general notiifications (Expo, 2026)
  const loadNotifications = useCallback(async () => {
    const firebaseUid = auth?.currentUser?.uid;
    if (!firebaseUid) {
      setLoading(false);
      return;
    }

    try {
      const [ticketsRes, notifsRes] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/Tickets`),
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notification`),
      ]);

      const allTickets = await ticketsRes.json();
      const myTickets = allTickets.filter(
        (t: any) => t.userID === firebaseUid && t.status === 'Notified'
      );

      const ticketItems: NotificationItem[] = myTickets.map((t: any) => ({
        id: `ticket-${t.ticketID}`,
        type: 'complaint',
        title: 'Parking Ticket Issued',
        description: `${t.reason} — Parking Bay ${t.bayNumber}`,
        time: new Date(t.createdAt).toLocaleString(),
        ticketId: t.ticketID,
      }));

      const generalNotifs = notifsRes.ok ? await notifsRes.json() : [];
      const generalItems: NotificationItem[] = generalNotifs.map((n: any) => ({
        id: `notif-${n.notificationID}`,
        type: n.notificationType,
        title: n.title,
        description: n.description,
        time: new Date(n.time).toLocaleString(),
      }));

      setNotifications([...ticketItems, ...generalItems]);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);
  
  
const handleOpenNotification = (item: NotificationItem) => {
    setComplaintFixed(false);
    setSelectedNotification(item);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  //method for a fixed ticket-security is notified
  const handleMarkFixed = async () => {
    if (!selectedNotification?.ticketId) {
      setComplaintFixed(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/Tickets/${selectedNotification.ticketId}`);
      const ticket = await res.json();

      ticket.status = 'Awaiting review';
      ticket.response = 'I have fixed the parking issue.';

      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/Tickets/${selectedNotification.ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      });

      setComplaintFixed(true);
      setNotifications((prev) => prev.filter((n) => n.id !== selectedNotification.id));
    } catch (error) {
      console.error('Failed to submit response', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDotStyle = (type: NotificationType) => {
    switch (type) {
      case 'complaint':
        return styles.dotComplaint;
      case 'alert':
        return styles.dotAlert;
      case 'reminder':
        return styles.dotReminder;
      default:
        return styles.dotInfo;
    }
  };

  const getModalIconName = (type: NotificationType) => {
    switch (type) {
      case 'complaint':
        return 'alert-triangle';
      case 'reminder':
        return 'clock';
      case 'alert':
        return 'bell';
      default:
        return 'info';
    }
  };

  return (
    <View style ={styles.container}>
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FeatherIcon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <Text style={styles.screenTitle}>Notifications</Text>

        {isParked && (
          <View style={styles.parkingBanner}>
            <View style={styles.parkingIconBadge}>
              <FeatherIcon name="map-pin" size={20} color="#087d79" />
            </View>

            <View style={styles.parkingDetails}>
              <Text style={styles.parkingBannerTitle}>You're currently parked</Text>
              <Text style={styles.parkingLocation}>Section A • Bay A-03</Text>
              <Text style={styles.parkingTime}>Parked at 09:42 AM</Text>

              <TouchableOpacity
                style={styles.findCarBtn}
                onPress={() => router.push('/findCar')}
                activeOpacity={0.8}
              >
                <FeatherIcon name="navigation" size={14} color="#cfede6" />
                <Text style={styles.findCarBtnText}>Find My Car</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#0D5265" />
        ) : notifications.length > 0 ? (
          <>
            <Text style={styles.sectionHeader}>Recent notifications</Text>

            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.notificationCard}
                activeOpacity={0.7}
                onPress={() => handleOpenNotification(item)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View style={[styles.statusDot, getStatusDotStyle(item.type)]} />
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>

                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FeatherIcon name="bell-off" size={26} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDescription}>
              You're all caught up. New parking alerts and updates will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
</SafeAreaView>
      {/* Detail Modal */}
      {selectedNotification !== null && (
        <View style = {StyleSheet.absoluteFillObject}>
       
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
                <View style={styles.modalIconBadge}>
                  <FeatherIcon
                    name={getModalIconName(selectedNotification.type)}
                    size={28}
                    color="#0D5265"
                  />
                </View>

                <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                <Text style={styles.modalDescription}>{selectedNotification.description}</Text>

                {selectedNotification.type === 'complaint' ? (
                  !complaintFixed ? (
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnSecondary]}
                        onPress={handleCloseModal}
                        disabled={submitting}
                      >
                        <Text style={styles.btnSecondaryText}>Not Yet</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary]}
                        onPress={handleMarkFixed}
                        disabled={submitting}
                      >
                        <Text style={styles.btnPrimaryText}>
                          {submitting ? 'Sending...' : 'Fixed'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.confirmationBanner}>
                      <FeatherIcon name="check-circle" size={18} color="#166534" />
                      <Text style={styles.confirmationText}>
                        Thanks, we will verify if your violation has been resolved.
                      </Text>
                    </View>
                  )
                ) : (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnPrimary, styles.fullWidthBtn]}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.btnPrimaryText}>Got it</Text>
                  </TouchableOpacity>
                )}
            
          
          </TouchableOpacity>
        </TouchableOpacity>
        </View>
      )}
    </View>
  );

}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    marginTop: 23,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 20,
  },
  parkingBanner: {
    flexDirection: 'row',
    backgroundColor: '#13384Bff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  parkingIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  parkingDetails: {
    flex: 1,
  },
  parkingBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e7f2f5',
    marginBottom: 2,
  },
  parkingLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cfede6',
    marginBottom: 2,
  },
  parkingTime: {
    fontSize: 12,
    color: '#a7b0bc',
    marginBottom: 12,
  },
  findCarBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075d5f',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  findCarBtnText: {
    color: '#cfede6',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotComplaint: {
    backgroundColor: '#EF4444',
  },
  dotAlert: {
    backgroundColor: '#F97316',
  },
  dotReminder: {
    backgroundColor: '#EAB308',
  },
  dotInfo: {
    backgroundColor: '#0D5265',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    paddingLeft: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F7F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthBtn: {
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: '#0D5265',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: '#F1F5F9',
  },
  btnSecondaryText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    width: '100%',
  },
  confirmationText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
});


/**
 * References
 * 
 * Expo Docs, 2026. Expo push notifications setup. (Version 10.0) [Source Code]. Available at: < https://docs.expo.dev/push-notifications/push-notifications-setup/ > [Accessed 25 September 2026]
 * Expo Docs, 2026b. Expo Notifications. (Version 10.0) [Source Code]. Available at: < https://docs.expo.dev/versions/latest/sdk/notifications/ > [Accessed 25 September 2026]
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */