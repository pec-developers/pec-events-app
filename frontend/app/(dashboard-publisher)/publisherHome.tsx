import React, { useCallback, useMemo, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Image,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import Icon from 'react-native-vector-icons/Ionicons'
import { SearchEvent } from '../data/events'
import { mockApi } from '../services/mockApi'
import { invalidateCacheByPrefix } from '../services/cache'

const departments = ['All Departments', 'CSE', 'AIML', 'AIDS', 'ECE', 'MECH', 'CIVIL', 'EEE'] as const
const categories = ['All', 'Seminar', 'Workshop', 'Guest Lecture', 'Industrial Visit', 'Cultural', 'Sports'] as const

const PublisherHome = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<(typeof departments)[number]>('All Departments')
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('All')
  const [deptPickerVisible, setDeptPickerVisible] = useState(false)
  const [catPickerVisible, setCatPickerVisible] = useState(false)
  const [events, setEvents] = useState<SearchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEvents = useCallback(async () => {
    try {
      const params = {
        dept: selectedDepartment !== 'All Departments' ? selectedDepartment : undefined,
        type: selectedCategory !== 'All' ? selectedCategory : undefined,
        name: searchQuery.trim() !== '' ? searchQuery.trim() : undefined,
      }
      const fetched = await mockApi.listSearchEvents(params)
      setEvents(fetched)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }, [searchQuery, selectedDepartment, selectedCategory])

  // Fetch and search via API when filters/search change
  React.useEffect(() => {
    setLoading(true)
    fetchEvents().finally(() => setLoading(false))
  }, [fetchEvents])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await invalidateCacheByPrefix('publisher:events:')
      await invalidateCacheByPrefix('student:events:')
      await invalidateCacheByPrefix('student:events:list')
    } catch (error) {
      console.error('Error invalidating cache:', error)
    }
    await fetchEvents()
    setRefreshing(false)
  }, [fetchEvents])

  const filtered = events

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: '/(dashboard-publisher)/edit-event', params: { id: eventId } })
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keywords"
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <Pressable style={styles.filterPill} onPress={() => setDeptPickerVisible(true)}>
          <Text style={styles.filterPillText}>{selectedDepartment}</Text>
          <Icon name="chevron-down" size={16} color="#64748b" />
        </Pressable>
        <Pressable style={styles.filterPill} onPress={() => setCatPickerVisible(true)}>
          <Text style={styles.filterPillText}>{selectedCategory}</Text>
          <Icon name="chevron-down" size={16} color="#64748b" />
        </Pressable>
      </View>

      {/* Department Picker Modal */}
      <Modal transparent visible={deptPickerVisible} animationType="fade" onRequestClose={() => setDeptPickerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setDeptPickerVisible(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Department</Text>
          {departments.map((d) => {
            const active = selectedDepartment === d
            return (
              <Pressable key={d} style={[styles.modalRow, active && styles.modalRowActive]} onPress={() => { setSelectedDepartment(d); setDeptPickerVisible(false) }}>
                <Text style={[styles.modalRowText, active && styles.modalRowTextActive]}>{d}</Text>
                {active && <Icon name="checkmark" size={18} color="#9e0202" />}
              </Pressable>
            )
          })}
          <Pressable style={styles.modalCancel} onPress={() => setDeptPickerVisible(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal transparent visible={catPickerVisible} animationType="fade" onRequestClose={() => setCatPickerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setCatPickerVisible(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Category</Text>
          {categories.map((c) => {
            const active = selectedCategory === c
            return (
              <Pressable key={c} style={[styles.modalRow, active && styles.modalRowActive]} onPress={() => { setSelectedCategory(c); setCatPickerVisible(false) }}>
                <Text style={[styles.modalRowText, active && styles.modalRowTextActive]}>{c}</Text>
                {active && <Icon name="checkmark" size={18} color="#9e0202" />}
              </Pressable>
            )
          })}
          <Pressable style={styles.modalCancel} onPress={() => setCatPickerVisible(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Events List */}
      <View style={styles.eventsList}>
        {filtered.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => handleEventPress(event.id)}
          >
            {/* Event Image */}
            <View style={styles.eventImageWrapper}>
              {event.image?.uri ? (
                <Image source={{ uri: event.image.uri }} style={styles.eventImage} />
              ) : (
                <View style={[styles.eventImage, { backgroundColor: getEventColor(event.category) }]} />
              )}
            </View>
            {/* Event Content */}
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.date || 'Date TBD'}</Text>
              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Icon name={getEventIcon(event.category)} size={12} color="#b91c1c" />
                  <Text style={styles.tagText}>{event.category}</Text>
                </View>
                <View style={styles.tag}>
                  <Icon name="business" size={12} color="#b91c1c" />
                  <Text style={styles.tagText}>{event.department} Dept</Text>
                </View>
              </View>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.noEventsText}>No events found.</Text>
        )}
      </View>
    </ScrollView>
  )
}

// Helper functions for event styling
const getEventColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Seminar': '#0f766e',
    'Workshop': '#059669',
    'Guest Lecture': '#2563eb',
    'Industrial Visit': '#7c3aed',
    'Cultural': '#dc2626',
    'Sports': '#ea580c'
  }
  return colors[category] || '#64748b'
}

const getEventIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    'Seminar': 'school',
    'Workshop': 'construct',
    'Guest Lecture': 'mic',
    'Industrial Visit': 'business',
    'Cultural': 'podium',
    'Sports': 'fitness'
  }
  return icons[category] || 'calendar'
}

export default PublisherHome

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    backgroundColor: '#f8fafc',
    padding: 16,
    paddingBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 15,
    color: '#64748b',
    marginRight: 4,
    fontWeight: '600',
  },
  categoryContainer: {
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  categoryChipActive: {
    backgroundColor: '#fde7e7',
    borderColor: '#ef9a9a',
  },
  categoryChipText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: '#9e0202',
  },
  modalBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 6,
  },
  modalTitle: {
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    fontSize: 16
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalRowActive: {
    backgroundColor: '#fff'
  },
  modalRowText: {
    color: '#0f172a'
  },
  modalRowTextActive: {
    color: '#9e0202',
    fontWeight: '800'
  },
  modalCancel: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#64748b',
    fontWeight: '700'
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  noEventsText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemActive: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  navTextActive: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
    fontWeight: '700',
  },
})


