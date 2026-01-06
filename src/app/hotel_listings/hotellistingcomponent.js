// pages/index.js
'use client'
import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Image,
  Button,
  Span,
  NumberInput,
  Input,
  HStack,
  IconButton,
  Accordion, 
  Drawer,
  Checkbox,
  NativeSelect,
  Stack,
  Portal,
  Badge,
  Icon,
  useBreakpointValue,
  Flex,
  Slider,
  CloseButton,
  VStack
} from '@chakra-ui/react';
import { FiFilter, FiMapPin, FiWifi, FiCoffee, FiTv, FiWind, FiSearch, FiStar, FiCheck } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaHotel, FaPlane, FaCar, FaUser, FaCalendar, FaTrash } from 'react-icons/fa'
import { LuMinus, LuPlus } from "react-icons/lu"
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Controller,useForm } from "react-hook-form";
const DatePicker = dynamic(() => import("@/components/datepicker"), { ssr: false });
const CustomHotelTypeahead = dynamic(() => import("@/components/customhoteltypeahead"), { ssr: false });
import dynamic from "next/dynamic";
import { useRouter,usePathname,useSearchParams  } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner';
import { toaster } from "@/components/ui/toaster"
import { getAmenityIcon } from "@/components/amenitiesfunction";
import Pagination from '@/components/pagination';
import { useAuth } from '@/components/Auth.js';

const amenityIcons = {
  wifi: FiWifi,
  breakfast: FiCoffee,
  "air conditioning": FiWind,
  tv: FiTv
};

// Initial room state
const initialRoomState = {
  adults: 1,
  children: 0,
  infants: 0,
  childrenAges: []
};

export default function HotelListingPage() {
    const router = useRouter();
    const params = useSearchParams();
    const pathname = usePathname();
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [allHotels, setAllHotels] = useState([]);
    const [priceRange, setPriceRange] = useState([0,1000]);
    const [selectedAccommodations, setSelectedAccommodations] = useState(params.getAll('accomodations') || []);
    const [sortOption, setSortOption] = useState('price-low');
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [rooms, setRooms] = React.useState([{...initialRoomState}]);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const imageUrl = "http://photos.hotelbeds.com/giata/";
    const datevalue = {
      start: params.get('checkIn') || null,
      end: params.get('checkOut') || null,
    };
    const { isLoggedIn, loading, logout, userData } = useAuth();
    const [pagination, setPagination] = useState({
      current_page: allHotels?.pagination?.current_page || 1,
      has_next: allHotels?.pagination?.has_next || false,
      has_prev: allHotels?.pagination?.has_prev || false,
      offset: allHotels?.pagination?.offset || 0,
      page_size: allHotels?.pagination?.page_size || 6,
      total_items: allHotels?.pagination?.total_items || 2,
      total_pages: allHotels?.pagination?.total_pages || 1
    });

    const { control, handleSubmit, register, formState: { errors }, setValue, watch } = useForm({defaultValues: {
      'departureDate' : datevalue
    }});

    const isMobile = useBreakpointValue({ base: true, md: false });
    console.log(router);

    // Calculate totals for display
    const getTotals = () => {
      return rooms.reduce((acc, room) => ({
        adults: acc.adults + room.adults,
        children: acc.children + room.children,
        infants: acc.infants + room.infants,
        rooms: acc.rooms + 1
      }), { adults: 0, children: 0, infants: 0, rooms: 0 });
    };

    const totals = getTotals();

    // Update room configurations from URL parameters
    useEffect(() => {
      const roomsCount = parseInt(params.get('rooms')) || 1;
      const roomConfigs = [];
      
      for (let i = 1; i <= roomsCount; i++) {
        const roomAdults = parseInt(params.get(`room${i}_adults`)) || 1;
        const roomChildren = parseInt(params.get(`room${i}_children`)) || 0;
        const roomInfants = parseInt(params.get(`room${i}_infants`)) || 0;
        const roomChildAges = params.get(`room${i}_child_ages`) ? 
          params.get(`room${i}_child_ages`).split(',').map(age => age.trim()) : 
          [];
        
        roomConfigs.push({
          adults: roomAdults,
          children: roomChildren,
          infants: roomInfants,
          childrenAges: roomChildAges
        });
      }
      
      setRooms(roomConfigs);
    }, [params]);

    // Room management functions
    const addRoom = () => {
      if (rooms.length < 3) {
        setRooms(prev => [...prev, {...initialRoomState}]);
      }
    };

    const removeRoom = (index) => {
      if (rooms.length > 1) {
        setRooms(prev => prev.filter((_, i) => i !== index));
      }
    };

    const updateRoom = (index, field, value) => {
      setRooms(prev => {
        const updated = [...prev];
        
        if (field === 'children') {
          const currentChildren = updated[index].children || 0;
          const newChildren = value;
          
          if (newChildren > currentChildren) {
            updated[index].childrenAges = [
              ...updated[index].childrenAges,
              ...Array(newChildren - currentChildren).fill("")
            ];
          } else if (newChildren < currentChildren) {
            updated[index].childrenAges = updated[index].childrenAges.slice(0, newChildren);
          }
        }
        
        updated[index][field] = value;
        return updated;
      });
    };

    const updateChildAge = (roomIndex, childIndex, value) => {
      setRooms(prev => {
        const updated = [...prev];
        updated[roomIndex].childrenAges[childIndex] = value;
        return updated;
      });
    };

    const initialQuery = useMemo(() => params.get('destination') || '', [params]);
    const minRate = parseFloat(params.get('minRate') || 0);
    const maxRate = parseFloat(params.get('maxRate') || 0);
    const accoms = params.getAll('accommodations') || [];
    const hotel_Codes = allHotels?.data?.length > 0 && allHotels?.data?.map(hotel => hotel.code).filter(code => code).join(',');


    const fetchHotels = useCallback(() => {
      setIsLoading(true);

      const formData = new URLSearchParams();

      formData.append("destination", params.get("destination") || "");
      formData.append("checkIn", params.get("checkIn") || "");
      formData.append("checkOut", params.get("checkOut") || "");
      formData.append("rooms", params.get("rooms") || "1");
      
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
      
      // Add totals
      formData.append("total_adults", params.get("total_adults") || "1");
      formData.append("total_children", params.get("total_children") || "0");
      formData.append("total_infants", params.get("total_infants") || "0");
      
      formData.append("minRate", params.get("minRate") || "");
      formData.append("maxRate", params.get("maxRate") || "");
      formData.append("page", params.get("page") || "1");
      formData.append("hotelcodes", hotel_Codes);

      // Get accommodations from URL params
      const accommodationsFromParams = params.get("accommodations");
      if (accommodationsFromParams) {
        const accommodationsArray = accommodationsFromParams.split(",");
        accommodationsArray.forEach(acc => {
          if (acc.trim()) {
            formData.append("accommodations[]", acc.trim());
          }
        });
      }

      let token = userData?.token || process.env.NEXT_PUBLIC_API_KEY;

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/searchhotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
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
    }, [params, hotel_Codes, userData]);

    useEffect(() => {
      fetchHotels();
    }, [params, fetchHotels]);

    useEffect(() => {
      if(allHotels) {
        setPriceRange([allHotels?.prices?.overallMinRate || 0, allHotels?.prices?.overallMaxRate || 0]);
        setPagination({
          current_page: allHotels?.pagination?.current_page || 1,
          has_next: allHotels?.pagination?.has_next || false,
          has_prev: allHotels?.pagination?.has_prev || false,
          offset: allHotels?.pagination?.offset || 0,
          page_size: allHotels?.pagination?.page_size || 6,
          total_items: allHotels?.pagination?.total_items || 2,
          total_pages: allHotels?.pagination?.total_pages || 1
        });
      }
    },[allHotels]);
  
    // Form validation and submission
    const onSubmit = async (data) => {
      setIsLoading(true);
      
      try {

        const formData = new URLSearchParams();
        
        formData.append('destination', data.destination);
        formData.append('checkIn', data.departureDate.start);
        formData.append('checkOut', data.departureDate.end);
        formData.append('rooms', rooms.length.toString());
        
        // Add room configurations
        rooms.forEach((room, index) => {
          formData.append(`room${index + 1}_adults`, room.adults.toString());
          formData.append(`room${index + 1}_children`, room.children.toString());
          formData.append(`room${index + 1}_infants`, room.infants.toString());
          
          if (room.children > 0) {
            formData.append(`room${index + 1}_child_ages`, room.childrenAges.join(','));
          }
        });
        
        // Add totals
        formData.append('total_adults', totals.adults.toString());
        formData.append('total_children', totals.children.toString());
        formData.append('total_infants', totals.infants.toString());

        setIsOpenModal(false);
        router.push(`/hotel_listings?${formData.toString()}`);

      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const buildUrl = (code) => {
      const param = new URLSearchParams(params);
      param.set('code', code);
      router.push(`hotel_details?${param.toString()}`);
    }
    
    const hotels = filteredHotels || allHotels || [];

    const handleFilter = () => {
      const param = new URLSearchParams(params);
      
      selectedAccommodations.forEach((checkedItem) => {
        param.append('accommodations[]', checkedItem);
      });

      param.set('minRate', priceRange[0]);
      param.set('maxRate', priceRange[1]);

      const newUrl = `${pathname}?${param.toString()}`;
      const decodedUrl = decodeURIComponent(newUrl);

      if (isMobile) setIsOpen(false);

      router.push(decodedUrl);
    };

    const handleReset = () => {
      setPriceRange([0, 0]);
      setSelectedAccommodations([]);

      const formData = new URLSearchParams();

      formData.append('destination', params.get('destination'));
      formData.append('checkIn', params.get('checkIn'));
      formData.append('checkOut', params.get('checkOut'));
      formData.append('rooms', params.get('rooms'));

      router.push(`/hotel_listings?${formData.toString()}`);
    };

    function getFirstSentence(description) {
      if (!description) return "";
      const parts = description.split(".");
      return parts.length > 0 ? parts[0].trim() + "." : "";
    }

    const handleAccommodationChange = (accommodationCode, isChecked) => {
      if (isChecked.checked) {
        setSelectedAccommodations(prev => [...prev, accommodationCode]);
      } else {
        setSelectedAccommodations(prev => prev.filter(code => code !== accommodationCode));
      }
    };

    const handlePageChange = async (newPage) => {
      setIsLoading(true);
      try {
        const param = new URLSearchParams(params);
        param.set('page', newPage);
        router.push(`${pathname}?${param.toString()}`);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handlePageSizeChange = async (newSize) => {
      setIsLoading(true);
      try {
        // Your API call with new page size
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSliderChange = (values) => {
      setPriceRange(values.value);
    };

    const HotelCard = ({ hotel }) => (
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        boxShadow="base"
        transition="all 0.2s"
        _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
        height="100%"
        display="flex"
        flexDirection="column"
        bg="white"
      >
        <Box position="relative">
          <Image 
            src={hotel.local_data.images?.length > 0 
              ? `${imageUrl}${hotel.local_data.images[0].path}` 
              : '/hotelplaceholder.png'
            } 
            alt={hotel.name}
            height="200px"
            width="100%"
            objectFit="cover"
            fallbackSrc="/hotelplaceholder.png"
          />
          <Badge 
            position="absolute" 
            top="2" 
            right="2"
            borderRadius="full"
            fontWeight={"bold"}
            px="2"
            bg="blue.800"
            color="white"
          >
          From {hotel.currency} {hotel.minRate}
          </Badge>
        </Box>
        
        <Box p="4" flex="1" display="flex" flexDirection="column">
          <Heading as="h3" size="md" mb="1" noOfLines={1}>{hotel.name}</Heading>
          
          <Flex align="center" mb="2">
            <Icon as={FiMapPin} mr="1" color="gray.500" />
            <Text color="gray.600" fontSize="sm" noOfLines={1}>
              {hotel?.local_data?.address || 'Address not available'}
            </Text>
          </Flex>
          
          {hotel?.reviews?.[0] && (
            <Flex align="center" mb="3">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  as={FiStar}
                  color={i < Math.floor(hotel.reviews[0].rate) ? 'yellow.400' : 'gray.300'}
                />
              ))}
              <Text ml="1" fontSize="sm">
                {hotel.reviews[0].rate} ({hotel.reviews[0].reviewCount} reviews)
              </Text>
            </Flex>
          )}
          
          <Text fontSize="sm" color="gray.600" mb="3" flex="1" noOfLines={2}>
            {hotel?.local_data?.description ? getFirstSentence(hotel.local_data.description) : 'No description available'}
          </Text>
          
          <Flex wrap="wrap" mb="4" gap={2}>
            {hotel?.local_data?.facilities?.slice(0, 4).map(amenity => (
              <Badge
                key={amenity.description}
                colorScheme="blue"
                variant="subtle"
                display="flex"
                alignItems="center"
                gap={1}
                px={2}
                py={1}
              >
                <Icon as={getAmenityIcon(amenity.description) || FiCheck} boxSize="3" />
                <Text fontSize="xs" textTransform="capitalize">
                  {amenity.description}
                </Text>
              </Badge>
            ))}
          </Flex>
          
          <Button
            colorScheme="blue" 
            width="full"
            _hover={{ textDecoration: 'none' }}
            onClick = {() => {buildUrl(hotel.code)}}
          >
            View Details
          </Button>
        </Box>
      </Box>
    );

    const FilterSidebar = () => {
      if (!(allHotels?.data?.length > 0)) return null;

      const rawMin = allHotels?.prices?.overallMinRate ?? 0;
      const rawMax = allHotels?.prices?.overallMaxRate ?? 0;

      const validMin = Number.isFinite(rawMin) ? rawMin : 0;
      const validMax = Number.isFinite(rawMax) && rawMax > validMin
        ? rawMax
        : validMin + 1;

      const safePriceRange = Array.isArray(priceRange) && priceRange.length === 2
        ? [
            Math.max(validMin, Math.min(priceRange[0], validMax - 1)),
            Math.min(validMax, Math.max(priceRange[1], validMin + 1)),
          ]
        : [validMin, validMax];

      const canRenderSlider = validMax > validMin;

      return (
        <Box
          borderWidth={{ base: '0px', md: '1px' }}
          p={{ base: '0px', md: '4' }}
          borderRadius="lg"
          position={isMobile ? "static" : "sticky"}
        >
          {/* PRICE RANGE */}
          <Box mb="6">
            <Text fontWeight="bold" mb="2">
              Price Range (per night)
            </Text>

            {canRenderSlider ? (
              <Slider.Root
                maxW="md"
                step={1}
                min={validMin}
                max={validMax}
                defaultValue={safePriceRange}
                onValueChangeEnd={(e) => setPriceRange(e.value)}
              >
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb index={0}>
                    <Slider.DraggingIndicator
                      layerStyle="fill.solid"
                      top="6"
                      rounded="sm"
                      px="1.5"
                    >
                      <Slider.ValueText />
                    </Slider.DraggingIndicator>
                  </Slider.Thumb>
                  <Slider.Thumb index={1}>
                    <Slider.DraggingIndicator
                      layerStyle="fill.solid"
                      top="6"
                      rounded="sm"
                      px="1.5"
                    >
                      <Slider.ValueText />
                    </Slider.DraggingIndicator>
                  </Slider.Thumb>
                </Slider.Control>
              </Slider.Root>
            ) : (
              <Text fontSize="sm" color="gray.500">
                Price data not available
              </Text>
            )}

            <Flex justify="space-between" mt="2">
              <Text fontSize="sm">EUR {validMin}</Text>
              <Text fontSize="sm">EUR {validMax}</Text>
            </Flex>
          </Box>

          {/* SORT BY */}
          <Box mb="6">
            <Text fontWeight="bold" mb="2">
              Sort By
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Sort by"
                width={{ base: 'full', md: 'full' }}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>

          {/* ACCOMMODATION TYPES */}
          <Box mb="6">
            <Text fontWeight="bold" mb="2">
              Accommodation types
            </Text>
            <Stack spacing={2}>
              {allHotels?.accommodations?.map((acc) => (
                <Checkbox.Root
                  key={acc.code}
                  checked={selectedAccommodations.includes(acc.code)}
                  onCheckedChange={(checked) =>
                    handleAccommodationChange(acc.code, checked)
                  }
                >
                  <Checkbox.HiddenInput />
                  <Flex justify="space-between" width="full">
                    <div>{acc.description}</div>
                    <Checkbox.Control />
                  </Flex>
                </Checkbox.Root>
              ))}
            </Stack>
          </Box>

          {/* ACTION BUTTONS */}
          <Button colorScheme="blue" width="full" onClick={handleFilter} mb="2">
            Apply Filters
          </Button>
          <Button variant="outline" width="full" onClick={handleReset}>
            Reset Filters
          </Button>
        </Box>
      );
    };

    const SearchBox = () => (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr' }} gap={4}>
          <GridItem>
            <Controller
              name="destination"
              control={control}
              rules={{ required: 'Please enter a destination.' }}
              render={({ field }) => (
                <CustomHotelTypeahead 
                  value={field.value} 
                  onChange={field.onChange}
                  initialQuery={initialQuery}
                  icon={<FaHotel />}
                  id="hotel-destination"
                />
              )}
            />
            {errors.destination && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.destination.message}
              </Text>
            )}
          </GridItem>
          <GridItem>
            <Controller
              name="departureDate"
              control={control}
              rules={{ required: 'Please select your checkin/checkout date.' }}
              render={({ field }) => (
                <DatePicker
                  placeholder="Checkin / Checkout Date"
                  mode="range"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  minDate={new Date().toISOString().split('T')[0]}
                  color="black"
                  borderColor="#9ca3af"
                  error={errors.destination?.message}
                />
              )}
            />
            {errors.departureDate && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.departureDate.message}
              </Text>
            )}
          </GridItem>
          <GridItem rounded="md" bgColor={"white"}>
            <Accordion.Root value={isAccordionOpen ? "occupants" : ""} onValueChange={(details) => setIsAccordionOpen(details.value.includes("occupants"))} collapsible pl={3} pr={3}>
              <Accordion.Item value="occupants" border="none" boxShadow="none">
                <Accordion.ItemTrigger>
                  <Span color="black" flex="1">
                    Occupants ({totals.adults} {totals.adults > 1 ? 'Adults' : 'Adult'}, {totals.children} {totals.children > 1 ? 'Children' : 'Child'}, {totals.infants} {totals.infants > 1 ? 'Infants' : 'Infant'}, {totals.rooms} {totals.rooms > 1 ? 'Rooms' : 'Room'})
                  </Span>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <VStack spacing={4} align="stretch">
                    {rooms.map((room, roomIndex) => (
                      <Box key={roomIndex} border="1px" borderColor="gray.200" rounded="md" p={3}>
                        <Flex justifyContent="space-between" alignItems="center" mb={2}>
                          <Text fontWeight="bold" color="black">
                            Room {roomIndex + 1}
                          </Text>
                          {rooms.length > 1 && (
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removeRoom(roomIndex)}
                              aria-label="Remove room"
                            >
                              <FaTrash />
                            </IconButton>
                          )}
                        </Flex>
                        
                        {/* Adults */}
                        <Flex justifyContent="space-between" alignItems="center" mb={3}>
                          <Text color="black">Adults</Text>
                          <NumberInput.Root 
                            value={room.adults} 
                            onValueChange={(e) => updateRoom(roomIndex, 'adults', e.value)} 
                            min={1} 
                            max={3} 
                            unstyled 
                            spinOnPress={false}
                          >
                            <HStack gap="2">
                              <NumberInput.DecrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                  <LuMinus />
                                </IconButton>
                              </NumberInput.DecrementTrigger>
                              <NumberInput.ValueText textAlign="center" color="black" fontSize="lg" minW="3ch" />
                              <NumberInput.IncrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                  <LuPlus />
                                </IconButton>
                              </NumberInput.IncrementTrigger>
                            </HStack>
                          </NumberInput.Root>
                        </Flex>

                        {/* Children */}
                        <Flex justifyContent="space-between" alignItems="center" mb={3}>
                          <Text color="black">Children</Text>
                          <NumberInput.Root 
                            value={room.children} 
                            onValueChange={(e) => updateRoom(roomIndex, 'children', e.value)} 
                            min={0} 
                            max={3} 
                            unstyled 
                            spinOnPress={false}
                          >
                            <HStack gap="2">
                              <NumberInput.DecrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                  <LuMinus />
                                </IconButton>
                              </NumberInput.DecrementTrigger>
                              <NumberInput.ValueText textAlign="center" color="black" fontSize="lg" minW="3ch" />
                              <NumberInput.IncrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                  <LuPlus />
                                </IconButton>
                              </NumberInput.IncrementTrigger>
                            </HStack>
                          </NumberInput.Root>
                        </Flex>

                        {/* Children Ages */}
                        {room.children > 0 && (
                          <Box mb={3}>
                            <Text color="black" mb={2}>Children Ages</Text>
                            <Grid templateColumns={{ base: '1fr 1fr', md: '1fr 1fr', lg: '1fr 1fr' }} gap={2}>
                              {room.childrenAges.slice(0, room.children).map((ageValue, childIndex) => (
                                <GridItem key={childIndex}>
                                  <NativeSelect.Root
                                    size="sm"
                                    value={ageValue}
                                    onChange={(e) => updateChildAge(roomIndex, childIndex, e.target.value)}
                                  >
                                    <NativeSelect.Field placeholder={`Child ${childIndex + 1} Age`}>
                                      <option value="">Select Age</option>
                                      {[...Array(17)].map((_, age) => (
                                        <option key={age} value={age + 1}>
                                          {age + 1}
                                        </option>
                                      ))}
                                    </NativeSelect.Field>
                                  </NativeSelect.Root>
                                </GridItem>
                              ))}
                            </Grid>
                          </Box>
                        )}

                        {/* Infants */}
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text color="black">Infants</Text>
                          <NumberInput.Root 
                            value={room.infants} 
                            onValueChange={(e) => updateRoom(roomIndex, 'infants', e.value)} 
                            min={0} 
                            max={3} 
                            unstyled 
                            spinOnPress={false}
                          >
                            <HStack gap="2">
                              <NumberInput.DecrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                  <LuMinus />
                                </IconButton>
                              </NumberInput.DecrementTrigger>
                              <NumberInput.ValueText textAlign="center" color="black" fontSize="lg" minW="3ch" />
                              <NumberInput.IncrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                  <LuPlus />
                                </IconButton>
                              </NumberInput.IncrementTrigger>
                            </HStack>
                          </NumberInput.Root>
                        </Flex>
                      </Box>
                    ))}
                    
                    {/* Add Room Button */}
                    {rooms.length < 3 && (
                      <Button 
                        onClick={addRoom} 
                        variant="outline" 
                        colorScheme="blue" 
                        size="sm"
                        w="full"
                      >
                        + Add Another Room
                      </Button>
                    )}
                  </VStack>
                </Accordion.ItemContent>
              </Accordion.Item>
            </Accordion.Root>
          </GridItem>

          <GridItem>
            <Button type="submit" bg="blue.700" rounded="lg" w="full" size="md">Continue</Button>
          </GridItem>
        </Grid>
      </form>
    );

  return (
    <Suspense fallback={<LoadingSpinner show={true} text="Loading..." />}>
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Container maxW="container.xl" py="6">
        <LoadingSpinner show={isLoading} text="Processing your request..." />
        {/* Search and Sort Bar */}
        {!isMobile && (
          <Box borderWidth="1px" borderColor="gray.200" p="4" shadow="md" borderRadius="md" mb="5">
            <SearchBox />
          </Box>
        )}
        
        <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap="6">
          {/* Sidebar - Hidden on mobile, shown in modal */}
          {!isMobile && (
            <GridItem>
              <FilterSidebar />
            </GridItem>
          )}
          
          {/* Hotel Listing */}
          <GridItem>
            <Flex mb="4" align="center">
              <Text fontSize="25" color="gray.600">
                {allHotels?.data?.length > 0 &&  `${allHotels?.pagination?.total_items} deals found in ${allHotels?.data[0]?.destinationName}`}
              </Text>
              <Flex marginLeft="auto" gap={2} display={{ base: 'flex', md: 'none' }}>
                <IconButton><FiSearch onClick={() => setIsOpenModal(true)} /></IconButton>
                <IconButton><FiFilter onClick={() => setIsOpen(true)} /></IconButton>
              </Flex>
            </Flex>
            
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
                      {allHotels.errors.map((error, index) => (
                        <Text key={index} color="red.700" fontSize="sm" mb="1">
                          • {error.detail || error.title}
                        </Text>
                      ))}
                    </Box>
                    <Text color="gray.600" mb="4">
                      Please adjust your search criteria and try again.
                    </Text>
                  </>
                ) : (
                  /* Original no results message */
                  <>
                    <Heading as="h3" size="md" mb="2">No hotels match your filters</Heading>
                    <Text color="gray.600">Try adjusting your search criteria</Text>
                  </>
                )}
                <Button mt="4" colorScheme="blue" onClick={handleReset}>
                  Reset Filters
                </Button>
              </Box>
            ) : (
              <Grid 
                templateColumns={{ 
                  base: '1fr', 
                  sm: 'repeat(2, 1fr)', 
                  lg: 'repeat(3, 1fr)' 
                }} 
                gap="6"
              >
                {allHotels?.data?.map(hotel => (
                  <GridItem key={hotel.code}>
                    <HotelCard hotel={hotel} />
                  </GridItem>
                ))}
              </Grid>
            )}
          </GridItem>
        </Grid>
        
        {/* Pagination */}
        {allHotels?.data?.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[6, 12, 24, 48]}
            showPageSize={true}
            showTotal={true}
            mt={4}
          />
        )}
      </Container>
                      
      {/* Mobile Filter Modal */}
      <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Filters</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <FilterSidebar />
              </Drawer.Body>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
      
      {/* Mobile Search Modal */}
      <Drawer.Root open={isOpenModal} onOpenChange={(e) => setIsOpenModal(e.open)}>
        <div className="drawer-search-wrapper">
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Search</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <SearchBox />
                </Drawer.Body>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </div>
      </Drawer.Root>

      <Footer />
    </Box>
    </Suspense>
  );
}