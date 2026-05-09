/**
 * Zustand State Management Store
 * 
 * Provides global state management for the e-commerce application using Zustand.
 * Stores cart, wishlist, and order data with localStorage persistence.
 * 
 * Features:
 * - Persistent storage (survives page refresh)
 * - Type-safe state management
 * - Simple, lightweight API
 * - Works for both logged-in and guest users
 * 
 * @module lib/store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/src/types';

/**
 * Cart Item Interface
 * 
 * Extends Product with cart-specific properties.
 * Represents a single product in the shopping cart.
 */
interface CartItem extends Product {
  /** Quantity of this product in the cart */
  quantity: number;
  /** Selected size variant (optional, for products with size options) */
  selectedSize?: string;
  /** Selected color variant (optional, for products with color options) */
  selectedColor?: string;
}

/**
 * Cart Store Interface
 * 
 * Defines the shape of the cart state and its methods.
 * The cart stores items locally and persists to localStorage.
 */
interface CartStore {
  /** Array of items currently in the cart */
  items: CartItem[];

  /**
   * Add Item to Cart
   * 
   * Adds a product to the cart or increases quantity if already present.
   * 
   * @param product - The product to add
   * @param quantity - Quantity to add (defaults to 1)
   * @param size - Optional selected size
   * @param color - Optional selected color
   * 
   * Behavior:
   * - If product already in cart, increases quantity
   * - If product not in cart, adds new item
   * - Stores size/color selections for variant products
   */
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;

  /**
   * Remove Item from Cart
   * 
   * @param productId - ID of the product
   * @param size - Size of the variant to remove
   * @param color - Color of the variant to remove
   */
  removeItem: (productId: string, size?: string, color?: string) => void;

  /**
   * Update Item Quantity
   * 
   * @param productId - ID of the product
   * @param quantity - New quantity
   * @param size - Size of the variant
   * @param color - Color of the variant
   */
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;

  /**
   * Clear Cart
   * 
   * Removes all items from the cart.
   * Typically called after successful order completion.
   */
  clearCart: () => void;

  /**
   * Get Total Items Count
   * 
   * Calculates the total number of items in the cart (sum of all quantities).
   * 
   * @returns Total number of items
   * 
   * Example:
   * - Cart: [Product A (qty: 2), Product B (qty: 3)]
   * - Returns: 5
   */
  getTotalItems: () => number;

  /**
   * Get Total Price
   * 
   * Calculates the total price of all items in the cart.
   * Applies discounts if present on products.
   * 
   * @returns Total price (sum of all item prices * quantities)
   * 
   * Calculation:
   * - For each item: (price * (1 - discount/100)) * quantity
   * - Sum all items
   */
  getTotalPrice: () => number;
}

/**
 * Cart Store Hook
 * 
 * Zustand store for managing shopping cart state.
 * Persists to localStorage with key 'cart-storage'.
 * 
 * Usage:
 * ```typescript
 * const { items, addItem, removeItem, getTotalPrice } = useCartStore();
 * 
 * // Add product to cart
 * addItem(product, 2, 'M', 'Blue');
 * 
 * // Get total price
 * const total = getTotalPrice();
 * ```
 * 
 * Persistence:
 * - Automatically saves to localStorage on every state change
 * - Automatically restores from localStorage on page load
 * - Works for both logged-in and guest users
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      /** Initial state: empty cart */
      items: [],

      /**
       * Add Item Implementation
       * 
       * Logic:
       * 1. Check if product already exists in cart
       * 2. If exists: increase quantity
       * 3. If not exists: add new item with specified quantity and variants
       */
      addItem: (product, quantity = 1, size, color) => {
        set((state) => {
          // Find existing item by product ID AND size AND color
          const existingItem = state.items.find(
            (item) =>
              item.product_id === product.product_id &&
              item.selectedSize === size &&
              item.selectedColor === color
          );

          // If product with same variants already in cart, increase quantity
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product_id === product.product_id &&
                  item.selectedSize === size &&
                  item.selectedColor === color
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          // If product not in cart, add new item
          return {
            items: [
              ...state.items,
              { ...product, quantity, selectedSize: size, selectedColor: color },
            ],
          };
        });
      },

      /**
       * Remove Item Implementation
       * 
       * Filters out the item with matching product ID.
       */
      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product_id === productId &&
                item.selectedSize === size &&
                item.selectedColor === color)
          ),
        }));
      },

      /**
       * Update Quantity Implementation
       * 
       * Updates the quantity of the item with matching product ID.
       * Note: Does not validate quantity > 0 (validation should be done in UI).
       */
      updateQuantity: (productId, quantity, size, color) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId &&
              item.selectedSize === size &&
              item.selectedColor === color
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      /**
       * Clear Cart Implementation
       * 
       * Resets cart to empty array.
       */
      clearCart: () => {
        set({ items: [] });
      },

      /**
       * Get Total Items Implementation
       * 
       * Sums up all item quantities.
       */
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      /**
       * Get Total Price Implementation
       * 
       * Calculates total by:
       * 1. For each item, apply discount if present
       * 2. Multiply discounted price by quantity
       * 3. Sum all items
       */
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          // Calculate price with discount if applicable
          const price = item.discount
            ? item.price * (1 - item.discount / 100) // Apply discount percentage
            : item.price;
          // Add to total: price * quantity
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      /**
       * Persistence Configuration
       * 
       * Stores cart data in localStorage with key 'cart-storage'.
       * Data persists across page refreshes and browser sessions.
       */
      name: 'cart-storage',
    }
  )
);

/**
 * Wishlist Store Interface
 * 
 * Defines the shape of the wishlist state and its methods.
 * Wishlist allows users to save products for later purchase.
 */
interface WishlistStore {
  /** Array of products in the wishlist */
  items: Product[];

  /**
   * Add Item to Wishlist
   * 
   * Adds a product to the wishlist if not already present.
   * 
   * @param product - The product to add
   */
  addItem: (product: Product) => void;

  /**
   * Remove Item from Wishlist
   * 
   * Removes a product from the wishlist.
   * 
   * @param productId - ID of the product to remove
   */
  removeItem: (productId: string) => void;

  /**
   * Check if Product is in Wishlist
   * 
   * Determines if a product is already in the wishlist.
   * 
   * @param productId - ID of the product to check
   * @returns true if product is in wishlist, false otherwise
   */
  isInWishlist: (productId: string) => boolean;

  /**
   * Clear Wishlist
   * 
   * Removes all products from the wishlist.
   */
  clearWishlist: () => void;
}

/**
 * Wishlist Store Hook
 * 
 * Zustand store for managing wishlist state.
 * Persists to localStorage with key 'wishlist-storage'.
 * 
 * Usage:
 * ```typescript
 * const { items, addItem, isInWishlist } = useWishlistStore();
 * 
 * // Add product to wishlist
 * addItem(product);
 * 
 * // Check if product is in wishlist
 * if (isInWishlist(productId)) {
 *   // Show "Remove from wishlist" button
 * }
 * ```
 */
export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      /** Initial state: empty wishlist */
      items: [],

      /**
       * Add Item Implementation
       * 
       * Adds product if not already in wishlist.
       * Prevents duplicates by checking existing items.
       */
      addItem: (product) => {
        set((state) => {
          // Check if product already exists
          const exists = state.items.find(
            (item) => item.product_id === product.product_id
          );
          // If exists, don't add again (return current state)
          if (exists) return state;
          // If not exists, add to wishlist
          return { items: [...state.items, product] };
        });
      },

      /**
       * Remove Item Implementation
       * 
       * Filters out the item with matching product ID.
       */
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      },

      /**
       * Check if in Wishlist Implementation
       * 
       * Searches wishlist items for matching product ID.
       */
      isInWishlist: (productId) => {
        return get().items.some((item) => item.product_id === productId);
      },

      /**
       * Clear Wishlist Implementation
       * 
       * Resets wishlist to empty array.
       */
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      /**
       * Persistence Configuration
       * 
       * Stores wishlist data in localStorage with key 'wishlist-storage'.
       */
      name: 'wishlist-storage',
    }
  )
);

/**
 * Order Data Interface
 * 
 * Defines the structure of order information.
 * Used for displaying order receipts and order history.
 */
export interface OrderData {
  /** Unique order identifier (e.g., "ORD-2024-001") */
  orderNumber: string;
  /** Date when order was placed */
  orderDate: string;
  /** Estimated delivery date range */
  estimatedDelivery: string;
  /** Customer's full name */
  customerName: string;
  /** Customer's email address */
  email: string;
  /** Customer's phone number */
  phone: string;
  /** Shipping address details */
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  /** Payment method used (e.g., "cod", "card", "stripe") */
  paymentMethod: string;
  /** Array of items in the order */
  items: CartItem[];
  /** Subtotal before shipping, tax, and discount */
  subtotal: number;
  /** Shipping cost */
  shipping: number;
  /** Tax amount */
  tax: number;
  /** Discount amount */
  discount: number;
  /** Final total amount */
  total: number;
}

/**
 * Order Store Interface
 * 
 * Defines the shape of the order state and its methods.
 * Stores the current order (typically the most recent order) for display.
 */
interface OrderStore {
  /** Current order data (null if no order) */
  currentOrder: OrderData | null;

  /**
   * Set Order
   * 
   * Stores order data, typically after successful checkout.
   * 
   * @param order - The order data to store
   */
  setOrder: (order: OrderData) => void;

  /**
   * Clear Order
   * 
   * Removes the current order from storage.
   * Typically called after displaying order receipt.
   */
  clearOrder: () => void;
}

/**
 * Order Store Hook
 * 
 * Zustand store for managing current order state.
 * Persists to localStorage with key 'order-storage'.
 * 
 * Usage:
 * ```typescript
 * const { currentOrder, setOrder, clearOrder } = useOrderStore();
 * 
 * // Store order after checkout
 * setOrder(orderData);
 * 
 * // Display order receipt
 * if (currentOrder) {
 *   // Show order details
 * }
 * 
 * // Clear after viewing
 * clearOrder();
 * ```
 */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      /** Initial state: no order */
      currentOrder: null,

      /**
       * Set Order Implementation
       * 
       * Stores the provided order data.
       */
      setOrder: (order) => set({ currentOrder: order }),

      /**
       * Clear Order Implementation
       * 
       * Resets order to null.
       */
      clearOrder: () => set({ currentOrder: null }),
    }),
    {
      /**
       * Persistence Configuration
       * 
       * Stores order data in localStorage with key 'order-storage'.
       * Allows order receipt to be viewed after page refresh.
       */
      name: 'order-storage',
    }
  )
);