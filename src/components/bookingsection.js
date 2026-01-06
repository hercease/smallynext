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
  NativeSelect,
  VStack
} from "@chakra-ui/react";
import {
  FaFacebookF, FaTwitter, FaInstagram, FaHotel, FaPlane, FaCar, FaUser,
  FaCalendar, FaTrash
} from 'react-icons/fa'
import React from "react";
import { LuMinus, LuPlus } from "react-icons/lu"
import { Controller,useForm } from "react-hook-form";
import CustomTypeahead from "./customtypeahead";
import dynamic from "next/dynamic";
import { BiSolidPlaneLand, BiSolidPlaneTakeOff } from "react-icons/bi";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

const DatePicker = dynamic(() => import("./datepicker"), { ssr: false });
const CustomHotelTypeahead = dynamic(() => import("./customhoteltypeahead"), { ssr: false });

// Room configuration structure
const initialRoomState = {
  adults: 1,
  children: 0,
  childrenAges: []
};

export default function BookingSection() {
    const [Cvalue, setCValue] = React.useState("hotel");
    const [rooms, setRooms] = React.useState([{...initialRoomState}]);
    const router = useRouter();

    // Initialize with one room
    useEffect(() => {
        setRooms([{...initialRoomState}]);
    }, []);

    // Add a new room (max 3)
    const addRoom = () => {
        if (rooms.length < 3) {
            setRooms(prev => [...prev, {...initialRoomState}]);
        }
    };

    // Remove a room (min 1)
    const removeRoom = (index) => {
        if (rooms.length > 1) {
            setRooms(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Update room configuration
    const updateRoom = (index, field, value) => {
        setRooms(prev => {
            const updated = [...prev];
            
            if (field === 'children') {
                // Handle children count change and sync childrenAges array
                const currentChildren = updated[index].children || 0;
                const newChildren = value;
                
                if (newChildren > currentChildren) {
                    // Add new age slots
                    updated[index].childrenAges = [
                        ...updated[index].childrenAges,
                        ...Array(newChildren - currentChildren).fill("")
                    ];
                } else if (newChildren < currentChildren) {
                    // Remove extra age slots
                    updated[index].childrenAges = updated[index].childrenAges.slice(0, newChildren);
                }
            }
            
            updated[index][field] = value;
            return updated;
        });
    };

    // Update child age for specific room
    const updateChildAge = (roomIndex, childIndex, value) => {
        setRooms(prev => {
            const updated = [...prev];
            updated[roomIndex].childrenAges[childIndex] = value;
            return updated;
        });
    };

    // Calculate totals for display
    const getTotals = () => {
        const totals = rooms.reduce((acc, room) => ({
            adults: acc.adults + room.adults,
            children: acc.children + room.children,
            rooms: acc.rooms + 1
        }), { adults: 0, children: 0, rooms: 0 });
        
        return totals;
    };

    const { register: registerForm1, handleSubmit: handleSubmitForm1, formState: { errors: errorsForm1 }, setValue: setValueForm1, control: controlForm1 } = useForm();
    const { register: registerForm2, handleSubmit: handleSubmitForm2, formState: { errors: errorsForm2 }, setValue: setValueForm2, control: controlForm2 } = useForm();

    const onSubmit = async (data, formName) => {
        if (formName === 'hotelform') {
            const params = new URLSearchParams();
            
            if (data.destination) {
                params.append('destination', data.destination);
            }

            params.append('checkIn', data.departureDate.start);
            params.append('checkOut', data.departureDate.end);
            
            if (data.departureDate && Array.isArray(data.departureDate)) {
                const formatDate = (date) => {
                    if (!date) return '';
                    const d = new Date(date);
                    return d.toISOString().split('T')[0];
                };
                
                params.append('checkIn', formatDate(data.departureDate.start));
                params.append('checkOut', formatDate(data.departureDate.end));
            }

            // Add room configurations
            params.append('rooms', rooms.length);
            
            rooms.forEach((room, index) => {
                params.append(`room${index + 1}_adults`, room.adults);
                params.append(`room${index + 1}_children`, room.children);
                
                if (room.children > 0) {
                    const childAgesToSend = room.childrenAges.slice(0, room.children).map(age => age || '1');
                    params.append(`room${index + 1}_child_ages`, childAgesToSend.join(','));
                }
            });
            
            // Add totals
            const totals = getTotals();
            //params.append('total_adults', totals.adults);
            //params.append('total_children', totals.children);
            //params.append('total_infants', totals.infants);
            
            router.push(`/hotel_listings?${params.toString()}`);
        }
    };

    const totals = getTotals();

    return (
        <Box
            bgImage="url('/05.jpg')"
            bgSize="cover"
            bgPos="center"
            py={{ base: 6, lg: 10 }}
            px={4}
        >
            <Box maxW="5xl" mx="auto" bgColor={"whiteAlpha.800"} p={3} rounded="lg" boxShadow="lg">
                <Tabs.Root value={Cvalue} onValueChange={(e) => setCValue(e.value)} variant="enclosed" colorScheme="blue" defaultValue="flight" maxW="5xl" mx="auto">
                    {/* Main Tabs - Unchanged */}
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

                    {/* Flight Tab Content - Unchanged */}
                    <Tabs.Content value="flight" px={2} rounded="md">
                        {/* ... existing flight content ... */}
                    </Tabs.Content>

                    {/* Hotel Tab Content - Updated */}
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
                                                <Span color="black" flex="1">
                                                    Occupants ({totals.adults} {totals.adults > 1 ? 'Adults' : 'Adult'}, {totals.children} {totals.children > 1 ? 'Children' : 'Child'}, {totals.rooms} {totals.rooms > 1 ? 'Rooms' : 'Room'})
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

                            {/* Hidden form fields for submission */}
                            <input type="hidden" {...registerForm2('total_adults')} value={totals.adults} />
                            <input type="hidden" {...registerForm2('total_children')} value={totals.children} />
                            <input type="hidden" {...registerForm2('total_infants')} value={totals.infants} />
                            <input type="hidden" {...registerForm2('total_rooms')} value={rooms.length} />
                        </form>
                    </Tabs.Content>
                </Tabs.Root>
            </Box>
        </Box>
    );
}