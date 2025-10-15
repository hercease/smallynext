'use client'

import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Image,
  Link,
  Separator,
  IconButton
} from '@chakra-ui/react'
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaHotel,
  FaPlane,
  FaCar,
} from 'react-icons/fa'
import { useColorMode, useColorModeValue  } from "@/components/ui/color-mode"

export default function Footer() {
    
  const textMuted = useColorModeValue('gray.600', 'gray.300')
  const textHeading = useColorModeValue('white', 'gray.100')
  const subTest = useColorModeValue('gray.400', 'gray.400')

  return (
    <Box as="footer" bg="gray.900" color={textMuted} pt={10} mt={10}>
      <Container maxW="container.xl">
        {/* Top Section */}
        <Grid templateColumns={{ base: '1fr', lg: '3fr 8fr' }} gap={8}>
          {/* Widget 1 */}
          <VStack align="flex-start" spacing={3}>
            <Link href="/">
              <Image src="/logo/Smallywhite.png" alt="logo" h="40px" />
            </Link>
            <Text color={subTest}>Cheap Prices, Premium Services.</Text>
            <Text>
              <Link href="tel:+2347049043727" color="blue.400">
                Nigeria: +(234) 704 904 3727
              </Link>
            </Text>
            <Text>
              <Link href="tel:+442045771094" color="blue.400">
                UK Office: +(+44) 204 577 1094
              </Link>
            </Text>
            <Text>
              <Link href="tel:+15878856105" color="blue.400">
                Canada Office: +(1) 587 885 6105
              </Link>
            </Text>
            <Text>
              <Link href="mailto:support@smallyfares.com" color="blue.400">
                support@smallyfares.com
              </Link>
            </Text>
          </VStack>

          {/* Widget 2 */}
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
            <Box>
              <Text fontWeight="bold" color={textHeading} mb={4}>
                Page
              </Text>
              <VStack align="flex-start" spacing={2}>
                <Link color={subTest} href="/about">About us</Link>
                <Link color={subTest} href="#">Travel Tips</Link>
              </VStack>
            </Box>

            <Box>
              <Text fontWeight="bold" color={textHeading} mb={4}>
                Link
              </Text>
              <VStack align="flex-start" spacing={2}>
                <Link color={subTest} href="/cookie-policy">Cookie</Link>
                <Link color={subTest} href="/contact">Support</Link>
              </VStack>
            </Box>

            <Box>
              <Text fontWeight="bold" color={textHeading} mb={4}>
                Company
              </Text>
              <VStack align="flex-start" spacing={2}>
                <Link color={subTest} href="#">Become an Agent</Link>
                <Link color={subTest} href="#">Career</Link>
              </VStack>
            </Box>

            <Box>
              <Text fontWeight="bold" color={textHeading} mb={4}>
                Booking
              </Text>
              <VStack align="flex-start" spacing={2}>
                <Link color={subTest} href="#"><FaHotel style={{ marginRight: 6 }} /> Hotel</Link>
                <Link color={subTest} href="#"><FaPlane style={{ marginRight: 6 }} /> Flight</Link>
                <Link color={subTest} href="#"><FaCar style={{ marginRight: 6 }} /> Cars</Link>
              </VStack>
            </Box>
          </Grid>
        </Grid>

        {/* Partners */}
        <Box mt={10}>
          <Text fontWeight="bold" color={textHeading} mb={2}>
            Our Partners
          </Text>
          <Text color={subTest}>
            LH (Lufthansa), AC (Air Canada), KQ (Kenya Airways), AA (American Airlines), DL (Delta Air Lines),
            KL (KLM), AF (Air France), QR (Qatar Airways), UA (United Airlines), ET (Ethiopian Airlines),
            ETHIAD, Virgin Australia.
          </Text>
        </Box>

        {/* Payment + Social */}
        <Grid templateColumns={{ base: '1fr', sm: '2fr 1fr' }} gap={6} mt={8} alignItems="center">
            {/* Payment */}
            <Box>
                <Text fontWeight="bold" color={textHeading} mb={3}>
                    Payment & Security
                </Text>
                <HStack spacing={4}>
                <Image alt="PayPal" src="/paypal.svg" h="30px" />
                <Image alt="Visa" src="/visa.svg" h="30px" />
                <Image alt="MasterCard" src="/mastercard.svg" h="30px" />
                <Image alt="Express Card" src="/expresscard.svg" h="30px" />
                </HStack>
            </Box>

          {/* Social */}
          <Box textAlign={{ base: 'left', sm: 'right' }}>
            <Text fontWeight="bold" color={textHeading} mb={3}>
              Follow us on
            </Text>
            <HStack spacing={3} justify={{ base: 'flex-start', sm: 'flex-end' }}>
              <IconButton onClick={() => window.open('https://facebook.com/smallyfares', '_blank')} aria-label="Facebook" size="sm" bg="blue.600" color="white" rounded="full"><FaFacebookF /></IconButton>
              <IconButton onClick={() => window.open('https://instagram.com/smallyfares', '_blank')} aria-label="Instagram" size="sm" bg="pink.500" color="white" rounded="full"><FaInstagram /></IconButton>
              <IconButton onClick={() => window.open('https://x.com/smallyfares', '_blank')} aria-label="Twitter" size="sm" bg="blue.400" color="white" rounded="full"><FaTwitter /></IconButton>
              <IconButton onClick={() => window.open('https://linkedin.com/smallfares', '_blank')} aria-label="LinkedIn" size="sm" bg="blue.700" color="white" rounded="full"><FaLinkedinIn /></IconButton>
            </HStack>
          </Box>
        </Grid>

        {/* Separator */}
        <Separator my={6} borderColor="gray.700" />

        {/* Bottom footer */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} py={4} alignItems="center">
          <Text color={subTest} fontSize="sm">
            © {new Date().getFullYear()} JUSSEG TRAVELS LTD. All rights reserved. Smallyfares.com is a registered seller of travel.
          </Text>
          <HStack spacing={4} justify={{ base: 'center', lg: 'flex-end' }}>
            <Link color={subTest} href="/privacy-policy">Privacy policy</Link>
            <Link color={subTest} href="#">Terms and conditions</Link>
            <Link color={subTest} href="#">Refund policy</Link>
          </HStack>
        </Grid>
      </Container>
    </Box>
  )
}
