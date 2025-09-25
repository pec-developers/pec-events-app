import React, { useEffect, useMemo, useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { router } from 'expo-router'
import { mockApi } from '../services/mockApi'
import type { SearchEvent } from '../data/events'

const allEventsInitial: SearchEvent[] = []

const departments = ['All Departments', 'CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'] as const
const categories = ['All', 'Seminar', 'Workshop', 'Guest Lecture','Industrial Visit', 'Cultural', 'Sports'] as const

const StudentSearch = () => {
  const [query, setQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<(typeof departments)[number]>('All Departments')
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('All')
  const [deptPickerVisible, setDeptPickerVisible] = useState(false)
  const [allEvents, setAllEvents] = useState<SearchEvent[]>(allEventsInitial)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const params = {
          dept: selectedDepartment !== 'All Departments' ? selectedDepartment : undefined,
          type: selectedCategory !== 'All' ? selectedCategory : undefined,
          name: query.trim() !== '' ? query.trim() : undefined,
        }
        const data = await mockApi.listSearchEvents(params)
        if (mounted) setAllEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
        if (mounted) setAllEvents([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [query, selectedDepartment, selectedCategory])

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim()
    
    return allEvents.filter((e) => {
      const matchesQuery = normalizedQuery === '' || 
        (e.title || '').toLowerCase().includes(normalizedQuery) || 
        (e.description || '').toLowerCase().includes(normalizedQuery)
      
      const matchesDept = selectedDepartment === 'All Departments' || e.department === selectedDepartment
      const matchesCat = selectedCategory === 'All' || e.category === selectedCategory
      
      return matchesQuery && matchesDept && matchesCat
    })
  }, [query, selectedDepartment, selectedCategory, allEvents])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>
        Search Events
      </Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search events"
          placeholderTextColor="#94a3b8"
          style={{ flex: 1, paddingVertical: 8 }}
        />
      </View>

      {/* Filters */}
      <Text style={styles.sectionTitle}>Filters</Text>

      <Text style={styles.label}>Department</Text>
      <Pressable style={styles.dropdown} onPress={() => setDeptPickerVisible(true)}>
        <Text style={styles.dropdownText}>{selectedDepartment}</Text>
        <Icon name="chevron-down" size={18} color="#64748b" />
      </Pressable>

      {/* Department Picker */}
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

      <Text style={[styles.label, { marginTop: 14 }]}>Event Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {categories.map((cat) => {
            const active = selectedCategory === cat
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      {/* Results */}
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Search Results</Text>
      <View style={{ marginTop: 8 }}>
        {loading ? (
          <Text style={{ color: '#64748b' }}>Loading events...</Text>
        ) : filtered.map((e) => (
          <Pressable key={e.id} style={styles.resultRow} onPress={() => {
            router.push({ pathname: '../eventDetail', params: { id: e.id } })
          }}>
            <Image source={e.image} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.category}>{e.category}</Text>
              <Text style={styles.resultTitle} numberOfLines={2}>
                {e.title}
              </Text>
              <Text style={styles.resultDesc} numberOfLines={2}>
                {e.description}
              </Text>
            </View>
          </Pressable>
        ))}
        {!loading && filtered.length === 0 && (
          <Text style={{ color: '#64748b', marginTop: 8 }}>No events found.</Text>
        )}
      </View>
    </ScrollView>
  )
}

export default StudentSearch

const styles = StyleSheet.create({

  container: { padding: 16, paddingBottom: 28, backgroundColor: '#ffffff' },

  header: {
      fontSize: 20,
      marginTop: 20,
      fontWeight: '700',
      color: '#0f172a',
      marginVertical: 10
  },

  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor:'#e2e8f0',
    paddingHorizontal: 14,
    height: 44,
  },

  sectionTitle: { marginTop: 16, fontSize: 18, fontWeight: '800', color: '#0f172a' },

  label: { marginTop: 12, color: '#334155', fontWeight: '700' },

  dropdown: {
    marginTop: 6,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownText: { color: '#0f172a' },
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
  modalTitle: { fontWeight: '800', color: '#0f172a', marginBottom: 8, fontSize: 16 },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalRowActive: { backgroundColor: '#fff' },
  modalRowText: { color: '#0f172a' },
  modalRowTextActive: { color: '#9e0202', fontWeight: '800' },
  modalCancel: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: { color: '#64748b', fontWeight: '700' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  chipActive: {
    backgroundColor: '#fde7e7',
    borderColor: '#ef9a9a',
  },
  chipText: { color: '#0f172a', fontWeight: '700' },
  chipTextActive: { color: '#9e0202' },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#e2e8f0' },
  category: { color: '#b91c1c', fontWeight: '800', marginBottom: 2 },
  resultTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  resultDesc: { color: '#475569', marginTop: 2 },
})
