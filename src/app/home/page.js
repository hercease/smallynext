import HomeComponent from './HomeComponent';
export const metadata = {
    title: "Smallyfares | Cheap Airline Tickets, Air Travels, Book Hotels, Book Cars & Holiday Packages",
    description: "Book cheap airline tickets, hotels, car rentals, and holiday packages with Smallyfares. Enjoy seamless travel experiences and exclusive deals worldwide.",
    keywords: ["cheap airline tickets", "book hotels", "car rentals", "holiday packages", "Smallyfares"],
    metadataBase: new URL('https://smallyfares.com'),
    alternates: {
        canonical: 'https://smallyfares.com',
        languages: {
            'en-US': '/',
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
        title: "Smallyfares | Cheap Airline Tickets, Air Travels, Book Hotels, Book Cars & Holiday Packages",
        description: "Book cheap airline tickets, hotels, car rentals, and holiday packages with Smallyfares. Enjoy seamless travel experiences and exclusive deals worldwide.",
        url: "https://smallyfares.com",
        siteName: "Smallyfares",
        images: [
            {
                url: "https://smallyfares.com/logo/logo.png",
                width: 1200,
                height: 630,
                alt: "Smallyfares - Cheap Airline Tickets & Travel Deals",
            },
        ],
        locale: "en-US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Smallyfares | Cheap Airline Tickets, Air Travels, Book Hotels, Book Cars & Holiday Packages",
        description: "Book cheap airline tickets, hotels, car rentals, and holiday packages with Smallyfares. Enjoy seamless travel experiences and exclusive deals worldwide.",
        images: {
            url: "https://smallyfares.com/logo/logo.png",
            alt: "Smallyfares - Cheap Airline Tickets & Travel Deals",
        },
        creator: "@Smallyfares",
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    additionalMeta: {
        viewport: "width=device-width, initial-scale=1",
        themeColor: "#ffffff",
    },
};
export default async function Home() {

  return (
    <>
      <HomeComponent />
    </>
  )
}