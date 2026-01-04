import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Badge, 
  Tag, 
  TagLabel,
  TagLeftIcon,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Heading,
  Flex,
  Icon
} from '@chakra-ui/react';
import { RiCheckFill, RiTimeFill } from 'react-icons/ri';
import { FiCheck } from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { groupFacilitiesByCategory } from '@/components/groupfacilitiesbycategory';
import { getAmenityIcon } from "@/components/amenitiesfunction";

export default function FacilitiesDisplay({ facilities }) {
  const groupedFacilities = groupFacilitiesByCategory(facilities);

  console.log("groupedFacilities", groupedFacilities);

  const getSafeAmenityIcon = (description) => {
    const icon = getAmenityIcon(description);
    return icon && typeof icon === 'function' ? icon : FiCheck;
  };

  return (
    <VStack spacing={8} align="stretch">
      {groupedFacilities.map(group => (
        <Box key={group.groupcode}>
          <Heading size="md" mb={4} color="blue.600" pb={2} borderBottom="2px" borderColor="blue.100">
            {group.groupName}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="40px">
            {group.facilities.map((facility, index) => {
              const AmenityIcon = getSafeAmenityIcon(facility.description);

              return (
                <Card.Root 
                  key={index} 
                  variant="outline" 
                  size="sm"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ 
                    shadow: "md", 
                    borderColor: "blue.200",
                    transform: "translateY(-2px)" 
                  }}
                  transition="all 0.2s"
                >
                  <Card.Body>
                    <Stack spacing={3}>
                      {/* Facility Header */}
                      <Flex align="center" gap={3}>
                        <Icon 
                          as={AmenityIcon} 
                          boxSize={5} 
                          color="blue.500"
                          flexShrink={0}
                        />
                        <Text 
                          fontWeight="semibold" 
                          flex={1}
                          fontSize="sm"
                          noOfLines={2}
                          minH="40px"
                          display="flex"
                          alignItems="center"
                        >
                          {facility.description}
                        </Text>
                        {facility.indFee && (
                          <Badge 
                            colorScheme="orange" 
                            variant="solid"
                            flexShrink={0}
                            ml={2}
                          >
                            Paid
                          </Badge>
                        )}
                      </Flex>

                      {/* Indicators */}
                      <HStack spacing={2} flexWrap="wrap">
                        {/* Availability Indicator */}
                        {facility.indLogic && (
                            <Tag.Root size="sm" colorScheme="green" variant="subtle">
                                <Tag.StartElement>
                                    <RiCheckFill />
                                </Tag.StartElement>
                                <Tag.Label>Available</Tag.Label>
                            </Tag.Root>
                        )}
                      
                      {/* Mandatory Facility Indicator */}
                      {facility.indYesOrNo && (
                        <Tag.Root 
                          size="sm" 
                          colorScheme={facility.indYesOrNo ? "blue" : "red"}
                          variant="subtle"
                        >
                            <Tag.StartElement>
                                {facility.indYesOrNo ? <FaCheckCircle /> : <FaTimesCircle />}
                            </Tag.StartElement>
                            <Tag.Label>
                                {facility.indYesOrNo ? "Available" : "Not Available"}
                            </Tag.Label>
                        </Tag.Root>
                      )}
                      
                      {/* Quantity Indicator */}
                      {facility.number > 0 && (
                        <Tag.Root size="sm" colorScheme="gray" variant="subtle">
                            <Tag.StartElement>
                                <RiTimeFill />
                            </Tag.StartElement>
                          <Tag.Label>{facility.number}</Tag.Label>
                        </Tag.Root>
                      )}
                      </HStack>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </SimpleGrid>
        </Box>
      ))}
    </VStack>
  );
}