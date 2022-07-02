import { Flex, HStack, Text } from '@chakra-ui/react'
import React from 'react'
import { useAuth } from 'store/auth.store'
import { Login } from './login.component'
import { Logout } from './logout.component'
import { Signup } from './sign-up.component'

export const Navbar = () => {
  const username = useAuth((state) => state.username);

  return (
    <Flex columnGap="4" pb={4} px={3} pt={6} h="16">
        {username ? (
          <HStack justifyContent="space-between" w="full">
            <Text>Logged in as {username}</Text>
            <Logout />
          </HStack>
        ) : (
          <>
            <Login />
            <Signup />
          </>
        )}
      </Flex>
  )
}
