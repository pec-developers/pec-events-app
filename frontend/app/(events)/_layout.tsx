import React from 'react'
import { Tabs } from 'expo-router'
import Icon from 'react-native-vector-icons/Ionicons'
import { TouchableOpacity } from 'react-native'

const EventDetailsLayout = () => {
  return (
    <Tabs>
        <Tabs.Screen
        name="eventDetail"
        options={({ navigation }) => ({
          href: null,
          title: 'Event Details',
          headerShown: true,
          headerTitleAlign: 'center',
          tabBarButton: () => null,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon
                name="chevron-back"
                size={22}
                color="#0f172a"
                style={{ marginLeft: 12 }}
              />
            </TouchableOpacity>
          ),
        })}
      />
    </Tabs>
  )
}

export default EventDetailsLayout