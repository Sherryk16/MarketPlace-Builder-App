'use client'; // Enable client-side behavior

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // App Router-specific navigation
import Image from "next/image";
import { IoCartOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { client, urlFor } from "@/sanity/lib/client";
import { useCart } from "@/app/components/CartProvider";
import PopupMessage from "@/app/components/cartPopup"; // Import the PopupMessage component

// Define a type for the image asset
interface SanityImage {
  asset: {
    _ref: string;
    _type: string;
  };
  // Additional fields if necessary
}

// Define the Product type with the precise image structure
interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  image: SanityImage; // Adjusted the image type
  currentSlug: string;
  quantity: number;
}

export default function FeatureProducts() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null); // State for the popup message

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `*[_type == 'trendingProduct']|order(_createdAt desc){
          name,
          code,
          price,
          image,
          "currentSlug": slug.current
        }`;

        const data = await client.fetch(query);

        if (data.length > 0) {
          setProducts(data);
        } else {
          setError("No products found.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("An error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Navigate to the product detail page
  const handleNavigate = (slug: string) => {
    router.push(`/ProductDetail/${slug}`); // Navigate using slug
  };

  const handleAddToCart = (product: Product) => {
    const productWithIdAndQuantity = {
      ...product,
      id: product.code,  // You can use the product code as the unique id
      quantity: 1,  // Set the initial quantity to 1
    };
    addToCart(productWithIdAndQuantity); // Add the product to the cart

    // Show popup message when item is added to cart
    setPopupMessage(`${product.name} added to cart!`);

    // Clear the message after 3 seconds
    setTimeout(() => {
      setPopupMessage(null);
    }, 3000);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="py-10 overflow-hidden relative">
      <div className="text-[#1A0B5B] text-[32px] md:text-[42px] font-semibold flex justify-center mb-5">
        Trending Products
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-6 overflow-x-auto px-4 sm:px-8 py-4">
        {products.map((item: Product) => {
          // Log the image object to debug
          console.log(item.image);

          return (
            <div
              key={item.currentSlug}
              className="group relative w-[250px] flex-shrink-0 bg-white p-4 hover:scale-105 transition-transform mx-auto shadow-lg rounded-md"
            >
              <div className="relative w-full aspect-square flex justify-center items-center bg-gray-100 rounded-md overflow-hidden">
                {/* Check if image exists and use the URL */}
                {item.image?.asset?._ref ? (
                  <Image
                    src={urlFor(item.image).url()}
                    width={178}
                    height={178}
                    alt={item.name}
                  />
                ) : (
                  <div className="w-[178px] h-[178px] bg-gray-200 flex items-center justify-center">
                    <p>No Image</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 rounded-full shadow-md hover:bg-gray-200 transition"
                    onClick={() => handleAddToCart(item)} // Add the product to the cart on click
                  >
                    <IoCartOutline className="text-lg bg-slate-100" />
                  </button>
                  <button className="p-2 rounded-full shadow-md hover:bg-gray-200 transition">
                    <FaRegHeart className="text-lg bg-slate-100" />
                  </button>
                </div>
                <button
                  className="absolute bottom-4 bg-green-500 text-white px-4 py-2 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleNavigate(item.currentSlug)}
                >
                  View Details
                </button>
              </div>

              <div className="mt-3 text-center py-2 rounded-md transition-colors bg-white group-hover:bg-blue-900 group-hover:text-white">
                <p className="font-serif text-[18px]">{item.name}</p>
                <p className="mt-1 text-[14px] font-mono">Code: {item.code}</p>
                <p className="text-[14px] font-sans">${item.price}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show the PopupMessage component */}
      {popupMessage && (
        <PopupMessage
          message={popupMessage}
          onClose={() => setPopupMessage(null)}
        />
      )}

      {/* Optional: Scroll Indicators (if needed) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {products.map((_: Product, index: number) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full cursor-pointer bg-gray-300"
          ></div>
        ))}
      </div>
    </div>
  );
}
