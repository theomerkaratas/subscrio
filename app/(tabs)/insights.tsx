import { Text } from 'react-native'
import React from 'react'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background p-5">
      <Text className="text-2xl font-bold text-primary">Insights</Text>
    </SafeAreaView>
  )
}

export default Insights