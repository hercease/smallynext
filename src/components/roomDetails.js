import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Dialog,
  Grid,
  GridItem,
  Box,
  Image,
  Text,
  Heading,
  Button,
  Badge,
  Flex,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Tag,
  Wrap,
  AspectRatio,
  Card,
  Stack,
  useBreakpointValue,
  IconButton,
  CloseButton,
  Portal,
  Table
} from '@chakra-ui/react';
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiCreditCard,
  FiStar,
  FiWifi,
  FiCoffee,
  FiHome,
  FiWind,
  FiUsers,
  FiSquare,
  FiHeart,
  FiShare2,
  FiAlertTriangle, FiDollarSign, FiCalendar
} from 'react-icons/fi';
import { getAmenityIcon } from "@/components/amenitiesfunction";
import { formatCancellationDate, formatDateShort, formatRelativeTime } from '@/components/dateFormatter';
import { toaster } from "@/components/ui/toaster"

const RoomDetailsModals = ({ isOpen, onClose, room, user}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedRateIndex, setSelectedRateIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedRateForCart, setSelectedRateForCart] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const imageUrl = "http://photos.hotelbeds.com/giata/";
  const params = useSearchParams();
  const router = useRouter();


  const fetchRateComments = useCallback(async () => {
      if (!room?.rates) return;
      
      setLoadingComments(true);
      try {
        const roomKeys = room?.rates
          .map(rate => rate.rateKey)
          .filter(code => code)
          .join(',');
        
        if (!roomKeys) {
          return;
        }
  
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: new URLSearchParams({
            ratekeys: roomKeys
          }).toString(),
        });

        const data = await response.json();
        //console.log("rate Comments", data);
        
      } catch (error) {
        console.error('Error fetching rate comments:', error);
      } finally {
        setLoadingComments(false);
      }
    }, [room]);

    /*useEffect(() => {
      fetchRateComments();
    }, [room, fetchRateComments]);*/

  const isMobile = useBreakpointValue({ base: true, md: false });
  const roomData = room;

  const parseRoomDataFromURL = () => {
    const rooms = [];
    const totalRooms = parseInt(params.get('rooms')) || 1;
    
    for (let i = 1; i <= totalRooms; i++) {
      const room = {
        roomNumber: i,
        adults: parseInt(params.get(`room${i}_adults`)) || 1,
        children: parseInt(params.get(`room${i}_children`)) || 0,
        childAges: params.get(`room${i}_child_ages`) ? 
                  params.get(`room${i}_child_ages`).split(',').map(age => parseInt(age)) : []
      };
      rooms.push(room);
    }
    
    return rooms;
  };

  // Session management for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  const handleAddToCart = async (rate) => {
    setIsAddingToCart(true);
    
    try {
      const roomDataFromURL = parseRoomDataFromURL();
      
      // Prepare cart data
      const cartData = {
        room: {
          name: roomData?.name,
          code: roomData?.code,
          images: roomData?.images,
          facilities: roomData?.facilities,
        },
        rate: {
          boardName: rate.boardName,
          rateKey: rate.rateKey,
          net: rate.net,
          currency: rate.currency,
          cancellationPolicies: rate.cancellationPolicies,
          taxes: rate.taxes,
          rateType: rate.rateType,
        },
        bookingDetails: {
          checkIn: params.get('checkIn'),
          checkOut: params.get('checkOut'),
          rooms: params.get('rooms'),
          roomDetails: roomDataFromURL,
        },
      };

      // Always use backend - it handles both guest and authenticated users
      const result = await addToCartBackend(cartData);

      if (!result.success) {
          toaster.create({
            title: 'Already in Cart',
            description: `${roomData?.name} is already in your cart`,
            type: 'warning',
            duration: 10000,
          });
          return;
      }

      // Show success toast
      toaster.create({
        title: result.is_new_item ? 'Added to Cart!' : 'Cart Exists!',
        description: `${roomData?.name} - ${rate.boardName} ${result.is_new_item ? 'has been added to' : 'already exists in'} your cart`,
        type: `${result.is_new_item ? 'success' : 'warning'}`,
        action: {
          label: "View Cart",
          onClick: () => router.push('/cart'),
        },
        duration: 5000,
      });

      // Close the confirmation modal
      setIsAddToCartModalOpen(false);
      
      // Dispatch cart update event for other components
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const addToCartBackend = async (cartData) => {
    const formData = new FormData();
    
    // Append all cart data
    formData.append('cartItemId', cartData.rate.rateKey);
    formData.append('roomData', JSON.stringify(cartData.room));
    formData.append('rateData', JSON.stringify(cartData.rate));
    formData.append('bookingDetails', JSON.stringify(cartData.bookingDetails));
    formData.append('session_id', getSessionId());
    formData.append('user_id', user.user);
    formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add-room-to-cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  // Rest of your component code remains the same...
  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === roomData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? roomData.images.length - 1 : prev - 1
    );
  };

  const ImageGallery = () => (
    <Box position="relative" height="100%">
      {/* Main Image */}
      <AspectRatio ratio={16 / 9} height="400px" cursor="pointer" onClick={() => setImageModalOpen(true)}>
        <Image
          src={`${imageUrl}${roomData?.images[selectedImageIndex]?.path}`}
          alt={roomData?.name}
          objectFit="cover"
          borderRadius="lg"
          fallback={
            <Box
              bg="gray.100"
              height="400px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
            >
              <Box textAlign="center">
                <Text fontSize="4xl" mb={2}>🏨</Text>
                <Text color="gray.600" fontSize="sm">
                  {roomData?.name}
                </Text>
                <Text color="gray.700" fontSize="xs" mt={1}>
                  Image not available
                </Text>
              </Box>
            </Box>
          }
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </AspectRatio>

      {/* Navigation Arrows */}
      <IconButton
        position="absolute"
        left={4}
        top="50%"
        transform="translateY(-50%)"
        aria-label="Previous image"
        onClick={prevImage}
        variant="solid"
        bg="blackAlpha.600"
        color="white"
        _hover={{ bg: 'blackAlpha.800' }}
      >
        <FiChevronLeft />
      </IconButton>
      <IconButton
        position="absolute"
        right={4}
        top="50%"
        transform="translateY(-50%)"
        aria-label="Next image"
        onClick={nextImage}
        variant="solid"
        bg="blackAlpha.600"
        color="white"
        _hover={{ bg: 'blackAlpha.800' }}
      >
        <FiChevronRight />
      </IconButton>

      {/* Image Counter */}
      <Box
        position="absolute"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        bg="blackAlpha.600"
        color="white"
        px={3}
        py={1}
        borderRadius="full"
        fontSize="sm"
      >
        {selectedImageIndex + 1} / {roomData?.images.length}
      </Box>

      {/* Thumbnails */}
      <SimpleGrid columns={4} spacing={2} mt={4}>
        {roomData?.images.map((image, index) => (
          <AspectRatio ratio={4 / 3} key={index}>
            <Image
              src={`${imageUrl}${image.path}`}
              alt={`${roomData?.name} ${index + 1}`}
              objectFit="cover"
              borderRadius="md"
              cursor="pointer"
              border={selectedImageIndex === index ? "3px solid" : "1px solid"}
              borderColor={selectedImageIndex === index ? "blue.500" : "gray.200"}
              onClick={() => setSelectedImageIndex(index)}
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.05)' }}
            />
          </AspectRatio>
        ))}
      </SimpleGrid>
    </Box>
  );

  const FacilitiesSection = () => (
    <Box>
      <Heading size="lg" mb={4}>Facilities</Heading>
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        {roomData?.facilities?.map((facility, index) => (
          <Flex key={index} align="center" gap={3} p={3} bg="gray.50" borderRadius="md">
            <Icon as={getAmenityIcon(facility.description) || FiCheck} boxSize={5} color="blue.500" />
            <Text fontSize="sm" fontWeight="medium">{facility.description}</Text>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  );

  const RatesSection = () => (
    <Box>
      <Heading size="lg" mb={4}>Available Rates</Heading>
      <VStack spacing={4} align="stretch">
        {roomData?.rates.map((rate, index) => (
          <Card.Root
            key={index} 
            variant="outline" 
            border={selectedRateIndex === index ? "2px solid" : "1px solid"}
            borderColor={selectedRateIndex === index ? "blue.500" : "gray.200"}
            cursor="pointer"
            onClick={() => setSelectedRateIndex(index)}
            transition="all 0.2s"
            _hover={{ borderColor: 'blue.300' }}
          >
            <Card.Body>
              <Stack spacing={4}>
                {/* Rate Header */}
                <Flex justify="space-between" align="start">
                  <Box>
                    <Heading size="md" color="blue.600" mb={1}>
                      {rate.boardName}
                    </Heading>
                  </Box>
                  <Box textAlign="right">
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      EUR{rate.net}
                    </Text>
                    <Text fontSize="sm" color="gray.600"></Text>
                  </Box>
                </Flex>

                {/* Cancellation Policy */}
                {rate?.cancellationPolicies?.length > 0 && <Box p={3} bg="green.50" borderRadius="md">
                    {rate?.cancellationPolicies?.map( (policy, index) => (
                      <Flex key={index} align="center" gap={2}>
                        <Icon as={FiCheck} color="green.500" />
                        <Text fontSize="sm" color="green.700">
                          Free cancellation until {formatCancellationDate(policy.from)} (EUR{policy.amount} penalty applies after)
                        </Text>
                      </Flex>
                    ))}
                </Box>}

                {/* Taxes */}
                {
                rate?.taxes?.taxes?.length > 0 && <TaxesSection taxes={rate?.taxes?.taxes} />
                }

                {/* Add to Cart Button */}
                <Button 
                  colorScheme="blue" 
                  size="lg" 
                  width="full"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    openAddToCartConfirmation(rate);
                  }}
                >
                  {rate.rateType=='BOOKABLE' ? 'Add to Cart' : 'Add to Cart'}
                </Button>
              </Stack>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
    </Box>
  );

  const ImageModal = () => (
    <Dialog.Root open={imageModalOpen} size="full">
      <Dialog.Backdrop />
      <Dialog.Positioner>
      <Dialog.Content bg="black">
          <Flex justify="space-between" align="center" p={6}>
            <Text fontSize="md" color="white">
              {roomData?.name} - {selectedImageIndex + 1} of {roomData?.images.length}
            </Text>
              <IconButton
                aria-label="Close"
                onClick={() => setImageModalOpen(false)}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                <FiX />
              </IconButton>
          </Flex>
        <Dialog.Body position="relative" display="flex" alignItems="center" justifyContent="center">
          <Image
            src={`${imageUrl}${roomData?.images[selectedImageIndex]?.path}`}
            alt={roomData?.name}
            objectFit="contain"
            maxH="80vh"
            maxW="100%"
            fallback={
              <Box
                bg="gray.100"
                height="400px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="md"
              >
                <Box textAlign="center">
                  <Text fontSize="4xl" mb={2}>🏨</Text>
                  <Text color="gray.600" fontSize="sm">
                    {roomData?.name}
                  </Text>
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    Image not available
                  </Text>
                </Box>
              </Box>
            }
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          
          {/* Navigation Arrows */}
          <IconButton
            position="absolute"
            left={4}
            top="50%"
            transform="translateY(-50%)"
            aria-label="Previous image"
            onClick={prevImage}
            variant="solid"
            bg="blackAlpha.600"
            color="white"
            _hover={{ bg: 'blackAlpha.800' }}
          >
            <FiChevronLeft />
          </IconButton>
          <IconButton
            position="absolute"
            right={4}
            top="50%"
            transform="translateY(-50%)"
            aria-label="Next image"
            onClick={nextImage}
            variant="solid"
            bg="blackAlpha.600"
            color="white"
            _hover={{ bg: 'blackAlpha.800' }}
          >
            <FiChevronRight />
          </IconButton>
        </Dialog.Body>
      </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );

  const TaxesSection = ({ taxes = [] }) => {
    const excludedTaxes = taxes.filter(tax => tax.included === false);

    if (excludedTaxes.length === 0) {
      return null;
    }

    const totalTaxes = excludedTaxes.reduce((total, tax) => {
      return total + (parseFloat(tax.clientAmount || tax.amount) || 0);
    }, 0);

    return (
      <Box mt={4}>
        <Flex align="center" gap={2} mb={3}>
          <Icon as={FiAlertTriangle} color="orange.500" />
          <Heading size="md">Additional Taxes (To be paid at the hotel)</Heading>
        </Flex>

        <Box border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
          <Table.Root variant="simple" size="sm">
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader>Tax Type</Table.ColumnHeader>
                <Table.ColumnHeader justify="flex-end" isNumeric>Amount</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {excludedTaxes.map((tax, index) => (
                <Table.Row key={index} _hover={{ bg: 'gray.50' }}>
                  <Table.Cell>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{tax.subType || tax.type}</Text>
                    </VStack>
                  </Table.Cell>
                  <Table.Cell isNumeric>
                    <HStack justify="flex-end" spacing={1}>
                      <Text fontWeight="bold" color="red.600">
                        {tax.clientAmount || tax.amount}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {tax.clientCurrency || tax.currency}
                      </Text>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root >

          {/* Total Row */}
          <Flex 
            justify="space-between" 
            align="center" 
            p={3} 
            bg="red.50" 
            borderTop="1px" 
            borderColor="gray.200"
          >
            <Text fontWeight="bold">Total Additional Taxes</Text>
            <HStack spacing={2}>
              <Text fontSize="lg" fontWeight="bold" color="red.600">
                {totalTaxes.toFixed(2)} {excludedTaxes[0]?.clientCurrency || 'EUR'}
              </Text>
            </HStack>
          </Flex>
        </Box>
      </Box>
    );
  };

  //console.log("user", user.user);

  const AddToCartConfirmationModal = () => {
    const roomDataFromURL = parseRoomDataFromURL();
    
    return (
      <Dialog.Root open={isAddToCartModalOpen} onClose={() => setIsAddToCartModalOpen(false)} size="full">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Heading size="lg">Add to Cart</Heading>
            </Dialog.Header>
            
            <Dialog.Body>
              <VStack spacing={4} align="stretch">
                {/* Room Summary */}
                <Flex align="center" gap={3} p={3} bg="blue.50" borderRadius="md">
                  <Image
                    src={`${imageUrl}${roomData?.images[0]?.path || '/placeholder.jpg'}`}
                    alt={roomData?.name}
                    boxSize="60px"
                    objectFit="cover"
                    borderRadius="md"
                    fallback={
                      <Box
                        boxSize="60px"
                        bg="gray.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                      >
                        <Text fontSize="xs" color="gray.500">No Image</Text>
                      </Box>
                    }
                  />
                  <Box flex={1}>
                    <Text fontWeight="bold" fontSize="md">
                      {roomData?.name}
                    </Text>
                    <Badge colorScheme="blue" size="sm">
                      {selectedRateForCart?.boardName}
                    </Badge>
                  </Box>
                </Flex>

                {/* Rate Details */}
                <VStack spacing={2} align="start">
                  <Flex align="center" gap={2}>
                    <Icon as={FiCreditCard} color="green.500" />
                    <Text fontWeight="medium">Price: EUR{selectedRateForCart?.net}</Text>
                  </Flex>
                  
                  {/* Dynamic Room Occupancy Details */}
                  <VStack spacing={3} align="stretch" width="100%">
                    <Text fontWeight="semibold" color="gray.700">Room Occupancy:</Text>
                    {roomDataFromURL.map((room, index) => (
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
                            {room.children > 0 && room.childAges.length > 0 && (
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

                  <Flex align="center" gap={2}>
                    <Icon as={FiCalendar} color="purple.500" />
                    <Text>
                      Stay: {params.get('checkIn')} to {params.get('checkOut')}
                    </Text>
                  </Flex>

                  {/* Total Rooms Summary */}
                  <Box p={2} bg="blue.50" borderRadius="md" width="100%">
                    <Flex justify="space-between">
                      <Text fontWeight="semibold">Total Rooms:</Text>
                      <Text fontWeight="bold">{roomDataFromURL.length}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontWeight="semibold">Total Guests:</Text>
                      <Text fontWeight="bold">
                        {roomDataFromURL.reduce((total, room) => total + room.adults + room.children, 0)}
                      </Text>
                    </Flex>
                  </Box>
                </VStack>

                {/* Cancellation Policy Preview */}
                {selectedRateForCart?.cancellationPolicies?.length > 0 && (
                  <Box p={2} bg="green.50" borderRadius="md">
                    <Text fontSize="sm" color="green.700">
                      ✅ {selectedRateForCart.cancellationPolicies[0].amount === '0' 
                        ? 'Free cancellation available' 
                        : `Cancellation policy applies`}
                    </Text>
                  </Box>
                )}

                {/* Login Reminder for guest users */}
                {!user && (
                  <Box p={2} bg="orange.50" borderRadius="md">
                    <Text fontSize="sm" color="orange.700">
                      🔒 Your cart will be saved to your session. 
                      <Text as="span" fontWeight="medium"> Login to sync across devices!</Text>
                    </Text>
                  </Box>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack spacing={3}>
                <Button
                  variant="outline"
                  onClick={() => setIsAddToCartModalOpen(false)}
                  isDisabled={isAddingToCart}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => handleAddToCart(selectedRateForCart)}
                  loading={isAddingToCart}
                  loadingText="Adding to cart..."
                  leftIcon={<FiCheck />}
                >
                  Confirm Add to Cart
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  };

  const openAddToCartConfirmation = (rate) => {
    setSelectedRateForCart(rate);
    setIsAddToCartModalOpen(true);
  };

  return (
    <>
      <Dialog.Root open={isOpen} onClose={onClose} size="full" motionPreset="slide-in-bottom">
        <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
        <Dialog.Content>

          <Dialog.Body p={0} overflow="auto">
             <Flex justify="space-between" align="center" p={6}>
                <Heading size="xl">{roomData?.name}</Heading>
              <IconButton
                aria-label="Close"
                onClick={() => onClose()}
                variant="ghost"
                color="black"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                <FiX />
              </IconButton>
            </Flex>
            <Grid
              templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            >
              {/* Left Column - Images & Facilities */}
              <GridItem borderRight={{ base: 'none', lg: '1px' }} borderColor="gray.200" p={6} overflow="auto">
                <VStack spacing={8} align="stretch">
                  <ImageGallery />
                  <FacilitiesSection />
                </VStack>
              </GridItem>

              {/* Right Column - Rates */}
              <GridItem p={6}>
                <RatesSection />
              </GridItem>
            </Grid>
          </Dialog.Body>
        </Dialog.Content>
        </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <ImageModal />
      <AddToCartConfirmationModal />
    </>
  );
};

export default RoomDetailsModals;