"use client";
import {
  Box,
  Tabs,
  Flex,
  HStack,
  FormLabel,
  Input,
  InputGroup,
  Select,
  Button,
  Text,
  Grid,
  GridItem,
  Accordion,
  Span,
  NumberInput,
  IconButton,
  NativeSelect
} from "@chakra-ui/react";
import {
  FaFacebookF, FaTwitter, FaInstagram, FaHotel, FaPlane, FaCar, FaUser,
  FaCalendar
} from 'react-icons/fa'
import React from "react";
import { LuMinus, LuPlus } from "react-icons/lu"
import { Controller,useForm } from "react-hook-form";
import CustomTypeahead from "./customtypeahead";
import dynamic from "next/dynamic";
import { BiSolidPlaneLand, BiSolidPlaneTakeOff } from "react-icons/bi";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
//import CustomHotelTypeahead from "./customhoteltypeahead";
const DatePicker = dynamic(() => import("./datepicker"), { ssr: false });
const CustomHotelTypeahead = dynamic(() => import("./customhoteltypeahead"), { ssr: false });

export default function BookingSection() {

    const [Cvalue, setCValue] = React.useState("flight");
    const [adultValue, setAdultValue] = React.useState(1);
    const [childValue, setChildValue] = React.useState(0);
    const [infantValue, setInfantValue] = React.useState(0);
    const [roomValue, setRoomValue] = React.useState(1);
    const [childrenAges, setChildrenAges] = React.useState([]);
    const router = useRouter();

  // Sync the array length with childValue while preserving selected ages
  useEffect(() => {
    setChildrenAges((prev) => {
      if (childValue > prev.length) {
        // Add new slots
        return [...prev, ...Array(childValue - prev.length).fill("")];
      } else if (childValue < prev.length) {
        // Remove extra slots
        return prev.slice(0, childValue);
      }
      return prev;
    });
  }, [childValue]);

  // Update a child’s age
  const handleAgeChange = (index, value) => {
    setChildrenAges((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

    const { register: registerForm1, handleSubmit: handleSubmitForm1, formState: { errors: errorsForm1 }, setValue: setValueForm1, control: controlForm1 } = useForm();
    const { register: registerForm2, handleSubmit: handleSubmitForm2, formState: { errors: errorsForm2 }, setValue: setValueForm2, control: controlForm2 } = useForm();

    const onSubmit = async (data, formName) => {
            if (formName === 'hotelform') {
            // Prepare URL parameters
            const params = new URLSearchParams();
            
            // Add destination
            if (data.destination) {
                params.append('destination', data.destination);
            }
            
            // Add dates (assuming data.departureDate is an array with [checkin, checkout])
            if (data.departureDate && Array.isArray(data.departureDate)) {
                // Format dates as YYYY-MM-DD
                const formatDate = (date) => {
                if (!date) return '';
                const d = new Date(date);
                return d.toISOString().split('T')[0];
                };
                
                params.append('checkIn', formatDate(data.departureDate.start));
                params.append('checkOut', formatDate(data.departureDate.end));
            }

            params.append('checkIn', data.departureDate.start);
            params.append('checkOut', data.departureDate.end);

            // Add occupants
            params.append('adults', adultValue);
            params.append('children', childValue);
            params.append('rooms', roomValue);
            
            // Add child ages in the format "1,1" (comma-separated)
            if (childValue > 0) {
                // Use the childrenAges state which should be in sync with the form
                const childAgesToSend = childrenAges.slice(0, childValue).map(age => age || '1');
                params.append('child_ages', childAgesToSend.join(','));
            }
            
            // Navigate to hotel listing page with query parameters
            router.push(`/hotel_listings?${params.toString()}`);
        }
    };

        

return (
    <Box
        bgImage="url('/05.jpg')"
        bgSize="cover"
        bgPos="center"
        rounded="xl"
        py={{ base: 6, lg: 10 }}
        px={4}
    >
    <Box maxW="5xl" mx="auto" bgColor={"whiteAlpha.800"} p={3} rounded="lg" boxShadow="lg">
            <Tabs.Root value={Cvalue} onValueChange={(e) => setCValue(e.value)} variant="enclosed" colorScheme="blue" defaultValue="flight" maxW="5xl" mx="auto">
                    {/* Main Tabs */}
                    <Tabs.List
                            display="flex"
                            bgColor={"blue.700"}
                            color={"white"}
                            rounded="lg"
                    >
                    <Tabs.Trigger color={Cvalue === "flight" ? "blue.500" : "gray.200"} value="flight">
                            <FaPlane /> Flight
                    </Tabs.Trigger>
                    <Tabs.Trigger color={Cvalue === "hotel" ? "blue.500" : "gray.200"} value="hotel">
                            <FaHotel /> Hotel
                    </Tabs.Trigger>
                    <Tabs.Trigger color={Cvalue === "cars" ? "blue.500" : "gray.200"} value="cars">
                            <FaCar /> Cars
                    </Tabs.Trigger>
                    </Tabs.List>

                    {/* Flight Tab Content */}
                    <Tabs.Content value="flight" px={2} rounded="md">
                        <Tabs.Root defaultValue="roundtrip" w="full">
                            <Tabs.List display="flex" >
                                    <Tabs.Trigger value="roundtrip">
                                        Round Trip
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="oneway">
                                        One Way
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="multicity">
                                        Multi-City
                                    </Tabs.Trigger>
                            </Tabs.List>
                            <Tabs.Content value="roundtrip" rounded="md">

                                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr' }} gap={4}>
                                    <GridItem>
                                            <Controller
                                                name="departure"
                                                control={controlForm1}
                                                rules={{ required: 'Please enter a departure location.' }}
                                                render={({ field }) => (
                                                <CustomTypeahead
                                                    id="one-flight-from"
                                                    icon={<BiSolidPlaneTakeOff />}
                                                    placeholder="Departure"
                                                    name="departure"
                                                    onCodeSelect={(code) => field.onChange(code)}
                                                    error={errorsForm1.departure}
                                                    initialQuery=""
                                                />
                                                )}
                                            />
                                    </GridItem>
                                    <GridItem>
                                        <Controller
                                            name="arrival"
                                            control={controlForm1}
                                            rules={{ required: 'Please enter a arrival location.' }}
                                            render={({ field }) => (
                                            <CustomTypeahead
                                                id="one-flight-to"
                                                icon={<BiSolidPlaneLand />}
                                                placeholder="Arrival"
                                                name="arrival"
                                                onCodeSelect={(code) => field.onChange(code)}
                                                error={errorsForm1.arrival}
                                                initialQuery=""
                                            />
                                            )}
                                        />
                                        
                                    </GridItem>
                                    <GridItem>
                                        <Controller
                                            name="departureDate"
                                            control={controlForm1}
                                            rules={{ required: 'Please select a departure/arrival date.' }}
                                            render={({ field }) => (
                                            <DatePicker
                                                placeholder="Departure Date"
                                                mode="range"
                                                value={field.value}
                                                onChange={field.onChange}
                                                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                                color="black"
                                                borderColor="#9ca3af"

                                            />
                                            )}
                                        />
                                    </GridItem>
                                    <GridItem rounded="md" bgColor={"white"}>
                                        <Accordion.Root collapsible pl={3} pr={3}>
                                            <Accordion.Item>
                                                <Accordion.ItemTrigger>
                                                    <Span color="black" flex="1">Passenger({adultValue} {adultValue > 1 ? 'Adults' : 'Adult'}, {childValue} {childValue > 1 ? 'Children' : 'Child'}, {roomValue} {roomValue > 1 ? 'Rooms' : 'Room'})</Span>
                                                    <Accordion.ItemIndicator />
                                                </Accordion.ItemTrigger>
                                                <Accordion.ItemContent>
                                                    <Accordion.ItemBody>
                                                        <Flex justifyContent="space-between" alignItems="center">
                                                            <Text color="black" mb={1}>{adultValue} {adultValue > 1 ? 'Adults' : 'Adult'}</Text>
                                                            <NumberInput.Root defaultValue="1" value={adultValue} onValueChange={(e) => setAdultValue(e.value)} min={1} max={50} unstyled spinOnPress={false}>
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
                                                            <NumberInput.Root defaultValue="1" value={childValue} onValueChange={(e) => setChildValue(e.value)} min={0} max={50} unstyled spinOnPress={false}>
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
                                                            <Text color="black" mb={1}>{infantValue} {infantValue > 1 ? 'Infants' : 'Infant'}</Text>
                                                            <NumberInput.Root defaultValue="1" value={infantValue} onValueChange={(e) => setInfantValue(e.value)} color="black" min={0} max={50} unstyled spinOnPress={false}>
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
                                </Grid>
                                
                            </Tabs.Content>
                            <Tabs.Content value="oneway" rounded="md">One Way</Tabs.Content>
                            <Tabs.Content value="multicity" rounded="md">Multi-City</Tabs.Content>
                        </Tabs.Root>
                    </Tabs.Content>

                    {/* Hotel Tab Content */}
                    <Tabs.Content value="hotel" rounded="md">
                        
                    <form onSubmit={handleSubmitForm2(data => onSubmit(data, 'hotelform'))}>
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr' }} gap={4}>
                            <GridItem>
                                <Controller
                                    name="destination"
                                    control={controlForm2}
                                    rules={{ required: 'Please enter a destination.' }}
                                    render={({ field }) => (
                                        <CustomHotelTypeahead 
                                            value={field.value} 
                                            onChange={field.onChange} 
                                            error={errorsForm2.destination}
                                            initialQuery=""
                                            icon={<FaHotel />}
                                            id="hotel-destination"
                                        />
                                    )}
                                />
                                {errorsForm2.destination && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        {errorsForm2.destination.message}
                                    </Text>
                                )}
                            </GridItem>
                            <GridItem>
                                <Controller
                                    name="departureDate"
                                    control={controlForm2}
                                    rules={{ required: 'Please select your checkin/checkout date.' }}
                                    render={({ field }) => (
                                        <DatePicker
                                            placeholder="Checkin / Checkout Date"
                                            mode="range"
                                            value={field.value}
                                            onChange={field.onChange}
                                            minDate={new Date().toISOString().split('T')[0]}
                                            color="black"
                                            borderColor="#9ca3af"
                                        />
                                    )}
                                />
                                {errorsForm2.departureDate && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        {errorsForm2.departureDate.message}
                                    </Text>
                                )}
                            </GridItem>
                            <GridItem rounded="md" bgColor={"white"}>
                                <Accordion.Root collapsible pl={3} pr={3}>
                                    <Accordion.Item>
                                        <Accordion.ItemTrigger>
                                            <Span color="black" flex="1">Ocuppants ({adultValue} {adultValue > 1 ? 'Adults' : 'Adult'}, {childValue} {childValue > 1 ? 'Children' : 'Child'}, {infantValue} {infantValue > 1 ? 'Rooms' : 'Room'})</Span>
                                            <Accordion.ItemIndicator />
                                        </Accordion.ItemTrigger>
                                        <Accordion.ItemContent>
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
                                                <Grid bgColor={"white"} templateColumns={{ base: '1fr 1fr', md: '1fr 1fr', lg: '1fr 1fr' }} gap={4}>
                                                    {childrenAges.map((ageValue, childIndex) => (
                                                        <GridItem key={childIndex}>
                                                        <label>{`Child ${childIndex + 1} Age`}</label>
                                                        <NativeSelect.Root
                                                            size="sm"
                                                            name={`child_age_${childIndex}`}
                                                            value={ageValue}
                                                            onChange={(e) => handleAgeChange(childIndex, e.target.value)}
                                                        >
                                                            <NativeSelect.Field placeholder="Select option">
                                                                {[...Array(17)].map((_, age) => (
                                                                    <option key={age} value={age + 1}>
                                                                        {age + 1}
                                                                    </option>
                                                                ))}
                                                            </NativeSelect.Field>
                                                        </NativeSelect.Root>
                                                        {/* Hidden input for form submission */}
                                                        <input 
                                                            type="hidden" 
                                                            {...registerForm2(`child_age_${childIndex}`)} 
                                                            value={ageValue} 
                                                        />
                                                        </GridItem>

                                                    ))}
                                                </Grid>
                                            </Accordion.ItemBody>
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

                        <input type="hidden" {...registerForm2('adults')} value={adultValue} />
                        <input type="hidden" {...registerForm2('children')} value={childValue} />
                        <input type="hidden" {...registerForm2('rooms')} value={roomValue} />
                        </form>
                    </Tabs.Content>

            </Tabs.Root>

            </Box>

    </Box>
);
}
