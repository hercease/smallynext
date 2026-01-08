// pages/checkout.js
'use client'
import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text, 
  Button,
  Flex,
  HStack,
  Image,
  Badge,
  Card,
  Spinner,
  SimpleGrid,
  Field,
  Input,
  Portal,
  Drawer,
  Textarea,
  Checkbox,
  Divider,
  Alert,
  Grid,
  GridItem,
  Icon,
  Stack,
  useBreakpointValue,
  useDisclosure,
  CloseButton,
  RadioGroup,
  Radio
} from '@chakra-ui/react';
import { 
  FiCreditCard, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiLock,
  FiShield,
  FiCalendar,
  FiUsers,
  FiHome,
  FiDollarSign,
  FiStar,
  FiMap,
  FiPhoneCall,
  FiGlobe,
  FiAlertCircle,
  FiMenu,
  FiChevronUp,
  FiChevronDown,
  FiUserPlus,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import { FaChild, FaStripe, FaCreditCard, FaWallet, FaRegClock, FaCheckCircle } from "react-icons/fa";
import Link from 'next/link';
import Header from "@/components/header";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useForm, Controller, set, get } from 'react-hook-form';
import { toaster } from "@/components/ui/toaster"
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/stripe';
import { useAuth } from '@/components/Auth.js';
import LoadingSpinner from '@/components/LoadingSpinner';


// Stripe Card Component
const StripeCardForm = ({ onPaymentSuccess, onPaymentError, amount, currency, cartId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const searchParams = useSearchParams();


  const handlePayment = async () => {
    if (!stripe || !elements) {
      onPaymentError('Stripe is not initialized');
      return;
    }

    setProcessing(true);
    setCardError('');

    try {
      const cardElement = elements.getElement(CardElement);

      // 1. Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // 2. Create payment intent on backend
      const createIntentResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create_stripe_payment_intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100).toString(),
          currency: currency.toLowerCase(),
          cart_id: cartId,
          payment_method_id: paymentMethod.id
        }),
      });

      const intentData = await createIntentResponse.json();

      if (!createIntentResponse.ok || !intentData.clientSecret) {
        throw new Error(intentData.error || 'Failed to create payment intent');
      }

      setPaymentIntentId(intentData.paymentIntentId);

      console.log("return url", `${window.location.origin}${window.location.pathname}?cart_id=${cartId}`);

      // 3. Confirm the payment on client side (this handles 3D Secure)
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
          return_url: `${window.location.origin}${window.location.pathname}?id=${cartId}`,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // 4. Check payment status
      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onPaymentSuccess(paymentIntent.id, paymentIntent);
      } else if (paymentIntent.status === 'requires_action') {
        // User was redirected for 3D Secure and came back
        // We need to check the final status
        const formData = new FormData();
        formData.append('payment_intent_id', paymentIntent.id);
        const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/confirm_stripe_payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        const statusData = await statusResponse.json();
        
        if (statusData.status === 'succeeded') {
          onPaymentSuccess(paymentIntent.id, paymentIntent);
        } else {
          throw new Error(`Payment requires action: ${statusData.status}`);
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }

    } catch (error) {
      console.error('Payment error:', error);
      setCardError(error.message);
      onPaymentError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  return (
    <Box width="100%">
      <Box mb={4}>
        <Text fontSize="sm" color="gray.600" mb={2}>
          Enter your card details
        </Text>
        <Alert.Root status="info" mb={3}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Payment Information!</Alert.Title>
            <Alert.Description>
              The sum of {currency} {amount} will be charged to your card.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Box p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="white">
          <CardElement options={cardElementOptions} />
        </Box>
        {cardError && (
          <Text color="red.500" fontSize="sm" mt={2}>{cardError}</Text>
        )}
      </Box>
      <Button
        onClick={handlePayment}
        colorScheme="blue"
        width="100%"
        loading={processing}
        disabled={!stripe || processing}
        leftIcon={<FaStripe />}
      >
        {processing ? 'Processing Payment...' : 'Pay with Stripe'}
      </Button>
      
      <HStack mt={3} spacing={2} justify="center">
        <Text fontSize="xs" color="gray.600">Secure payment powered by Stripe</Text>
      </HStack>
    </Box>
  );
};

  const handleStripeSuccess = async () => {
    
  };

const CheckoutPage = (user) => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [cartItem, setCartItem] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [eligibleForPayLater, setEligibleForPayLater] = useState(false);
  const { isLoggedIn, loading, logout, userData } = useAuth();
  const [countdowns, setCountdowns] = useState({});
  const timersRef = useRef({});
  
  const pathname = usePathname();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  // React Hook Form setup
  const { register, handleSubmit, control, formState: { errors }, watch, setValue, trigger, getValues } = useForm({
    defaultValues: {
      holderFirstName: '',
      holderLastName: '',
      holderEmail: '',
      holderPhone: '',
      holderCountry: '',
      holderCity: '',
      holderAddress: '',
      specialRequests: '',
      agreeTerms: false,
      paymentMethod: 'stripe', // Default to Stripe
      paymentType: 'paynow', // Default to Pay Now
    }
  });

  // Watch payment method
  const paymentMethod = watch('paymentMethod');
  const paymentType = watch('paymentType');

   const calculateTimeRemaining = (addedAt, expiresAt) => {
    try {
      const now = new Date().getTime();
      const addedTime = new Date(addedAt).getTime();
      const expireTime = new Date(expiresAt).getTime();
      
      // Calculate total reservation time (from added to expired)
      const totalReservationTime = expireTime - addedTime;
      const timeRemaining = expireTime - now;
      
      // Debug logs
      //console.log('Added At:', addedAt, 'Parsed:', new Date(addedAt));
      //console.log('Expires At:', expiresAt, 'Parsed:', new Date(expiresAt));
      //console.log('Total Reservation Time (ms):', totalReservationTime);
      //console.log('Time Remaining (ms):', timeRemaining);
      
      if (timeRemaining <= 0) {
        return {
          total: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          percentage: 100,
          expired: true
        };
      }
      
      const totalSeconds = Math.floor(timeRemaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // Calculate percentage based on actual total reservation time
      let percentage = 0;
      if (totalReservationTime > 0) {
        const elapsedTime = totalReservationTime - timeRemaining;
        percentage = Math.max(0, Math.min(100, (elapsedTime / totalReservationTime) * 100));
      } else {
        // Fallback to time-based percentage if total time is invalid
        percentage = Math.max(0, Math.min(100, (timeRemaining / (15 * 60 * 1000)) * 100));
      }
      
      return {
        total: timeRemaining,
        hours,
        minutes,
        seconds,
        percentage: Math.round(percentage),
        expired: false
      };
    } catch (error) {
      console.error('Error calculating time remaining:', error, 'addedAt:', addedAt, 'expiresAt:', expiresAt);
      return {
        total: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        percentage: 0,
        expired: true
      };
    }
  };

   const startCountdownTimer = useCallback((itemId, addedAt, expiresAt) => {
    // Clear existing timer if any
    if (timersRef.current[itemId]) {
      clearInterval(timersRef.current[itemId]);
    }

    const timer = setInterval(() => {
      setCountdowns(prev => {
        const newTime = calculateTimeRemaining(addedAt, expiresAt);

        console.log(`Countdown for item ${itemId}:`, newTime);
        
        // If time is up, clear the interval and remove item
        if (newTime.total <= 0 || newTime.expired) {
          clearInterval(timer);
          delete timersRef.current[itemId];
          // Automatically remove the item from cart
          removeExpiredItem(itemId);
          return { ...prev, [itemId]: newTime };
        }
        
        return { ...prev, [itemId]: newTime };
      });
    }, 1000);

    timersRef.current[itemId] = timer;
    return timer;
  }, [removeExpiredItem]);

  // Format duration for display (e.g., "15 min" or "2 hours")
  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Initialize countdown timers for all items
  const initializeCountdowns = useCallback((items) => {
    const initialCountdowns = {};
    
   // Clean up existing timers
     // Clean up existing timers
    Object.values(timersRef.current).forEach(timer => {
      if (timer) clearInterval(timer);
    });
    timersRef.current = {};

    if (items.added_at && items.expires_at) {
      initialCountdowns[items.id] = calculateTimeRemaining(items.added_at, items.expires_at);
    }

    setCountdowns(initialCountdowns);
    
    // Start timers for each item
    if (items.added_at && items.expires_at && items.id) {
      startCountdownTimer(items.id, items.added_at, items.expires_at);
    }
    
  }, [startCountdownTimer]);

   // Fetch cart item by ID
  const fetchCartItem = useCallback(async () => {
    if (!id) {
      setCartLoading(false);
      return;
    }

    try {
      setCartLoading(true);
      const formData = new FormData();
      formData.append('cart_id', id);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fetch-cart-by-id`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart item');
      }

      const result = await response.json();
      console.log('Cart item result:', result);
      
      if (result) {
        setCartItem(result);
        initializeCountdowns(result);
        // Set default values for the form
        setValue('holderEmail', result.holder_email || '');
      } else {
        setCartItem(null);
      }
    } catch (error) {
      console.error('Error fetching cart item:', error);
    } finally {
      setCartLoading(false);
    }
  }, [id, setValue, initializeCountdowns]);

  const removeFromCart = useCallback(async (itemId) => {
    const formData = new FormData();
    formData.append('cart_id', itemId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/remove-cart-item`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to remove cart item');
      }
      const result = await response.json();
      console.log('Remove result:', result);
      if (result.success) {
        // Clean up timer
        if (timersRef.current[itemId]) {
          clearInterval(timersRef.current[itemId]);
          delete timersRef.current[itemId];
        }
        
        // Remove from countdowns state
        setCountdowns(prev => {
          const newCountdowns = { ...prev };
          delete newCountdowns[itemId];
          return newCountdowns;
        });
        
        fetchCartItem(); // Refresh cart after removal
      } else {
        fetchCartItem(); // Refresh cart after removal
      }
    }
    catch (error) {
      console.error('Error removing cart item:', error);
    }
  }, [fetchCartItem]);


  // Remove expired item from cart
  const removeExpiredItem = useCallback(async (itemId) => {
    try {
      await removeFromCart(itemId);
      console.log(`Item ${itemId} removed due to expiration`);
    } catch (error) {
      console.error('Error removing expired item:', error);
    }
  }, [removeFromCart]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, []);

  const getTimeColor = (timeData) => {
    if (!timeData || timeData.expired || timeData.total <= 0) return "red.500";
    if (timeData.minutes < 5) return "red.500";
    if (timeData.minutes < 10) return "orange.500";
    return "green.500";
  };

   const formatTimeDisplay = (timeData) => {
    if (!timeData || timeData.expired || timeData.total <= 0) {
      return "Expired";
    }
    
    if (timeData.hours > 0) {
      return `${timeData.hours.toString().padStart(2, '0')}:${timeData.minutes.toString().padStart(2, '0')}:${timeData.seconds.toString().padStart(2, '0')}`;
    }
    
    return `${timeData.minutes.toString().padStart(2, '0')}:${timeData.seconds.toString().padStart(2, '0')}`;
  };


  useEffect(() => {
    if (cartItem?.booking_details?.checkIn) {
      const checkInDate = new Date(cartItem.booking_details.checkIn);
      const bookingDate = new Date(); // Current date when booking is being made
      const timeDifference = checkInDate.getTime() - bookingDate.getTime();
      const daysDifference = timeDifference / (1000 * 3600 * 24);
      
      // If check-in is more than 10 days away, enable pay later option
      setEligibleForPayLater(daysDifference > 10);
    }
  }, [cartItem]);

  const calculatePercentage = (amount, percentage) => {
    return (amount * (percentage / 100)).toFixed(2);
  };

   const calculateTotal = () => {
    if (!cartItem) return 0;
    const netPrice = parseFloat(cartItem.rate_data?.net) || 0;
    if(userData && userData.token !== ''){
      if(userData.hotel_margin === 0) return (netPrice).toFixed(2);
      const calc = calculatePercentage(netPrice, userData.hotel_margin);
      return (netPrice - calc).toFixed(2);
    }
    return (netPrice).toFixed(2);
  };

  // Create Stripe Payment Intent
  const createPaymentIntent = useCallback(async () => {
    if (!cartItem) return;

    try {
      const formData = new URLSearchParams();
      const totalAmount = parseFloat(cartItem.rate_data.net) || 0;
      const amountInCents = Math.round(parseFloat(totalAmount) * 100); // Convert to cents
      formData.append('amount', amountInCents);
      formData.append('currency', cartItem.rate_data?.currency?.toLowerCase() || 'EUR');
      formData.append('metadata', JSON.stringify({
        cart_id: cartItem.cart_item_id,
        hotel_name: cartItem.hotel_info?.name,
        rooms: cartItem.booking_details.rooms,
        nights: calculateNights(
          cartItem.booking_details.checkIn,
          cartItem.booking_details.checkOut
        )
      }));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create_stripe_payment_intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Debug logging
      console.log('Payment intent response:', data.clientSecret);
      
      if (!data.clientSecret) {
        throw new Error('No client secret returned from server');
      }
      
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);

    } catch (error) {
      console.error('Error creating payment intent:', error);
    }
  }, [cartItem]);

    // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);
    };
    initializeStripe();
  }, []);

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHotelTaxes = () => {
    if (!cartItem || !cartItem.rate_data?.taxes || !cartItem.rate_data.taxes?.taxes) {
      return [];
    }
    return cartItem.rate_data.taxes.taxes.filter(tax => tax.included === false);
  };

  const handleStripeError = (errorMessage) => {
    toaster.create({
      title: 'Payment Error',
      description: errorMessage,
      type: 'error',
      duration: 10000,
    });
  };

  const submitBookingForm = async (paymentIntentId) => {

    setCheckoutLoading(true);
    // Get ALL form values once
    const values = getValues() || {};

    const params = new URLSearchParams();

    /* ----------------------------------------------------
    * Guest / Room Details
    * -------------------------------------------------- */
    cartItem.booking_details.roomDetails.forEach((room) => {
      // Adults
      for (let i = 1; i <= room.adults; i++) {
        params.append(
          `room${room.roomNumber}_adult${i}_firstName`,
          values[`room${room.roomNumber}_adult${i}_firstName`] || ''
        );
        params.append(
          `room${room.roomNumber}_adult${i}_lastName`,
          values[`room${room.roomNumber}_adult${i}_lastName`] || ''
        );
        params.append(
          `room${room.roomNumber}_adult${i}_type`,
          'AD'
        );
      }

      // Children
      for (let i = 1; i <= room.children; i++) {
        params.append(
          `room${room.roomNumber}_child${i}_type`,
          'CH'
        );
        params.append(
          `room${room.roomNumber}_child${i}_firstName`,
          values[`room${room.roomNumber}_child${i}_firstName`] || ''
        );
        params.append(
          `room${room.roomNumber}_child${i}_lastName`,
          values[`room${room.roomNumber}_child${i}_lastName`] || ''
        );
        params.append(
          `room${room.roomNumber}_child${i}_age`,
          values[`room${room.roomNumber}_child${i}_age`] || ''
        );
      }
    });

    /* ----------------------------------------------------
    * Holder / Booking Details
    * -------------------------------------------------- */
    params.append('holderFirstName', values.holderFirstName || '');
    params.append('holderLastName', values.holderLastName || '');
    params.append('holderEmail', values.holderEmail || '');
    params.append('special_requests', values.specialRequests || '');
    params.append('paymentMethod', values.paymentMethod || '');

    params.append('hotelCode', cartItem.hotel_info.code);
    params.append('hotelName', cartItem.hotel_info.name);
    params.append('checkIn', cartItem.booking_details.checkIn);
    params.append('checkOut', cartItem.booking_details.checkOut);
    params.append('rooms', cartItem.booking_details.roomDetails.length.toString());
    params.append('boardName', cartItem.rate_data.boardName);
    params.append('roomName', cartItem.room_data.name);
    params.append('destName', cartItem.hotel_info.dest_name);
    params.append( 
      'address',
      `${cartItem.hotel_info.address}, ${cartItem.hotel_info.city}`
    );
    params.append('phone', cartItem.hotel_info.phone || '');
    params.append('category', cartItem.hotel_info.category || '');
    params.append('rateKey', cartItem.cart_item_id);

    const totalAmount = cartItem.rate_data.net;
    params.append('total_amount', totalAmount);
    params.append('paymentAmount', totalAmount);
    params.append('payment_method', values.paymentMethod);
    params.append('payment_type', values.paymentType);

    // 🔐 VERY IMPORTANT (Stripe reconciliation)
    if (paymentIntentId) {
      params.append('payment_intent_id', paymentIntentId);
    }
    params.append('user', isLoggedIn && userData.email || '');
    params.append('platform', 'smallyfares');
    params.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
     
    /* ----------------------------------------------------
    * API Call
    * -------------------------------------------------- */
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book-hotel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

       const result = await response.json();

       console.log('Booking response:', result);

      if (response.ok && result.status) {

        toaster.create({
          title: 'Successful Booking',
          description: 'Your booking has been completed successfully.',
          type: 'success',
          duration: 10000,
        });

        router.push(`/booking_confirmation/bookingId=${result.booking_id}`);
        setCheckoutLoading(false);
      } else {
        const message = result.errors[0].detail || 'Booking failed';
        throw new Error(message|| 'Booking failed');
      }
    } catch (error) {
      setCheckoutLoading(false);
      console.error('Booking error:', error);
      const errorDescription = error.message || 'An error occurred during booking. Please try again.';
      toaster.create({
        title: 'Booking Error',
        description: errorDescription,
        type: 'error',
        duration: 5000,
      });
    }
  };


  const onSubmit = async (data) => {
     const isValid = await trigger();
    if (!isValid) {
      toaster.create({
        title: 'Form Validation Error',
        description: 'Please fix all errors in the form',
        type: 'error',
        duration: 5000,
      });
      return;
    }

    // Check terms agreement
    if (!data.agreeTerms) {
      toaster.create({
        title: 'Terms Required',
        description: 'You must agree to the terms and conditions',
        type: 'error',
        duration: 5000,
      });
      return;
    }

     // Handle different payment scenarios
    if (data.paymentType === 'paylater') { 
      // For pay later, just submit the booking without payment processing
      await submitBookingForm(null);
    } else if (data.paymentType === 'paynow') {
      if (data.paymentMethod === 'stripe') {
        // For stripe, open payment drawer
        setPaymentOpen(true);
      } else if (data.paymentMethod === 'wallet') {
        // For wallet, process immediately
        await submitBookingForm(null);
      }
    }
  };

    // Handle successful payment
  const handlePaymentSuccess = async (paymentIntentId, paymentIntent) => {
    try {

      toaster.create({
        title: 'Payment Success',
        description: 'Payment was successful',
        type: 'success',
        duration: 10000,
      })
      // Now submit the booking with payment reference
      await submitBookingForm(paymentIntentId);
    } catch (error) {
      console.error('Error after payment success:', error);
      toaster.create({
        title: 'Booking Error',
        description: error || 'An error occurred during booking after payment.',
        type: 'error',
        duration: 10000,
      });
    }
  };

  useEffect(() => {
    fetchCartItem();
  }, [fetchCartItem]);

  const renderPayment = () => {
    {/* Stripe Card Component */}
    return (
      <>
    { stripe ? (
      <Elements stripe={stripe}>
       <StripeCardForm
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handleStripeError}
          amount={parseFloat(calculateTotal())}
          currency={cartItem?.rate_data?.currency || 'EUR'}
          cartId={cartItem?.cart_item_id}
        />
      </Elements>
    ) : (

        <Box textAlign="center" p={6}>
          <Spinner size="lg" color="blue.500" />
          <Text mt={3} fontSize="sm" color="gray.600">
            Setting up secure payment...
          </Text>
        </Box>

    )
    }
    </>
    );
  }

  // Mobile Price Summary Drawer
  const PriceSummaryDrawer = () => (
    <Drawer.Root closeOnInteractOutside={false} open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Price Summary</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              {renderPriceSummary()}
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );

  const PaymentDrawer = () => (
    <Drawer.Root closeOnInteractOutside={false} open={paymentOpen} onOpenChange={(e) => setPaymentOpen(e.open)}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Payment</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              {renderPayment()}
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )

  // Mobile Sticky Bottom Bar
  const MobileStickyBar = () => {
    if (!cartItem) return null;
    return (
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        boxShadow="0 -4px 12px rgba(0, 0, 0, 0.1)"
        p={4}
        zIndex={1000}
        display={{ base: 'block', lg: 'none' }}
      >
        <VStack spacing={3}>
          <Flex justify="space-between" w="full">
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="sm">
                {cartItem.rate_data?.currency || 'EUR'} {calculateTotal()}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Total to pay
              </Text>
            </VStack>
            <Button
              colorScheme="blue"
              size="md"
              onClick={() => setOpen(true)}
            >
              View Summary
            </Button>
          </Flex>
          
          <Checkbox.Root
            checked={watch('agreeTerms') || false}
            onCheckedChange={(e) => setValue('agreeTerms', (!!e.checked))}
            name= "agreeTerms"
            {...register('agreeTerms', { required: 'You must agree to the terms and conditions' })}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label> I agree to the <Link href="/terms" style={{ color: '#3182CE' }}>Terms & Conditions</Link> and <Link href="/privacy" style={{ color: '#3182CE' }}>Privacy Policy</Link></Checkbox.Label>
          </Checkbox.Root>
          
          
            <Button
              type="submit"
              form="checkout-form"
              colorScheme="green"
              size="lg"
              w="full"
              loading={checkoutLoading}
              loadingText="Processing..."
              leftIcon={<FiCheckCircle />}
            >
              Complete Booking
            </Button>
         
        </VStack>
      </Box>
    );
  };

  const renderPriceSummary = () => {
    if (!cartItem) return null;
    
    const nights = calculateNights(
      cartItem.booking_details?.checkIn,
      cartItem.booking_details?.checkOut
    );
    const totalAmount = calculateTotal();
    const hotelTaxes = getHotelTaxes();

    return (
      <VStack spacing={4} align="stretch">
        <Box pb={4} borderBottomWidth="1px" borderBottomColor="gray.200">
          <Text fontWeight="bold" mb={2}>{cartItem.room_data?.name}</Text>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="gray.600">
              {formatDate(cartItem.booking_details?.checkIn)} - {formatDate(cartItem.booking_details?.checkOut)}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {nights} night{nights > 1 ? 's' : ''} • {cartItem.booking_details?.rooms} room{cartItem.booking_details?.rooms > 1 ? 's' : ''}
            </Text>
          </VStack>
        </Box>

        <VStack spacing={3} align="stretch">
          <Flex justify="space-between">
            <Text color="gray.600">Room Rate</Text>
            <Text fontSize="sm">
              {cartItem.rate_data?.currency || 'EUR'} {cartItem.rate_data?.net}
            </Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text color="gray.600">Subtotal</Text>
            <Text fontWeight="semibold">
              {cartItem.rate_data?.currency || 'EUR'} {cartItem.rate_data?.net || '0.00'}
            </Text>
          </Flex>

          {cartItem.rate_data?.taxes?.taxes?.filter(tax => tax.included === true).map((tax, index) => (
            <Flex key={index} justify="space-between">
              <Text color="gray.600">{tax.type || 'Tax'}</Text>
              <Text fontSize="sm">
                {tax.currency || cartItem.rate_data?.currency || 'EUR'} {tax.amount} (included)
              </Text>
            </Flex>
          ))}

          {hotelTaxes.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2} color="orange.600" fontSize="sm">
                To be paid at hotel:
              </Text>
              {hotelTaxes.map((tax, index) => (
                <Flex key={index} justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.600">
                    {tax.type || tax.subType || 'Tax'}
                  </Text>
                  <Text fontSize="xs">
                    {tax.currency || cartItem.rate_data?.currency || 'EUR'} {tax.amount}
                  </Text>
                </Flex>
              ))}
            </Box>
          )}

          
          <Flex justify="space-between" fontSize="lg" fontWeight="bold">
            <Text>Total to Pay Now</Text>
            <Text color="green.600">
              {cartItem.rate_data?.currency || 'EUR'} {totalAmount}
            </Text>
          </Flex>
          
          {hotelTaxes.length > 0 && (
            <Text fontSize="xs" color="orange.600" fontStyle="italic">
              * Additional taxes of {cartItem.rate_data?.currency || 'EUR'} {
                hotelTaxes.reduce((sum, tax) => sum + parseFloat(tax.amount || 0), 0).toFixed(2)
              } to be paid directly at hotel
            </Text>
          )}
        </VStack>
      </VStack>
    );
  };

  if (cartLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} textAlign="center" py={20}>
            <Spinner size="xl" color="blue.500" />
            <Heading size="lg">Loading checkout...</Heading>
            <Text color="gray.600">Preparing your booking details</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!cartItem) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} textAlign="center" py={20}>
            <Box fontSize="6xl" color="gray.400">🔍</Box>
            <Heading size="xl" color="gray.700">Booking Not Found</Heading>
            <Text fontSize="lg" color="gray.600" maxW="md">
              The booking you are looking for does not exist or has expired.
            </Text>
            <Link href="/" passHref>
              <Button leftIcon={<FiHome />} colorScheme="blue" size="lg" mt={4}>
                Back to Home
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    );
  }

  const nights = calculateNights(
    cartItem.booking_details?.checkIn,
    cartItem.booking_details?.checkOut
  );
  const hotelImage = cartItem.room_data?.images?.[0]?.path
    ? `http://photos.hotelbeds.com/giata/${cartItem.room_data.images[0].path}`
    : 'hotelplaceholder.png';
  const hotelMainImage = cartItem.hotel_info?.main_image_path
    ? `http://photos.hotelbeds.com/giata/${cartItem.hotel_info.main_image_path}`
    : 'hotelplaceholder.png';

  // Helper function to render guest inputs for a room
  const renderGuestInputs = (room) => {
    const inputs = [];
    
    // Add inputs for each adult
    for (let i = 1; i <= room.adults; i++) {
      inputs.push(
        <React.Fragment key={`room${room.roomNumber}_adult${i}`}>
          <Box>
            <HStack spacing={2} mb={2}>
              <Icon as={FiUserPlus} color="blue.500" />
              <Text fontWeight="semibold" fontSize="sm">
                Adult {i} (18+ years)
              </Text>
            </HStack>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              <Field.Root>
                <Field.Label fontSize="xs">First Name</Field.Label>
                <Input
                  {...register(`room${room.roomNumber}_adult${i}_firstName`, { 
                    required: `Adult ${i} first name is required` 
                  })}
                  placeholder={`Adult ${i} first name`}
                  size="sm"
                />
              </Field.Root>
              
              <Field.Root>
                <Field.Label fontSize="xs">Last Name</Field.Label>
                <Input
                  {...register(`room${room.roomNumber}_adult${i}_lastName`, { 
                    required: `Adult ${i} last name is required` 
                  })}
                  placeholder={`Adult ${i} last name`}
                  size="sm"
                />
              </Field.Root>
            </SimpleGrid>
          </Box>
          {i < room.adults && <div style={{ borderTop: "2px solid gray", margin: "12px 0" }} />}
        </React.Fragment>
      );
    }
    
    // Add inputs for each child
    for (let i = 1; i <= room.children; i++) {
      const childAge = room.childAges?.[i - 1] || 'N/A';
      inputs.push(
        <React.Fragment key={`room${room.roomNumber}_child${i}`}>
          <Box>
            <HStack spacing={2} mb={2}>
              <Icon size="lg" color="pink.700">
                <FaChild />
              </Icon>
              <Text fontWeight="semibold" fontSize="sm">
                Child {i} ({childAge} years)
              </Text>
            </HStack>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              <Field.Root>
                <Field.Label fontSize="xs">First Name</Field.Label>
                <Input
                  {...register(`room${room.roomNumber}_child${i}_firstName`, { 
                    required: `Child ${i} first name is required` 
                  })}
                  placeholder={`Child ${i} first name`}
                  size="sm"
                />
              </Field.Root>
              
              <Field.Root>
                <Field.Label fontSize="xs">Last Name</Field.Label>
                <Input
                  {...register(`room${room.roomNumber}_child${i}_lastName`, { 
                    required: `Child ${i} last name is required` 
                  })}
                  placeholder={`Child ${i} last name`}
                  size="sm"
                />
              </Field.Root>
              
              <GridItem colSpan={{ base: 1, sm: 2 }}>
                <Field.Root>
                  <Field.Label fontSize="xs">Age</Field.Label>
                  <Input
                    defaultValue={`${childAge}`}
                    readOnly
                    bg="gray.50"
                    size="sm"
                    color="gray.600"
                    {...register(`room${room.roomNumber}_child${i}_age`, { 
                      required: `Child ${i} age is required` 
                    })}
                  />
                </Field.Root>
              </GridItem>
            </SimpleGrid>
          </Box>
          {i < room.children && <div style={{ borderTop: "2px solid gray", margin: "12px 0" }} />}
        </React.Fragment>
      );
    }
    
    return inputs;
  };

  const getTotalReservationDuration = (item) => {
    if (!item.addedAt || !item.expiresAt) return null;
    
    try {
      const addedTime = new Date(item.added_at).getTime();
      const expireTime = new Date(item.expires_at).getTime();
      const totalTime = expireTime - addedTime;
      
      if (totalTime > 0) {
        return formatDuration(totalTime);
      }
    } catch (error) {
      console.error('Error calculating total duration:', error);
    }
    return null;
  };

  const disPlayCountdown = () => {
    const timeData = countdowns[cartItem.id];
    const isExpired = timeData && (timeData.expired || timeData.total <= 0);
    const totalDuration = getTotalReservationDuration(cartItem);

    return (
      <Box mb={2}>
        <VStack spacing={2} align="stretch">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <HStack spacing={2}>
                <FiClock color="#4A5568" />
                <Text fontWeight="semibold" color="gray.700">
                  Reservation Time Remaining
                </Text>
              </HStack>
              {totalDuration && (
                <Text fontSize="xs" color="gray.500">
                  Total hold time: {totalDuration}
                </Text>
              )}
            </VStack>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={getTimeColor(timeData)}
            >
              {timeData ? formatTimeDisplay(timeData) : "Calculating..."}
            </Text>
          </Flex>

          {isExpired && (
            <Badge colorScheme="red" alignSelf="flex-start">
              Expired - This item will be removed shortly
            </Badge>
          )}
        </VStack>
      </Box>
    );
  };

  return (
      <>
        <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            {/* Page Header - Mobile Optimized */}
            <Box>
              <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'start', sm: 'center' }} mb={2} gap={3}>
                <HStack spacing={3}>
                  <Box display={{ base: 'block', sm: 'block' }}>
                    <FiCreditCard size={28} color="#3182CE" />
                  </Box>
                  <Heading size={{ base: 'lg', md: 'xl' }} color="gray.800">Complete Your Booking</Heading>
                </HStack>
                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
                  Step 2 of 2
                </Badge>
              </Flex>
              <Text color="gray.600" fontSize={{ base: 'md', md: 'lg' }}>
                Review your booking details and enter guest information
              </Text>
              {disPlayCountdown()}
            </Box>

            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
              <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={{ base: 6, lg: 8 }}>
                
                {/* Left Column: Forms - Mobile Optimized */}
                <VStack spacing={5} align="stretch">
                  
                  {/* Section 1: Hotel Information */}
                  <Card.Root variant="outline">
                    <Card.Header py={4}>
                      <HStack spacing={2}>
                        <FiHome color="#3182CE" />
                        <Heading size="md">Hotel Information</Heading>
                      </HStack>
                    </Card.Header>
                    <Card.Body py={4}>
                      <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                        <Box flexShrink={0}>
                          <Image
                            src={hotelMainImage}
                            alt={cartItem.hotel_info?.name}
                            width={{ base: '80px', sm: '100px' }}
                            height={{ base: '80px', sm: '100px' }}
                            objectFit="cover"
                            borderRadius="lg"
                            fallback={
                              <Box
                                width={{ base: '80px', sm: '100px' }}
                                height={{ base: '80px', sm: '100px' }}
                                bg="gray.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                borderRadius="lg"
                              >
                                <Text color="gray.500" fontSize="sm">No Image</Text>
                              </Box>
                            }
                          />
                        </Box>
                        <Box flex={1}>
                          <Heading size="md" mb={2} fontSize={{ base: 'md', sm: 'lg' }}>{cartItem.hotel_info?.name}</Heading>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <FiMap color="gray.500" size={14} />
                              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                {cartItem.hotel_info?.address}, {cartItem.hotel_info?.city}, {cartItem.hotel_info?.country_name}
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <FiPhoneCall color="gray.500" size={14} />
                              <Text fontSize="sm" color="gray.600">
                                {cartItem.hotel_info?.phone}
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <FiStar color="gray.500" size={14} />
                              <Text fontSize="sm" color="gray.600">
                                {cartItem.hotel_info?.category}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>
                      </Stack>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 2: Room Information */}
                  <Card.Root variant="outline">
                    <Card.Header py={4}>
                      <HStack spacing={2}>
                        <FiHome color="#3182CE" />
                        <Heading size="md">Room Information</Heading>
                      </HStack>
                    </Card.Header>
                    <Card.Body py={4}>
                      <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                        <Box flexShrink={0}>
                          <Image
                            src={hotelImage}
                            alt={cartItem.room_data?.name}
                            width={{ base: '80px', sm: '100px' }}
                            height={{ base: '80px', sm: '100px' }}
                            objectFit="cover"
                            borderRadius="lg"
                            fallback={
                              <Box
                                width={{ base: '80px', sm: '100px' }}
                                height={{ base: '80px', sm: '100px' }}
                                bg="gray.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                borderRadius="lg"
                              >
                                <Text color="gray.500" fontSize="sm">No Image</Text>
                              </Box>
                            }
                          />
                        </Box>
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize={{ base: 'md', sm: 'lg' }} mb={1}>{cartItem.room_data?.name}</Text>
                          <Badge colorScheme="green" mb={2} fontSize="xs">
                            {cartItem.rate_data?.boardName}
                          </Badge>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <FiCalendar color="gray.500" size={14} />
                              <Text fontSize="sm" color="gray.600">
                                {formatDate(cartItem.booking_details?.checkIn)} → {formatDate(cartItem.booking_details?.checkOut)}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {nights} night{nights > 1 ? 's' : ''} • {cartItem.booking_details?.rooms} room{cartItem.booking_details?.rooms > 1 ? 's' : ''}
                            </Text>
                          </VStack>
                        </Box>
                        <Box textAlign={{ base: 'left', sm: 'right' }} mt={{ base: 2, sm: 0 }}>
                          <Text fontSize={{ base: 'xl', sm: '2xl' }} fontWeight="bold" color="green.600">
                            {cartItem.rate_data?.currency || 'EUR'} {cartItem.rate_data?.net}
                          </Text>
                          <Text fontSize="xs" color="gray.600">per room per night</Text>
                        </Box>
                      </Stack>

                      {cartItem.rate_data?.cancellationPolicies?.length > 0 && (
                        <Box mt={4} pt={4} borderTopWidth="1px" borderTopColor="gray.100">
                          <Text fontWeight="semibold" mb={1} fontSize="sm">Cancellation Policy:</Text>
                          {cartItem.rate_data.cancellationPolicies.map((policy, index) => (
                            <Text key={index} fontSize="xs" color="gray.600">
                              Free cancellation until {formatDateTime(policy.from)}. 
                              After that, cancellation fee: {policy.currency || 'EUR'} {policy.amount}
                            </Text>
                          ))}
                        </Box>
                      )}
                    </Card.Body>
                  </Card.Root>

                  {/* Section 3: Holder Information */}
                  <Card.Root variant="outline">
                    <Card.Header py={4}>
                      <HStack spacing={2}>
                        <FiUser color="#3182CE" />
                        <Heading size="md">Booking Holder Information</Heading>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        The primary contact for this booking
                      </Text>
                    </Card.Header>
                    <Card.Body py={4}>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                        <Field.Root>
                          <Field.Label fontSize="sm">First Name</Field.Label>
                          <Input
                            {...register('holderFirstName', { required: 'First name is required' })}
                            placeholder="John"
                            size={{ base: 'md', sm: 'lg' }}
                          />
                          {errors.holderFirstName && (
                            <Text color="red.500" fontSize="xs">{errors.holderFirstName.message}</Text>
                          )}
                        </Field.Root>
                        
                        <Field.Root>
                          <Field.Label fontSize="sm">Last Name</Field.Label>
                          <Input
                            {...register('holderLastName', { required: 'Last name is required' })}
                            placeholder="Doe"
                            size={{ base: 'md', sm: 'lg' }}
                          />
                          {errors.holderLastName && (
                            <Text color="red.500" fontSize="xs">{errors.holderLastName.message}</Text>
                          )}
                        </Field.Root>
                        
                        <Field.Root>
                          <Field.Label fontSize="sm">Email Address</Field.Label>
                          <Input
                            type="email"
                            {...register('holderEmail', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            placeholder="john@example.com"
                            size={{ base: 'md', sm: 'lg' }}
                          />
                          {errors.holderEmail && (
                            <Text color="red.500" fontSize="xs">{errors.holderEmail.message}</Text>
                          )}
                        </Field.Root>
                      </SimpleGrid>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 4: Guest Information for Each Room */}
                  {cartItem.booking_details?.roomDetails.map((room, roomIndex) => (
                    <Card.Root key={room.roomNumber} variant="outline">
                      <Card.Header py={4}>
                        <HStack spacing={2}>
                          <FiUsers color="#3182CE" />
                          <Heading size="md">Room {room.roomNumber} - Guest Information</Heading>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {room.adults} adult{room.adults > 1 ? 's' : ''}
                          {room.children > 0 && `, ${room.children} child${room.children > 1 ? 'ren' : ''}`}
                        </Text>
                      </Card.Header>
                      <Card.Body py={4}>
                        <VStack spacing={4} align="stretch">
                          {renderGuestInputs(room)}
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}

                  {/* Section 6: Special Requests */}
                  <Card.Root variant="outline">
                    <Card.Header py={4}>
                      <HStack spacing={2}>
                        <FiGlobe color="#3182CE" />
                        <Heading size="md">Special Requests</Heading>
                      </HStack>
                    </Card.Header>
                    <Card.Body py={4}>
                      <Field.Root>
                        <Field.Label fontSize="sm">Additional Notes (Optional)</Field.Label>
                        <Textarea
                          {...register('specialRequests')}
                          placeholder="Any special requirements, preferences, or additional information for your stay..."
                          rows={3}
                          size={{ base: 'md', sm: 'lg' }}
                        />
                      </Field.Root>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 7: Payment Type */}
                  <Card.Root variant="outline">
                    <Card.Header py={4}>
                      <HStack spacing={2}>
                        <FaRegClock color="#3182CE" />
                        <Heading size="md">Payment Type</Heading>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        Choose when to process your payment
                      </Text>
                    </Card.Header>
                    <Card.Body py={4}>
                      <Controller
                        name="paymentType"
                        control={control}
                        rules={{ required: 'Payment type is required' }}
                        render={({ field }) => (
                          <RadioGroup.Root
                            value={field.value}
                            name={field.name}
                            onValueChange={(value) => field.onChange(value.value)}
                            display="flex"
                            flexDirection="column"
                            gap={4}
                          >
                            <RadioGroup.Item 
                              value="paynow" 
                              width="100%"
                            >
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText display="flex" alignItems="center" gap={3}>
                                <Box p={2} bg="blue.50" borderRadius="md">
                                  <FaCheckCircle size={20} color="#3182CE" />
                                </Box>
                                <Box>
                                  <Text fontWeight="semibold">Pay Now</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Complete payment immediately
                                  </Text>
                                </Box>
                              </RadioGroup.ItemText>
                            </RadioGroup.Item>
                            
                            {eligibleForPayLater && (
                              <RadioGroup.Item value="paylater" width="100%">
                                <RadioGroup.ItemHiddenInput />
                                <RadioGroup.ItemIndicator />
                                <RadioGroup.ItemText display="flex" alignItems="center" gap={3}>
                                  <Box p={2} bg="orange.50" borderRadius="md">
                                    <FaRegClock size={20} color="#DD6B20" />
                                  </Box>
                                  <Box>
                                    <Text fontWeight="semibold">Pay Later</Text>
                                    <Text fontSize="sm" color="gray.600">
                                      Book now, pay closer to your check-in date
                                    </Text>
                                  </Box>
                                </RadioGroup.ItemText>
                              </RadioGroup.Item>
                            )}
                            
                            {!eligibleForPayLater && (
                              <Alert.Root status="info" borderRadius="md">
                                <Alert.Indicator />
                                <Alert.Title fontSize="sm">
                                  Pay Later is only available for bookings with check-in more than 10 days away
                                </Alert.Title>
                              </Alert.Root>
                            )}
                          </RadioGroup.Root>
                        )}
                      />
                      {errors.paymentType && (
                        <Text color="red.500" fontSize="sm" mt={2}>
                          {errors.paymentType.message}
                        </Text>
                      )}
                    </Card.Body>
                  </Card.Root>

                  {/* Section 8: Payment Method */}
                  {paymentType === 'paynow' && (
                  <Card.Root variant="outline">
                    <Card.Header py={4}>
                      <HStack spacing={2}>
                        <FiCreditCard color="#3182CE" />
                        <Heading size="md">Payment Method</Heading>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        Choose how you want to pay
                      </Text>
                    </Card.Header>
                    <Card.Body py={4}>
                      <Controller
                        name="paymentMethod"
                        defaultValue="stripe"
                        control={control}
                        rules={{ required: 'Payment method is required' }}
                        render={({ field }) => (
                          <RadioGroup.Root
                            value={field.value}
                            name={field.name}
                            onValueChange={(value) => field.onChange(value.value)}
                            display="flex"
                            flexDirection="column"
                            gap={4}
                          >
                            <RadioGroup.Item value="stripe" width="100%">
                              <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText display="flex" alignItems="center" gap={3}>
                                <Box p={2} bg="blue.50" borderRadius="md">
                                  <FaStripe size={20} color="#6772E5" />
                                </Box>
                                <Box>
                                  <Text fontWeight="semibold">Online Payment (Stripe)</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Pay with credit/debit card securely
                                  </Text>
                                </Box>
                              </RadioGroup.ItemText>
                            </RadioGroup.Item>
                            
                            {userData && (
                              <RadioGroup.Item value="wallet" width="100%">
                                <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                <RadioGroup.ItemIndicator />
                                <RadioGroup.ItemText display="flex" alignItems="center" gap={3}>
                                  <Box p={2} bg="green.50" borderRadius="md">
                                    <FaWallet size={20} color="#38A169" />
                                  </Box>
                                  <Box>
                                    <Text fontWeight="semibold">Wallet Payment({userData?.wallet  || 0}USD) </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      Use your wallet balance
                                    </Text>
                                  </Box>
                                </RadioGroup.ItemText>
                              </RadioGroup.Item>
                            )}

                          </RadioGroup.Root>
                        )}
                      />
                      {errors.paymentMethod && (
                        <Text color="red.500" fontSize="sm" mt={2}>
                          {errors.paymentMethod.message}
                        </Text>
                      )}
                    </Card.Body>
                  </Card.Root>
                  )}
                  
                  {/* Desktop Only: Terms and Booking Button */}
                  <Box display={{ base: 'none', lg: 'block' }}>
                    <Card.Root variant="outline">
                      <Card.Body>
                        <VStack spacing={4} align="stretch">
                          <Checkbox.Root
                            checked={watch('agreeTerms') || false}
                            onCheckedChange={(e) => setValue('agreeTerms', (!!e.checked))}
                            name= "agreeTerms"
                            {...register('agreeTerms', { required: 'You must agree to the terms and conditions' })}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>I agree to the <Link href="/terms" style={{ color: '#3182CE' }}>Terms & Conditions</Link> and <Link href="/privacy" style={{ color: '#3182CE' }}>Privacy Policy</Link></Checkbox.Label>
                          </Checkbox.Root>

                          {errors.agreeTerms && (
                            <Text color="red.500" fontSize="sm">{errors.agreeTerms.message}</Text>
                          )}

                            <Button
                              type="submit"
                              colorScheme="green"
                              size="lg"
                              height="40px"
                              fontSize="lg"
                              loading={checkoutLoading}
                              loadingText="Processing..."
                              leftIcon={<FiCheckCircle />}
                            >
                              Complete Booking
                            </Button>
                          
                          <HStack spacing={2} justify="center" color="gray.600">
                            <FiLock />
                            <Text fontSize="sm">Your information is secured with SSL encryption</Text>
                          </HStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  </Box>
                </VStack>

                {/* Desktop Right Column: Price Summary */}
                <Box display={{ base: 'none', lg: 'block' }}>
                  <Card.Root variant="outline" boxShadow="lg" position="sticky" top="24">
                    <Card.Header borderBottomWidth="1px" py={4}>
                      <Heading size="md">Price Summary</Heading>
                    </Card.Header>
                    <Card.Body py={4}>
                      {renderPriceSummary()}
                    </Card.Body>
                  </Card.Root>

                  <Box mt={4} textAlign="center">
                    <Link href="/cart" passHref>
                      <Button variant="ghost" size="sm">
                        ← Back to Cart
                      </Button>
                    </Link>
                  </Box>
                </Box>
              </Grid>
            </form>
          </VStack>
        </Container>

        {/* Mobile Components */}
        <MobileStickyBar />
        <PriceSummaryDrawer />
        <PaymentDrawer />
      </>
  );
};

export default CheckoutPage;