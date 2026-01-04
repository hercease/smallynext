'use client'
import React from 'react'
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode"
import { Box, Button, Container, Grid, GridItem, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { FiArrowRight } from "react-icons/fi";
export default function HeroSection() {
    return (
        <Box 
            bgGradient="to-r" gradientFrom="blue.600" gradientTo="blue.800"
            color="white"
            py={{ base: 7, md: 10 }}
            position="relative"
            overflow="hidden"
        >
            <Container maxW="container.xl">
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="center">
                <GridItem>
                <VStack align="start" spacing={6}>
                    <Heading size={{ base: '2xl', md: '3xl' }}>
                    Travel the World, 
                    <Text as="span" color="green.600"> Your Way</Text>
                    </Heading>
                    <Text fontSize="xl">
                    Book flights, hotels, and vacation packages at unbeatable prices
                    </Text>
                    <HStack spacing={6} mt={4}>
                    <VStack align="start" spacing={1}>
                        <Text fontSize="2xl" fontWeight="bold">2M+</Text>
                        <Text fontSize="sm" opacity={0.9}>Happy Travelers</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                        <Text fontSize="2xl" fontWeight="bold">150+</Text>
                        <Text fontSize="sm" opacity={0.9}>Countries</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                        <Text fontSize="2xl" fontWeight="bold">24/7</Text>
                        <Text fontSize="sm" opacity={0.9}>Support</Text>
                    </VStack>
                    </HStack>
                </VStack>
                </GridItem>
                <GridItem display={{ base: 'none', lg: 'block' }}>
                <Image
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
                    alt="Travel"
                    borderRadius="xl"
                    boxShadow="xl"
                />
                </GridItem>
            </Grid>
        </Container>
        </Box>
    )
}