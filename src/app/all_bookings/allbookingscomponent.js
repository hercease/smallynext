// app/my-bookings/page.js
'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Card,
  NativeSelect,
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
  Input,
  InputGroup,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Drawer,
  Image,
  Link,
  Avatar,
  AvatarGroup,
  Tag,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiHome,
  FiMapPin,
  FiUser,
  FiUsers,
  FiDollarSign,
  FiEye,
  FiDownload,
  FiPrinter,
  FiMoreVertical,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiMail,
  FiCreditCard,
  FiPackage,
  FiAirplane,
} from 'react-icons/fi';
import { FaHotel, FaPlane, FaBed, FaChild } from 'react-icons/fa';
import Header from "@/components/header";

export default function MyBookingsPage(token) {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Sample data structure based on your endpoint
  const sampleBookings = [
    {
      booking_id: "29992903",
      reference: "GO27804454-29992903-A(INT)",
      date: "2024-01-15T10:30:00Z",
      status: "confirmed",
      booking_type: "hotel",
      payment_type: "paynow",
      payment_method: "stripe",
      total_amount: "1072.00",
      currency: "USD",
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      hotel_name: "CASCADE WELLNESS AND LIFESTYLE RESORT",
      check_in: "2025-12-17",
      check_out: "2025-12-19",
      nights: 2,
      guests: 4,
      rooms: 2,
    },
    {
      booking_id: "29992904",
      reference: "FL27804455-29992904-B(INT)",
      date: "2024-01-14T14:20:00Z",
      status: "pending",
      booking_type: "flight",
      payment_type: "paylater",
      payment_method: "wallet",
      total_amount: "850.50",
      currency: "USD",
      firstname: "Jane",
      lastname: "Smith",
      email: "jane.smith@example.com",
      flight_number: "AA1234",
      departure: "JFK",
      arrival: "LAX",
      departure_date: "2025-03-15T08:00:00Z",
      arrival_date: "2025-03-15T11:00:00Z",
      passengers: 2,
    },
    {
      booking_id: "29992905",
      reference: "GO27804456-29992905-C(INT)",
      date: "2024-01-10T09:15:00Z",
      status: "cancelled",
      booking_type: "hotel",
      payment_type: "paynow",
      payment_method: "stripe",
      total_amount: "750.00",
      currency: "USD",
      firstname: "Robert",
      lastname: "Johnson",
      email: "robert.j@example.com",
      hotel_name: "GRAND PLAZA HOTEL",
      check_in: "2025-02-20",
      check_out: "2025-02-25",
      nights: 5,
      guests: 2,
      rooms: 1,
    },
  ];

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
     

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user_bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body : new URLSearchParams({ token: token.user  }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }
      
      const data = await response.json();
      //console.log("Bookings data:", data);
      
      // Use sample data if API returns empty or for testing
      const bookingsData = data.length > 0 ? data : sampleBookings;
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error.message);
      // Fallback to sample data for demo
      setBookings(sampleBookings);
      setFilteredBookings(sampleBookings);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and sorting
  useEffect(() => {

    let result = [...bookings];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(booking => {
        return (
          booking.reference?.toLowerCase().includes(term) ||
          `${booking.firstname} ${booking.lastname}`.toLowerCase().includes(term) ||
          booking.email?.toLowerCase().includes(term)
        );
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    // Apply booking type filter
    if (bookingTypeFilter !== 'all') {
      result = result.filter(booking => booking.booking_type === bookingTypeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      
      switch (sortBy) {
        case 'date-asc':
          return aDate - bDate;
        case 'date-desc':
          return bDate - aDate;
        case 'price-asc':
          return parseFloat(a.total_amount) - parseFloat(b.total_amount);
        case 'price-desc':
          return parseFloat(b.total_amount) - parseFloat(a.total_amount);
        default:
          return bDate - aDate;
      }
    });
    
    setFilteredBookings(result);

  }, [bookings, searchTerm, statusFilter, bookingTypeFilter, sortBy]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  // Get status badge properties
  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmed':
        return { 
          color: 'green', 
          text: 'Confirmed', 
          icon: FiCheckCircle,
          bgColor: 'green.50',
          borderColor: 'green.200'
        };
      case 'pending':
        return { 
          color: 'yellow', 
          text: 'Pending', 
          icon: FiClock,
          bgColor: 'yellow.50',
          borderColor: 'yellow.200'
        };
      case 'cancelled':
        return { 
          color: 'red', 
          text: 'Cancelled', 
          icon: FiXCircle,
          bgColor: 'red.50',
          borderColor: 'red.200'
        };
      default:
        return { 
          color: 'gray', 
          text: 'Unknown', 
          icon: FiAlertCircle,
          bgColor: 'gray.50',
          borderColor: 'gray.200'
        };
    }
  };

  // Get booking type badge properties
  const getBookingTypeConfig = (type) => {
    switch (type) {
      case 'hotel':
        return { 
          color: 'blue', 
          text: 'Hotel', 
          icon: FaHotel,
          bgColor: 'blue.50'
        };
      case 'flight':
        return { 
          color: 'purple', 
          text: 'Flight', 
          icon: FaPlane,
          bgColor: 'purple.50'
        };
      default:
        return { 
          color: 'gray', 
          text: 'Other', 
          icon: FiPackage,
          bgColor: 'gray.50'
        };
    }
  };

  // Get payment method badge properties
  const getPaymentMethodConfig = (method) => {
    switch (method) {
      case 'stripe':
        return { color: 'blue', text: 'Credit Card', icon: <FiCreditCard /> };
      case 'wallet':
        return { color: 'green', text: 'Wallet', icon: <FiCreditCard /> };
      default:
        return { color: 'gray', text: method, icon: <FiCreditCard /> };
    }
  };

  // Get payment type badge properties
  const getPaymentTypeConfig = (type) => {
    switch (type) {
      case 'paynow':
        return { color: 'green', text: 'Paid Now' };
      case 'paylater':
        return { color: 'orange', text: 'Pay Later' };
      default:
        return { color: 'gray', text: type };
    }
  };

  // Handle view booking details
  const handleViewDetails = (booking) => {
    router.push(`/booking_confirmation?bookingId=${booking.booking_id}`);
  };

  // Handle booking action
  const handleBookingAction = (action, booking) => {
    switch (action) {
      case 'view':
        handleViewDetails(booking);
        break;
      case 'download':
        alert(`Download booking ${booking.reference}`);
        break;
      case 'cancel':
        setSelectedBooking(booking);
        break;
      case 'modify':
        alert(`Modify booking ${booking.reference}`);
        break;
      default:
        break;
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cancel_booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ 
          bookingId: selectedBooking.booking_id,
        }),
      });
      
      if (response.ok) {
        alert('Booking cancelled successfully');
        fetchBookings(); // Refresh bookings
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // Calculate days until check-in/departure
  const getDaysUntilEvent = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get appropriate icon for booking details
  const getBookingIcon = (booking) => {
    if (booking.booking_type === 'hotel') {
      return FaHotel;
    } else if (booking.booking_type === 'flight') {
      return FaPlane;
    }
    return FiPackage;
  };

  // Get booking details summary
  const getBookingSummary = (booking) => {
    if (booking.booking_type === 'hotel') {
      return `${booking.nights || 1} night${booking.nights > 1 ? 's' : ''} • ${booking.guests || 1} guest${booking.guests > 1 ? 's' : ''}`;
    } else if (booking.booking_type === 'flight') {
      return `${booking.passengers || 1} passenger${booking.passengers > 1 ? 's' : ''} • ${booking.departure} → ${booking.arrival}`;
    }
    return 'Booking details';
  };

  // Refetch bookings
  const handleRefresh = () => {
    fetchBookings();
  };

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  if (loading) {
    return (
      <Box minH="100vh" bg='gray.50' display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading your bookings...</Text>
        </VStack>
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
              <Heading size="2xl" color="blue.700">
                My Bookings
              </Heading>
              <Text color="gray.600">
                Manage and view all your travel bookings in one place
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <Button 
                leftIcon={<FiRefreshCw />} 
                variant="outline" 
                onClick={handleRefresh}
                isLoading={loading}
              >
                Refresh
              </Button>
              <Button 
                colorScheme="blue"
                onClick={() => router.push('/')}
              >
                Book New Trip
              </Button>
            </HStack>
          </Flex>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card.Root bg='gray.50' boxShadow="sm">
              <Card.Body>
                <VStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Total Bookings</Text>
                  <Heading size="xl">{bookings.length}</Heading>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root bg='gray.50' boxShadow="sm">
              <Card.Body>
                <VStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Active</Text>
                  <Heading size="xl" color="green.600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </Heading>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root bg='gray.50' boxShadow="sm">
              <Card.Body>
                <VStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Pending</Text>
                  <Heading size="xl" color="yellow.600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </Heading>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root bg='gray.50' boxShadow="sm">
              <Card.Body>
                <VStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Total Spent</Text>
                  <Heading size="xl" color="purple.600">
                    {formatCurrency(
                      bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
                      bookings[0]?.currency || 'USD'
                    )}
                  </Heading>
                </VStack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </VStack>

        {/* Filters Section */}
        <Card.Root bg='gray.50' boxShadow="sm" mb={6}>
          <Card.Body>
            <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr 1fr auto' }} gap={4} alignItems="end">
              {/* Search */}
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>Search Bookings</Text>
                <InputGroup startElement={<FiSearch color="gray.400" />}>
                  <Input
                    placeholder="Search by reference, name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Box>
              
              {/* Status Filter */}
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>Status</Text>
                <NativeSelect.Root>
                <NativeSelect.Field
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>
              
              {/* Booking Type Filter */}
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>Type</Text>
                <NativeSelect.Root>
                <NativeSelect.Field
                  value={bookingTypeFilter}
                  onChange={(e) => setBookingTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="hotel">Hotels</option>
                  <option value="flight">Flights</option>
                </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>
              
              {/* Sort By */}
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>Sort By</Text>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="price-asc">Price (Low to High)</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>
              
              {/* Results Count */}
              <Box>
                <Text fontSize="sm" color="gray.600">
                  {filteredBookings.length} of {bookings.length} bookings
                </Text>
              </Box>
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Error Display */}
        {error && (
          <Alert.Root status="error" borderRadius="md" mb={6}>
            <Alert.Indicator />
            <Box>
              <Alert.Title>Error Loading Bookings</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Box>
          </Alert.Root>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card.Root bg='gray.50' boxShadow="sm">
            <Card.Body>
              <VStack spacing={4} py={10} textAlign="center">
                <Icon as={FiCalendar} boxSize={12} color="gray.400" />
                <Heading size="md" color="gray.600">
                  {searchTerm || statusFilter !== 'all' || bookingTypeFilter !== 'all' ? 'No matching bookings found' : 'No bookings yet'}
                </Heading>
                <Text color="gray.500">
                  {searchTerm || statusFilter !== 'all' || bookingTypeFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Start planning your next trip!'}
                </Text>
                {(!searchTerm && statusFilter === 'all' && bookingTypeFilter === 'all') && (
                  <Button colorScheme="blue" onClick={() => router.push('/')}>
                    Browse Travel Options
                  </Button>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        ) : (
          <VStack spacing={4} align="stretch">
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const bookingTypeConfig = getBookingTypeConfig(booking.booking_type);
              const paymentMethodConfig = getPaymentMethodConfig(booking.payment_method);
              const paymentTypeConfig = getPaymentTypeConfig(booking.payment_type);
              const BookingIcon = getBookingIcon(booking);
              const StatusIcon = statusConfig.icon;
              const daysUntilEvent = getDaysUntilEvent(booking.check_in || booking.departure_date);
              
              return (
                <Card.Root
                  key={booking.booking_id} 
                  bg='gray.50'
                  boxShadow="sm" 
                  borderLeft="4px" 
                  borderLeftColor={`${statusConfig.color}.500`}
                  _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr', md: 'auto 2fr 1fr auto' }} gap={6} alignItems="center">
                      {/* Booking Icon */}
                      <Box>
                        <Flex
                          w="80px"
                          h="80px"
                          bg={`${bookingTypeConfig.color}.50`}
                          border={`2px solid`}
                          borderColor={`${bookingTypeConfig.color}.200`}
                          alignItems="center"
                          justifyContent="center"
                          borderRadius="lg"
                        >
                          <Icon as={BookingIcon} boxSize={8} color={`${bookingTypeConfig.color}.600`} />
                        </Flex>
                      </Box>
                      
                      {/* Booking Info */}
                      <VStack align="start" spacing={3}>
                        <HStack spacing={3} flexWrap="wrap">
                          <Badge 
                            colorScheme={statusConfig.color} 
                            px={3} 
                            py={1} 
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <StatusIcon />
                            <Text>{statusConfig.text}</Text>
                          </Badge>
                          
                          <Badge 
                            colorScheme={bookingTypeConfig.color} 
                            px={3} 
                            py={1} 
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <bookingTypeConfig.icon />
                            <Text>{bookingTypeConfig.text}</Text>
                          </Badge>
                          
                          {daysUntilEvent > 0 && daysUntilEvent <= 7 && (
                            <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                              <HStack spacing={1}>
                                <FiClock />
                                <Text>
                                  {booking.booking_type === 'hotel' ? 'Check-in' : 'Departure'} in {daysUntilEvent} days
                                </Text>
                              </HStack>
                            </Badge>
                          )}
                        </HStack>
                        
                        <Box>
                          <Heading size="md" mb={1}>
                            {booking.booking_type === 'hotel' 
                              ? booking.hotel_name 
                              : booking.booking_type === 'flight'
                                ? `Flight ${booking.flight_number}`
                                : `Booking ${booking.reference}`
                            }
                          </Heading>
                          
                          <Text color="gray.600" fontSize="sm" mb={2}>
                            {getBookingSummary(booking)}
                          </Text>
                          
                          <HStack spacing={4} color="gray.600" fontSize="sm" flexWrap="wrap">
                            {booking.booking_type === 'hotel' && (
                              <HStack spacing={1}>
                                <FiCalendar />
                                <Text>
                                  {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                                </Text>
                              </HStack>
                            )}
                            
                            {booking.booking_type === 'flight' && (
                              <HStack spacing={1}>
                                <FiCalendar />
                                <Text>{formatDateTime(booking.departure_date)}</Text>
                              </HStack>
                            )}
                            
                            <HStack spacing={1}>
                              <FiUser />
                              <Text>{booking.firstname} {booking.lastname}</Text>
                            </HStack>
                          </HStack>
                        </Box>
                        
                        <HStack spacing={4} fontSize="sm">
                          <Text color="gray.500">
                            Ref: <Text as="span" fontFamily="mono">{booking.reference}</Text>
                          </Text>
                          <Text color="gray.500">
                            Booked: {formatDate(booking.date)}
                          </Text>
                        </HStack>
                      </VStack>
                      
                      {/* Payment & Price Info */}
                      <VStack align="start" spacing={3}>
                        <Text fontWeight="bold" fontSize="xl" color="green.600">
                          {formatCurrency(booking.total_amount, booking.currency)}
                        </Text>
                        
                        <HStack spacing={2} flexWrap="wrap">
                          <Tag.Root size="sm" colorScheme={paymentMethodConfig.color} variant="subtle">
                            <Tag.StartElement>{paymentMethodConfig.icon}</Tag.StartElement>
                            <Tag.Label>{paymentMethodConfig.text}</Tag.Label>
                          </Tag.Root>

                          <Tag.Root size="sm" colorScheme={paymentTypeConfig.color} variant="subtle">
                            <Tag.Label>{paymentTypeConfig.text}</Tag.Label>
                          </Tag.Root>
                        </HStack>
                      </VStack>
                      
                      {/* Actions */}
                      <HStack spacing={2}>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={(e) => {
                            handleViewDetails(booking);
                          }}
                        >
                          Details
                        </Button>
                        
                        {/*<Menu.Root>
                          <Menu.Trigger asChild>
                            <Button variant="ghost" size="sm">
                              <FiMoreVertical /> Actions
                            </Button>
                          </Menu.Trigger>
                          <Menu.Content onClick={(e) => e.stopPropagation()}>
                            <Menu.Item icon={<FiEye />} onClick={() => handleBookingAction('view', booking)}>
                              View Details
                            </Menu.Item>
                            <Menu.Item icon={<FiDownload />} onClick={() => handleBookingAction('download', booking)}>
                              Download Invoice
                            </Menu.Item>
                            {booking.status === 'confirmed' && (
                              <Menu.Item icon={<FiCalendar />} onClick={() => handleBookingAction('modify', booking)}>
                                Modify Booking
                              </Menu.Item>
                            )}
                            {booking.status === 'confirmed' && (
                              <Menu.Item icon={<FiXCircle />} onClick={() => handleBookingAction('cancel', booking)}>
                                Cancel Booking
                              </Menu.Item>
                            )}
                            <Menu.Item icon={<FiMail />} onClick={() => alert(`Email sent to ${booking.email}`)}>
                              Resend Confirmation
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Root>*/}
                      </HStack>
                    </Grid>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </VStack>
        )}

        {/* Quick Actions Bar 
        {filteredBookings.length > 0 && (
          <Card.Root bg='gray.50' boxShadow="sm" mt={6}>
            <Card.Body>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <Text color="gray.600">Quick Actions:</Text>
                <HStack spacing={3}>
                  <Button size="sm" leftIcon={<FiDownload />} variant="outline">
                    Export All
                  </Button>
                  <Button size="sm" leftIcon={<FiPrinter />} variant="outline">
                    Print Summary
                  </Button>
                  <Button size="sm" leftIcon={<FiMail />} variant="outline">
                    Email All
                  </Button>
                </HStack>
              </Flex>
            </Card.Body>
          </Card.Root>
        )}
        */}

        {/* Cancellation Modal */}
        <Drawer.Root open={cancelOpen} onOpenChange={(e) => setCancelOpen(e.open)}>
          <Drawer.Backdrop />
          <Drawer.Content>
            <Drawer.Header>Cancel Booking</Drawer.Header>
            <Drawer.Body>
              {selectedBooking && (
                <VStack spacing={4} align="stretch">
                  <Text>
                    Are you sure you want to cancel booking{' '}
                    <Text as="span" fontWeight="bold">
                      {selectedBooking.reference}
                    </Text>?
                  </Text>
                  
                  <Alert.Root status="warning" borderRadius="md">
                    <Alert.Indicator />
                    <Box>
                      <Text fontWeight="bold">Cancellation Policy:</Text>
                      <Text fontSize="sm">
                        Cancellation fees may apply based on the provider's policy.
                      </Text>
                      <Text fontSize="sm" mt={1}>
                        Total amount: {formatCurrency(selectedBooking.total_amount, selectedBooking.currency)}
                      </Text>
                    </Box>
                  </Alert.Root>
                </VStack>
              )}
            </Drawer.Body>
            
            <Drawer.Footer>
              <Button variant="ghost" mr={3} onClick={(e) => setCancelOpen(false)}>
                Keep Booking
              </Button>
              <Button colorScheme="red" onClick={handleCancelBooking}>
                Cancel Booking
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Root>

        {/* Help Section */}
        <Card.Root bg='gray.50' boxShadow="sm" mt={8}>
          <Card.Header>
            <Heading size="md">Need Help with Your Bookings?</Heading>
          </Card.Header>
          <Card.Body>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <VStack align="start" spacing={3}>
                <Heading size="sm">Modifying Bookings</Heading>
                <Text fontSize="sm" color="gray.600">
                  Need to change dates, flights, or hotel rooms? Contact our support team for modifications.
                </Text>
                <Button size="sm" colorScheme="blue" variant="outline">
                  Request Modification
                </Button>
              </VStack>
              
              <VStack align="start" spacing={3}>
                <Heading size="sm">Payment Issues</Heading>
                <Text fontSize="sm" color="gray.600">
                  Having trouble with payments? Check your payment history or contact support.
                </Text>
                <Link href="/payment-history" color="blue.500" fontSize="sm">
                  View Payment History →
                </Link>
              </VStack>
              
              <VStack align="start" spacing={3}>
                <Heading size="sm">24/7 Support</Heading>
                <Text fontSize="sm" color="gray.600">
                  Our customer support team is available 24/7 to assist with any booking-related queries.
                </Text>
                <Button size="sm" colorScheme="green">
                  Contact Support
                </Button>
              </VStack>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
}