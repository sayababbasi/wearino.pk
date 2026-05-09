'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import ProductCard from '@/src/components/product/ProductCard';
import ProductFilter from '@/src/components/product/ProductFilter';
import { api } from '@/src/lib/api';

export default function SubcategoryPage() {
  const params = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const slug = params.slug as string;
  const subcategory = params.subcategory as string;
  
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  const subcategoryName = subcategory.charAt(0).toUpperCase() + subcategory.slice(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Map subcategory names to product categories
        const subcategoryMap: Record<string, string> = {
          'tops': 'Tops',
          'jackets': 'Outerwear',
          'trousers': 'Bottoms',
          'dresses': 'Dresses',
          'shirts': 'Tops',
          'pants': 'Bottoms',
          'outerwear': 'Outerwear',
          'activewear': 'Activewear',
        };
        
        const productCategory = subcategoryMap[subcategory.toLowerCase()] || subcategoryName;
        
        const fetchedProducts = await api.getProducts({ 
          department: categoryName,
          subcategory: productCategory,
        });
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching subcategory products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, subcategory, categoryName, subcategoryName]);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Top Rated' },
  ];

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-dark-600 mb-2">
          <a href="/" className="hover:text-dark-900">Home</a> /{' '}
          <a href={`/categories/${slug}`} className="hover:text-dark-900">{categoryName}</a> /{' '}
          <span className="text-dark-900">{subcategoryName}</span>
        </nav>
        <h1 className="text-4xl font-bold mb-2">{categoryName} - {subcategoryName}</h1>
        <p className="text-dark-600">
          {loading ? 'Loading...' : `Showing ${products.length} products`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <ProductFilter />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 btn-secondary"
            >
              <Filter size={18} />
              Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-dark-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-dark-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-900"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.product_id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-dark-600">No products found in this subcategory</div>
          )}

          {/* Pagination */}
          {products.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button className="px-4 py-2 border border-dark-300 rounded hover:bg-dark-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-dark-900 text-white rounded">1</button>
              <button className="px-4 py-2 border border-dark-300 rounded hover:bg-dark-50">
                2
              </button>
              <button className="px-4 py-2 border border-dark-300 rounded hover:bg-dark-50">
                3
              </button>
              <button className="px-4 py-2 border border-dark-300 rounded hover:bg-dark-50">
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>
            <ProductFilter />
            <button
              onClick={() => setShowFilters(false)}
              className="w-full btn-primary mt-6"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

