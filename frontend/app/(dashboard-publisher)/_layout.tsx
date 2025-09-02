import React from 'react'
import { Redirect, Tabs, router } from 'expo-router'
import Icon from 'react-native-vector-icons/Ionicons'
import { useAuth } from '../contexts/AuthContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Platform } from 'react-native'

const PublisherDashBoardLayout = () => {
  const { state } = useAuth()
  const insets = useSafeAreaInsets()

  if (state.status === 'loading') return null
  if (state.status === 'unauthenticated') return <Redirect href="/login" />
  if (state.status === 'authenticated' && state.user.role !== 'publisher') {
    return <Redirect href="/studentHome" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#9e0202',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 6,
          paddingTop: 6,
          paddingHorizontal: 16,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: { 
          marginBottom: Platform.OS === 'ios' ? 0 : 2, 
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="publisherHome"
        options={{
          title: 'Events',
          headerTitle: 'Events',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create-event"
        options={{
          title: 'Create Event',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="publisherProfile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="edit-event"
        options={{
          title: 'Event Details',
          headerLeft: () => (
            <Icon
              name="chevron-back"
              size={22}
              color="#0f172a"
              style={{ marginLeft: 12 }}
              onPress={() => router.back()}
            />
          ),
          href: null
        }}
      />

      <Tabs.Screen
        name="edit-event-form"
        options={{
          headerShown: false,
          href: null
        }}
      />
    </Tabs>
  )
}

export default PublisherDashBoardLayout


