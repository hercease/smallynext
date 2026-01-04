'use client'
import { SimpleGrid, Card, Icon, Text, Box, Container, Heading, VStack } from '@chakra-ui/react'
import { FiShield, FiAward, FiClock, FiCheckCircle } from 'react-icons/fi'

export default function TrustBadges() {
  const badges = [
    { icon: FiShield, title: "Secure Booking", desc: "SSL encrypted payments" },
    { icon: FiAward, title: "Best Price", desc: "Guaranteed lowest rates" },
    { icon: FiClock, title: "24/7 Support", desc: "Always here to help" },
    { icon: FiCheckCircle, title: "Easy Cancellation", desc: "Flexible policies" },
  ]

  return (
    <Box py={16} bg="gray.50">
      <Container maxW="container.xl">
        <VStack spacing={8} mb={12} textAlign="center">
          <Heading size="lg">Why Travelers Trust Us</Heading>
          <Text color="gray.600" maxW="2xl">
            We're committed to providing you with the best travel experience
          </Text>
        </VStack>
        
        <SimpleGrid 
          columns={{ base: 1, sm: 2, lg: 4 }} 
          spacing={{ base: 6, md: 8, lg: 10 }}
          maxW="1200px"
          mx="auto"
        >
          {badges.map((badge, index) => (
            <Card.Root 
              key={index} 
              variant="elevated" 
              align="center" 
              p={8}
              mb={4}
              mr={{ base: 0, md: 2 }}
              bg="white"
              _hover={{ 
                transform: 'translateY(-4px)',
                boxShadow: 'xl',
                transition: 'all 0.3s ease'
              }}
              transition="all 0.3s ease"
              borderRadius="xl"
            >
              <Box 
                p={4} 
                bg="blue.50" 
                borderRadius="full" 
                mb={6}
              >
                <Icon as={badge.icon} boxSize={8} color="blue.600" />
              </Box>
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                {badge.title}
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {badge.desc}
              </Text>
            </Card.Root>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}