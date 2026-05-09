'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FolderTree, Image as ImageIcon } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import ConfirmationModal from '@/src/components/admin/ConfirmationModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    status: 'active',
    parentId: '',
    imageFile: null as File | null,
    imagePreview: ''
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null
  });
  const { showToast } = useToast();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await api.getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      image: '',
      description: '',
      status: 'active',
      parentId: '',
      imageFile: null,
      imagePreview: ''
    });
    setShowModal(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: category.image || '',
      description: category.description || '',
      status: category.status || 'active',
      parentId: category.parentId || '',
      imageFile: null,
      imagePreview: category.image || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('status', formData.status);
      data.append('parentId', formData.parentId);

      if (formData.imageFile) {
        data.append('image', formData.imageFile);
      } else if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, data);
      } else {
        await api.createCategory(data);
      }

      // Refresh categories
      const categoriesData = await api.getCategories();
      setCategories(categoriesData || []);

      setShowModal(false);
      showToast(editingCategory ? 'Category updated successfully' : 'Category created successfully', 'success');
    } catch (error: any) {
      console.error('Error saving category:', error);
      showToast(error.message || 'Failed to save category. Please try again.', 'error');
    }
  };

  const handleDelete = (categoryId: string) => {
    setConfirmModal({ isOpen: true, categoryId });
  };

  const confirmDelete = async () => {
    if (!confirmModal.categoryId) return;

    try {
      await api.deleteCategory(confirmModal.categoryId);

      // Refresh categories
      const categoriesData = await api.getCategories();
      setCategories(categoriesData || []);
      showToast('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category. Please try again.', 'error');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Category Management</h1>
          <p className="text-dark-600">Organize your products into categories</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-dark-600">Total Categories</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-dark-600">Total Products</p>
          <p className="text-2xl font-bold">
            {categories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-dark-600">Active Categories</p>
          <p className="text-2xl font-bold text-green-600">
            {categories.filter(c => c.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-900"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">No categories found</p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-video bg-dark-100 relative overflow-hidden">
                  {category.image ? (
                    <img
                      src={api.getImageUrl(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FolderTree size={48} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {category.status || 'Active'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-dark-500 mb-2">
                      {category.parentId ? (
                        <>
                          <FolderTree size={12} />
                          <span>Subcategory of: <strong>{categories.find(c => c.id === category.parentId)?.name || 'Unknown'}</strong></span>
                        </>
                      ) : (
                        <span className="bg-dark-100 px-2 py-0.5 rounded">Main Department</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {category.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-sm text-dark-600">
                      <FolderTree size={16} />
                      <span>{category.products?.length || 0} products</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 hover:bg-dark-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200">
              <h2 className="text-2xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full p-2 border rounded"
                  placeholder="e.g., Women"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Image {editingCategory ? '(Optional)' : '*'}
                </label>

                <div className="flex flex-col gap-4">
                  {formData.imagePreview && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-dark-200">
                      <img
                        src={api.getImageUrl(formData.imagePreview)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageFile: null, imagePreview: '', image: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dark-300 border-dashed rounded-lg cursor-pointer bg-dark-50 hover:bg-dark-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Plus className="w-8 h-8 mb-3 text-dark-400" />
                        <p className="mb-2 text-sm text-dark-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-dark-400">PNG, JPG, WEBP (MAX. 2MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({
                              ...formData,
                              imageFile: file,
                              imagePreview: URL.createObjectURL(file)
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Or Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value, imagePreview: e.target.value })}
                    className="input-field w-full p-2 border rounded"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full p-2 border rounded h-24"
                  placeholder="Describe this category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Parent Category
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="input-field w-full p-2 border rounded"
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id && !c.parentId) // Only top-level can be parents for now to keep it simple, or just avoid self
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <p className="text-xs text-dark-500 mt-1">
                  Select a department (e.g., Men) if this is a subcategory (e.g., Shirts).
                </p>
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, categoryId: null })}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete Category"
        variant="danger"
      />
    </div>
  );
}