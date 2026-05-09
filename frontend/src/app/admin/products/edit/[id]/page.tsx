'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X, Upload, Image } from 'lucide-react';
import { api, apiClient } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    sku: '',
    status: 'active',
    description: '',
    isTrending: false,
    secondaryCategoryIds: [] as string[],
    tags: [] as string[],
    sizes: [] as string[],
    discount: '0',
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: any = await apiClient.get('/category');
        setCategories(response.data?.categories || response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetching(true);
        const product: any = await api.getProduct(productId);
        if (product) {
          // Extract secondary category IDs
          // Assuming backend returns "secondaryCategories" array of objects
          const secIds = product.secondaryCategories
            ? product.secondaryCategories.map((c: any) => c.id.toString())
            : [];

          setFormData({
            name: product.name || '',
            categoryId: product.category_id?.toString() || product.categoryId?.toString() || '',
            price: product.price?.toString() || '',
            stock: product.stock?.toString() || '0',
            sku: product.sku || '',
            status: product.status || 'active',
            description: product.description || '',
            isTrending: product.isTrending || false,
            secondaryCategoryIds: secIds,
            tags: Array.isArray(product.tags) ? product.tags : [],
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            discount: product.discount?.toString() || '0',
          });
          // Handle existing images
          const imgs = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
          setExistingImages(imgs);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        showToast('Failed to load product. Redirecting...', 'error');
        router.push('/admin/products');
      } finally {
        setFetching(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSecondaryCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, secondaryCategoryIds: selectedOptions }));
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImages([...newImages, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSizeAdd = (size: string) => {
    if (size && !formData.sizes.includes(size)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }));
    }
  };

  const handleSizeRemove = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('isTrending', String(formData.isTrending));
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      formDataToSend.append('discount', formData.discount);

      // Secondary Categories - send as comma separated string or append multiple times
      if (formData.secondaryCategoryIds.length > 0) {
        formDataToSend.append('secondaryCategoryIds', formData.secondaryCategoryIds.join(','));
      }

      // Send existing images as a single field for the backend to handle
      if (existingImages.length > 0) {
        existingImages.forEach(img => {
          formDataToSend.append('existingImages', img);
        });
      } else {
        // If empty, send a flag to clear them
        formDataToSend.append('existingImages', '');
      }

      // Send new images as 'newImages' files
      newImages.forEach(file => {
        formDataToSend.append('newImages', file);
      });

      // Use the centralized api.put which handles error throwing correctly
      const response = await api.put(`/product/${productId}`, formDataToSend);

      console.log("Update successful:", response);
      showToast('Product updated successfully!', 'success');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      const errorMessage = error.message || 'Failed to update product.';
      showToast(`Update Failed: ${errorMessage}`, 'error');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-600">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>

          <div className="space-y-6">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h3>
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative group w-32 h-32">
                      <img
                        src={api.getImageUrl(img)}
                        alt={`Product ${index}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Uploads */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Images</h3>
              <div className="flex flex-wrap gap-4 items-end">
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group w-32 h-32">
                    <img src={preview} alt={`New ${index}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors">
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500 mt-2">Upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
              />
            </div>


            <div>
              <label className="block text-sm font-medium mb-2">
                Primary Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Categories (Hold Ctrl)
              </label>
              <select
                multiple
                name="secondaryCategoryIds"
                value={formData.secondaryCategoryIds}
                onChange={handleSecondaryCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="isTrending"
                name="isTrending"
                checked={formData.isTrending}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isTrending" className="ml-2 block text-sm text-gray-900 font-medium">
                Manual Trending Override (Priority A)
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (Rs) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., SUM-TSH-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Percentage (%)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-600 font-bold text-coral-500">%</span>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full px-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              id="tagInput"
              placeholder="Enter tag (e.g., Sale, New)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  handleTagAdd(input.value);
                  input.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('tagInput') as HTMLInputElement;
                handleTagAdd(input.value);
                input.value = '';
              }}
              className="btn-secondary"
            >
              Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(formData.tags) && formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Sizes</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              id="sizeInput"
              placeholder="Enter size (e.g., S, M, L, XL)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  handleSizeAdd(input.value);
                  input.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('sizeInput') as HTMLInputElement;
                handleSizeAdd(input.value);
                input.value = '';
              }}
              className="btn-secondary"
            >
              Add Size
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(formData.sizes) && formData.sizes.map(size => (
              <span
                key={size}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full font-medium"
              >
                {size}
                <button
                  type="button"
                  onClick={() => handleSizeRemove(size)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}