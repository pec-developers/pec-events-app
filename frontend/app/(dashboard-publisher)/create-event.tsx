import React, { useState } from 'react'
import { StyleSheet, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text, Image, Modal, Alert } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { Ionicons } from '@expo/vector-icons'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/spacer'
import { mockApi } from '../services/mockApi'
import { router } from 'expo-router'
import { Picker } from '@react-native-picker/picker'

type mode = 'Online' | 'Offline' | 'Hybrid'
type EventType = 'Seminar' | 'Workshop' | 'Guest Lecture' | 'Industrial Visit' | 'Cultural' | 'Sports'
type EventMode = 'Online' | 'Offline' | 'Hybrid'

type Organizer = {
  parentOrganization: string
  eventOrganizer: string
}

type Contact = {
  name: string
  role: string
  contactNumber: string
}

type DayCell = {
  date: number
  month: number
  year: number
  isCurrentMonth: boolean
}

type PickedFile = {
  uri: string
  name?: string
  size?: number
  mimeType?: string
  type?: string
  data?: Blob
}

const emptyOrganizer = (): Organizer => ({ parentOrganization: '', eventOrganizer: '' })
const emptyContact = (): Contact => ({ name: '', role: '', contactNumber: '' })

const snapToFiveMinutes = (date: Date) => {
  const rounded = new Date(date)
  const minutes = rounded.getMinutes()
  const nearest = Math.round(minutes / 5) * 5
  if (nearest === 60) {
    rounded.setHours(rounded.getHours() + 1)
    rounded.setMinutes(0)
  } else {
    rounded.setMinutes(nearest)
  }
  rounded.setSeconds(0)
  rounded.setMilliseconds(0)
  return rounded
}

const getDaysInMonth = (date: Date): DayCell[] => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: DayCell[] = []
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    days.push({
      date: currentDate.getDate(),
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      isCurrentMonth: currentDate.getMonth() === month
    })
  }
  return days
}

const PublisherCreateEvent = () => {
  const [eventTitle, setEventTitle] = useState<string>('')
  const [eventDescription, setEventDescription] = useState<string>('')
  const [eligibility, setEligibility] = useState<string>('')
  const [date, setDate] = useState<string>('') // e.g., dd-mm-yyyy
  const [startTime, setStartTime] = useState<string>('') // e.g., HH:MM
  const [endTime, setEndTime] = useState<string>('')
  const [mode, setMode] = useState<string>('')
  const [eventType, setEventType] = useState<string>('Seminar')
  const [venue, setVenue] = useState<string>('')
  const [entryFee, setEntryFee] = useState<string>('')
  const [organizers, setOrganizers] = useState<Organizer[]>([emptyOrganizer()])
  const [contacts, setContacts] = useState<Contact[]>([emptyContact()])
  const [registrationLink, setRegistrationLink] = useState<string>('')
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false)
  const [selectedTime, setSelectedTime] = useState<Date>(snapToFiveMinutes(new Date()))
  const [timePickerType, setTimePickerType] = useState<'start' | 'end'>('start') // 'start' or 'end'
  const [uploadedFile, setUploadedFile] = useState<PickedFile | null>(null)
  const [isDateConfirmed, setIsDateConfirmed] = useState<boolean>(false)

  const handleAddOrganizer = () => setOrganizers(prev => [...prev, emptyOrganizer()])
  const handleRemoveOrganizer = (indexToRemove: number) => setOrganizers(prev => prev.filter((_, idx) => idx !== indexToRemove))
  const handleUpdateOrganizer = (indexToUpdate: number, field: keyof Organizer, value: string) =>
    setOrganizers(prev => prev.map((item, idx) => idx === indexToUpdate ? { ...item, [field]: value } : item))

  const handleAddContact = () => setContacts(prev => [...prev, emptyContact()])
  const handleRemoveContact = (indexToRemove: number) => setContacts(prev => prev.filter((_, idx) => idx !== indexToRemove))
  const handleUpdateContact = (indexToUpdate: number, field: keyof Contact, value: string) =>
    setContacts(prev => prev.map((item, idx) => idx === indexToUpdate ? { ...item, [field]: value } : item))

  const handleDatePress = () => {
    // Reset confirmation state when opening date picker
    setIsDateConfirmed(false)
    setShowDatePicker(true)
  }

  const handlePreviousMonth = () => {
    if (!isDateConfirmed) {
      const newMonth = new Date(calendarMonth)
      newMonth.setMonth(newMonth.getMonth() - 1)
      setCalendarMonth(newMonth)
    }
  }

  const handleNextMonth = () => {
    if (!isDateConfirmed) {
      const newMonth = new Date(calendarMonth)
      newMonth.setMonth(newMonth.getMonth() + 1)
      setCalendarMonth(newMonth)
    }
  }

  const handleDateConfirm = () => {
    const formattedDate = selectedDate.toLocaleDateString('en-GB') // dd/mm/yyyy format
    setDate(formattedDate.replace(/\//g, '-')) // Convert to dd-mm-yyyy format
    setIsDateConfirmed(true)
    setShowDatePicker(false)
  }

  const handleDateCancel = () => {
    setShowDatePicker(false)
  }

  const handleTimePress = (type: 'start' | 'end') => {
    setTimePickerType(type)
    setSelectedTime((prev) => snapToFiveMinutes(prev))
    setShowTimePicker(true)
  }

  const handleTimeConfirm = () => {
    const hours = selectedTime.getHours()
    const minutes = selectedTime.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const formattedTime = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`
    
    if (timePickerType === 'start') {
      setStartTime(formattedTime)
    } else {
      setEndTime(formattedTime)
    }
    setShowTimePicker(false)
  }

  const handleTimeCancel = () => {
    setShowTimePicker(false)
  }

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'image/jpeg', 'image/png', 'image/gif'],
        copyToCacheDirectory: true,
        multiple: false,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        
        // Check file size (10MB limit)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.')
          return
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!file.mimeType || !allowedTypes.includes(file.mimeType)) {
          Alert.alert('Invalid File Type', 'Please select a PNG, JPG, or GIF file.')
          return
        }

        // Create a file object with the necessary properties for FormData
        const fileWithData = {
          uri: file.uri,
          name: file.name || `image-${Date.now()}.jpg`,
          type: file.mimeType || 'image/jpeg',
          mimeType: file.mimeType || 'image/jpeg', // Keep mimeType for compatibility
        };

        setUploadedFile(fileWithData);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  }

  const handlePublish = async () => {
    try {
      if (!eventTitle.trim() || !eventDescription.trim()) {
        Alert.alert('Missing fields', 'Please fill the required fields (Title, Description)')
        return
      }

      const payload = {
        title: eventTitle,
        description: eventDescription,
        eligibility,
        date,
        startTime,
        endTime,
        mode,
        venue,
        fee: entryFee,
        organizers,
        contacts: contacts.map(c => ({ name: c.name, role: c.role, phone: c.contactNumber })),
        registrationLink,
        type: eventType as any,
      }

      // Prepare the file for upload with actual bytes where possible
      let imagePart: any | undefined
      if (uploadedFile) {
        // Ensure we have the basic file structure needed
        imagePart = {
          uri: uploadedFile.uri,
          name: uploadedFile.name || `image-${Date.now()}.jpg`,
          type: uploadedFile.type || uploadedFile.mimeType || 'image/jpeg',
          mimeType: uploadedFile.mimeType || uploadedFile.type || 'image/jpeg', // Keep mimeType for compatibility
        }
      } else {
      }

      const res = await mockApi.createPublisherEvent(payload, imagePart)
      if (res?.success) {
        Alert.alert('Success', res.message || 'Event created successfully')
        router.replace('/(dashboard-publisher)/publisherHome')
      } else {
        Alert.alert('Error', res?.message || 'Failed to create event')
      }
    } catch (error: any) {
      console.error('Create event error:', error)
      Alert.alert('Error', error?.message || 'Failed to create event')
    }
  }

  return (
    <ThemedView style={[styles.screen ]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
          <Spacer height={16} />

          {/* Event Title */}
          <FormLabel>Event Title</FormLabel>
          <TextInput
            value={eventTitle}
            onChangeText={setEventTitle}
            placeholder="Enter event title"
            style={styles.input}
          />

          {/* Event Description */}
          <Spacer height={12} />
          <FormLabel>Event Description</FormLabel>
          <TextInput
            value={eventDescription}
            onChangeText={setEventDescription}
            placeholder="Enter event description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[styles.input, styles.multiline]}
          />

          {/* Thumbnail placeholder */}
          <Spacer height={12} />
          <FormLabel>Event Thumbnail</FormLabel>
          <TouchableOpacity style={styles.uploadBox} onPress={handleFileUpload}>
            {uploadedFile ? (
              <View style={styles.uploadedFileContainer}>
                <Image
                  source={{ uri: uploadedFile.uri }}
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
                <View style={styles.fileInfo}>
                  <ThemedText style={styles.fileName}>{uploadedFile.name}</ThemedText>
                  <ThemedText style={styles.fileSize}>
                    {uploadedFile.size ? (uploadedFile.size / 1024 / 1024).toFixed(2) : '0.00'} MB
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.removeFileButton}
                  onPress={() => setUploadedFile(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={40} color="#6b7280" />
                <ThemedText style={styles.uploadTitle}>Upload a file</ThemedText>
                <ThemedText style={styles.uploadSubtitle}>PNG, JPG, GIF up to 10MB</ThemedText>
              </>
            )}
          </TouchableOpacity>

          {/* Eligibility */}
          <Spacer height={12} />
          <FormLabel>Eligibility</FormLabel>
          <TextInput
            value={eligibility}
            onChangeText={setEligibility}
            placeholder="e.g., Open to all college students"
            style={styles.input}
          />

          {/* Date */}
          <Spacer height={12} />
          <FormLabel>Date</FormLabel>
          <View style={styles.inputContainer}>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="dd-mm-yyyy"
              style={styles.inputWithIcon}
              
            />
            <TouchableOpacity 
              onPress={handleDatePress}
              style={styles.iconContainer}
            >
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          

          {/* Time row */}
          <Spacer height={12} />
          <View style={styles.row}>
            <View style={[styles.flexItem, { marginRight: 8 }]}> 
              <FormLabel>Start Time</FormLabel>
              <View style={styles.inputContainer}>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="--:-- --"
                  style={styles.inputWithIcon}
                />
                <TouchableOpacity 
                  onPress={() => handleTimePress('start')}
                  style={styles.iconContainer}
                >
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.flexItem, { marginLeft: 8 }]}> 
              <FormLabel>End Time</FormLabel>
              <View style={styles.inputContainer}>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="--:-- --"
                  style={styles.inputWithIcon}
                />
                <TouchableOpacity 
                  onPress={() => handleTimePress('end')}
                  style={styles.iconContainer}
                >
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Mode */}
          <Spacer height={12} />
          <FormLabel>Mode</FormLabel>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={mode}
              onValueChange={(value: string) => setMode(value as EventMode)}
              style={styles.picker}
            >
              <Picker.Item label="Select mode" value="" />
              <Picker.Item label="Online" value="Online" />
              <Picker.Item label="Offline" value="Offline" />
              <Picker.Item label="Hybrid" value="Hybrid" />
            </Picker>
          </View>

          {/* Event Type */}
          <Spacer height={12} />
          <FormLabel>Event Type</FormLabel>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={eventType}
              onValueChange={(value: string) => setEventType(value as EventType)}
              style={styles.picker}
            >
              <Picker.Item label="Select event type" value="" />
              <Picker.Item label="Seminar" value="Seminar" />
              <Picker.Item label="Workshop" value="Workshop" />
              <Picker.Item label="Guest Lecture" value="Guest Lecture" />
              <Picker.Item label="Industrial Visit" value="Industrial Visit" />
              <Picker.Item label="Cultural" value="Cultural" />
              <Picker.Item label="Sports" value="Sports" />
            </Picker>
          </View>

          {/* Venue */}
          <Spacer height={12} />
          <FormLabel>Venue</FormLabel>
          <TextInput
            value={venue}
            onChangeText={setVenue}
            placeholder="Enter venue"
            style={styles.input}
          />

          {/* Entry Fee */}
          <Spacer height={12} />
          <FormLabel>Entry Fee (in ₹)</FormLabel>
          <TextInput
            value={entryFee}
            onChangeText={setEntryFee}
            placeholder="Enter amount or 0 for free entry"
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Organizers */}
          <Spacer height={18} />
          <ThemedText title style={styles.sectionTitle}>Organizers</ThemedText>
          <Spacer height={8} />
          {organizers.map((org, idx) => (
            <View key={`org-${idx}`} style={styles.card}>
              
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>Organizer {idx + 1}</ThemedText>
                <TouchableOpacity onPress={() => handleRemoveOrganizer(idx)} disabled={organizers.length === 1}>
                  <Text style={[styles.removeText, organizers.length === 1 && { opacity: 0.5 }]}>Remove</Text>
                </TouchableOpacity>
              </View>

              <FormLabel>Parent Organization</FormLabel>
              <TextInput
                value={org.parentOrganization}
                onChangeText={(v) => handleUpdateOrganizer(idx, 'parentOrganization', v)}
                placeholder="e.g., College Name"
                style={styles.input}
              />
              <Spacer height={8} />
              <FormLabel>Event Organizer</FormLabel>
              <TextInput
                value={org.eventOrganizer}
                onChangeText={(v) => handleUpdateOrganizer(idx, 'eventOrganizer', v)}
                placeholder="e.g., Student Council"
                style={styles.input}
              />
            </View>
          ))}
          <TouchableOpacity style={[styles.addButton,{width:150}]} onPress={handleAddOrganizer}>
            <Text style={styles.addButtonText}>+ Add Organizer</Text>
          </TouchableOpacity>

          {/* Contacts */}
          <Spacer height={18} />
          <ThemedText title style={styles.sectionTitle}>Points of Contact</ThemedText>
          <Spacer height={8} />
          {contacts.map((ct, idx) => (
            <View key={`ct-${idx}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>Contact {idx + 1}</ThemedText>
                <TouchableOpacity onPress={() => handleRemoveContact(idx)} disabled={contacts.length === 1}>
                  <Text style={[styles.removeText, contacts.length === 1 && { opacity: 0.5 }]}>Remove</Text>
                </TouchableOpacity>
              </View>
              <FormLabel>Name</FormLabel>
              <TextInput
                value={ct.name}
                onChangeText={(v) => handleUpdateContact(idx, 'name', v)}
                placeholder="Enter name"
                style={styles.input}
              />
              <Spacer height={8} />
              <FormLabel>Role</FormLabel>
              <TextInput
                value={ct.role}
                onChangeText={(v) => handleUpdateContact(idx, 'role', v)}
                placeholder="e.g., Event Coordinator"
                style={styles.input}
              />
              <Spacer height={8} />
              <FormLabel>Contact Number</FormLabel>
              <TextInput
                value={ct.contactNumber}
                onChangeText={(v) => handleUpdateContact(idx, 'contactNumber', v)}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          ))}
                      <TouchableOpacity style={[styles.addButton, {width:150}]} onPress={handleAddContact}>
              <Text style={[styles.addButtonText, { marginLeft: -5}]}>+ Add Contact</Text>
            </TouchableOpacity>

          {/* Registration Link */}
          <Spacer height={18} />
          <FormLabel>Registration Link</FormLabel>
          <TextInput
            value={registrationLink}
            onChangeText={setRegistrationLink}
            placeholder="Enter registration link"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
          />

          <Spacer height={24} />
          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Text style={styles.publishButtonText}>Publish Event</Text>
          </TouchableOpacity>

          <Spacer height={80} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Bottom nav removed; using Tabs from layout */}

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDateCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText title style={styles.modalTitle}>Select Date</ThemedText>
              <TouchableOpacity onPress={handleDateCancel}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity 
                  style={styles.monthNavButton} 
                  onPress={handlePreviousMonth}
                  disabled={isDateConfirmed}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={24} 
                    color={isDateConfirmed ? "#9ca3af" : "#6b7280"} 
                  />
                </TouchableOpacity>
                <ThemedText style={styles.monthYearText}>
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </ThemedText>
                <TouchableOpacity 
                  style={styles.monthNavButton} 
                  onPress={handleNextMonth}
                  disabled={isDateConfirmed}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color={isDateConfirmed ? "#9ca3af" : "#6b7280"} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.weekDaysContainer}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.daysContainer}>
                {getDaysInMonth(calendarMonth).map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      if (!isDateConfirmed) {
                        setSelectedDate(new Date(day.year, day.month, day.date))
                      }
                    }}
                    style={[
                      styles.dayButton,
                      day.date === selectedDate.getDate() && 
                      day.month === selectedDate.getMonth() && 
                      day.year === selectedDate.getFullYear() && styles.selectedDay
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      !day.isCurrentMonth && styles.otherMonthDay,
                      day.date === selectedDate.getDate() && 
                      day.month === selectedDate.getMonth() && 
                      day.year === selectedDate.getFullYear() && styles.selectedDayText
                    ]}>
                      {day.date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleDateCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleDateConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleTimeCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText title style={styles.modalTitle}>
                Select {timePickerType === 'start' ? 'Start' : 'End'} Time
              </ThemedText>
              <TouchableOpacity onPress={handleTimeCancel}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeDisplayText}>
                  {selectedTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </View>
              
              <View style={styles.timeControls}>
                <View style={styles.timeControlRow}>
                  <Text style={styles.timeLabel}>Hour</Text>
                  <View style={styles.timeButtons}>
                    <TouchableOpacity 
                      style={styles.timeButton}
                      onPress={() => {
                        const newTime = new Date(selectedTime)
                        newTime.setHours((selectedTime.getHours() + 1) % 24)
                        setSelectedTime(newTime)
                      }}
                    >
                      <Ionicons name="chevron-up" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    <Text style={styles.timeValue}>
                      {selectedTime.getHours() % 12 || 12}
                    </Text>
                    <TouchableOpacity 
                      style={styles.timeButton}
                      onPress={() => {
                        const newTime = new Date(selectedTime)
                        newTime.setHours((selectedTime.getHours() - 1 + 24) % 24)
                        setSelectedTime(newTime)
                      }}
                    >
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.timeSeparator}>:</Text>
                
                <View style={styles.timeControlRow}>
                  <Text style={styles.timeLabel}>Minute</Text>
                  <View style={styles.timeButtons}>
                    <TouchableOpacity 
                      style={styles.timeButton}
                      onPress={() => {
                        const newTime = new Date(selectedTime)
                        const currentHour = newTime.getHours()
                        const currentMinutes = newTime.getMinutes()
                        const totalMinutes = currentHour * 60 + currentMinutes + 5
                        const normalizedTotalMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
                        newTime.setHours(Math.floor(normalizedTotalMinutes / 60))
                        newTime.setMinutes(normalizedTotalMinutes % 60)
                        setSelectedTime(newTime)
                      }}
                    >
                      <Ionicons name="chevron-up" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    <Text style={styles.timeValue}>
                      {selectedTime.getMinutes().toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity 
                      style={styles.timeButton}
                      onPress={() => {
                        const newTime = new Date(selectedTime)
                        const currentHour = newTime.getHours()
                        const currentMinutes = newTime.getMinutes()
                        const totalMinutes = currentHour * 60 + currentMinutes - 5
                        const normalizedTotalMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
                        newTime.setHours(Math.floor(normalizedTotalMinutes / 60))
                        newTime.setMinutes(normalizedTotalMinutes % 60)
                        setSelectedTime(newTime)
                      }}
                    >
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.timeControlRow}>
                  <Text style={styles.timeLabel}>AM/PM</Text>
                  <TouchableOpacity 
                    style={styles.ampmButton}
                    onPress={() => {
                      const newTime = new Date(selectedTime)
                      const currentHour = newTime.getHours()
                      if (currentHour < 12) {
                        newTime.setHours(currentHour + 12)
                      } else {
                        newTime.setHours(currentHour - 12)
                      }
                      setSelectedTime(newTime)
                    }}
                  >
                    <Text style={styles.ampmText}>
                      {selectedTime.getHours() >= 12 ? 'PM' : 'AM'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleTimeCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleTimeConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  )
}

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemedText style={styles.label}>{children}</ThemedText>
)

export default PublisherCreateEvent

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    alignItems:'center'
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  multiline: {
    minHeight: 100,
  },
  uploadBox: {
    height: 140,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  uploadTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  uploadedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeFileButton: {
    marginLeft: 8,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithIcon: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    paddingRight: 40, // Add space for the icon
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
    row: {
    flexDirection: 'row',
  },
  flexItem: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeText: {
    color: 'red',
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  addButtonText: {
    fontWeight: '600',
    color: '#374151',
  },
  publishButton: {
    backgroundColor: '#991b1b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  
  // Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 350,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarContainer: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  otherMonthDay: {
    color: '#d1d5db',
  },
  selectedDay: {
    backgroundColor: '#991b1b',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#991b1b',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Time Picker Styles
  timePickerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  timeDisplay: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  timeDisplayText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#374151', 
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeControlRow: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  timeButtons: {
    alignItems: 'center',
  },
  timeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginVertical: 2,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginVertical: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginHorizontal: 8,
    marginTop: 20,
  },
  ampmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#991b1b',
    marginTop: 8,
  },
  ampmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
})

