import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const SignIn = () => {
  return (
    <View>
      <Link href="/(auth)/sign-up">
        Create Account
      </Link>
    </View>
  )
}

export default SignIn