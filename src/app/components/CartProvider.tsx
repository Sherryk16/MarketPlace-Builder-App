"use client";

import React, { createContext, useContext, useState, useEffect, Key } from "react";
import { useUser } from "@clerk/nextjs"; // Import Clerk's `useUser` hook

// Define types for cart items
interface SanityImage {
  asset: {
    url: string; // Update to expect the actual url string, not a method
    _ref: string;
    _type: string;
  };
  url?: string; // Optional url for image
}

interface Product {
  imageUrl: string; // Added imageUrl as required
  id: Key | null | undefined;
  _id: any;
  currentSlug: string;
  name: string;
  price: number;
  size?: string | string[];
  image: SanityImage;
  quantity: number;
}

interface CartContextProps {
  cartItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (slug: string) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, user, isLoaded } = useUser(); // Clerk user info
  const [cartItems, setCartItems] = useState<Product[]>([]);

  // Handle cart synchronization on mount
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const storedCartItems = localStorage.getItem('cartItems');
      if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
      }
    } else {
      const storedCartItems = localStorage.getItem('cartItems');
      if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
      }
    }
  }, [isSignedIn, user, isLoaded]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingProductIndex = prevItems.findIndex((item) => item.currentSlug === product.currentSlug);
      let updatedCart;

      if (existingProductIndex >= 0) {
        updatedCart = [...prevItems];
        updatedCart[existingProductIndex].quantity += 1;
      } else {
        updatedCart = [...prevItems, { ...product, quantity: 1 }];
      }

      return updatedCart;
    });
  };

  const removeFromCart = (slug: string) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.filter((item) => item.currentSlug !== slug);
      return updatedCart;
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartProvider;
