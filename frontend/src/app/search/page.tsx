'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import ProductCard from '@/src/components/product/ProductCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/src/lib/api';

const ITEMS_PER_PAGE = 12;

import { Suspense } from 'react';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container-custom py-16 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-black rounded-full" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Category names that should redirect to products page
  const categoryNames = ['Women', 'Men', 'Kids', 'Accessories', 'Beauty', 'Home', 'Sale'];
  const categorySlugs: Record<string, string> = {
    'women': 'women',
    'men': 'men',
    'kids': 'kids',
    'accessories': 'accessories',
    'beauty': 'beauty',
    'home': 'home',
    'sale': 'sale',
  };

  // Fetch all products from database on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await api.getProducts();
        setAllProducts(products);
        setSearchResults(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([]);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (query) {
      // Check if query exactly matches a category name
      const matchedCategory = categoryNames.find(
        (cat) => cat.toLowerCase() === query.toLowerCase()
      );
      
      if (matchedCategory && categorySlugs[matchedCategory.toLowerCase()]) {
        // Redirect to products page with category filter
        router.push(`/products?category=${categorySlugs[matchedCategory.toLowerCase()]}`);
        return;
      }
      
      // Regular search - filter products client-side
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category_name?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(allProducts);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [query, router, allProducts]);

  // Pagination calculations
  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResults = useMemo(
    () => searchResults.slice(startIndex, endIndex),
    [searchResults, startIndex, endIndex]
  );

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="container-custom py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Search size={32} className="text-dark-600" />
          <div>
            <h1 className="text-3xl font-bold">
              {query ? `Search Results for "${query}"` : 'All Products'}
            </h1>
            <p className="text-dark-600 mt-1">
              Showing {startIndex + 1}-{Math.min(endIndex, searchResults.length)} of {searchResults.length} {searchResults.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : paginatedResults.length > 0 ? (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedResults.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>

          {/* Modern Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-12">
              {/* Pagination Info */}
              <div className="text-sm text-dark-600">
                Page {currentPage} of {totalPages}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-dark-300 bg-white text-dark-700 hover:bg-dark-50 hover:border-dark-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-dark-300 transition-all duration-200"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {pageNumbers.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-2 text-dark-500"
                        >
                          ...
                        </span>
                      );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-black text-white shadow-md scale-105'
                            : 'border border-dark-300 bg-white text-dark-700 hover:bg-dark-50 hover:border-dark-400 hover:scale-105'
                        }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-dark-300 bg-white text-dark-700 hover:bg-dark-50 hover:border-dark-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-dark-300 transition-all duration-200"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Quick Jump (Optional) */}
              {totalPages > 7 && (
                <div className="flex items-center gap-2 text-sm text-dark-600">
                  <span>Go to page:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-16 px-2 py-1 border border-dark-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Search size={64} className="mx-auto text-dark-300 mb-6" />
            <h2 className="text-2xl font-bold mb-4">No results found</h2>
            <p className="text-dark-600 mb-6">
              We couldn't find any products matching "{query}". Try adjusting your search.
            </p>
            <div className="space-y-2 text-sm text-dark-600">
              <p>Suggestions:</p>
              <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                <li>Check your spelling</li>
                <li>Try more general keywords</li>
                <li>Try different keywords</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}