'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, MoreVertical, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { api, apiClient } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import ConfirmationModal from '@/src/components/admin/ConfirmationModal';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const router = useRouter();
  // ... (rest of code)

  // ... inside render:

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null
  });
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    sku: '',
    discount: '0',
    isTrending: false,
    description: '',
    tags: [] as string[],
    secondaryCategoryIds: [] as string[],
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await api.getProducts();
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('categoryId', formData.category);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('discount', formData.discount);
      formDataToSend.append('isTrending', String(formData.isTrending));
      formDataToSend.append('tags', JSON.stringify(formData.tags));

      if (formData.secondaryCategoryIds.length > 0) {
        formDataToSend.append('secondaryCategoryIds', formData.secondaryCategoryIds.join(','));
      }

      if (selectedFile) {
        formDataToSend.append('images', selectedFile);
      }

      await api.post('/product', formDataToSend);

      showToast('Product added successfully', 'success');

      // Refresh products list
      const productsData = await api.getProducts();
      setProducts(productsData || []);

      setShowAddModal(false);
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        sku: '',
        discount: '0',
        isTrending: false,
        description: '',
        tags: [],
        secondaryCategoryIds: [],
      });
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Error adding product:', error);
      showToast(error.message || 'Failed to add product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (productId: string) => {
    setConfirmModal({ isOpen: true, productId });
  };

  const confirmDelete = async () => {
    if (!confirmModal.productId) return;

    try {
      setLoading(true);
      await api.deleteProduct(confirmModal.productId);

      setProducts(products.filter(p => (p.id || p.product_id) !== confirmModal.productId));
      showToast('Product deleted successfully', 'success');
      setConfirmModal({ isOpen: false, productId: null });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showToast(error.message || 'Failed to delete product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const value = input.value.trim();
      if (value && !formData.tags.includes(value)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, value]
        }));
        input.value = '';
      }
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleSecondaryCategory = (catId: string) => {
    setFormData(prev => {
      const isSelected = prev.secondaryCategoryIds.includes(catId);
      if (isSelected) {
        return {
          ...prev,
          secondaryCategoryIds: prev.secondaryCategoryIds.filter(id => id !== catId)
        };
      } else {
        return {
          ...prev,
          secondaryCategoryIds: [...prev.secondaryCategoryIds, catId]
        };
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-dark-600">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-900"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-900"
          >
            <option value="">All Categories</option>
            <option value="SALE">Flash Sale 🔥</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-900"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                    No products found
                  </td>
                </tr>
              ) : (
                products
                  .filter((product) => {
                    // Search Filter
                    const matchesSearch =
                      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.category_name?.toLowerCase().includes(searchTerm.toLowerCase());

                    // Category Filter
                    let matchesCategory = true;
                    if (selectedCategory === 'SALE') {
                      matchesCategory = (product.discount > 0);
                    } else if (selectedCategory !== '') {
                      matchesCategory = product.category_name === selectedCategory;
                    }

                    // Status Filter
                    let matchesStatus = true;
                    if (selectedStatus === 'active') {
                      matchesStatus = (product.stock > 5);
                    } else if (selectedStatus === 'low-stock') {
                      matchesStatus = (product.stock > 0 && product.stock <= 5);
                    } else if (selectedStatus === 'out-of-stock') {
                      matchesStatus = (product.stock === 0);
                    }

                    return matchesSearch && matchesCategory && matchesStatus;
                  })
                  .map((product) => (
                    <tr key={product.id || product.product_id} className="hover:bg-dark-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={api.getImageUrl(product.image || product.images?.[0])}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                            }}
                          />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{product.category_name || 'Uncategorized'}</td>
                      <td className="px-6 py-4 text-sm font-semibold">Rs {product.price?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">{product.stock || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(product.stock || 0) > 5 ? 'bg-green-100 text-green-800' :
                          (product.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {(product.stock || 0) > 5 ? 'Active' : (product.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/products/${product.id || product.product_id}`)}
                            className="p-2 hover:bg-dark-100 rounded transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/products/edit/${product.id || product.product_id}`)}
                            className="p-2 hover:bg-dark-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id || product.product_id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-dark-200 flex items-center justify-between">
          <p className="text-sm text-dark-600">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-dark-300 rounded hover:bg-dark-50 text-sm">
              Previous
            </button>
            <button className="px-4 py-2 bg-dark-900 text-white rounded text-sm">
              1
            </button>
            <button className="px-4 py-2 border border-dark-300 rounded hover:bg-dark-50 text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button onClick={() => setShowAddModal(false)}>
                <Trash2 size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (Rs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU (Unique Identifier)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input-field"
                    placeholder="e.g. W-TOP-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="input-field"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-dark-50 p-3 rounded-lg border border-dark-200">
                <input
                  type="checkbox"
                  id="add-isTrending"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-300 text-dark-900 focus:ring-dark-900"
                />
                <label htmlFor="add-isTrending" className="text-sm font-medium cursor-pointer">
                  Feature in "Trending Now" section on Homepage
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Categories (Optional)</label>
                <div className="flex flex-wrap gap-2 p-3 border border-dark-300 rounded-lg max-h-40 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleSecondaryCategory(String(cat.id))}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${formData.secondaryCategoryIds.includes(String(cat.id))
                        ? 'bg-dark-900 text-white'
                        : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-dark-400 mt-1">Select other categories where this product should appear</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search Tags</label>
                <input
                  type="text"
                  placeholder="Type and press Enter to add tags (e.g. New, Hot, Sale)"
                  onKeyDown={handleTagAdd}
                  className="input-field"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-dark-100 text-dark-700 rounded text-xs">
                        {tag}
                        <button type="button" onClick={() => handleTagRemove(tag)} className="hover:text-red-500">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Long Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Briefly describe your product..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product Image (Primary)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="input-field"
                />
                <p className="text-[10px] text-dark-400 mt-1">Recommended size: 800x800px</p>
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-dark-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding Product...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, productId: null })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        variant="danger"
      />
    </div>
  );
}