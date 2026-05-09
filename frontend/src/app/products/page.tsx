'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid, LayoutGrid, List, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/src/components/product/ProductCard';
import { api } from '@/src/lib/api';

const ITEMS_PER_PAGE = 12;

const filterSections = [
  {
    id: 'brand',
    title: 'BRAND',
    options: ['Forever 21', 'Z Supply', 'Love & Harmony', 'Premium Label', 'Others']
  },
  {
    id: 'department',
    title: 'DEPARTMENT',
    options: ['Women', 'Men', 'Kids', 'Plus Size', 'Petite']
  },
  {
    id: 'category',
    title: 'CATEGORY',
    options: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories']
  },
  {
    id: 'price',
    title: 'PRICE',
    options: ['Under Rs 500', 'Rs 500 - Rs 1000', 'Rs 1000 - Rs 2000', 'Over Rs 2000']
  },
  {
    id: 'size',
    title: 'SIZE',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'color',
    title: 'COLOR',
    options: ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Brown', 'Gray']
  },
  {
    id: 'skirtLength',
    title: 'SKIRT LENGTH',
    options: ['Mini', 'Midi', 'Maxi']
  },
  {
    id: 'sleeveLength',
    title: 'SLEEVE LENGTH',
    options: ['Sleeveless', 'Short Sleeve', 'Long Sleeve', '3/4 Sleeve']
  }
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [viewMode, setViewMode] = useState<'grid-2' | 'grid-3' | 'list'>('grid-3');
  const [sortBy, setSortBy] = useState('featured');
  const [expandedSections, setExpandedSections] = useState<string[]>(['brand', 'department', 'category']);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state - only one active filter type at a time
  const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    brand: [],
    department: [],
    category: [],
    price: [],
    size: [],
    color: [],
    skirtLength: [],
    sleeveLength: [],
  });

  // Category mapping
  const categoryMap: Record<string, string> = {
    'women': 'Women',
    'men': 'Men',
    'kids': 'Kids',
    'accessories': 'Accessories',
    'beauty': 'Beauty',
    'home': 'Home',
    'sale': 'Sale',
  };

  // Fetch products from database on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products from database
        const products = await api.getProducts();
        setAllProducts(products);
        setFilteredProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle filter checkbox change
  const handleFilterChange = (filterType: string, option: string, checked: boolean) => {
    // Set this filter type as active
    setActiveFilterType(filterType);

    setSelectedFilters((prev) => {
      const newFilters = { ...prev };

      // Clear all other filter types
      Object.keys(newFilters).forEach((key) => {
        if (key !== filterType) {
          newFilters[key] = [];
        }
      });

      // Update the selected filter
      if (checked) {
        newFilters[filterType] = [...newFilters[filterType], option];
      } else {
        newFilters[filterType] = newFilters[filterType].filter((item) => item !== option);
      }

      // If no filters selected, clear active filter type
      if (newFilters[filterType].length === 0) {
        setActiveFilterType(null);
      }

      return newFilters;
    });
  };

  // Apply filters and sorting
  useEffect(() => {
    let products = [...allProducts];

    // Filter by URL category param first
    if (categoryParam) {
      const categoryName = categoryMap[categoryParam.toLowerCase()];
      if (categoryName) {
        products = products.filter(
          (product) => product.category_name?.toLowerCase() === categoryName.toLowerCase()
        );
      }
    }

    // Apply selected filters (only one filter type active at a time)
    if (activeFilterType && selectedFilters[activeFilterType].length > 0) {
      const selectedOptions = selectedFilters[activeFilterType];

      products = products.filter((product) => {
        switch (activeFilterType) {
          case 'brand':
            return selectedOptions.includes(product.brand);
          case 'department':
            return selectedOptions.includes(product.department);
          case 'category':
            return selectedOptions.includes(product.productCategory);
          case 'price':
            return selectedOptions.some((range) => {
              if (range === 'Under Rs 500') return product.price < 500;
              if (range === 'Rs 500 - Rs 1000') return product.price >= 500 && product.price <= 1000;
              if (range === 'Rs 1000 - Rs 2000') return product.price > 1000 && product.price <= 2000;
              if (range === 'Over Rs 2000') return product.price > 2000;
              return false;
            });
          case 'size':
            return selectedOptions.some((size) => product.availableSizes?.includes(size));
          case 'color':
            return selectedOptions.includes(product.color);
          case 'skirtLength':
            return product.skirtLength && selectedOptions.includes(product.skirtLength);
          case 'sleeveLength':
            return selectedOptions.includes(product.sleeveLength);
          default:
            return true;
        }
      });
    }

    // Apply sorting
    products = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return parseInt(b.product_id) - parseInt(a.product_id);
        case 'featured':
        default:
          return 0;
      }
    });

    setFilteredProducts(products);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [categoryParam, activeFilterType, selectedFilters, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = useMemo(
    () => filteredProducts.slice(startIndex, endIndex),
    [filteredProducts, startIndex, endIndex]
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

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const gridClasses = {
    'grid-2': 'grid-cols-2 lg:grid-cols-2',
    'grid-3': 'grid-cols-2 md:grid-cols-3',
    'list': 'grid-cols-1'
  };

  return (
    <div className="bg-white">
      {/* Top Bar */}
      <div className="border-b border-dark-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* View Mode Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid-2')}
                className={`p-2 border border-dark-300 rounded ${viewMode === 'grid-2' ? 'bg-dark-900 text-white' : 'bg-white text-dark-900'
                  }`}
                title="2 columns"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid-3')}
                className={`p-2 border border-dark-300 rounded ${viewMode === 'grid-3' ? 'bg-dark-900 text-white' : 'bg-white text-dark-900'
                  }`}
                title="3 columns"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border border-dark-300 rounded ${viewMode === 'list' ? 'bg-dark-900 text-white' : 'bg-white text-dark-900'
                  }`}
                title="List view"
              >
                <List size={18} />
              </button>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden ml-4 px-4 py-2 border border-dark-300 rounded text-sm font-medium"
              >
                FILTERS
              </button>
            </div>

            {/* Product Count */}
            <div className="hidden md:block text-sm text-dark-600 font-medium">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} PRODUCTS
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-dark-600 font-medium">SORT BY</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-dark-300 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-dark-900 bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-6">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 px-10">
            {activeFilterType && (
              <div className="mb-4 pb-4 border-b border-dark-200">
                <button
                  onClick={() => {
                    setActiveFilterType(null);
                    setSelectedFilters({
                      brand: [],
                      department: [],
                      category: [],
                      price: [],
                      size: [],
                      color: [],
                      skirtLength: [],
                      sleeveLength: [],
                    });
                  }}
                  className="w-full px-4 py-2 border border-dark-300 rounded text-sm font-medium hover:bg-dark-50 transition-colors"
                >
                  CLEAR FILTERS
                </button>
              </div>
            )}
            <div className="space-y-0">
              {filterSections.map((section, index) => {
                const isActive = activeFilterType === section.id;
                const hasSelection = selectedFilters[section.id]?.length > 0;

                return (
                  <div
                    key={section.id}
                    className={`${index !== 0 ? 'border-t border-dark-200' : ''} ${isActive ? 'bg-dark-50' : ''
                      }`}
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-50 transition-colors"
                    >
                      <span className="text-sm tracking-wider font-light">
                        {section.title}
                        {hasSelection && (
                          <span className="ml-2 text-xs text-dark-600">
                            ({selectedFilters[section.id].length})
                          </span>
                        )}
                      </span>
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    {expandedSections.includes(section.id) && (
                      <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
                        {section.options.map((option) => {
                          const isChecked = selectedFilters[section.id]?.includes(option) || false;
                          const isDisabled = activeFilterType !== null && activeFilterType !== section.id;

                          return (
                            <label
                              key={option}
                              className={`flex items-center cursor-pointer text-sm hover:text-dark-900 ${isDisabled ? 'text-dark-400 cursor-not-allowed opacity-50' : 'text-dark-700'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={(e) => handleFilterChange(section.id, option, e.target.checked)}
                                className="mr-2 w-4 h-4 rounded border-dark-300"
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Page Title */}
            <h1 className="text-2xl font-bold mb-16 mt-5 uppercase tracking-wide">
              {categoryParam && categoryMap[categoryParam.toLowerCase()]
                ? categoryMap[categoryParam.toLowerCase()].toUpperCase()
                : 'LAYERING SHOP'}
            </h1>

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className={`grid ${gridClasses[viewMode]} gap-4 md:gap-6`}>
                  {paginatedProducts.map((product) => (
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
                              className={`flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-200 ${isActive
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
                <p className="text-dark-600 text-lg">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-dark-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">FILTERS</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-0">
              {filterSections.map((section, index) => (
                <div
                  key={section.id}
                  className={`${index !== 0 ? 'border-t border-dark-200' : ''}`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-xs font-bold tracking-wider">{section.title}</span>
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {expandedSections.includes(section.id) && (
                    <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
                      {section.options.map((option) => {
                        const isChecked = selectedFilters[section.id]?.includes(option) || false;
                        const isDisabled = activeFilterType !== null && activeFilterType !== section.id;

                        return (
                          <label
                            key={option}
                            className={`flex items-center cursor-pointer text-sm ${isDisabled ? 'text-dark-400 cursor-not-allowed opacity-50' : ''
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={(e) => handleFilterChange(section.id, option, e.target.checked)}
                              className="mr-2 w-4 h-4 rounded border-dark-300"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-dark-200 p-4 space-y-2">
              {activeFilterType && (
                <button
                  onClick={() => {
                    setActiveFilterType(null);
                    setSelectedFilters({
                      brand: [],
                      department: [],
                      category: [],
                      price: [],
                      size: [],
                      color: [],
                      skirtLength: [],
                      sleeveLength: [],
                    });
                  }}
                  className="w-full px-4 py-2 border border-dark-300 rounded text-sm font-medium hover:bg-dark-50 transition-colors"
                >
                  CLEAR FILTERS
                </button>
              )}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full btn-primary"
              >
                APPLY FILTERS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}