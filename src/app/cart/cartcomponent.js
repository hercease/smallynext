// pages/cart.js
'use client'
import React, { useEffect, useState, useCallback, useRef, use } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  HStack,
  Image,
  Badge,
  IconButton,
  Card,
  Stack,
  Spinner,
  Divider,
  SimpleGrid,
  Progress,
  Dialog, Portal, CloseButton
} from '@chakra-ui/react';
import { FiTrash2, FiShoppingCart, FiCreditCard, FiArrowLeft, FiCalendar, FiUsers, FiHome, FiDollarSign, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from 'next/navigation';

const CartPage = (user) => {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const timersRef = useRef({});
  const [OpenDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // ========== UTILITY FUNCTIONS (No dependencies) ==========
  
  // Calculate nights between dates
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format cancellation policy
  const formatCancellationPolicy = (policy) => {
    if (policy.description) return policy.description;
    
    if (policy.amount === '0') {
      return `Free cancellation until ${new Date(policy.from).toLocaleDateString()}`;
    } else {
      return `Cancellation fee: ${policy.currency || 'EUR'}${policy.amount} after ${new Date(policy.from).toLocaleDateString()}`;
    }
  };

  // Format duration for display
  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Format time for display
  const formatTimeDisplay = (timeData) => {
    if (!timeData || timeData.expired || timeData.total <= 0) {
      return "Expired";
    }
    
    if (timeData.hours > 0) {
      return `${timeData.hours.toString().padStart(2, '0')}:${timeData.minutes.toString().padStart(2, '0')}:${timeData.seconds.toString().padStart(2, '0')}`;
    }
    
    return `${timeData.minutes.toString().padStart(2, '0')}:${timeData.seconds.toString().padStart(2, '0')}`;
  };

  // Get color based on time remaining
  const getTimeColor = (timeData) => {
    if (!timeData || timeData.expired || timeData.total <= 0) return "red.500";
    if (timeData.minutes < 5) return "red.500";
    if (timeData.minutes < 10) return "orange.500";
    return "green.500";
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    return (item.price * item.rooms * item.nights).toFixed(2);
  };

  // Calculate cart total
  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.price * item.rooms * item.nights);
    }, 0);
  };

  // Calculate time remaining until expiration
  const calculateTimeRemaining = (addedAt, expiresAt) => {
    try {
      const now = new Date().getTime();
      const addedTime = new Date(addedAt).getTime();
      const expireTime = new Date(expiresAt).getTime();
      
      // Calculate total reservation time (from added to expired)
      const totalReservationTime = expireTime - addedTime;
      const timeRemaining = expireTime - now;
      
      if (timeRemaining <= 0) {
        return {
          total: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          percentage: 100,
          expired: true
        };
      }
      
      const totalSeconds = Math.floor(timeRemaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // Calculate percentage based on actual total reservation time
      let percentage = 0;
      if (totalReservationTime > 0) {
        const elapsedTime = totalReservationTime - timeRemaining;
        percentage = Math.max(0, Math.min(100, (elapsedTime / totalReservationTime) * 100));
      } else {
        // Fallback to time-based percentage if total time is invalid
        percentage = Math.max(0, Math.min(100, (timeRemaining / (15 * 60 * 1000)) * 100));
      }
      
      return {
        total: timeRemaining,
        hours,
        minutes,
        seconds,
        percentage: Math.round(percentage),
        expired: false
      };
    } catch (error) {
      console.error('Error calculating time remaining:', error, 'addedAt:', addedAt, 'expiresAt:', expiresAt);
      return {
        total: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        percentage: 0,
        expired: true
      };
    }
  };

  // ========== EVENT HANDLERS (Can depend on utilities) ==========

  // Get session ID for guest users
  const getSessionId = useCallback(async () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      router.back();
    }
    return sessionId;
  }, [router]);

  // Calculate total reservation duration for display
  const getTotalReservationDuration = (item) => {
    if (!item.addedAt || !item.expiresAt) return null;
    
    try {
      const addedTime = new Date(item.addedAt).getTime();
      const expireTime = new Date(item.expiresAt).getTime();
      const totalTime = expireTime - addedTime;
      
      if (totalTime > 0) {
        return formatDuration(totalTime);
      }
    } catch (error) {
      console.error('Error calculating total duration:', error);
    }
    return null;
  };

  // Fetch cart items from backend
  const fetchCartItems = useCallback(async () => {
    const formData = new FormData();
    const sessionId = await getSessionId(); // Add await here
    formData.append('session_id', sessionId);
    formData.append('user_id', user.user);
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const result = await response.json();

      console.log('Fetch cart result:', result);
      
      if (result.success) {
        const cartItems = result.cart_items.map(item => ({
          id: item.id,
          cart_id: item.cart_item_id,
          name: item.room_data?.name,
          code: item.room_data?.code || '',
          roomBoardName: item.rate_data?.boardName,
          price: parseFloat(item.rate_data?.net) || 0,
          currency: item.rate_data?.currency || 'EUR',
          checkIn: item.booking_details?.checkIn,
          checkOut: item.booking_details?.checkOut,
          nights: calculateNights(item.booking_details?.checkIn, item.booking_details?.checkOut),
          guests: item.booking_details?.roomDetails || [],
          rooms: parseInt(item.booking_details?.rooms) || 1,
          cancellationPolicies: item.rate_data?.cancellationPolicies || [],
          taxes: item.rate_data?.taxes || [],
          image: item.room_data?.images?.[0]?.path
            ? `http://photos.hotelbeds.com/giata/${item.room_data.images[0].path}`
            : null,
          addedAt: item.added_at,
          expiresAt: item.expires_at,
        }));
        
        const total = cartItems.reduce((total, item) => {
          return total + (item.price * item.rooms * item.nights);
        }, 0);
        
        setCart({items: cartItems, total});
      } else {
        setCart({ items: [], total: 0 });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user.user, getSessionId]);

  
  // Remove item from cart
  const removeFromCart = useCallback(async (itemId) => {
    const formData = new FormData();
    formData.append('cart_id', itemId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/remove-cart-item`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to remove cart item');
      }
      const result = await response.json();
      console.log('Remove result:', result);
      if (result.success) {
        // Clean up timer
        if (timersRef.current[itemId]) {
          clearInterval(timersRef.current[itemId]);
          delete timersRef.current[itemId];
        }
        
        // Remove from countdowns state
        setCountdowns(prev => {
          const newCountdowns = { ...prev };
          delete newCountdowns[itemId];
          return newCountdowns;
        });
        
         //Refresh the page
        fetchCartItems();
      } else {
       fetchCartItems();
      }
    }
    catch (error) {
      console.error('Error removing cart item:', error);
    }
  }, [fetchCartItems]);

  // Remove expired item from cart
  const removeExpiredItem = useCallback(async (itemId) => {
    try {
      await removeFromCart(itemId);
      console.log(`Item ${itemId} removed due to expiration`);
    } catch (error) {
      console.error('Error removing expired item:', error);
    }
  }, [removeFromCart]); // Empty dependency initially, will be updated

  // Start countdown timer for an item
  const startCountdownTimer = useCallback((itemId, addedAt, expiresAt) => {
    console.log('Starting timer for item:', itemId, addedAt, expiresAt);
    // Clear existing timer if any
    if (timersRef.current[itemId]) {
      clearInterval(timersRef.current[itemId]);
    }

    const timer = setInterval(() => {
      setCountdowns(prev => {
        const newTime = calculateTimeRemaining(addedAt, expiresAt);
        console.log('New time:', newTime);
        // If time is up, clear the interval and remove item
        if (newTime.total <= 0 || newTime.expired) {
          clearInterval(timer);
          delete timersRef.current[itemId];
          // Automatically remove the item from cart
          removeExpiredItem(itemId);
          return { ...prev, [itemId]: newTime };
        }
        
        return { ...prev, [itemId]: newTime };
      });
    }, 1000);

    timersRef.current[itemId] = timer;
    return timer;
  }, [removeExpiredItem]);

  // Initialize countdown timers for all items
  const initializeCountdowns = useCallback(() => {
    if (!cart || !cart.items.length) return;
    const initialCountdowns = {};

    // Clean up existing timers
    Object.values(timersRef.current).forEach(timer => {
      if (timer) clearInterval(timer);
    });
    timersRef.current = {};
    
    cart.items.forEach(item => {
      if (item.addedAt && item.expiresAt) {
        initialCountdowns[item.id] = calculateTimeRemaining(item.addedAt, item.expiresAt);
      }
    });
    
    setCountdowns(initialCountdowns);
    
    // Start timers for each item
    cart.items.forEach(item => {
      if (item.addedAt && item.expiresAt && item.id) {
        startCountdownTimer(item.id, item.addedAt, item.expiresAt);
      }
    });
  }, [startCountdownTimer, cart]);

  // ========== API FUNCTIONS (Can depend on everything above) ==========

  

  // ========== EFFECTS AND HANDLERS (Depends on everything) ==========

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, []);

  // Refresh cart on component mount
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems, user.user]);

  useEffect(() => {
    initializeCountdowns();
  }, [cart, initializeCountdowns]);

  // ========== EVENT HANDLERS ==========

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleCheckout = async (item) => {
    console.log('Checkout item:', item);
  };

  const handleDeleteConfirmation = (itemId) => {
    setSelectedItemId(itemId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      await handleRemoveItem(selectedItemId);
      setOpenDialog(false);
      setSelectedItemId(null);
    }
  };

  // ========== RENDER LOGIC ==========

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} textAlign="center" py={20}>
            <Spinner size="xl" color="blue.500" />
            <Heading size="lg">Loading your cart...</Heading>
            <Text color="gray.600">Please wait while we fetch your cart items</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} textAlign="center" py={20}>
            <Box fontSize="6xl" color="gray.400">🛒</Box>
            <Heading size="xl" color="gray.700">Your Cart is Empty</Heading>
            <Text fontSize="lg" color="gray.600" maxW="md">
              Looks like you haven{`'`}t added any room rates to your cart yet. Start exploring our amazing accommodations!
            </Text>
            <Link href="/" passHref>
              <Button leftIcon={<FiArrowLeft />} colorScheme="blue" size="lg" mt={4}>
                Start Booking Now
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Page Header */}
          <Box>
            <Flex justify="space-between" align="center" mb={2}>
              <HStack spacing={3}>
                <FiShoppingCart size={28} color="#3182CE" />
                <Heading size="xl" color="gray.800">Your Booking Cart</Heading>
              </HStack>
              <Badge colorScheme="blue" fontSize="lg" px={3} py={1} borderRadius="full">
                {cart.items.length} item{cart.items.length > 1 ? 's' : ''}
              </Badge>
            </Flex>
            <Text color="gray.600" fontSize="lg">
              Review your selected room rates and proceed to checkout
            </Text>
          </Box>

          {/* Cart Items Grid */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {cart.items.map((item) => {
              const timeData = countdowns[item.id];
              const isExpired = timeData && (timeData.expired || timeData.total <= 0);
              const totalDuration = getTotalReservationDuration(item);
              
              return (
                <Card.Root key={item.id} variant="outline" boxShadow="md" borderRadius="xl">
                  <Card.Body p={6}>
                    <VStack spacing={4} align="stretch">
                      
                      {/* Row 1: Countdown Timer */}
                      {item.addedAt && item.expiresAt && (
                        <Box mb={2}>
                          <VStack spacing={2} align="stretch">
                            <Flex justify="space-between" align="center">
                              <VStack align="start" spacing={1}>
                                <HStack spacing={2}>
                                  <FiClock color="#4A5568" />
                                  <Text fontWeight="semibold" color="gray.700">
                                    Reservation Time Remaining
                                  </Text>
                                </HStack>
                                {totalDuration && (
                                  <Text fontSize="xs" color="gray.500">
                                    Total hold time: {totalDuration}
                                  </Text>
                                )}
                              </VStack>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={getTimeColor(timeData)}
                              >
                                {timeData ? formatTimeDisplay(timeData) : "Calculating..."}
                              </Text>
                            </Flex>
                            
                            {isExpired && (
                              <Badge colorScheme="red" alignSelf="flex-start">
                                Expired - This item will be removed shortly
                              </Badge>
                            )}
                            
                          </VStack>
                        </Box>
                      )}

                      {/* Row 2: Image, Name and Board Section */}
                      <Flex gap={4} align="start">
                        {/* Room Image */}
                        <Box flexShrink={0}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            boxSize="100px"
                            objectFit="cover"
                            borderRadius="lg"
                            fallback={
                              <Box
                                boxSize="100px"
                                bg="gray.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                borderRadius="lg"
                              >
                                <Text color="gray.500" fontSize="sm">No Image</Text>
                              </Box>
                            }
                          />
                        </Box>

                        {/* Room Info */}
                        <Box flex={1}>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="lg" fontWeight="bold" color="gray.900" lineHeight="1.2">
                              {item.name}
                            </Text>
                            <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
                              {item.roomBoardName}
                            </Badge>
                            <Text fontSize="2xl" fontWeight="bold" color="green.600">
                              {item.currency} {item.price}
                            </Text>
                          </VStack>
                        </Box>
                      </Flex>

                      {/* Row 3: Date and Stay Section */}
                      <Box>
                        <HStack spacing={2} mb={2}>
                          <FiCalendar color="#4A5568" />
                          <Text fontWeight="semibold" color="gray.700">Stay Duration</Text>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(item.checkIn)} → {formatDate(item.checkOut)}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {item.nights} night{item.nights > 1 ? 's' : ''} • {item.rooms} room{item.rooms > 1 ? 's' : ''}
                          </Text>
                        </VStack>
                      </Box>

                      {/* Row 4: Guests Section */}
                      <Box>
                        <HStack spacing={2} mb={2}>
                          <FiUsers color="#4A5568" />
                          <Text fontWeight="semibold" color="gray.700">Room Occupancy</Text>
                        </HStack>
                        <VStack spacing={3} align="stretch" width="100%">
                          {item.guests.map((room, index) => (
                            <Box 
                              key={index} 
                              p={3} 
                              bg="gray.50"
                              borderRadius="md" 
                              borderLeft="4px solid"
                              borderLeftColor="blue.500"
                            >
                              <Flex justify="space-between" align="start">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold" fontSize="sm">
                                    Room {room.roomNumber}
                                  </Text>
                                  <Text fontSize="sm">
                                    {room.adults} adult{room.adults > 1 ? 's' : ''}
                                    {room.children > 0 && `, ${room.children} child${room.children > 1 ? 'ren' : ''}`}
                                  </Text>
                                  {room.children > 0 && room.childAges && room.childAges.length > 0 && (
                                    <Text fontSize="xs" color="gray.600">
                                      Child ages: {room.childAges.join(', ')}
                                    </Text>
                                  )}
                                </VStack>
                                <Badge colorScheme="blue" variant="subtle">
                                  {room.adults + room.children} guest{room.adults + room.children > 1 ? 's' : ''}
                                </Badge>
                              </Flex>
                            </Box>
                          ))}
                        </VStack>
                      </Box>

                      {/* Row 5: Cancellation Policy Section */}
                      {item.cancellationPolicies.length > 0 && (
                        <Box>
                          <HStack spacing={2} mb={2}>
                            <FiHome color="#4A5568" />
                            <Text fontWeight="semibold" color="gray.700">Cancellation Policy</Text>
                          </HStack>
                          <VStack align="start" spacing={2}>
                            {item.cancellationPolicies.map((policy, index) => (
                              <Box key={index} width="full">
                                <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                                  • {formatCancellationPolicy(policy)}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {/* Row 6: Taxes Section */}
                      {item.taxes && item.taxes.taxes && item.taxes.taxes.length > 0 && (
                        <Box>
                          <HStack spacing={2} mb={2}>
                            <FiDollarSign color="#4A5568" />
                            <Text fontWeight="semibold" color="gray.700">Additional Taxes & Fees</Text>
                          </HStack>
                          <VStack align="start" spacing={2}>
                            {item.taxes.taxes
                              .filter(tax => tax.included === false)
                              .map((tax, index) => (
                                <Box key={index} width="full">
                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="sm" color="gray.600">
                                      {tax.type || tax.description || 'Tax'}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                      {tax.currency || item.currency} {tax.amount || tax.clientAmount}
                                    </Text>
                                  </Flex>
                                  <Text fontSize="xs" color="orange.600">
                                    Pay at hotel
                                  </Text>
                                </Box>
                              ))
                            }
                          </VStack>
                        </Box>
                      )}

                      {/* Row 7: Action Buttons */}
                      <Flex justify="space-between" align="center" gap={4}>
                        <Button
                          leftIcon={<FiCreditCard />}
                          colorScheme="blue"
                          flex={1}
                          onClick={() => router.push('/checkout' + `?id=${item.id}`)}
                          isDisabled={isExpired}
                        >
                          {isExpired ? 'Reservation Expired' : 'Checkout This Stay'}
                        </Button>
                        <IconButton
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleDeleteConfirmation(item.id)}
                          aria-label="Remove from cart"
                        >
                          <FiTrash2 />
                        </IconButton>
                      </Flex>

                    </VStack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </SimpleGrid>

           <Dialog.Root lazyMount open={OpenDialog} placement="center" closeOnInteractOutside={false} onOpenChange={(e) => setOpenDialog(e.open)}>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete Confirmation</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  Are you sure you want to delete this item from your cart?
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline">No</Button>
                  </Dialog.ActionTrigger>
                  <Button onClick={() => handleConfirmDelete()}>Yes</Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

          {/* Continue Shopping Button */}
          <Box textAlign="center" pt={4}>
            <Link href="/hotels" passHref>
              <Button leftIcon={<FiArrowLeft />} variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </Box>
        </VStack>
      </Container>
      </>
  );
};

export default CartPage;