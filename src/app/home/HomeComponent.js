'use client'
import React from 'react'
import Header from "@/components/header";
import Footer from "@/components/footer";
import BookingSection from "@/components/bookingsection";
import HeroSection from "@/components/herosection";
import TrustBadges from '@/components/trustbadges';
import { Box, Container, Skeleton } from '@chakra-ui/react'

export default function HomeComponent() {
    return (
        <Box>
            <BookingSection />
            <HeroSection />
            <TrustBadges />
        </Box>
    )
}