import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Pressable,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import Icon from 'react-native-vector-icons/Ionicons'
import { useEffect, useMemo, useState } from 'react'
import { mockApi } from '../services/mockApi'
import { type EventItem, type SearchEvent } from '../data/events'
import { contactUtils } from '../utils/contactUtils'

const EditEvent = () => {
  const params = useLocalSearchParams<{ id?: string }>()
  const [fetched, setFetched] = useState<(EventItem | SearchEvent) | null>(null)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        if (params.id) {
          const ev = await mockApi.getPublisherEventById(params.id)
          setFetched(ev)
        }
      } catch (error) {
        console.error('Failed to fetch event:', error)
        setError('Failed to load event. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  // Derived, with sensible fallbacks so UI remains intact
  // Define a proper interface for the event data
  interface EventData {
    title?: string
    description?: string
    date?: string
    time?: string
    type?: string
    category?: string
    venue?: string
    eligibility?: string
    fee?: string
    registrationLink?: string
    imageUrl?: string
    organizers?: Array<{ name: string; subtitle: string; icon: string }>
    creator?: { name: string; subtitle: string; icon: string }
    contacts?: Array<{ name: string; role: string; phone: string; icon: string }>
  }

  const eventData = useMemo(() => {
    const ev = fetched as any
    if (!ev) {
      return {
        title: 'Event',
        bannerTitle: 'Event',
        description: '',
        dateTime: '',
        venue: '',
        eligibility: '',
        eventType: 'Seminar',
        entryFee: '',
        registrationLink: '',
        imageUrl: '',
        organizers: [],
        creator: { name: '', subtitle: '', icon: 'person' },
        contacts: [],
      }
    }

    const date: string = ev?.date || ''
    const time: string = ev?.time || ev?.startTime || ''
    const dateTime = date && time ? `${date}, ${time}` : (date || time || '')

    return {
      title: ev?.title || 'Event',
      bannerTitle: ev?.image?.uri || 'Event',
      description: ev?.description || '',
      dateTime,
      venue: ev?.venue || '',
      eligibility: ev?.eligibility || '',
      eventType: ev?.type || ev?.category || ev?.eventType || 'Seminar',
      entryFee: ev?.fee || '',
      registrationLink: ev?.registrationLink || '',
      imageUrl: ev?.imageUrl || ev?.image?.uri || '',
      organizers: Array.isArray(ev?.organizers) ? ev.organizers : [],
      creator: ev?.creator || (ev?.publisher ? { name: ev.publisher.name || '', subtitle: ev.publisher.department || '', icon: 'person' } : { name: '', subtitle: '', icon: 'person' }),
      contacts: Array.isArray(ev?.contacts) ? ev.contacts : [],
    }
  }, [fetched])

  const handleEditEvent = () => {
    const id = (params.id as string) || (fetched as any)?.id || ''
    router.push({ pathname: '/(dashboard-publisher)/edit-event-form', params: { id } })
  }

  const handleCall = async (phone: string) => {
    await contactUtils.makePhoneCall(phone)
  }

  const handleWhatsApp = async (phone: string) => {
    await contactUtils.openWhatsApp(phone)
  }

  const handleRegistrationLink = () => {
    if (eventData.registrationLink) {
      Linking.canOpenURL(eventData.registrationLink).then((supported) => {
        if (supported) {
          Linking.openURL(eventData.registrationLink)
        } else {
          console.error('Cannot open URL:', eventData.registrationLink)
          // Show user feedback
        }
      })
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ padding: 16, color: '#64748b' }}>Loading...</Text>
        </ScrollView>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cover */}
      <Image 
        source={eventData.imageUrl 
          ? { uri: eventData.imageUrl }
          : { uri: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1600&auto=format&fit=crop' }
        } 
        style={styles.cover}
      />

      {/* Title + Description */}
      <Text style={styles.title}>{eventData.title}</Text>
      <Text style={styles.description}>
        {eventData.description || 'Join us for an insightful session covering key strategies and tools to help you succeed. Whether you are a student or an aspiring professional, this event is for you.'}
      </Text>

      {/* Info list */}
      <LabelRow icon="calendar-outline" label="Date & Time" value={eventData.dateTime} />
      <LabelRow icon="location-outline" label="Venue" value={eventData.venue} />
      <LabelRow icon="people-outline" label="Eligibility" value={eventData.eligibility} />
      <LabelRow icon="pricetag-outline" label="Event Type" value={eventData.eventType} />
      <LabelRow icon="cash-outline" label="Entry Fee" value={eventData.entryFee} />

      {/* Organizers */}
      <Text style={styles.sectionTitle}>Organizers</Text>
      {eventData.organizers.length > 0 ? (
        eventData.organizers.map((organizer: { name: string; subtitle: string; icon: string }, index: number) => (
          <View key={index} style={styles.orgRow}>
            <View style={styles.orgAvatar}>
              <Icon name={organizer.icon || 'business-outline'} size={18} color="#94a3b8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName}>{organizer.name}</Text>
              <Text style={styles.orgSub}>{organizer.subtitle}</Text>
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

      {/* Event Creator */}
      <Text style={styles.sectionTitle}>Event Creator</Text>
      <View style={styles.orgRow}>
        <View style={styles.orgAvatar}>
          <Icon name={eventData.creator.icon || 'person'} size={18} color="#94a3b8" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.orgName}>{eventData.creator.name || 'Event Creator'}</Text>
          <Text style={styles.orgSub}>{eventData.creator.subtitle || 'Creator'}</Text>
        </View>
      </View>

      {/* Point of Contact */}
      <Text style={styles.sectionTitle}>Point of Contact</Text>
      {eventData.contacts.length > 0 ? (
        eventData.contacts.map((contact: { name: string; role: string; phone: string; icon: string }, index: number) => (
          <View key={index} style={styles.pocCard}>
            <View style={styles.pocLeft}>
              <View style={styles.pocAvatar}>
                <Icon name={contact.icon || 'person'} size={18} color="#94a3b8" />
              </View>
              <View>
                <Text style={styles.pocName}>{contact.name}</Text>
                <Text style={styles.pocRole}>{contact.role}</Text>
                <Text style={styles.pocPhone}>{contact.phone}</Text>
              </View>
            </View>
            <View style={styles.pocActions}>
              <Pressable
                style={styles.circleBtn}
                onPress={() => handleCall(contact.phone)}
              >
                <Icon name="call" size={16} color="#0f172a" />
              </Pressable>
              <Pressable
                style={[styles.circleBtn, styles.circleBtnGreen]}
                onPress={() => handleWhatsApp(contact.phone)}
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
                onPress={() => handleCall('+91 98765 43210')}
              >
                <Icon name="call" size={16} color="#0f172a" />
              </Pressable>
              <Pressable
                style={[styles.circleBtn, styles.circleBtnGreen]}
                onPress={() => handleWhatsApp('+91 98765 43210')}
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
                onPress={() => handleCall('+91 98765 43211')}
              >
                <Icon name="call" size={16} color="#0f172a" />
              </Pressable>
              <Pressable
                style={[styles.circleBtn, styles.circleBtnGreen]}
                onPress={() => handleWhatsApp('+91 98765 43211')}
              >
                <Icon name="logo-whatsapp" size={16} color="#16a34a" />
              </Pressable>
            </View>
          </View>
        </>
      )}

      {/* Registration Link */}
      {eventData.registrationLink && (
        <>
          <Text style={styles.sectionTitle}>Registration Link</Text>
          <Pressable
            style={styles.linkContainer}
            onPress={handleRegistrationLink}
          >
            <Icon name="link" size={20} color="#64748b" />
            <Text style={styles.linkText}>{eventData.registrationLink}</Text>
          </Pressable>
        </>
      )}

      {/* Edit Event Button */}
      <Pressable style={styles.editButton} onPress={handleEditEvent}>
        <Icon name="create" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Edit Event</Text>
      </Pressable>
    </ScrollView>
  )
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

export default EditEvent

const styles = StyleSheet.create({
  container: { 
    paddingBottom: 28, 
    backgroundColor: '#ffffff' 
  },
  cover: { 
    height: 170, 
    width: '100%', 
    backgroundColor: '#e2e8f0' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#991b1b', 
    paddingHorizontal: 12, 
    marginTop: 12 
  },
  description: { 
    color: '#475569', 
    paddingHorizontal: 12, 
    marginTop: 8, 
    lineHeight: 20 
  },

  infoRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
    alignItems: 'center', 
    gap: 12 
  },
  infoIconWrap: { 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    backgroundColor: '#fee2e2', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  infoLabel: { 
    color: '#64748b', 
    fontWeight: '700' 
  },
  infoValue: { 
    color: '#0f172a', 
    fontWeight: '700' 
  },

  sectionTitle: { 
    paddingHorizontal: 12, 
    marginTop: 12, 
    fontWeight: '900', 
    color: '#991b1b' 
  },
  orgRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 10 
  },
  orgAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#e2e8f0', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  orgName: { 
    fontWeight: '800', 
    color: '#0f172a' 
  },
  orgSub: { 
    color: '#64748b' 
  },

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
  pocLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  pocAvatar: { 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    backgroundColor: '#e2e8f0', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  pocName: { 
    fontWeight: '800', 
    color: '#0f172a' 
  },
  pocRole: { 
    color: '#64748b' 
  },
  pocPhone: { 
    color: '#64748b' 
  },
  pocActions: { 
    flexDirection: 'row', 
    gap: 10 
  },
  circleBtn: { 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    backgroundColor: '#f8fafc', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  circleBtnGreen: { 
    backgroundColor: '#f0fdf4', 
    borderColor: '#dcfce7' 
  },

  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#2563eb',
    textDecorationLine: 'underline',
    marginLeft: 8,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9e0202',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginTop: 18,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})
