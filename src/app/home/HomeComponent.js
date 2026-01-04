'use client'
import React from 'react'
import Header from "@/components/header";
import Footer from "@/components/footer";
import BookingSection from "@/components/bookingsection";
import HeroSection from "@/components/herosection";
import TrustBadges from '@/components/trustbadges';

export default function HomeComponent() {
    return (
        <div>
            <Header />
            <BookingSection />
            <HeroSection />
            <TrustBadges />
            <Footer />
        </div>
    )
}