'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Grid,
  GridItem,
  Divider,
  Flex,
  Spacer,
  Icon,
  Button,
  Spinner,
  Alert,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Image,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Separator
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiCalendar,
  FiHome,
  FiMapPin,
  FiUser,
  FiUsers,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiDownload,
  FiPrinter,
  FiShare2,
  FiAlertCircle,
  FiClock,
  FiStar,
  FiShield,
} from 'react-icons/fi';
import { FaChild, FaBed, FaWifi, FaSwimmingPool } from 'react-icons/fa';
import Header from "@/components/header";

export default function BookingConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookingDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking_details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ bookingId: id }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch booking details: ${response.status}`);
      }
      
      const data = await response.json();
      //console.log("Booking Details:", data);
      setBookingDetails(data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setError('No booking ID provided');
      setLoading(false);
    }
  }, [bookingId, fetchBookingDetails]);



  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'C': return 'green';
      case 'P': return 'yellow';
      case 'X': return 'red';
      default: return 'gray';
    }
  };

  // Function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'C': return 'Confirmed';
      case 'P': return 'Pending';
      case 'X': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  // Function to handle print
  const handlePrint = () => {
    window.print();
  };

  // Function to handle download
  const handleDownload = () => {
    // Implement PDF download functionality
    alert('Download functionality will be implemented');
  };

  // Function to handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Booking: ${bookingData?.hotel_name}`,
          text: `I booked ${bookingData?.hotel_name} on Smallyfares!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Booking link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading your booking details...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="container.md">
          <Alert.Root status="error" borderRadius="lg">
            <Alert.Indicator />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Error Loading Booking</Text>
              <Text fontSize="sm">{error}</Text>
            </VStack>
          </Alert.Root>
          <Button mt={4} colorScheme="blue" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }

  if (!bookingDetails) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="container.md">
          <Alert.Root status="warning" borderRadius="lg">
            <Alert.Indicator />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Booking Not Found</Text>
              <Text fontSize="sm">The booking you're looking for doesn't exist or has expired.</Text>
            </VStack>
          </Alert.Root>
          <Button mt={4} colorScheme="blue" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }

  const bookingData = bookingDetails;
  
  if (!bookingData) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Alert.Root status="error" borderRadius="lg">
          <Alert.Indicator />
          <Text>Invalid booking data format</Text>
        </Alert.Root>
      </Box>
    );
  }


  return (
    <Box minH="100vh" bg="gray.50" pb={{ base: '140px', lg: '0' }}>
    <Header />
      <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
        {/* Header Section */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <VStack align="start" spacing={2}>
              <Heading size="2xl" color="green.600">
                Booking Confirmed!
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Your booking has been successfully confirmed
              </Text>
            </VStack>
            
            <HStack spacing={3}>
            {/*
              <Button leftIcon={<FiDownload />} variant="outline" onClick={handleDownload}>
                Download
              </Button>
              <Button leftIcon={<FiPrinter />} variant="outline" onClick={handlePrint}>
                Print
              </Button>
            */}
              <Button leftIcon={<FiShare2 />} colorScheme="blue" onClick={handleShare}>
               <FiShare2 /> Share
              </Button>
            </HStack>
          </Flex>

          {/* Status & Reference Card */}
          <Card.Root boxShadow="sm">
            <Card.Body>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Booking Status</Text>
                  <Badge 
                    colorScheme={getStatusColor(bookingData.booking_status)} 
                    fontSize="md" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                  >
                    <HStack spacing={2}>
                      <FiCheckCircle />
                      <Text>{getStatusText(bookingData.booking_status)}</Text>
                    </HStack>
                  </Badge>
                </VStack>
                
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Booking Reference</Text>
                  <Text fontWeight="bold" fontSize="lg" fontFamily="mono">
                    {bookingData.booking_reference}
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Booking Date</Text>
                  <Text fontWeight="medium">{new Date().toLocaleDateString()}</Text>
                </VStack>
                
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Total Amount</Text>
                  <Text fontWeight="bold" fontSize="xl" color="green.600">
                    {formatCurrency(parseFloat(bookingData.total_price), bookingData.currency)}
                  </Text>
                </VStack>
              </Flex>
            </Card.Body>
          </Card.Root>
        </VStack>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Left Column - Main Content */}
          <VStack spacing={6} align="stretch">
            {/* Hotel Information Card */}
            <Card.Root boxShadow="sm">
              <Card.Header borderBottom="2px solid" borderColor="gray.200">
                <HStack mb={4} spacing={3}>
                  <Icon as={FiHome} color="blue.500" boxSize={6} />
                  <Heading size="md">Hotel Information</Heading>
                </HStack>
              </Card.Header>
              <Card.Body>
                <VStack spacing={4} align="stretch">
                  <Heading size="lg">{bookingData.hotel_name}</Heading>
                  
                  <HStack spacing={4} color="gray.600">
                    <HStack spacing={2}>
                      <Icon as={FiMapPin} />
                      <Text>{bookingData.address}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} />
                      <Text>
                        {formatDate(bookingData.check_in)} - {formatDate(bookingData.check_out)}
                      </Text>
                    </HStack>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={4}>
                    <VStack align="center" spacing={2}>
                      <Badge colorScheme="blue" px={3} py={1}>Stay</Badge>
                      <Text fontWeight="bold">{bookingData.nights} Night(s)</Text>
                    </VStack>
                    <VStack align="center" spacing={2}>
                      <Badge colorScheme="green" px={3} py={1}>Rooms</Badge>
                      <Text fontWeight="bold">{bookingData.total_rooms}</Text>
                    </VStack>
                    <VStack align="center" spacing={2}>
                      <Badge colorScheme="purple" px={3} py={1}>Adults</Badge>
                      <Text fontWeight="bold">{bookingData.summary?.total_adults || 0}</Text>
                    </VStack>
                    <VStack align="center" spacing={2}>
                      <Badge colorScheme="orange" px={3} py={1}>Children</Badge>
                      <Text fontWeight="bold">{bookingData.summary?.total_children || 0}</Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Guest Details Card */}
            <Card.Root boxShadow="sm">
              <Card.Header borderBottom="2px solid" borderColor="gray.200">
                <HStack mb={4} spacing={3}>
                  <Icon as={FiUsers} color="blue.500" boxSize={6} />
                  <Heading size="md">Guest Details</Heading>
                </HStack>
              </Card.Header>
              <Card.Body>
                <VStack spacing={6} align="stretch">
                  {/* Main Guest */}
                  <Box>
                    <Card.Root variant="outline">
                      <Card.Body>
                        <HStack spacing={4}>
                          <Icon as={FiUser} color="blue.500" boxSize={5} />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">
                              {bookingData.leader?.name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Booking Holder
                            </Text>
                          </VStack>
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                  </Box>

                  {/* Room Details */}
                  {bookingData.rooms?.map((roomType, roomTypeIndex) => (
                    <Box key={roomTypeIndex}>
                      
                      {roomType.rooms?.map((room, roomIndex) => (
                        <Card.Root key={roomIndex} variant="outline" mb={4}>
                            <Card.Header>
                                <Text fontWeight="semibold" mb={3} color="gray.600">
                                    Room {room.room_id}: {room.category || 'Standard Room'}
                                </Text>
                            </Card.Header>
                          <Card.Body>
                            <VStack spacing={4} align="stretch">
                              {/* Adults in this room */}
                              {room.adults?.map((adult, adultIndex) => (
                                <HStack key={adultIndex} spacing={3}>
                                  <Icon as={FiUser} color="green.500" />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">
                                      {adult.title} {adult.first_name} {adult.last_name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">Adult</Text>
                                  </VStack>
                                </HStack>
                              ))}
                              
                              {/* Children in this room */}
                              {room.children?.map((child, childIndex) => (
                                <HStack key={childIndex} spacing={3}>
                                  <Icon as={FaChild} color="orange.500" />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">
                                      {child.first_name} {child.last_name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      Child ({child.child_age} years)
                                    </Text>
                                  </VStack>
                                </HStack>
                              ))}
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </Box>
                  ))}
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Important Information Card */}
            <Card.Root boxShadow="sm">
              <Card.Header borderBottom="2px solid" borderColor="gray.200">
                <HStack mb={4} spacing={3}>
                  <Icon as={FiAlertCircle} color="orange.500" boxSize={6} />
                  <Heading  size="md">Important Information</Heading>
                </HStack>
              </Card.Header>
              <Card.Body>
                <VStack spacing={4} align="stretch">
                  {/* Cancellation Policy */}
                  <Box>
                    <Text fontWeight="semibold" mb={2} color="gray.700">
                      Cancellation Policy
                    </Text>
                    <Alert.Root status="warning" variant="left-accent" borderRadius="md">
                      <Alert.Indicator />
                      <Box>
                        <Text fontWeight="medium">Cancellation Deadline:</Text>
                        <Text fontSize="sm">
                          {formatDate(bookingData.cancellation_deadline)}
                        </Text>
                        <Text fontSize="sm" mt={2}>
                          Free cancellation before deadline. After deadline: 100% penalty fee applies.
                        </Text>
                      </Box>
                    </Alert.Root>
                  </Box>

                  {/* Special Remarks */}
                  {bookingData.remarks && (
                    <Box>
                      <Text fontWeight="semibold" mb={2} color="gray.700">
                        Special Remarks
                      </Text>
                      <Card.Root variant="outline">
                        <Card.Body>
                          <Text fontSize="sm" color="gray.600" whiteSpace="pre-line">
                            {bookingData.remarks.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')}
                          </Text>
                        </Card.Body>
                      </Card.Root>
                    </Box>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
          </VStack>

          {/* Right Column - Sidebar */}
          <VStack spacing={6} align="stretch">
            {/* Price Summary Card */}
            <Card.Root boxShadow="sm" position="sticky">
              <Card.Header borderBottom="2px solid" borderColor="gray.200">
                <HStack mb={4} spacing={3}>
                  <Heading  size="md">Price Summary</Heading>
                </HStack>
              </Card.Header>
              <Card.Body>
                <VStack spacing={3} align="stretch">
                  <Flex justify="space-between">
                    <Text color="gray.600">Room Rate</Text>
                    <Text fontWeight="medium">
                      {formatCurrency(parseFloat(bookingData.total_price), bookingData.currency)}
                    </Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text color="gray.600">Taxes & Fees</Text>
                    <Text fontSize="sm" color="green.600">Included</Text>
                  </Flex>
                  
                  <Flex justify="space-between" fontSize="lg" fontWeight="bold">
                    <Text>Total Paid</Text>
                    <Text color="green.600">
                      {formatCurrency(parseFloat(bookingData.total_price), bookingData.currency)}
                    </Text>
                  </Flex>
                  
                  <Text fontSize="xs" color="gray.500" fontStyle="italic">
                    * All prices are in {bookingData.currency}
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Next Steps Card */}
            <Card.Root boxShadow="sm">
              <Card.Header borderBottom="2px solid" borderColor="gray.200">
                <HStack mb={4} spacing={3}>
                  <Heading  size="md">Next Steps</Heading>
                </HStack>
              </Card.Header>
              <Card.Body>
                <List.Root spacing={4}>
                  <List.Item>
                    <HStack spacing={3}>
                      <Icon as={FiMail} color="blue.500" />
                      <Text fontSize="sm">Check your email for confirmation</Text>
                    </HStack>
                  </List.Item>
                  <List.Item>
                    <HStack spacing={3}>
                      <Icon as={FiDownload} color="purple.500" />
                      <Text fontSize="sm">Download booking confirmation</Text>
                    </HStack>
                  </List.Item>
                  <List.Item>
                    <HStack spacing={3}>
                      <Icon as={FiPhone} color="orange.500" />
                      <Text fontSize="sm">Contact support if needed</Text>
                    </HStack>
                  </List.Item>
                </List.Root>
              </Card.Body>
            </Card.Root>

            {/* Support Card */}
            <Card.Root boxShadow="sm">
              <Card.Header borderBottomWidth="1px">
                <Heading size="md">Need Help?</Heading>
              </Card.Header>
              <Card.Body>
                <VStack spacing={4} align="stretch">
                  <Button colorScheme="blue" variant="outline" w="full">
                    <HStack spacing={3}>
                      <FiPhone />
                      <Text>Call Support</Text>
                    </HStack>
                  </Button>
                  <Button colorScheme="blue" variant="outline" w="full">
                    <HStack spacing={3}>
                      <FiMail />
                      <Text>Email Support</Text>
                    </HStack>
                  </Button>
                  <Button colorScheme="blue" variant="outline" w="full">
                    <HStack spacing={3}>
                      <Text>Live Chat</Text>
                    </HStack>
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          </VStack>
        </Grid>

        {/* Footer Actions */}
        <Flex justify="center" mt={8} gap={4} flexWrap="wrap">
          <Button 
            colorScheme="blue" 
            variant="outline" 
            leftIcon={<FiHome />}
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
          <Button 
            colorScheme="blue" 
            leftIcon={<FiCreditCard />}
            onClick={() => router.push('/all_bookings')}
          >
            View All Bookings
          </Button>
        </Flex>

        {/* Print-only content */}
        <Box display="none" className="print-only">
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold" fontSize="xl">Booking Confirmation</Text>
            <Text>Booking Reference: {bookingData.booking_reference}</Text>
            <Text>Hotel: {bookingData.hotel_name}</Text>
            <Text>Dates: {formatDate(bookingData.check_in)} to {formatDate(bookingData.check_out)}</Text>
            <Text>Total: {formatCurrency(parseFloat(bookingData.total_price), bookingData.currency)}</Text>
          </VStack>
        </Box>
      </Container>

      {/* CSS for print media */}
      <style jsx global>{`
        @media print {
          .print-only {
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </Box>
  );
}