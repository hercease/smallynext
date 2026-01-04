// app/my-bookings/page.js
import AllBookingsComponent from './allbookingscomponent';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'

export const metadata = {
    title: "My Bookings | Manage Your Travel Reservations | Smallyfares",
    description: "View and manage all your travel bookings in one place. Access hotel reservations, flight tickets, and holiday packages. Modify, cancel, or download booking confirmations.",
    keywords: ["my bookings", "travel reservations", "booking management", "hotel bookings", "flight tickets", "manage bookings", "booking history", "Smallyfares bookings"],
    metadataBase: new URL('https://smallyfares.com'),
    alternates: {
        canonical: 'https://smallyfares.com/my_bookings',
        languages: {
            'en-US': '/my_bookings',
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
        title: "My Bookings | Manage Your Travel Reservations | Smallyfares",
        description: "View and manage all your travel bookings in one place. Access hotel reservations, flight tickets, and holiday packages.",
        url: "https://smallyfares.com/my_bookings",
        siteName: "Smallyfares",
        images: [
            {
                url: "https://smallyfares.com/logo/logo.png",
                width: 1200,
                height: 630,
                alt: "Smallyfares - Manage Your Bookings",
            },
        ],
        locale: "en-US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "My Bookings | Manage Your Travel Reservations | Smallyfares",
        description: "View and manage all your travel bookings in one place. Access hotel reservations, flight tickets, and holiday packages.",
        images: {
            url: "https://smallyfares.com/logo/logo.png",
            alt: "Smallyfares - Manage Your Bookings",
        },
        creator: "@Smallyfares",
    },
    robots: {
        index: false, // User-specific pages shouldn't be indexed
        follow: true,
        nocache: true, // Prevent caching of personal data
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

export default async function AllBookings() {
    const cookieStore = await cookies();
    const token = cookieStore.get('smallytoken')?.value ?? null;
    if (!token) {
        redirect('/login');
    }
    return (
        <>
            <AllBookingsComponent user={token} />
        </>
    );
}