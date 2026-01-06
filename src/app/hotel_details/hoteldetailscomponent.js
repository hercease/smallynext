// pages/hotelsdetails
'use client'
import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import {
  Box,
  Container,
  Grid,
  Dialog,
  Heading,
  Text,
  Image,
  Button,
  Badge,
  Icon,
  Flex,
  HStack,
  VStack,
  Tabs,
  Card,
  Stack,
  Wrap,
  Spinner,
  Breadcrumb,
  StarRating,
  useBreakpointValue,
  AspectRatio,
  SimpleGrid,
  Tag,
  IconButton,
  Input,
  NumberInput,
  SkeletonText
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiStar,
  FiWifi,
  FiCoffee,
  FiTv,
  FiWind,
  FiDroplet,
  FiUmbrella,
  FiHeart,
  FiShare2,
  FiChevronRight,
  FiChevronLeft,
  FiHome,
  FiCheck,
  FiUsers,
  FiSquare, FiX,
  FiChevronsLeft
} from 'react-icons/fi';
import { FaSwimmingPool, FaSpa, FaDumbbell, FaParking, FaCar, FaUtensils, FaConciergeBell } from 'react-icons/fa';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter,usePathname,useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner';
import { getAmenityIcon } from "@/components/amenitiesfunction";
import FacilitiesDisplay from '@/components/displayfacilities';
import RoomDetailsModals from '@/components/roomDetails';
import { useAuth } from '@/components/Auth.js';

const HotelDetailsPage = (user) => {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [nights, setNights] = useState(3);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [allHotels, setAllHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const imageUrl = "http://photos.hotelbeds.com/giata/";
  const [facilitiesData, setFacilitiesData] = useState([]);
  const [roomsWithImages, setRoomsWithImages] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [activeTab, setActiveTab] = useState('tab-1');
  const [hasFetchedFacilities, setHasFetchedFacilities] = useState(false);
  const [hasFetchedRoomImages, setHasFetchedRoomImages] = useState(false);
  const getSafeAmenityIcon = (description) => {
      const icon = getAmenityIcon(description);
      return icon && typeof icon === 'function' ? icon : FiCheck;
  };
  const { isLoggedIn, loading, logout, userData } = useAuth();

  console.log("Rooms with images", roomsWithImages);

  const isMobile = useBreakpointValue({ base: true, md: false });

   // Extract hotel code from the data
  const hotelCode = allHotels?.data?.[0]?.code;
  const currency = allHotels?.data?.[0]?.currency;

  console.log("hotel code", hotelCode);

  function extractRoomSize(facilities) {
  if (!facilities || !Array.isArray(facilities)) return null;

  // Find the facility with "room size" in description
  const roomSizeFacility = facilities.find(facility => 
    facility && 
    facility.description && 
    facility.description.toLowerCase().includes('room size')
  );

  // Return the number property if found
  if (roomSizeFacility && roomSizeFacility.number !== undefined) {
    return roomSizeFacility.number;
  }

  return null;
}

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleBookNow = (room) => {
    setSelectedRoom(room);
    setIsBookModalOpen(false);
  };

   // Function to fetch facilities
  const fetchHotelFacilities = useCallback(async () => {

    if (!hotelCode || hasFetchedFacilities) return;
    
    setLoadingFacilities(true);

    let token = process.env.NEXT_PUBLIC_API_KEY;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-facilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
        body: new URLSearchParams({
          hotelCode: hotelCode.toString()
        }).toString(),
      });
      
      const data = await response.json();

      console.log("facilities data", data);
      setFacilitiesData(data || []);
      setHasFetchedFacilities(true);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setHasFetchedFacilities(false);
    } finally {
      setLoadingFacilities(false);
    }
  }, [hotelCode, hasFetchedFacilities]);

   // Function to fetch room images
  const fetchRoomImages = useCallback(async () => {
  if (!allHotels?.data?.[0]?.rooms || !hotelCode || hasFetchedRoomImages) return;
  
  setLoadingRooms(true);
  try {
    // Extract all room codes from the rooms array
    const roomCodes = allHotels.data[0].rooms
      .map(room => room.code)
      .filter(code => code)
      .join(',');
    
    if (!roomCodes) {
      setRoomsWithImages(allHotels.data[0].rooms);
      setHasFetchedRoomImages(true);
      return;
    }
    let token = process.env.NEXT_PUBLIC_API_KEY;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room-facilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({
        hotelCode: hotelCode.toString(),
        roomCodes: roomCodes
      }).toString(),
    });
    
    const data = await response.json();
    console.log("room images data", data);
    
    // Merge room images with existing room data
    const updatedRooms = allHotels.data[0].rooms.map(room => {
      const roomImages = data.roomImages?.[room.code] || [];
      const roomFacilities = data.roomFacilities?.[room.code] || [];
      return {
        ...room,
        images: roomImages,
        facilities: roomFacilities
      };
    });
    
    setRoomsWithImages(updatedRooms);
    setHasFetchedRoomImages(true); // Mark as fetched
  } catch (error) {
    console.error('Error fetching room images:', error);
    setRoomsWithImages([]);
    setHasFetchedRoomImages(false); // Mark as fetched even on error
  } finally {
    setLoadingRooms(false);
  }
}, [allHotels, hotelCode, hasFetchedRoomImages]);

   // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value.value);
    
    if (value.value === 'tab-2' && hotelCode && !hasFetchedFacilities && facilitiesData.length === 0) {
      // Fetch facilities when facilities tab is activated for the first time
      fetchHotelFacilities();
      setHasFetchedFacilities(true);
    }
    
    if (value.value === 'tab-3' && hotelCode && !hasFetchedRoomImages && roomsWithImages.length === 0) {
      // Fetch room images when rooms tab is activated for the first time
      fetchRoomImages();
      setHasFetchedRoomImages(true);
    }
  };

  

  const fetchHotelDetails = useCallback(() => {
    setIsLoading(true);

    const formData = new URLSearchParams();

    formData.append("destination", params.get("destination") || "");
    formData.append("checkIn", params.get("checkIn") || "");
    formData.append("checkOut", params.get("checkOut") || "");
    formData.append("rooms", params.get("rooms") || "1");
    formData.append("code", params.get("code") || "");
    
    // Add room configurations
    const roomsCount = parseInt(params.get("rooms")) || 1;
    for (let i = 1; i <= roomsCount; i++) {
      formData.append(`room${i}_adults`, params.get(`room${i}_adults`) || "1");
      formData.append(`room${i}_children`, params.get(`room${i}_children`) || "0");
      formData.append(`room${i}_infants`, params.get(`room${i}_infants`) || "0");
      
      const childAges = params.get(`room${i}_child_ages`);
      if (childAges) {
        formData.append(`room${i}_child_ages`, childAges);
      }
    }
  
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hoteldetails`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: formData.toString(),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setAllHotels(data);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching hotels:', error);
      setIsLoading(false);
    });
  }, [params]);

  useEffect(() => {
    fetchHotelDetails();
  }, [params, fetchHotelDetails]);


// Replace your ImageGallery component with this improved version
const ImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const images = allHotels?.data?.[0]?.local_data?.images || [];
  console.log("All images", images);
  const imageUrl = "http://photos.hotelbeds.com/giata/";

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const openViewer = (index) => {
    setSelectedImage(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  if (!images.length) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No images available</Text>
      </Box>
    );
  }

  return (
    <Box>
        <Box position="relative" width="100%" mb={3} borderRadius="lg" overflow="hidden">
          <AspectRatio ratio={21 / 9}>
          <Image
          src={images[selectedImage]?.path ? `${imageUrl}${`bigger/`}${images[selectedImage].path}` : 'hotelplaceholder.png'}
          alt={images[selectedImage].description || `Hotel image ${selectedImage + 1}`}
          objectFit="contain"
          borderRadius="lg"
          cursor="pointer"
          onClick={() => openViewer(selectedImage)}
          transition="all 0.3s"
          _hover={{ transform: 'scale(1.02)' }}
            />
          </AspectRatio>
          
          {/* Image Description */}
        {images[selectedImage].description && (
          <Box
            position="absolute"
            bottom={2}
            right={2}
            bg="blackAlpha.700"
            color="white"
            px={3}
            py={1}
            borderRadius="md"
            fontSize="sm"
            maxW="70%"
          >
            <Text noOfLines={1}>{images[selectedImage].description}</Text>
          </Box>
        )}
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <IconButton
              position="absolute"
              left={2}
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
              right={2}
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
          </>
        )}
        
        {/* Image Counter */}
        <Box
          position="absolute"
          top={2}
          right={2}
          bg="blackAlpha.700"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="sm"
        >
          {selectedImage + 1} / {images.length}
        </Box>
      </Box>

      {/* Compact Thumbnail Slider */}
      <Box position="relative" overflow="hidden">
        <Box
          display="flex"
          gap={2}
          overflowX="auto"
          py={1}
          sx={{
            '&::-webkit-scrollbar': {
              height: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'gray.100',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.400',
              borderRadius: '2px',
            },
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              flexShrink={0}
              width="80px"
              height="60px"
              position="relative"
              cursor="pointer"
              borderRadius="md"
              overflow="hidden"
              border={selectedImage === index ? "2px solid" : "1px solid"}
              borderColor={selectedImage === index ? "blue.500" : "gray.300"}
              onClick={() => setSelectedImage(index)}
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.05)', borderColor: 'blue.300' }}
            >
              <Image
                src={`${imageUrl}${image.path}`}
                alt={`Thumbnail ${index + 1}`}
                objectFit="cover"
                width="100%"
                height="100%"
              />
              
              {/* Thumbnail description badge */}
              {image.description && (
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  bg="blackAlpha.700"
                  color="white"
                  px={1}
                  py={0.5}
                  fontSize="xs"
                >
                  <Text noOfLines={1} fontSize="2xs">
                    {image.description}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Image Viewer Modal */}
      <Dialog.Root open={isViewerOpen} onOpenChange={(e) => setIsViewerOpen(e.open)} size="full">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="blackAlpha.900" maxW="100vw" maxH="100vh">
            <Dialog.Body p={0} position="relative">
              {/* Close Button */}
              <IconButton
                position="absolute"
                top={4}
                right={4}
                zIndex={10}
                aria-label="Close viewer"
                onClick={closeViewer}
                variant="solid"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: 'blackAlpha.800' }}
                size="lg"
              >
                <FiX />
              </IconButton>
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
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
                    size="lg"
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
                    size="lg"
                  >
                    <FiChevronRight />
                  </IconButton>
                </>
              )}
              
              {/* Main Image in Viewer */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100vh"
                p={4}
              >
                <Image
                  src={`${imageUrl}${images[selectedImage].path}`}
                  alt={images[selectedImage].description || `Hotel image ${selectedImage + 1}`}
                  objectFit="contain"
                  maxW="100%"
                  maxH="100%"
                />
              </Box>
              
              {/* Image Description in Viewer */}
              {images[selectedImage].description && (
                <Box
                  position="absolute"
                  bottom={4}
                  left="50%"
                  transform="translateX(-50%)"
                  bg="blackAlpha.700"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="md"
                  textAlign="center"
                  maxW="80%"
                >
                  <Text fontSize="lg">{images[selectedImage].description}</Text>
                </Box>
              )}
              
              {/* Image Counter in Viewer */}
              <Box
                position="absolute"
                top={4}
                left={4}
                bg="blackAlpha.700"
                color="white"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="md"
              >
                {selectedImage + 1} / {images.length}
              </Box>
              
              {/* Thumbnail Strip in Viewer */}
              <Box
                position="absolute"
                bottom={20}
                left="50%"
                transform="translateX(-50%)"
                display="flex"
                gap={2}
                maxW="90%"
                overflowX="auto"
                py={2}
              >
                {images.map((image, index) => (
                  <Box
                    key={index}
                    flexShrink={0}
                    width="60px"
                    height="45px"
                    cursor="pointer"
                    borderRadius="sm"
                    overflow="hidden"
                    border={selectedImage === index ? "2px solid" : "1px solid"}
                    borderColor={selectedImage === index ? "blue.400" : "whiteAlpha.500"}
                    onClick={() => setSelectedImage(index)}
                    opacity={selectedImage === index ? 1 : 0.7}
                    transition="all 0.2s"
                    _hover={{ opacity: 1, transform: 'scale(1.1)' }}
                  >
                    <Image
                      src={`${imageUrl}${image.path}`}
                      alt={`Thumbnail ${index + 1}`}
                      objectFit="cover"
                      width="100%"
                      height="100%"
                    />
                  </Box>
                ))}
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};

 /* const FacilitiesSection = () => (
    <Box py={3}>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
        {facilitiesData.map((facility, index) => {
          // Get icon safely for each facility
          const AmenityIcon = getAmenityIcon(facility.description) || FiCheck;
          
          return (
            <Flex key={index} align="center" gap={3}>
              <Icon as={AmenityIcon} boxSize={6} color="blue.500" />
              <Text fontSize="md">{facility.description}</Text>
            </Flex>
          );
        })}
      </SimpleGrid>
    </Box>
  );*/

  //console.log("facilitiesData", facilitiesData.length);

  // Updated Facilities Section with loading state
  const FacilitiesSection = () => (
    <Box py={3}>
      {loadingFacilities ? (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
          {[...Array(8)].map((_, index) => (
            <Flex key={index} align="center" gap={3}>
              <SkeletonText noOfLines={2} />
            </Flex>
          ))}
        </SimpleGrid>
      ) : facilitiesData.length > 0 ? (
       
          <FacilitiesDisplay facilities={facilitiesData} />
      
      ) : (
        <Text textAlign="center" color="gray.500">
          No facilities information available.
        </Text>
      )}
    </Box>
  );

  const RoomCard = ({ room }) => (
    <Card.Root
      mx="auto"
      width="100%"
      maxW="100%"
      overflow='hidden'
      variant='outline'
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
      cursor="pointer"
      onClick={() => handleRoomSelect(room)}
      mb={3}
    >
      <AspectRatio ratio={4 / 3}>
        <Image
          src={room?.images?.[0] && `${imageUrl}${room?.images[0]?.path}` || 'hotelplaceholder.png'}
          alt={room.name}
          objectFit='cover'
          width="100%"
          height="100%"
        />
      </AspectRatio>

      <Card.Body>
        <VStack align="start" spacing={3} height="100%">
          <Box width="full">
            <Heading size='md' mb={2} noOfLines={2}>{room.name}</Heading>
          </Box>

          <HStack spacing={4} fontSize="sm" color="gray.600" width="full">
            {extractRoomSize(room.facilities) != null && <Flex align="center" gap={1} flex={1}>
              <FiSquare />
              <Text fontSize="xs">{extractRoomSize(room?.facilities)} (sqm)</Text>
            </Flex>}
            <Flex align="center" gap={1} flex={1}>
              <FiUsers />
              <Text fontSize="xs">
                  {room.rates[0]?.adults > 0 && (
                  <>
                    {room.rates[0]?.adults}{" "}
                    {room.rates[0]?.adults > 1 ? "Adults" : "Adult"}
                  </>
                )}
                {room.rates[0]?.children > 0 && (
                  <>
                    {" / "}
                    {room.rates[0]?.children}{" "}
                    {room.rates[0]?.children > 1 ? "Children" : "Child"}
                    {" ("}
                    {room.rates[0]?.childrenAges}
                    {")"}
                  </>
                )}
              </Text>
            </Flex>
          </HStack>

          <Flex wrap="wrap" mb="4" gap={2}>
            {room?.facilities && room?.facilities.slice(0, 2).map((amenity, index) => {
              // Get icon safely for each amenity
              const getAmenityIcon = getSafeAmenityIcon(amenity.description);

              return (
                
                  <Badge
                    key={index}
                    colorScheme="blue"
                    variant="subtle"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    px={2}
                    py={1}
                  >
                    <Icon as={getAmenityIcon} boxSize="3" />
                    <Text fontSize="xs" textTransform="capitalize">
                      {amenity.description}
                    </Text>
                  </Badge>
              
              );
            }
            )}
            {room?.facilities && room?.facilities.length > 2 && (
              <Tag.Root size="sm" variant="outline">
                <Tag.Label fontSize="xs">+{room.facilities.length - 2}</Tag.Label>
              </Tag.Root>
            )}
          </Flex>

          <Box width="full" mt="auto">
            <Flex justify="space-between" align="center" width="full">
              <Box flex={1}>
                <Text fontSize="md" fontWeight="bold" color="blue.600">
                  <Text as="span" fontSize="sm" color="gray.600" fontWeight="normal">From </Text> {currency}{room.rates[0]?.net}
                </Text>
                <Text fontSize="xs" color="green.600">
                  {room.rates[0]?.allotment} rooms available
                </Text>
              </Box>
              <Button 
                colorScheme="blue" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookNow(room);
                }}
              >
                Room Info
              </Button>
            </Flex>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );

  const RoomDetailsModal = () => (
    <Dialog.Root open={isRoomModalOpen} onOpenChange={(e) => setIsRoomModalOpen(e.open)} size="4xl">
      <Dialog.Trigger />
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{selectedRoom?.name}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {selectedRoom && (
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                {/* Room Images */}
                <Box>
                  <AspectRatio ratio={4 / 3} mb={4}>
                    <Image
                      src={selectedRoom.images[0]}
                      alt={selectedRoom.name}
                      objectFit="cover"
                      borderRadius="lg"
                    />
                  </AspectRatio>
                  <SimpleGrid columns={2} spacing={2}>
                    {selectedRoom.images.slice(1).map((image, index) => (
                      <AspectRatio ratio={4 / 3} key={index}>
                        <Image
                          src={`${imageUrl}${image.path}`}
                          alt={`${selectedRoom.name} ${index + 2}`}
                          objectFit="cover"
                          borderRadius="md"
                        />
                      </AspectRatio>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Room Details */}
                <VStack align="start" spacing={4}>
                  <Box>
                    <Heading size="sm" mb={2}>Room Details</Heading>
                    <VStack align="start" spacing={1}>
                      <Flex align="center" gap={2}>
                        <FiSquare />
                        <Text>Size: {selectedRoom.size}</Text>
                      </Flex>
                      <Flex align="center" gap={2}>
                        <FiUsers />
                        <Text>Capacity: {selectedRoom.capacity}</Text>
                      </Flex>
                    </VStack>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={2}>Amenities</Heading>
                    <SimpleGrid columns={2} spacing={2}>
                      {selectedRoom.facilities.map((amenity, index) => (
                        <Flex key={index} align="center" gap={2}>
                          <FiCheck color="green" />
                          <Text fontSize="sm">{amenity.description}</Text>
                        </Flex>
                      ))}
                    </SimpleGrid>
                  </Box>

                  <Box width="full">
                    <Heading size="sm" mb={2}>Price</Heading>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      {selectedRoom.price}
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      {selectedRoom.available} rooms available
                    </Text>
                  </Box>

                  <Button colorScheme="blue" size="lg" width="full" onClick={() => {
                    setIsRoomModalOpen(false);
                    handleBookNow(selectedRoom);
                  }}>
                    Book This Room
                  </Button>
                </VStack>
              </Grid>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );

  const BookingModal = () => (
    <Dialog.Root open={isBookModalOpen} onOpenChange={(e) => setIsBookModalOpen(e.open)} size="lg">
      <Dialog.Trigger />
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>Book {selectedRoom?.name}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {selectedRoom && (
              <VStack spacing={6} align="stretch">
                {/* Room Summary */}
                <Card.Root variant="outline">
                  <Card.Body>
                    <Grid templateColumns="auto 1fr" gap={4} alignItems="center">
                      <AspectRatio ratio={4 / 3} width="80px">
                        <Image
                          src={selectedRoom.images[0]}
                          alt={selectedRoom.name}
                          objectFit="cover"
                          borderRadius="md"
                        />
                      </AspectRatio>
                      <Box>
                        <Heading size="sm">{selectedRoom.name}</Heading>
                        <Text fontSize="sm" color="gray.600">{selectedRoom.capacity}</Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.600">
                          ${selectedRoom.price}
                        </Text>
                      </Box>
                    </Grid>
                  </Card.Body>
                </Card.Root>

                {/* Booking Details */}
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Booking Details</Heading>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Guests</Text>
                    <HStack spacing={4}>
                      <Box>
                        <Text fontSize="sm" mb={1}>Adults</Text>
                        <NumberInput.Root value={adults} min={1} max={8} onChange={(e) => setAdults(e.value)}>
                          <NumberInput.Control />
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Box>
                      <Box>
                        <Text fontSize="sm" mb={1}>Children</Text>
                        <NumberInput.Root value={children} min={0} max={6} onChange={(e) => setChildren(e.value)}>
                          <NumberInput.Control />
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Box>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={2}>Stay Duration</Text>
                    <NumberInput.Root value={nights} min={1} max={30} onChange={(e) => setNights(e.value)}>
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Box>

                  {/* Price Summary */}
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <VStack spacing={2} align="stretch">
                      <Flex justify="space-between">
                        <Text>Room price ({nights} nights)</Text>
                        <Text>${selectedRoom.price * nights}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>Taxes & Fees</Text>
                        <Text>${(selectedRoom.price * nights * 0.1).toFixed(2)}</Text>
                      </Flex>
                      
                      <Flex justify="space-between" fontWeight="bold">
                        <Text>Total</Text>
                        <Text>${(selectedRoom.price * nights * 1.1).toFixed(2)}</Text>
                      </Flex>
                    </VStack>
                  </Box>
                </VStack>
              </VStack>
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" mr={3} onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={() => {
              console.log('Booking confirmed:', { room: selectedRoom, adults, children, nights });
              setIsBookModalOpen(false);
            }}>
              Confirm Booking
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );



  //console.log("allHotels:", allHotels?.data && allHotels?.data[0]);

  const displayRooms = roomsWithImages.length > 0 ? roomsWithImages : (allHotels?.data?.[0]?.rooms || []);

  /*{allHotels?.errors?.map((error, index) => (
    <Text key={index} color="red.700" fontSize="sm" mb="1">
      console.log(error.detail);
    </Text>
  ))}*/

  return (
    <>
    <Container maxW="container.xl" py="6">
      <LoadingSpinner show={isLoading} text="Processing your request..." />
      {/* Error Display - Just before breadcrumb */}
      {allHotels?.data?.length === 0 || allHotels?.success === false ? (
        <Box textAlign="center" py="10">
          {/* Check if there are errors in the response */}
          {allHotels?.errors && allHotels.errors.length > 0 ? (
            <>
              <Heading as="h3" size="md" mb="2" color="red.500">
                Search Error
              </Heading>
              <Box 
                bg="red.50" 
                border="1px" 
                borderColor="red.200" 
                borderRadius="md" 
                p="4" 
                mb="4"
                maxW="md" 
                mx="auto"
              >
                <Text color="red.800" fontWeight="medium" mb="2">
                  We encountered an issue with your search:
                </Text>
                {allHotels?.errors?.map((error, index) => (
                  <Text key={index} color="red.700" fontSize="sm" mb="1">
                    • {error.detail?.message || error.title}
                  </Text>
                ))}
              </Box>
              <Text color="gray.600" mb="4">
                Please adjust your search criteria and try again.
              </Text>
            </>
          ) : (
            /* Show this when no hotels found but no specific errors */
            <Box textAlign="center" py="10">
              <Heading as="h3" size="md" mb="2">No hotels found</Heading>
              <Text color="gray.600">No hotels match your search criteria.</Text>
              <Button mt="4" colorScheme="blue" onClick={() => router.back()}>
                Go Back
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <>
          {/* Breadcrumb */}
          <Breadcrumb.Root mb={6}>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/hotel_listings">Hotels</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.CurrentLink>{allHotels?.data && allHotels?.data[0]?.name}</Breadcrumb.CurrentLink>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>

          {/* Header Section */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8} mb={8}>
            <Box>
              <Heading size="2xl" mb={2}>{allHotels?.data && allHotels?.data[0]?.name}</Heading>
              <Flex align="center" gap={2} mb={3}>
                <Icon as={FiMapPin} color="gray.500" />
                <Text color="gray.600">{allHotels?.data && allHotels?.data[0]?.local_data?.address}</Text>
              </Flex>
              <Flex align="center" gap={3} mb={4}>
                <HStack spacing={1}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      as={FiStar}
                      color={i < Math.floor(allHotels?.data && allHotels?.data[0]?.reviews[0]?.rate || 0) ? 'yellow.400' : 'gray.300'}
                    />
                  ))}
                </HStack>
                <Text fontWeight="medium">{allHotels?.data && allHotels?.data[0]?.reviews[0]?.rate || 0}</Text>
                <Text color="gray.600">({allHotels?.data && allHotels?.data[0]?.reviews[0]?.reviewCount} reviews)</Text>
              </Flex>
            </Box>

            {/* Action Buttons 
            <VStack spacing={3} align="stretch">
              <Button leftIcon={<FiShare2 />} variant="outline" size="lg">
                Share
              </Button>
            </VStack>
            */}
          </Grid>

          {/* Image Gallery */}
          <Box mb={12}>
            <ImageGallery />
          </Box>

          <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8}>
            {/* Main Content */}
            <Box>
              <Tabs.Root variant="enclosed" fitted value={activeTab} onValueChange={handleTabChange}>
                <Tabs.List>
                  <Tabs.Trigger value="tab-1">Overview</Tabs.Trigger>
                  <Tabs.Trigger value="tab-2">Facilities {loadingFacilities && <Spinner size="sm" ml={2} />}</Tabs.Trigger>
                  <Tabs.Trigger value="tab-3">Rooms {loadingRooms && <Spinner size="sm" ml={2} />}</Tabs.Trigger>
                </Tabs.List>
                
                <Tabs.Content value="tab-1">
                  <Box py={4}>
                    <Heading size="lg" mb={4}>About This Hotel</Heading>
                    <Text lineHeight="1.8">
                      {allHotels?.data && allHotels?.data[0]?.local_data.description || 'No description available.'}
                    </Text>
                  </Box>
                </Tabs.Content>
                
                <Tabs.Content value="tab-2">
                  <Box py={4}>
                    <FacilitiesSection />
                  </Box>
                </Tabs.Content>
                
                <Tabs.Content value="tab-3">
                  <Box py={4} width="100%">
                      {loadingRooms ? (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                          {[...Array(6)].map((_, index) => (
                            <Card.Root key={index} variant="outline">
                              <SkeletonText height="200px" />
                              <Card.Body>
                                <SkeletonText noOfLines={3} spacing="3" />
                              </Card.Body>
                            </Card.Root>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <SimpleGrid 
                          columns={{ base: 1, md: 2, lg: 3 }}
                          spacing={6}
                          width="100%"
                        >
                          {displayRooms.map((room, index) => (
                            <RoomCard key={index} room={room} />
                          ))}
                        </SimpleGrid>
                      )}
                    </Box>
                </Tabs.Content>
              </Tabs.Root>
            </Box>

            {/* Sidebar */}
            <Box>
              <Card.Root position="sticky" top="4">
                <Card.Body>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Quick Facts</Heading>
                    {
                      allHotels?.data && allHotels?.data[0]?.local_data?.facilities.map((amenity, index) => (
                        <Flex key={index} justify="space-between">
                          <Text color="gray.600">{amenity.description}</Text>
                          <Text fontWeight="medium">{amenity.number}</Text>
                        </Flex>
                      ))
                    }

                  </VStack>
                </Card.Body>
              </Card.Root>
            </Box>
          </Grid>
        </>
      )}
 
    {/* Modals */}
    {/*<RoomDetailsModal />*/}
    <BookingModal />
    <RoomDetailsModals
      isOpen={!!selectedRoom}
      onClose={() => setSelectedRoom(null)}
      room={selectedRoom}
      user={user}
    />
    </Container>
    </>
  
  );
};

export default HotelDetailsPage;