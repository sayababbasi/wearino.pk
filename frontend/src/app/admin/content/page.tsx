'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X, Plus, Edit, Trash2, Eye, Save, Loader, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { api, apiClient } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import ConfirmationModal from '@/src/components/admin/ConfirmationModal';

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('banners');
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [categoryFeatures, setCategoryFeatures] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState({
    id: '',
    enabled: false,
    text: '',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    sliding: false,
    barStyle: 'single' as 'single' | 'triple', // 'single' = center text/marquee, 'triple' = 3-column info bar
    leftText: '',
    leftIcon: '🚚',
    centerText: '',
    centerIcon: '💳',
    rightText: '',
    rightIcon: '📞',
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; contentId: string | null }>({
    isOpen: false,
    contentId: null
  });
  const { showToast } = useToast();

  // Modal State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Featured Products Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingFeatured, setSavingFeatured] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    linkUrl: '',
    position: 'hero',
    image: null as File | null,
    imagePreview: '',
    priority: 1,
    isActive: true,
    label: '',
    subTitle: '',
    buttonText: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Content
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const allContent = await api.getContent(undefined, undefined, true);

      // Filter Banners
      const fetchedBanners = allContent.filter((c: any) => c.type === 'banner');
      setBanners(fetchedBanners);

      // Filter Featured (with Product data from backend)
      const fetchedFeatured = allContent.filter((c: any) => c.type === 'featured_product');
      setFeaturedProducts(fetchedFeatured);

      // Filter Brands
      const fetchedBrands = allContent.filter((c: any) => c.type === 'brand');
      setBrands(fetchedBrands);

      // Filter Category Features
      const fetchedCategoryFeatures = allContent.filter((c: any) => c.type === 'category_feature');
      // Sort by order
      fetchedCategoryFeatures.sort((a: any, b: any) => a.order - b.order);
      setCategoryFeatures(fetchedCategoryFeatures);

      // Filter Influencers
      const fetchedInfluencers = allContent.filter((c: any) => c.type === 'influencer');
      setInfluencers(fetchedInfluencers);

      // Announcement
      const fetchedAnnouncement = allContent.find((c: any) => c.type === 'announcement');
      if (fetchedAnnouncement) {
        let parsedMeta = {};
        try {
          parsedMeta = typeof fetchedAnnouncement.meta === 'string'
            ? JSON.parse(fetchedAnnouncement.meta)
            : fetchedAnnouncement.meta || {};
        } catch (e) {
          console.error("Failed to parse announcement meta", e);
        }

        setAnnouncement({
          id: fetchedAnnouncement.id,
          enabled: fetchedAnnouncement.isActive,
          text: fetchedAnnouncement.title,
          backgroundColor: (parsedMeta as any).backgroundColor || '#000000',
          textColor: (parsedMeta as any).textColor || '#ffffff',
          sliding: (parsedMeta as any).sliding || false,
          barStyle: (parsedMeta as any).barStyle || 'single',
          leftText: (parsedMeta as any).leftText || '',
          leftIcon: (parsedMeta as any).leftIcon || '🚚',
          centerText: (parsedMeta as any).centerText || '',
          centerIcon: (parsedMeta as any).centerIcon || '💳',
          rightText: (parsedMeta as any).rightText || '',
          rightIcon: (parsedMeta as any).rightIcon || '📞',
        });
      }
    } catch (error) {
      console.error("Failed to fetch content", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all products for selection modal
  const fetchAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await api.getProducts();
      setAllProducts(products);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  // Get product IDs that are already featured
  const featuredProductIds = featuredProducts.map(fp => fp.productId);

  // Handlers
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // Determine type from active tab
    let type = 'banner';
    if (activeTab === 'brands') type = 'brand';
    if (activeTab === 'influencers') type = 'influencer';
    if (activeTab === 'category_features') type = 'category_feature';

    data.append('type', type);
    data.append('title', formData.title);
    data.append('linkUrl', formData.linkUrl);
    data.append('position', formData.position);
    data.append('order', formData.priority.toString());
    data.append('isActive', formData.isActive.toString());

    // Add meta fields
    const metaData = {
      label: formData.label,
      subtitle: formData.subTitle, // Map subTitle to subtitle for consistency with homepage
      buttonText: formData.buttonText
    };
    data.append('meta', JSON.stringify(metaData));

    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (modalMode === 'create') {
        await api.createContent(data);
      } else if (currentEditId) {
        await api.updateContent(currentEditId, data);
      }
      setShowBannerModal(false);
      resetForm();
      fetchContent();
      showToast('Banner saved successfully', 'success');
    } catch (error: any) {
      console.error("Failed to save banner", error);
      showToast(error.message || "Failed to save banner", 'error');
    }
  };

  const handleAnnouncementSave = async () => {
    const data = {
      type: 'announcement',
      title: announcement.barStyle === 'triple' ? announcement.centerText : announcement.text,
      isActive: announcement.enabled,
      meta: JSON.stringify({
        backgroundColor: announcement.backgroundColor,
        textColor: announcement.textColor,
        sliding: announcement.sliding,
        barStyle: announcement.barStyle,
        leftText: announcement.leftText,
        leftIcon: announcement.leftIcon,
        centerText: announcement.centerText,
        centerIcon: announcement.centerIcon,
        rightText: announcement.rightText,
        rightIcon: announcement.rightIcon,
      })
    };

    try {
      if (announcement.id) {
        await api.updateContent(announcement.id, data);
      } else {
        await (api as any).createContent(data);
      }
      showToast("Announcement saved successfully!", 'success');
      fetchContent();
    } catch (error) {
      console.error("Failed to save announcement", error);
      showToast("Failed to save announcement", 'error');
    }
  };

  const handleDelete = (id: string) => {
    setConfirmModal({ isOpen: true, contentId: id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.contentId) return;

    try {
      await api.deleteContent(confirmModal.contentId);
      fetchContent();
      showToast('Item deleted successfully', 'success');
      setConfirmModal({ isOpen: false, contentId: null });
    } catch (e) {
      console.error("Delete failed", e);
      showToast('Delete failed', 'error');
    }
  };

  const handleDeleteBanner = (id: string) => handleDelete(id);
  const handleDeleteFeatured = (id: string) => handleDelete(id);

  // Featured Products Handlers
  const handleAddFeaturedProduct = async (product: any) => {
    setSavingFeatured(true);
    try {
      const data = {
        type: 'featured_product',
        title: product.name,
        productId: product.id,
        linkUrl: `/products/${product.id}`,
        order: featuredProducts.length + 1,
        isActive: true
      };
      await (api as any).createContent(data);
      setShowProductModal(false);
      setProductSearchQuery('');
      fetchContent();
      showToast('Featured product added successfully', 'success');
    } catch (error) {
      console.error("Failed to add featured product", error);
      showToast("Failed to add featured product", 'error');
    } finally {
      setSavingFeatured(false);
    }
  };

  const handleMoveFeaturedUp = async (index: number) => {
    if (index === 0) return;
    const currentItem = featuredProducts[index];
    const prevItem = featuredProducts[index - 1];

    try {
      await api.updateContent(currentItem.id, { order: prevItem.order });
      await api.updateContent(prevItem.id, { order: currentItem.order });
      fetchContent();
    } catch (error) {
      console.error("Failed to reorder", error);
    }
  };

  const handleMoveFeaturedDown = async (index: number) => {
    if (index === featuredProducts.length - 1) return;
    const currentItem = featuredProducts[index];
    const nextItem = featuredProducts[index + 1];

    try {
      await api.updateContent(currentItem.id, { order: nextItem.order });
      await api.updateContent(nextItem.id, { order: currentItem.order });
      fetchContent();
    } catch (error) {
      console.error("Failed to reorder", error);
    }
  };

  const openEditModal = (item: any) => {
    setModalMode('edit');
    setCurrentEditId(item.id);

    let parsedMeta: any = {};
    try {
      parsedMeta = typeof item.meta === 'string'
        ? JSON.parse(item.meta)
        : item.meta || {};
    } catch (e) {
      console.error("Failed to parse item meta", e);
    }

    setFormData({
      title: item.title,
      linkUrl: item.linkUrl,
      position: item.position,
      image: null,
      imagePreview: apiClient.getImageUrl(item.imageUrl),
      priority: item.order || 0,
      isActive: item.isActive ?? true,
      label: parsedMeta.label || '',
      subTitle: parsedMeta.subtitle || '', // Map subtitle back to subTitle
      buttonText: parsedMeta.buttonText || ''
    });
    setShowBannerModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      linkUrl: '',
      position: 'hero',
      image: null,
      imagePreview: '',
      priority: 1,
      isActive: true,
      label: '',
      subTitle: '',
      buttonText: ''
    });
    setCurrentEditId(null);
    setModalMode('create');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  // Get product image URL helper
  const getProductImageUrl = (product: any) => {
    if (product?.images && product.images.length > 0) {
      return apiClient.getImageUrl(product.images[0]);
    }
    if (product?.image) {
      return apiClient.getImageUrl(product.image);
    }
    return 'https://via.placeholder.com/64?text=No+Image';
  };

  const tabs = [
    { id: 'banners', label: 'Hero Banners' },
    { id: 'featured', label: 'Featured Products' },
    { id: 'brands', label: 'Brands' },
    { id: 'influencers', label: 'Influencers' },
    { id: 'category_features', label: 'Category Features' },
    { id: 'announcement', label: 'Announcement Bar' },
  ];

  if (loading && banners.length === 0 && !announcement.id) {
    return <div className="p-12 text-center text-gray-500">Loading content configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Content Management</h1>
        <p className="text-gray-600">Manage homepage banners, featured items, and announcements</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Banners Tab */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Manage hero banners and promotional images</p>
                <button
                  onClick={() => { resetForm(); setShowBannerModal(true); }}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Banner
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                  <div key={banner.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                    <div className="aspect-video bg-gray-100 relative group">
                      <img
                        src={apiClient.getImageUrl(banner.imageUrl) || 'https://via.placeholder.com/400x200?text=No+Image'}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image' }}
                      />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-all duration-300" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{banner.title}</h3>
                          <p className="text-sm text-gray-500 capitalize">{banner.position}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {banner.isActive ? 'Active' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 truncate">{banner.linkUrl}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-2 border border-gray-300 rounded hover:bg-red-50 hover:border-red-300 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {banners.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <p>No banners found. Add one to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Featured Products Tab */}
          {activeTab === 'featured' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Select products to feature on the homepage</p>
                <button
                  onClick={() => { fetchAllProducts(); setShowProductModal(true); }}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Featured Product
                </button>
              </div>

              {/* Featured Products List */}
              <div className="space-y-3">
                {featuredProducts.map((featured, index) => {
                  const product = featured.product;
                  return (
                    <div key={featured.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveFeaturedUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveFeaturedDown(index)}
                          disabled={index === featuredProducts.length - 1}
                          className={`p-1 rounded ${index === featuredProducts.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      {/* Order Number */}
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded font-bold text-gray-500 text-sm">
                        #{index + 1}
                      </div>

                      {/* Product Image */}
                      <img
                        src={product ? getProductImageUrl(product) : 'https://via.placeholder.com/64?text=No+Image'}
                        alt={product?.name || featured.title}
                        className="w-16 h-16 rounded object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image' }}
                      />

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{product?.name || featured.title}</h3>
                        <p className="text-sm text-gray-500">
                          ${product?.price?.toFixed(2) || 'N/A'} • Stock: {product?.stock ?? 'N/A'}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${featured.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {featured.isActive ? 'Active' : 'Hidden'}
                      </span>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteFeatured(featured.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
                {featuredProducts.length === 0 && (
                  <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="mb-2">No featured products configured.</p>
                    <p className="text-sm">Click "Add Featured Product" to select products to feature on the homepage.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Brands Tab */}
          {activeTab === 'brands' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Manage brand logos for "Brands You Love" section</p>
                <button
                  onClick={() => { resetForm(); setShowBannerModal(true); }}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Brand
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {brands.map((brand) => (
                  <div key={brand.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                    <div className="aspect-square bg-gray-100 relative group">
                      <img
                        src={apiClient.getImageUrl(brand.imageUrl) || 'https://via.placeholder.com/150?text=No+Image'}
                        alt={brand.title}
                        className="w-full h-full object-contain p-4"
                      />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-all duration-300" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-sm truncate mb-3">{brand.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(brand)}
                          className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                        >
                          <Edit size={14} className="mx-auto" />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="p-2 border border-gray-300 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={14} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {brands.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <p>No brands found. Add one to display the "Brands You Love" section.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Influencers Tab */}
          {activeTab === 'influencers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Manage influencers for "Loved and Worn By" section</p>
                <button
                  onClick={() => { resetForm(); setShowBannerModal(true); }}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Influencer
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {influencers.map((influencer) => (
                  <div key={influencer.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white text-center">
                    <div className="p-6">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-2 border-gray-100">
                        <img
                          src={apiClient.getImageUrl(influencer.imageUrl) || 'https://via.placeholder.com/100?text=No+Image'}
                          alt={influencer.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-4">{influencer.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(influencer)}
                          className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                        >
                          <Edit size={14} className="mx-auto" />
                        </button>
                        <button
                          onClick={() => handleDelete(influencer.id)}
                          className="p-2 border border-gray-300 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={14} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {influencers.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <p>No influencers found. Add one to display the "Loved and Worn By" section.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Features Tab */}
          {activeTab === 'category_features' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Manage items for the category feature highlight section</p>
                <button
                  onClick={() => { resetForm(); setShowBannerModal(true); }}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Category Feature
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryFeatures.map((feature) => (
                  <div key={feature.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex items-center p-4 gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 relative group">
                      <img
                        src={apiClient.getImageUrl(feature.imageUrl) || 'https://via.placeholder.com/150?text=No+Image'}
                        alt={feature.title}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{feature.title}</h3>
                      <p className="text-xs text-gray-500 truncate mb-2">
                        {typeof feature.meta === 'string' ? JSON.parse(feature.meta).subtitle : feature.meta?.subtitle || ''}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(feature)}
                          className="flex-1 p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex justify-center items-center"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(feature.id)}
                          className="flex-1 p-1.5 border border-gray-300 rounded hover:bg-red-50 text-red-600 flex justify-center items-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {categoryFeatures.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <p>No category features found. Add one to display the features section.</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Announcement Bar Tab */}
          {activeTab === 'announcement' && (
            <div className="space-y-6">
              <p className="text-gray-600">Configure the announcement bar at the top of your site</p>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">

                {/* Enable toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Enable Announcement Bar</h3>
                    <p className="text-sm text-gray-500">Show announcement at the top of every page</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={announcement.enabled} onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                {/* Bar Style */}
                <div className="border-t pt-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Bar Style</h3>
                  <div className="flex gap-4">
                    <label className={`flex-1 border-2 rounded-lg p-3 cursor-pointer transition-colors ${announcement.barStyle === 'single' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                      <input type="radio" name="barStyle" value="single" checked={announcement.barStyle === 'single'} onChange={() => setAnnouncement({ ...announcement, barStyle: 'single' })} className="sr-only" />
                      <p className="font-semibold text-sm text-gray-900">📢 Single Text</p>
                      <p className="text-xs text-gray-500 mt-0.5">One centered message (with optional marquee)</p>
                    </label>
                    <label className={`flex-1 border-2 rounded-lg p-3 cursor-pointer transition-colors ${announcement.barStyle === 'triple' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                      <input type="radio" name="barStyle" value="triple" checked={announcement.barStyle === 'triple'} onChange={() => setAnnouncement({ ...announcement, barStyle: 'triple' })} className="sr-only" />
                      <p className="font-semibold text-sm text-gray-900">📋 3-Column Info Bar</p>
                      <p className="text-xs text-gray-500 mt-0.5">Left / Center / Right info (like reference design)</p>
                    </label>
                  </div>
                </div>

                {/* Single style settings */}
                {announcement.barStyle === 'single' && (
                  <div className="border-t pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Enable Sliding Marquee</h3>
                        <p className="text-sm text-gray-500">Animate text from right to left</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={announcement.sliding} onChange={(e) => setAnnouncement({ ...announcement, sliding: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text</label>
                      <input type="text" value={announcement.text} onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="e.g., Get 15% Off Your First Order" />
                    </div>
                  </div>
                )}

                {/* Triple style settings */}
                {announcement.barStyle === 'triple' && (
                  <div className="border-t pt-6 space-y-4">
                    <p className="text-sm text-gray-500">Enter icon (emoji) and text for each column</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Left Column</label>
                        <input type="text" value={announcement.leftIcon} onChange={(e) => setAnnouncement({ ...announcement, leftIcon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Icon emoji e.g. 🚚" />
                        <input type="text" value={announcement.leftText} onChange={(e) => setAnnouncement({ ...announcement, leftText: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Free Delivery on Orders Above PKR 2500" />
                      </div>
                      {/* Center */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Center Column</label>
                        <input type="text" value={announcement.centerIcon} onChange={(e) => setAnnouncement({ ...announcement, centerIcon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Icon emoji e.g. 💳" />
                        <input type="text" value={announcement.centerText} onChange={(e) => setAnnouncement({ ...announcement, centerText: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Cash on Delivery Across Pakistan" />
                      </div>
                      {/* Right */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Right Column</label>
                        <input type="text" value={announcement.rightIcon} onChange={(e) => setAnnouncement({ ...announcement, rightIcon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Icon emoji e.g. 📞" />
                        <input type="text" value={announcement.rightText} onChange={(e) => setAnnouncement({ ...announcement, rightText: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. +92 300 1234567 | support@wearino.pk" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Colors */}
                <div className="border-t pt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Background Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={announcement.backgroundColor} onChange={(e) => setAnnouncement({ ...announcement, backgroundColor: e.target.value })} className="w-12 h-10 p-1 border border-gray-300 rounded cursor-pointer" />
                      <input type="text" value={announcement.backgroundColor} onChange={(e) => setAnnouncement({ ...announcement, backgroundColor: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Text Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={announcement.textColor} onChange={(e) => setAnnouncement({ ...announcement, textColor: e.target.value })} className="w-12 h-10 p-1 border border-gray-300 rounded cursor-pointer" />
                      <input type="text" value={announcement.textColor} onChange={(e) => setAnnouncement({ ...announcement, textColor: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* Preview — exactly matches the Header render */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Live Preview <span className="text-xs text-gray-400 font-normal">(identical to storefront)</span></label>
                  <div
                    className="overflow-hidden py-1.5 text-[10.5px] tracking-[0.12em] font-semibold uppercase"
                    style={{ backgroundColor: announcement.backgroundColor, color: announcement.textColor }}
                  >
                    {announcement.barStyle === 'triple' ? (
                      /* Same as Header: 3-column with container padding */
                      <div className="container-custom flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          {announcement.leftIcon && <span>{announcement.leftIcon}</span>}
                          {announcement.leftText || 'Left info text'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {announcement.centerIcon && <span>{announcement.centerIcon}</span>}
                          {announcement.centerText || 'Center info text'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {announcement.rightIcon && <span>{announcement.rightIcon}</span>}
                          {announcement.rightText || 'Right info text'}
                        </span>
                      </div>
                    ) : announcement.sliding ? (
                      /* Same as Header: single marquee centered */
                      <div className="marquee-container overflow-hidden whitespace-nowrap text-center">
                        <p className="animate-marquee inline-block">{announcement.text || 'Your announcement text here'}</p>
                      </div>
                    ) : (
                      /* Same as Header: single static centered */
                      <p className="text-center">{announcement.text || 'Your announcement text here'}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button onClick={handleAnnouncementSave} className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                    <Save size={18} />
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl transform transition-all">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{modalMode === 'create' ? 'Add New Content' : 'Edit Content'}</h2>
              <button onClick={() => setShowBannerModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Link URL</label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="/categories/sale"
                />
              </div>

              {(formData.position === 'hero' || formData.position === 'secondary' || formData.position === 'promotional') && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Upper Label</label>
                      <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="e.g., NEW COLLECTION 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Button Text</label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="e.g., SHOP NOW"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Subheading (Description Text)</label>
                    <textarea
                      value={formData.subTitle}
                      onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="e.g., Shop the latest trends from our design studio"
                      rows={2}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Position / Type</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="hero">Hero (Main Slider)</option>
                  <option value="secondary">Secondary Banner</option>
                  <option value="promotional">Promotional Section</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Display Order (Priority)</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {formData.isActive ? 'Active (Visible)' : 'Draft (Hidden)'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Image {modalMode === 'create' ? '*' : '(Optional)'}</label>

                {formData.imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-4 h-48 group">
                    <img
                      src={
                        formData.imagePreview.startsWith('blob')
                          ? formData.imagePreview
                          : apiClient.getImageUrl(formData.imagePreview)
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: null, imagePreview: '' });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">Recommended: 1920x600px (Hero) or 800x600px</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  {modalMode === 'create' ? 'Create Content' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowBannerModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {
        showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl transform transition-all">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Select Product to Feature</h2>
                <button onClick={() => { setShowProductModal(false); setProductSearchQuery(''); }} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Search products by name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Product List */}
              <div className="overflow-y-auto max-h-[60vh]">
                {loadingProducts ? (
                  <div className="p-8 text-center text-gray-500">
                    <Loader size={32} className="animate-spin mx-auto mb-2" />
                    Loading products...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {productSearchQuery ? 'No products match your search.' : 'No products available.'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const isAlreadyFeatured = featuredProductIds.includes(product.id);
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center gap-4 p-4 ${isAlreadyFeatured ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50 cursor-pointer'}`}
                          onClick={() => !isAlreadyFeatured && !savingFeatured && handleAddFeaturedProduct(product)}
                        >
                          <img
                            src={getProductImageUrl(product)}
                            alt={product.name}
                            className="w-16 h-16 rounded object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image' }}
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500">${product.price?.toFixed(2)} • Stock: {product.stock}</p>
                          </div>
                          {isAlreadyFeatured ? (
                            <span className="text-sm text-gray-400">Already Featured</span>
                          ) : (
                            <button
                              disabled={savingFeatured}
                              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                              {savingFeatured ? <Loader size={16} className="animate-spin" /> : 'Add'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, contentId: null })}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete Item"
        variant="danger"
      />
    </div>
  );
}