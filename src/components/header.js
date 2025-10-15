'use client'

import {
  Box,
  Flex,
  Image,
  Text,
  IconButton,
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Avatar,
  Container,
  Button,
  Portal
} from '@chakra-ui/react'
import {
  FiMenu,
  FiTablet,
  FiTool,
  FiHome,
  FiBook,
  FiShoppingCart,
  FiSettings
} from "react-icons/fi";
import Link from 'next/link';
import { useState } from 'react'
import { useColorMode, useColorModeValue  } from "@/components/ui/color-mode"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { toggleColorMode } = useColorMode()
  const colorMode = useColorModeValue('light', 'dark')
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700')

  const lightLogo = "/logo/logo.png"
  const darkLogo = "/logo/Smallywhite.png"

  const navItems = [
    { label: "Home", href: "/", icon: <FiHome /> },
    { label: "About us", href: "/about", icon: <FiTablet /> },
    { label: "Support", href: "/contact", icon: <FiTool /> },
  ]

  const profileItems = [
    { label: "My Bookings", href: "/bookings", icon: <FiBook /> },
    { label: "Cart", href: "/cart", icon: <FiShoppingCart /> },
    { label: "Settings", href: "/profile", icon: <FiSettings /> },
  ]

return (
    <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="sm"
        borderBottom="1px"
        color={useColorModeValue('gray.800', 'white')}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
            <Box maxWidth="8xl" mx="auto" px={{ base: '4', md: '8', lg: '12' }}>
                    <Flex as="nav" h="60px" align="center" justify="space-between">
                            <div align="center" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                    <div align="center" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <IconButton 
                                                    aria-label="Search database" 
                                                    display={{ base: "flex", lg: "none" }}
                                                    onClick={() => setIsOpen(true)}
                                                    variant="ghost"
                                                    
                                            >
                                                    <FiMenu />
                                            </IconButton>

                                            <Link href="/">
                                                    <Image
                                                            src={colorMode === 'light' ? lightLogo : darkLogo}
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
                                <Menu.Root>
                                    <Menu.Trigger variant="ghost" display={{ base: "flex", lg: "flex" }} rounded="full" focusRing="outside">
                                        <Avatar.Root size="sm">
                                                    <Avatar.Fallback name="Segun Adebayo" /> 
                                                    <Avatar.Image src="https://bit.ly/sage-adebayo" /> 
                                            </Avatar.Root> 
                                            </Menu.Trigger> 
                                            <Portal> 
                                                <Menu.Positioner> 
                                                    <Menu.Content>
                                                            {profileItems.map((item) => ( <Menu.Item key={item.label} as="a" href={item.href}> 
                                                            <Text as="span" mr={2}>{item.icon}</Text> 
                                                                    {item.label} </Menu.Item> ))} 
                                                    </Menu.Content> 
                                                </Menu.Positioner> 
                                            </Portal> 
                                    </Menu.Root>
                            </div>
                    </Flex>

        {/* Mobile Drawer Navigation */}
            <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="end">
                <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content
                    bg={useColorModeValue('white', 'gray.800')} color={useColorModeValue('gray.800', 'white')}
                    >
                    <Drawer.Header>
                        <Drawer.Title>Drawer Title</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                        do eiusmod tempor incididunt ut labore et dolore magna
                        aliqua.
                    </Drawer.Body>
                    <Drawer.Footer>
                        <Drawer.ActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                        </Drawer.ActionTrigger>
                        <Button>Save</Button>
                    </Drawer.Footer>
                    <Drawer.CloseTrigger asChild>
                        <CloseButton size="sm" />
                    </Drawer.CloseTrigger>
                    </Drawer.Content>
                </Drawer.Positioner>
                </Portal>
            </Drawer.Root>

        </Box>

        

    </Box>
)
}
