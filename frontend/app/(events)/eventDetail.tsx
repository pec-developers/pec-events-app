import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, Image, Pressable, ActivityIndicator, Linking, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useLocalSearchParams } from 'expo-router'
import { type EventItem, type SearchEvent } from '../data/events'
import { mockApi } from '../services/mockApi'
import { contactUtils } from '../utils/contactUtils'

type Params = {
  id?: string
  title?: string
  description?: string
  date?: string
  time?: string
  venue?: string
  type?: string
  mode?: string
  eligibility?: string
  fee?: string
  imageUrl?: string
}

const LabelRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <Icon name={icon} size={18} color="#b91c1c" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
)

export default function EventDetail() {
  const params = useLocalSearchParams<Params>()
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<(EventItem | SearchEvent) | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        if (!params.id) {
          if (isMounted) {
            setError('Event ID is missing. Please try again.')
            setLoading(false)
          }
          return
        }
        const data = await mockApi.getStudentEventById(params.id)
        if (isMounted) setEvent(data)
      } catch (error) {
        console.error('Failed to fetch event:', error)
        if (isMounted) setError('Failed to load event details. Please try again.')
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [params.id])

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9e0202" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#9e0202', fontSize: 16 }}>{error}</Text>
      </View>
    )
  }

  const coverSrc = (event as any)?.image?.uri
    ? { uri: (event as any).image.uri }
    : { uri: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1600&auto=format&fit=crop' }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cover */}
      <Image source={coverSrc} style={styles.cover} />

      {/* Title + Description */}
      <Text style={styles.title}>{event?.title || 'Event Title'}</Text>
      <Text style={styles.description}>
        {event?.description ||
          'Join us for an insightful session covering key strategies and tools to help you succeed. Whether you are a student or an aspiring professional, this event is for you.'}
      </Text>

      {/* Info list */}
      <LabelRow icon="calendar-outline" label="Date & Time" value={`${(event as any)?.date || 'July 20, 2024'}, ${(event as any)?.time || '10:00 AM – 1:00 PM'}`} />
      <LabelRow icon="location-outline" label="Venue" value={(event as any)?.venue || 'College Auditorium (Offline)'} />
      <LabelRow icon="people-outline" label="Eligibility" value={(event as any)?.eligibility || 'Open to all students'} />
      <LabelRow 
        icon="pricetag-outline" 
        label="Event Type" 
        value={(event as any)?.type || (event as any)?.category || 'Seminar'} 
      />
      <LabelRow 
        icon="globe-outline" 
        label="Event Mode" 
        value={event?.mode || 'Offline'} 
      />
      <LabelRow 
        icon="cash-outline" 
        label="Entry Fee" 
        value={event?.fee || 'Free'} 
      />

      {/* Organizers */}
      <Text style={styles.sectionTitle}>Organizers</Text>
      {Array.isArray((event as any)?.organizers) && (event as any)?.organizers.length > 0 ? (
        (event as any).organizers.map((org: { name: string; subtitle: string; icon?: string }, idx: number) => (
          <View key={`${org.name}-${idx}`} style={styles.orgRow}>
            <View style={styles.orgAvatar}>
              <Icon name={(org.icon as string) || 'business-outline'} size={18} color="#94a3b8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName}>{org.name}</Text>
              <Text style={styles.orgSub}>{org.subtitle}</Text>
            </View>
          </View>
        ))
      ) : (
        <>
          <View style={styles.orgRow}>
            <View style={styles.orgAvatar}><Icon name="business-outline" size={18} color="#94a3b8" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName}>Prathyusha Engineering College</Text>
              <Text style={styles.orgSub}>Department of Computer Science</Text>
            </View>
          </View>
          <View style={styles.orgRow}>
            <View style={styles.orgAvatar}><Icon name="people-circle-outline" size={18} color="#94a3b8" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName}>Entrepreneurship Cell</Text>
              <Text style={styles.orgSub}>In association with IIC</Text>
            </View>
          </View>
        </>
      )}

      {/* Point of Contact */}
      <Text style={styles.sectionTitle}>Point of Contact</Text>
      {Array.isArray((event as any)?.contacts) && (event as any)?.contacts.length > 0 ? (
        (event as any).contacts.map((c: { name: string; role: string; phone: string }, idx: number) => (
          <View key={`${c.name}-${idx}`} style={styles.pocCard}>
            <View style={styles.pocLeft}>
              <View style={styles.pocAvatar}><Icon name="person" size={18} color="#94a3b8" /></View>
              <View>
                <Text style={styles.pocName}>{c.name}</Text>
                <Text style={styles.pocRole}>{c.role}</Text>
                <Text style={styles.pocPhone}>{c.phone}</Text>
              </View>
            </View>
            <View style={styles.pocActions}>
              <Pressable
                style={styles.circleBtn}
                onPress={async () => {
                  try {
                    if (!c.phone || c.phone.trim().length === 0) {
                      Alert.alert('Invalid Phone Number', 'Please provide a valid phone number to make a call.')
                      return
                    }
                    await contactUtils.makePhoneCall(c.phone)
                  } catch (error) {
                    console.error('Phone call failed:', error)
                    Alert.alert('Call Failed', 'Unable to make the phone call. Please try again or dial the number manually.')
                  }
                }}
              >
                <Icon name="call" size={16} color="#0f172a" />
              </Pressable>
              <Pressable
                style={[styles.circleBtn, styles.circleBtnGreen]}
                onPress={async () => {
                  try {
                    if (!c.phone || c.phone.trim().length === 0) {
                      Alert.alert('Invalid Phone Number', 'Please provide a valid phone number to open WhatsApp.')
                      return
                    }
                    await contactUtils.openWhatsApp(c.phone)
                  } catch (error) {
                    console.error('WhatsApp open failed:', error)
                    Alert.alert('WhatsApp Failed', 'Unable to open WhatsApp. Please make sure WhatsApp is installed or try opening it manually.')
                  }
                }}
              >
                <Icon name="logo-whatsapp" size={16} color="#16a34a" />
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <>
          <View style={styles.pocCard}>
            <View style={styles.pocLeft}>
              <View style={styles.pocAvatar}><Icon name="person" size={18} color="#94a3b8" /></View>
              <View>
                <Text style={styles.pocName}>Rohan Sharma</Text>
                <Text style={styles.pocRole}>Student Coordinator</Text>
                <Text style={styles.pocPhone}>+91 98765 43210</Text>
              </View>
            </View>
            <View style={styles.pocActions}>
              <Pressable
                style={styles.circleBtn}
                onPress={async () => {
                  try {
                    const phoneNumber = '+91 98765 43210'
                    if (!phoneNumber || phoneNumber.trim().length === 0) {
                      Alert.alert('Invalid Phone Number', 'Please provide a valid phone number to make a call.')
                      return
                    }
                    await contactUtils.makePhoneCall(phoneNumber)
                  } catch (error) {
                    console.error('Phone call failed:', error)
                    Alert.alert('Call Failed', 'Unable to make the phone call. Please try again or dial the number manually.')
                  }
                }}
              >
                <Icon name="call" size={16} color="#0f172a" />
              </Pressable>
              <Pressable
                style={[styles.circleBtn, styles.circleBtnGreen]}
                onPress={async () => {
                  try {
                    const phoneNumber = '+91 98765 43210'
                    if (!phoneNumber || phoneNumber.trim().length === 0) {
                      Alert.alert('Invalid Phone Number', 'Please provide a valid phone number to open WhatsApp.')
                      return
                    }
                    await contactUtils.openWhatsApp(phoneNumber)
                  } catch (error) {
                    console.error('WhatsApp open failed:', error)
                    Alert.alert('WhatsApp Failed', 'Unable to open WhatsApp. Please make sure WhatsApp is installed or try opening it manually.')
                  }
                }}
              >
                <Icon name="logo-whatsapp" size={16} color="#16a34a" />
              </Pressable>
            </View>
          </View>
          <View style={styles.pocCard}>
            <View style={styles.pocLeft}>
              <View style={styles.pocAvatar}><Icon name="person" size={18} color="#94a3b8" /></View>
              <View>
                <Text style={styles.pocName}>Priya Singh</Text>
                <Text style={styles.pocRole}>Faculty Coordinator</Text>
                <Text style={styles.pocPhone}>+91 98765 43211</Text>
              </View>
            </View>
            <View style={styles.pocActions}>
              <Pressable
                style={styles.circleBtn}
                onPress={async () => {
                  try {
                    const phoneNumber = '+91 98765 43211'
                    if (!phoneNumber || phoneNumber.trim().length === 0) {
                      Alert.alert('Invalid Phone Number', 'Please provide a valid phone number to make a call.')
                      return
                    }
                    await contactUtils.makePhoneCall(phoneNumber)
                  } catch (error) {
                    console.error('Phone call failed:', error)
                    Alert.alert('Call Failed', 'Unable to make the phone call. Please try again or dial the number manually.')
                  }
                }}
              >
                <Icon name="call" size={16} color="#0f172a" />
              </Pressable>
              <Pressable
                style={[styles.circleBtn, styles.circleBtnGreen]}
                onPress={async () => {
                  try {
                    const phoneNumber = '+91 98765 43211'
                    if (!phoneNumber || phoneNumber.trim().length === 0) {
                      Alert.alert('Invalid Phone Number', 'Please provide a valid phone number to open WhatsApp.')
                      return
                    }
                    await contactUtils.openWhatsApp(phoneNumber)
                  } catch (error) {
                    console.error('WhatsApp open failed:', error)
                    Alert.alert('WhatsApp Failed', 'Unable to open WhatsApp. Please make sure WhatsApp is installed or try opening it manually.')
                  }
                }}
              >
                <Icon name="logo-whatsapp" size={16} color="#16a34a" />
              </Pressable>
            </View>
          </View>
        </>
      )}

      {/* Register CTA */}
      <Pressable
        style={[
          styles.registerBtn,
          !(event as any)?.registrationLink && styles.registerBtnDisabled
        ]}
        onPress={() => {
          const url = (event as any)?.registrationLink
          if (url) {
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(url)
                } else {
                  Alert.alert('Error', 'Unable to open registration link')
                }
              })
              .catch(() => {
                Alert.alert('Error', 'Invalid registration link')
              })
          }
        }}
        disabled={!(event as any)?.registrationLink}
      >
        <Text style={[
          styles.registerText,
          !(event as any)?.registrationLink && styles.registerTextDisabled
        ]}>
          {(event as any)?.registrationLink ? 'Register Now' : 'No Registration Available'}
        </Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { paddingBottom: 28, backgroundColor: '#ffffff' },
  cover: { height: 170, width: '100%', backgroundColor: '#e2e8f0' },
  title: { fontSize: 22, fontWeight: '900', color: '#991b1b', paddingHorizontal: 12, marginTop: 12 },
  description: { color: '#475569', paddingHorizontal: 12, marginTop: 8, lineHeight: 20 },

  infoRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, alignItems: 'center', gap: 12 },
  infoIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: '#64748b', fontWeight: '700' },
  infoValue: { color: '#0f172a', fontWeight: '700' },

  sectionTitle: { paddingHorizontal: 12, marginTop: 12, fontWeight: '900', color: '#991b1b' },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10 },
  orgAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  orgName: { fontWeight: '800', color: '#0f172a' },
  orgSub: { color: '#64748b' },

  pocCard: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pocLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pocAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  pocName: { fontWeight: '800', color: '#0f172a' },
  pocRole: { color: '#64748b' },
  pocPhone: { color: '#64748b' },
  pocActions: { flexDirection: 'row', gap: 10 },
  circleBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  circleBtnGreen: { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' },

  sectionTitleCentered: { textAlign: 'center', marginTop: 16, fontWeight: '900', color: '#991b1b' },
  interestRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 12, marginTop: 10 },
  interestBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  interestYes: { backgroundColor: '#e7f6ea', borderColor: '#c7f0d1' },
  interestNo: { backgroundColor: '#fde7e7', borderColor: '#f5c2c2' },
  interestYesText: { color: '#166534', fontWeight: '800' },
  interestNoText: { color: '#9b1c1c', fontWeight: '800' },

  registerBtn: { marginHorizontal: 12, marginTop: 18, backgroundColor: '#9e0202', borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  registerBtnDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0.05, elevation: 1 },
  registerText: { color: '#fff', fontWeight: '900' },
  registerTextDisabled: { color: '#6b7280' },
})


