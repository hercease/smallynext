// app/checkout/page.js
import CheckoutComponent from './checkoutcomponent';
import { cookies } from 'next/headers';

export async function generateMetadata({ searchParams }) {
 const { id } = await searchParams;
  const baseMetadata = {
    title: "Complete Your Booking | Secure Checkout | Smallyfares",
    description: "Securely complete your hotel booking on Smallyfares. Review your booking details, enter guest information, and choose payment method for a seamless checkout experience.",
    keywords: ["hotel booking", "secure checkout", "complete booking", "payment methods", "guest information", "travel booking", "Smallyfares checkout"],
    metadataBase: new URL('https://smallyfares.com'),
    alternates: {
      canonical: `https://smallyfares.com/checkout${id ? `?id=${id}` : ''}`,
    },
    openGraph: {
      title: "Complete Your Booking | Secure Checkout | Smallyfares",
      description: "Securely complete your hotel booking on Smallyfares.",
      url: `https://smallyfares.com/checkout${id ? `?id=${id}` : ''}`,
      images: [
        {
          url: "https://smallyfares.com/checkout-og-image.png",
          width: 1200,
          height: 630,
          alt: "Smallyfares - Secure Checkout Process",
        },
      ],
    },
    robots: {
      index: false,
      follow: true,
    },
  };

  return baseMetadata;
}


export default async function CheckoutListing({ searchParams }) {
  // Await searchParams
  const { cartId } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('smallytoken')?.value ?? null;
  // Pass ALL search params or specific ones
  return (
    <CheckoutComponent 
      user={token} 
    />
  );
}