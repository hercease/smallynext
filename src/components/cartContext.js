// context/CartContext.js
'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toaster } from '@/components/ui/toaster';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children, user }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  // Get session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Fetch cart items from backend
  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-cart`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const result = await response.json();
      
      if (result.success) {
        const cartItems = result.items.map(item => ({
          id: item.cart_item_id,
          roomName: item.room_data?.name,
          hotelName: item.room_data?.hotelName || 'Hotel',
          hotelAddress: item.room_data?.address || '',
          roomBoardName: item.rate_data?.boardName,
          price: parseFloat(item.rate_data?.net) || 0,
          currency: item.rate_data?.currency || 'EUR',
          checkIn: item.booking_details?.checkIn,
          checkOut: item.booking_details?.checkOut,
          nights: calculateNights(item.booking_details?.checkIn, item.booking_details?.checkOut),
          adults: item.booking_details?.roomDetails?.[0]?.adults || 1,
          children: item.booking_details?.roomDetails?.[0]?.children || 0,
          childrenAges: item.booking_details?.roomDetails?.[0]?.childAges || [],
          rooms: parseInt(item.booking_details?.rooms) || 1,
          quantity: 1, // Each cart item represents one rate selection
          cancellationPolicies: item.rate_data?.cancellationPolicies || [],
          taxes: item.rate_data?.taxes || {},
          roomData: item.room_data,
          rateData: item.rate_data,
          bookingDetails: item.booking_details,
          image: item.room_data?.images?.[0]?.path 
            ? `http://photos.hotelbeds.com/giata/${item.room_data.images[0].path}`
            : null,
        }));

        const total = cartItems.reduce((sum, item) => sum + (item.price * item.rooms * item.nights), 0);
        
        setCart({
          items: cartItems,
          total
        });
      } else {
        setCart({ items: [], total: 0 });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load cart items',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      const formData = new FormData();
      formData.append('cartItemId', cartItemId);
      
      if (!user) {
        formData.append('session_id', getSessionId());
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart.php?action=remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchCartItems(); // Refresh cart items
        toaster.create({
          title: 'Success',
          description: 'Item removed from cart',
          type: 'success',
          duration: 3000,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to remove item from cart',
        type: 'error',
        duration: 3000,
      });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      // Since we don't have a bulk delete, remove each item individually
      const deletePromises = cart.items.map(item => 
        removeFromCart(item.id)
      );
      
      await Promise.all(deletePromises);
      
      toaster.create({
        title: 'Success',
        description: 'Cart cleared successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to clear cart',
        type: 'error',
        duration: 3000,
      });
    }
  };

  // Update quantity (for future implementation)
  const updateQuantity = async (cartItemId, newQuantity) => {
    // Since our backend uses rateKey as unique ID, we can't have multiple quantities
    // of the same rate. This would require adding a quantity field to the database.
    toaster.create({
      title: 'Info',
      description: 'Quantity updates not supported for room rates',
      type: 'info',
      duration: 3000,
    });
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.price * item.rooms * item.nights);
    }, 0);
  };

  // Calculate nights between dates
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Refresh cart when user changes
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems, user]);

  const value = {
    cart,
    loading,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    refreshCart: fetchCartItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};