// app/booking-confirmation/page.js
import BookingConfirmationComponent from './bookingconfirmationcomponent';
import { cookies } from 'next/headers';

export const metadata = {
    title: "Booking Confirmation | Your Reservation Details | Smallyfares",
    description: "View your complete booking confirmation with all reservation details. Access booking reference, hotel/flight information, guest details, and payment summary.",
    keywords: ["booking confirmation", "reservation details", "booking reference", "hotel confirmation", "flight confirmation", "travel booking details", "Smallyfares booking"],
    metadataBase: new URL('https://smallyfares.com'),
    alternates: {
        canonical: 'https://smallyfares.com/booking_confirmation',
        languages: {
            'en-US': '/booking_confirmation',
        },
    },
    icons: {
        icon: [
            { url: '/favicon/favicon.ico' },
            { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/favicon/apple-touch-icon.png' },
            { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    openGraph: {
        title: "Booking Confirmation | Your Reservation Details | Smallyfares",
        description: "View your complete booking confirmation with all reservation details.",
        url: "https://smallyfares.com/booking_confirmation",
        siteName: "Smallyfares",
        images: [
            {
                url: "https://smallyfares.com/logo/logo.png",
                width: 1200,
                height: 630,
                alt: "Smallyfares - Booking Confirmation",
            },
        ],
        locale: "en-US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Booking Confirmation | Your Reservation Details | Smallyfares",
        description: "View your complete booking confirmation with all reservation details.",
        images: {
            url: "https://smallyfares.com/logo/logo.png",
            alt: "Smallyfares - Booking Confirmation",
        },
        creator: "@Smallyfares",
    },
    robots: {
        index: false, // Personal booking pages should not be indexed
        follow: true,
        nocache: true, // Prevent caching of personal booking data
        googleBot: {
            index: false,
            follow: true,
            noimageindex: true,
            "max-video-preview": -1,
            "max-image-preview": "standard",
            "max-snippet": -1,
        },
    },
    other: {
        "viewport": "width=device-width, initial-scale=1",
        "theme-color": "#3182CE",
        "format-detection": "telephone=no",
    },
};

export default async function BookingConfirmationDetails() {
    const cookieStore = await cookies();
    const token = cookieStore.get('smallytoken')?.value ?? null;
    return (
        <>
            <BookingConfirmationComponent user={token} />
        </>
    );
}