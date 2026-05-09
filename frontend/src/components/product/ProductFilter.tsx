'use client';

import { useState } from 'react';

export default function ProductFilter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const categories = ['All', 'Women', 'Men', 'Kids', 'Accessories', 'Sale'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Pink', hex: '#EC4899' },
  ];

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-4 text-lg">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={category.toLowerCase()}
                checked={selectedCategory === category.toLowerCase()}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mr-3 w-4 h-4"
              />
              <span className="group-hover:text-dark-900 transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="pt-6 border-t border-dark-200">
        <h3 className="font-semibold mb-4 text-lg">Price Range</h3>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="200"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full accent-dark-900"
          />
          <div className="flex justify-between text-sm font-medium">
            <span>Rs {priceRange[0]}</span>
            <span>Rs {priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Size Filter */}
      <div className="pt-6 border-t border-dark-200">
        <h3 className="font-semibold mb-4 text-lg">Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`py-2 border rounded font-medium transition-colors ${selectedSizes.includes(size)
                  ? 'border-dark-900 bg-dark-900 text-white'
                  : 'border-dark-300 hover:border-dark-900'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="pt-6 border-t border-dark-200">
        <h3 className="font-semibold mb-4 text-lg">Color</h3>
        <div className="grid grid-cols-4 gap-3">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              className={`w-full aspect-square rounded-full border-2 transition-all ${selectedColors.includes(color.name)
                  ? 'border-dark-900 scale-110'
                  : 'border-dark-200 hover:border-dark-400'
                }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setSelectedCategory('all');
          setPriceRange([0, 200]);
          setSelectedSizes([]);
          setSelectedColors([]);
        }}
        className="w-full btn-secondary text-sm mt-6"
      >
        Clear All Filters
      </button>
    </div>
  );
}