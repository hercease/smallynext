// pages/index.js
'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  CloseButton
} from '@chakra-ui/react';
import { FiFilter, FiMapPin, FiWifi, FiCoffee, FiTv, FiWind, FiSearch, FiStar } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaHotel, FaPlane, FaCar, FaUser, FaCalendar } from 'react-icons/fa'
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


const amenityIcons = {
  wifi: FiWifi,
  breakfast: FiCoffee,
  "air conditioning": FiWind,
  tv: FiTv
};

export default function HotelListingPage() {
    const router = useRouter();
    const params = useSearchParams();
    const pathname = usePathname();
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [allHotels, setAllHotels] = useState([]);
    const [priceRange, setPriceRange] = useState([0,0]);
    const [selectedAccommodations, setSelectedAccommodations] = useState(params.getAll('accomodations') || []);
    const [sortOption, setSortOption] = useState('price-low');
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [adultValue, setAdultValue] = React.useState(1);
    const [childValue, setChildValue] = React.useState(params.get('children') || 0);
    const [infantValue, setInfantValue] = React.useState(0);
    const [roomValue, setRoomValue] = React.useState(params.get('rooms') || 1);
    const [childrenAges, setChildrenAges] = React.useState([]);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const imageUrl = "http://photos.hotelbeds.com/giata/";
    const datevalue = {
      start: params.get('checkIn') || null,
      end: params.get('checkOut') || null,
    };
    const [pagination, setPagination] = useState({
      current_page: allHotels?.pagination?.current_page || 1,
      has_next: allHotels?.pagination?.has_next || false,
      has_prev: allHotels?.pagination?.has_prev || false,
      offset: allHotels?.pagination?.offset || 0,
      page_size: allHotels?.pagination?.page_size || 6,
      total_items: allHotels?.pagination?.total_items || 2,
      total_pages: allHotels?.pagination?.total_pages || 1
    });

    //console.log("Initial Pagination:", pagination);

    const { control, handleSubmit, register, formState: { errors }, setValue, watch } = useForm({defaultValues: {
      'departureDate' : datevalue
    }});

    const isMobile = useBreakpointValue({ base: true, md: false });

    // Update form values when number inputs change
    useEffect(() => {
        const childAgesParam = params.get('child_ages');
        if (childAgesParam) {
            // Split the comma-separated string and convert to array of numbers/strings
            const agesArray = childAgesParam.split(',').map(age => age.trim());
            setChildrenAges(agesArray);
            
            // Also set the childValue based on the number of ages provided
            setChildValue(agesArray.length);
        } else {
            // If no child_ages in URL, initialize based on childValue
            const childCount = parseInt(params.get('children')) || 0;
            setChildrenAges(Array(childCount).fill(""));
        }
    }, [params]);

    // Update childrenAges array when childValue changes
    useEffect(() => {
        const childCount = childValue;
        
        setChildrenAges((prev) => {
            if (childCount > prev.length) {
                // Add new slots with empty values
                return [...prev, ...Array(childCount - prev.length).fill("")];
            } else if (childCount < prev.length) {
                // Remove extra slots but preserve existing ages
                return prev.slice(0, childCount);
            }
            return prev;
        });
    }, [childValue, params]);
  
    // Update a child’s age
    const handleAgeChange = (index, value) => {
      setChildrenAges((prev) => {
        const updated = [...prev];
        updated[index] = value;
        return updated;
      });
    };

  const initialQuery = useMemo(() => params.get('destination') || '', [params]);
  const minRate = parseFloat(params.get('minRate') || 0);
  const maxRate = parseFloat(params.get('maxRate') || 0);
  const accoms = params.getAll('accommodations') || [];
  //console.log("CheckIn value:", params.get('checkIn'));
  console.log(selectedAccommodations);

  //console.log(minRate, maxRate);

  const fetchHotels = useCallback(() => {
    setIsLoading(true);

    const formData = new URLSearchParams();

    formData.append("destination", params.get("destination") || "");
    formData.append("checkIn", params.get("checkIn") || "");
    formData.append("checkOut", params.get("checkOut") || "");
    formData.append("rooms", params.get("rooms") || "1");
    formData.append("adults", params.get("adults") || "1");
    formData.append("children", params.get("children") || "0");
    formData.append("childAges", params.get("child_ages") || "");
    formData.append("minRate", params.get("minRate") || "");
    formData.append("maxRate", params.get("maxRate") || "");
    formData.append("page", params.get("page") || "1");

    // Get accommodations from URL params instead of state
     const accommodationsFromParams = params.get("accommodations");
      if (accommodationsFromParams) {
        const accommodationsArray = accommodationsFromParams.split(",");
        accommodationsArray.forEach(acc => {
          if (acc.trim()) {
            formData.append("accommodations[]", acc.trim());
          }
        });
      }

    const response = fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/searchhotels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: formData.toString(),
    }).then(response => response.json())
      .then(data => {
        setAllHotels(data);
        console.log('Request results:', data);
        setIsLoading(false);
      });
  }, [params]); // Now only depends on params

// only run on mount / when params change
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
      // Prepare form data for x-www-form-urlencoded
      const formData = new URLSearchParams();
      
      formData.append('destination', data.destination);
      formData.append('checkIn', data.departureDate.start);
      formData.append('checkOut', data.departureDate.end);
      formData.append('rooms', data.rooms);
      formData.append('adults', data.adults);
      formData.append('children', data.children);
      formData.append('childAges', childrenAges.join(','));

      setIsOpenModal(false);

      router.push(`/hotel_listings?${formData.toString()}`);

    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (show message to user)
    } finally {
      setIsLoading(false);
    }
  };
  
  const hotels = filteredHotels || allHotels || [];

  console.log(allHotels?.prices);

  const handleFilter = () => {

    const param = new URLSearchParams(params);
    
    selectedAccommodations.forEach((checkedItem) => {
      param.append('accommodations[]', checkedItem);
    });

    console.log(selectedAccommodations);

    param.set('minRate', priceRange[0]);
    param.set('maxRate', priceRange[1]);



    // Construct the new URL string
    const newUrl = `${pathname}?${param.toString()}`;

    // Decode any encoded characters (like `+` back to space)
    const decodedUrl = decodeURIComponent(newUrl);

    console.log(decodedUrl);

    if (isMobile) setIsOpen(false);

    // Update the URL without a page reload
    router.push(decodedUrl);
    
    // Sort results
   /* if (sortOption === 'price-low') {
      results.sort((a, b) => a.minRate - b.minRate);
    } else if (sortOption === 'price-high') {
      results.sort((a, b) => b.minRate - a.minRate);
    } else if (sortOption === 'rating') {
      results.sort((a, b) => b.minRate - a.minRate);
    } */
    
 
    
  };


  const handleReset = () => {

    setPriceRange([0, 0]);
    setSelectedAccommodations([]);

    const formData = new URLSearchParams();

    formData.append('destination', params.get('destination'));
    formData.append('checkIn', params.get('checkIn'));
    formData.append('checkOut', params.get('checkOut'));
    formData.append('rooms', params.get('rooms'));
    formData.append('adults', params.get('adults'));
    formData.append('children', params.get('children'));
    formData.append('childAges', params.get('childAges'));

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
        // Your API call to fetch new page
        const param = new URLSearchParams(params);
        param.set('page', newPage);
        router.push(`${pathname}?${param.toString()}`);
        //console.log("New Page:", newPage);
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
      //console.log("New Size:", newSize);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setIsLoading(false);
    }
  };


  //console.log(priceRange);

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
        {hotel.currency} {hotel.minRate} / night
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
              <Icon as={getAmenityIcon(amenity.description)} boxSize="3" />
              <Text fontSize="xs" textTransform="capitalize">
                {amenity.description}
              </Text>
            </Badge>
          ))}
        </Flex>
        
        <Button 
          as="a"
          href={`/hotel/${hotel.code}`}
          colorScheme="blue" 
          width="full"
          _hover={{ textDecoration: 'none' }}
        >
          View Details
        </Button>
      </Box>
    </Box>
  );

  const FilterSidebar = () => (
    <Box  
      borderWidth={{ base: '0px', md: '1px' }}
      p={{ base: '0px', md: '4' }}
      borderRadius="lg" 
      position={isMobile ? "static" : "sticky"}
    >
      <Box mb="6">
        <Text fontWeight="bold" mb="2">Price Range (per night)</Text>
        <Slider.Root maxW="md" step={1} min={allHotels?.data?.length > 0 ? allHotels?.prices?.overallMinRate || 0 : 0} max={allHotels?.data?.length > 0 ? allHotels?.prices?.overallMaxRate || 1000 : 1000} defaultValue={priceRange}   onValueChangeEnd={(e) => setPriceRange(e.value)}>
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
        <Flex justify="space-between" mt="2">
          <Text fontSize="sm">EUR {allHotels?.prices?.overallMinRate || 0}</Text>
          <Text fontSize="sm">EUR {allHotels?.prices?.overallMaxRate || 1000}</Text>
        </Flex>
      </Box>

      <Box mb="6">
        <Text fontWeight="bold" mb="2">Sort By</Text>
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
      
        <Box mb="6">
          <Text fontWeight="bold" mb="2">Accommodation types</Text>
          <Box>
            <Stack spacing={2}>
              {allHotels?.data?.length > 0 && allHotels?.accommodations.map(accommodation => (
                <Checkbox.Root 
                  key={accommodation.code}
                  checked={selectedAccommodations.includes(accommodation.code)}
                  onCheckedChange={(checked) => handleAccommodationChange(accommodation.code, checked)}
                >
                  <Checkbox.HiddenInput />
                  <Flex justify="space-between" width="full">
                    <div>{accommodation.description}</div>
                    <Checkbox.Control />
                  </Flex>
                </Checkbox.Root>
              ))}
            </Stack>
          </Box>
        </Box>
      
      <Button colorScheme="blue" width="full" onClick={handleFilter} mb="2">
        Apply Filters
      </Button>
      <Button variant="outline" width="full" onClick={handleReset}>
        Reset Filters
      </Button>
    </Box>
  );

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
                                                <Span color="black" flex="1">Occupants ({adultValue} {adultValue > 1 ? 'Adults' : 'Adult'}, {childValue} {childValue > 1 ? 'Children' : 'Child'}, {roomValue} {roomValue > 1 ? 'Rooms' : 'Room'})</Span>
                                                <Accordion.ItemIndicator />
                                            </Accordion.ItemTrigger>
                                            <Accordion.ItemContent>
                                                {/* ... adult and room sections remain the same */}
                                                <Accordion.ItemBody>
                                                    <Flex justifyContent="space-between" alignItems="center">
                                                        <Text color="black" mb={1}>{adultValue} {adultValue > 1 ? 'Adults' : 'Adult'}</Text>
                                                        <NumberInput.Root defaultValue="1" value={adultValue} onValueChange={(e) => setAdultValue(e.value)} min={1} max={4} unstyled spinOnPress={false}>
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
                                                </Accordion.ItemBody>
                                                
                                                <Accordion.ItemBody>
                                                    <Flex justifyContent="space-between" alignItems="center">
                                                        <Text color="black" mb={1}>{childValue} {childValue > 1 ? 'Children' : 'Child'}</Text>
                                                        <NumberInput.Root defaultValue="0" value={childValue} onValueChange={(e) => setChildValue(e.value)} min={0} max={4} unstyled spinOnPress={false}>
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
                                                    
                                                    {/* Dynamic children ages selection */}
                                                    
                                                        <Grid bgColor={"white"} templateColumns={{ base: '1fr 1fr', md: '1fr 1fr', lg: '1fr 1fr' }} gap={4} mt={3}>
                                                            {childrenAges.slice(0, childValue).map((ageValue, childIndex) => (
                                                                <GridItem key={childIndex}>
                                                                    <label>{`Child ${childIndex + 1} Age`}</label>
                                                                    <NativeSelect.Root size="sm">
                                                                        <NativeSelect.Field
                                                                            name={`child_age_${childIndex}`}
                                                                            value={ageValue}
                                                                            onChange={(e) => handleAgeChange(childIndex, e.target.value)}
                                                                        >
                                                                            <option value="">Select age</option>
                                                                            {[...Array(17)].map((_, age) => (
                                                                                <option key={age} value={age + 1}>
                                                                                    {age + 1} {age === 0 ? 'year' : 'years'}
                                                                                </option>
                                                                            ))}
                                                                        </NativeSelect.Field>
                                                                    </NativeSelect.Root>
                                                                    {/* Hidden input for form submission */}
                                                                    <input 
                                                                        type="hidden" 
                                                                        {...register(`child_age_${childIndex}`)} 
                                                                        value={ageValue} 
                                                                    />
                                                                </GridItem>
                                                            ))}
                                                        </Grid>
                                                    
                                                </Accordion.ItemBody>
                                                
                                                {/* ... room section remains the same */}
                                                <Accordion.ItemBody>
                                                    <Flex justifyContent="space-between" alignItems="center">
                                                        <Text color="black" mb={1}>{roomValue} {roomValue > 1 ? 'Room' : 'Room'}</Text>
                                                        <NumberInput.Root defaultValue="1" value={roomValue} onValueChange={(e) => setRoomValue(e.value)} color="black" min={1} max={1} unstyled spinOnPress={false}>
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
                                                </Accordion.ItemBody>
                                            </Accordion.ItemContent>
                                        </Accordion.Item>
                                    </Accordion.Root>
                                </GridItem>

                                <GridItem>
                                    <Button type="submit" bg="blue.700" rounded="lg" w="full" size="md">Continue</Button>
                                </GridItem>
                            </Grid>
    
                            <input type="hidden" {...register('adults')} value={adultValue} />
                            <input type="hidden" {...register('children')} value={childValue} />
                            <input type="hidden" {...register('rooms')} value={roomValue} />

                            {/* Register all child ages for form submission */}
                            {childrenAges.map((age, index) => (
                                  <input 
                                    key={index}
                                    type="hidden" 
                                    {...register(`child_ages.${index}`)} 
                                    value={age} 
                                  />
                            ))}
                          </form>

                    );

  return (

    <Box minH="100vh" bg="gray.50">
      <LoadingSpinner show={isLoading} text="Processing your request..." />
      <Header />
      <Container maxW="container.xl" py="6">
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
                  {allHotels?.data?.length > 0 &&  `${allHotels?.data?.length} properties found in ${allHotels?.data[0]?.destinationName}`}
                </Text>
                <Flex marginLeft="auto" gap={2} display={{ base: 'flex', md: 'none' }}>
                    <IconButton><FiSearch onClick={() => setIsOpenModal(true)} /></IconButton>
                    <IconButton><FiFilter onClick={() => setIsOpen(true)} /></IconButton>
                </Flex>
            </Flex>
            
            {allHotels?.data?.length === 0 ? (
                <Box textAlign="center" py="10">
                <Heading as="h3" size="md" mb="2">No hotels match your filters</Heading>
                <Text color="gray.600">Try adjusting your search criteria</Text>
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
  );
}