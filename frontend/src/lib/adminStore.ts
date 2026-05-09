import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/src/types';
import { getAllProducts } from './products';

// Extended Product interface for admin
export interface AdminProduct extends Product {
  brand?: string;
  department?: string;
  productCategory?: string;
  availableSizes?: string[];
  color?: string;
  skirtLength?: string;
  sleeveLength?: string;
}

interface AdminProductStore {
  products: AdminProduct[];
  initializeProducts: () => void;
  addProduct: (product: Omit<AdminProduct, 'product_id'>) => string;
  updateProduct: (productId: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (productId: string) => void;
  deleteProducts: (productIds: string[]) => void;
  getProduct: (productId: string) => AdminProduct | undefined;
}

export const useAdminProductStore = create<AdminProductStore>()(
  persist(
    (set, get) => {
      // Initialize with products from the shared data source
      const initializeProducts = () => {
        const existingProducts = getAllProducts();
        const adminProducts: AdminProduct[] = existingProducts.map((p) => ({
          ...p,
          stock: p.stock || 20 + (parseInt(p.product_id) % 50),
        }));
        
        set({ products: adminProducts });
      };

      return {
        products: [],
        
        initializeProducts,
        
        addProduct: (productData) => {
          const newId = `${Date.now()}`;
          const newProduct: AdminProduct = {
            ...productData,
            product_id: newId,
            rating: productData.rating || 4.5,
            tags: productData.tags || [],
            category_id: productData.category_id || '1',
            stock: productData.stock || 0,
          };
          
          set((state) => ({
            products: [newProduct, ...state.products],
          }));
          
          return newId;
        },
        
        updateProduct: (productId, updates) => {
          set((state) => ({
            products: state.products.map((p) =>
              p.product_id === productId ? { ...p, ...updates } : p
            ),
          }));
        },
        
        deleteProduct: (productId) => {
          set((state) => ({
            products: state.products.filter((p) => p.product_id !== productId),
          }));
        },
        
        deleteProducts: (productIds) => {
          set((state) => ({
            products: state.products.filter((p) => !productIds.includes(p.product_id)),
          }));
        },
        
        getProduct: (productId) => {
          return get().products.find((p) => p.product_id === productId);
        },
      };
    },
    {
      name: 'admin-products-storage',
    }
  )
);



