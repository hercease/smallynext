// components/Header.jsx
'use client'

import {
  Box,
  Flex,
  Image,
  Text,
  IconButton,
  CloseButton,
  Drawer,
  VStack,
  Menu,
  HStack,
  Avatar,
  Button,
  Portal,
  Spinner,
  Skeleton
} from '@chakra-ui/react'
import {
  FiMenu,
  FiTablet,
  FiTool,
  FiHome,
  FiBook,
  FiShoppingCart,
  FiSettings,
  FiUser,
  FiLogIn,
  FiLogOut
} from "react-icons/fi";
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/Auth.js';

// Create a separate component for search params logic
export default function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false)
  const hoverBgColor = 'gray.100'
  const drawerBg = 'white'
  const drawerColor = 'gray.800'
  const dividerColor = 'gray.200'
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Now safely wrapped in Suspense
  const router = useRouter();
  const { isLoggedIn, loading, logout, userData } = useAuth();

  const lightLogo = "/logo/logo.png"
  const darkLogo = "/logo/Smallywhite.png"

  const navItems = [
    { label: "Home", href: "/", icon: <FiHome /> },
    { label: "About us", href: "/about", icon: <FiTablet /> },
    { label: "Support", href: "/contact", icon: <FiTool /> },
  ]

  const profileItems = [
    { label: "My Bookings", href: "/all_bookings", icon: <FiBook /> },
    { label: "Cart", href: "/cart", icon: <FiShoppingCart /> },
    { label: "Settings", href: "/profile", icon: <FiSettings /> },
  ]

  const getReturnUrl = () => {
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return encodeURIComponent(currentUrl);
  };

  const handleLogout = () => {
    logout();
    router.push(`/login?return_url=${getReturnUrl()}`);
  }

  const closeDrawer = () => setIsOpen(false);

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg='white'
      boxShadow="sm"
      borderBottom="1px"
      color='gray.800'
      borderColor='gray.700'
    >
      <Box maxWidth="8xl" mx="auto" px={{ base: '4', md: '8', lg: '12' }}>
        <Flex as="nav" h="60px" align="center" justify="space-between">
          <div align="center" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div align="center" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconButton 
                aria-label="Open menu" 
                display={{ base: "flex", lg: "none" }}
                onClick={() => setIsOpen(true)}
                variant="ghost"
              >
                <FiMenu />
              </IconButton>

              <Link href="/">
                <Image
                  src={lightLogo}
                  alt="logo"
                  height="40px"
                />
              </Link>
            </div>
          </div>
          
          <Box display={{ base: "none", lg: "block" }}>
            <div align="center" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {navItems.map((item) => (
                <Box
                  key={item.label}
                  as={Link}
                  href={item.href}
                  mx={4}
                  py={2}
                  px={3}
                  borderRadius="md"
                  _hover={{ bg: hoverBgColor, textDecoration: 'none' }}
                  display="flex"
                  alignItems="center"
                >
                  <Text as="span" mr={2}>{item.icon}</Text>
                  {item.label}
                </Box>
              ))}
            </div>
          </Box>
          
          <div align="center" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loading ? (
              <Spinner size="sm" />
            ) : isLoggedIn ? (
              <Menu.Root>
                <Menu.Trigger variant="ghost" display={{ base: "flex", lg: "flex" }} rounded="full" focusRing="outside">
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={userData?.name} /> 
                    <Avatar.Image src="/avatar.png" /> 
                  </Avatar.Root> 
                </Menu.Trigger> 
                <Portal> 
                  <Menu.Positioner> 
                    <Menu.Content divideY="2px">
                      <Menu.Item pointerEvents="none" opacity="0.7">
                        <Text fontSize="sm" fontWeight="medium">{userData?.name}</Text>
                      </Menu.Item>
                      {profileItems.map((item) => ( 
                        <Menu.Item key={item.label} as={Link} href={item.href}> 
                          <Text as="span" mr={2}>{item.icon}</Text> 
                          {item.label} 
                        </Menu.Item> 
                      ))} 
                      <Menu.Item onClick={handleLogout}>
                        <Text as="span" mr={2}><FiLogOut /></Text>
                        Sign Out
                      </Menu.Item>
                    </Menu.Content> 
                  </Menu.Positioner> 
                </Portal> 
              </Menu.Root>
            ) : (
              <Button
                as={Link}
                href={`/login?return_url=${getReturnUrl()}`}
                leftIcon={<FiLogIn />}
                colorScheme="blue"
                size="sm"
                variant="outline"
              >
                Sign In
              </Button>
            )}
          </div>
        </Flex>

        {/* Mobile Drawer Navigation */}
        <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="start">
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content bg='white' color='gray.800'>
                {/* Drawer Header with Logo and Close Button */}
                <Drawer.Header borderBottom="1px" borderColor='gray.200'>
                  <Flex justify="space-between" align="center">
                    <Link href="/" onClick={closeDrawer}>
                      <Image
                        src={lightLogo}
                        alt="logo"
                        height="40px"
                      />
                    </Link>
                    <Drawer.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Drawer.CloseTrigger>
                  </Flex>
                </Drawer.Header>

                <Drawer.Body py={6}>
                  <VStack spacing={2} align="stretch">
                    {/* Main Navigation Items */}
                    <Text fontSize="sm" fontWeight="semibold" color="gray.500" px={4} mb={2}>
                      NAVIGATION
                    </Text>
                    {navItems.map((item) => (
                      <Box
                        key={item.label}
                        as={Link}
                        href={item.href}
                        onClick={closeDrawer}
                        px={4}
                        py={3}
                        borderRadius="md"
                        _hover={{ 
                          bg: hoverBgColor, 
                          textDecoration: 'none',
                          transform: 'translateX(4px)'
                        }}
                        display="flex"
                        alignItems="center"
                        transition="all 0.2s"
                      >
                        <Box color="blue.500" mr={3}>
                          {item.icon}
                        </Box>
                        <Text fontWeight="medium">{item.label}</Text>
                      </Box>
                    ))}

                    {/* Show profile items only if logged in */}
                    {isLoggedIn && (
                      <>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.500" px={4} mb={2}>
                          ACCOUNT
                        </Text>
                        {profileItems.map((item) => (
                          <Box
                            key={item.label}
                            as={Link}
                            href={item.href}
                            onClick={closeDrawer}
                            px={4}
                            py={3}
                            borderRadius="md"
                            _hover={{ 
                              bg: hoverBgColor, 
                              textDecoration: 'none',
                              transform: 'translateX(4px)'
                            }}
                            display="flex"
                            alignItems="center"
                            transition="all 0.2s"
                          >
                            <Box color="green.500" mr={3}>
                              {item.icon}
                            </Box>
                            <Text fontWeight="medium">{item.label}</Text>
                          </Box>
                        ))}
                        
                        <Box
                          px={4}
                          py={3}
                          display="flex"
                          alignItems="center"
                        >
                          <Avatar.Root size="sm" mr={3}>
                            <Avatar.Fallback name={userData?.name} bg="blue.500" color="white">
                              <FiUser />
                            </Avatar.Fallback> 
                            <Avatar.Image src="/avatar.png" /> 
                          </Avatar.Root>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm">{userData?.name}</Text>
                            <Text fontSize="xs" color="gray.500">View Profile</Text>
                          </Box>
                        </Box>
                      </>
                    )}
                  </VStack>
                </Drawer.Body>

                {/* Drawer Footer with Additional Actions */}
                <Drawer.Footer borderTop="1px" borderColor={dividerColor}>
                  <VStack spacing={3} align="stretch" width="100%">
                    
                    {isLoggedIn ? (
                      <Button 
                        colorScheme="red" 
                        variant="outline" 
                        onClick={handleLogout}
                        width="100%"
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <Button 
                        as={Link}
                        href={`/login?return_url=${getReturnUrl()}`}
                        colorScheme="blue"
                        width="100%"
                        leftIcon={<FiLogIn />}
                        onClick={closeDrawer}
                      >
                        Sign In
                      </Button>
                    )}
                  </VStack>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      </Box>
    </Box>
  )
}