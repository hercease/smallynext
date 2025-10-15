'use client'
import React from 'react'
import Header from "@/components/header";
import Footer from "@/components/footer";
import BookingSection from "@/components/bookingsection";

export default function HomeComponent() {
    return (
        <div>
            <Header />
            <BookingSection />
            <Footer />
        </div>
    )
}