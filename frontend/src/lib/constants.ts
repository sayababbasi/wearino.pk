export const SITE_NAME = 'WEARINO';
export const SITE_DESCRIPTION = 'Define Your Style, Wear Confidence. Shop the latest trends at wearino.pk';
export const BRAND_DOMAIN = 'wearino.pk';
export const SLOGAN = 'Define Your Style, Wear Confidence.';

export const NAVIGATION_LINKS = [
  { label: 'Women', href: '/categories/women' },
  { label: 'Men', href: '/categories/men' },
  { label: 'Kids', href: '/categories/kids' },
  { label: 'Accessories', href: '/categories/accessories' },
  { label: 'Beauty', href: '/categories/beauty' },
  { label: 'Home', href: '/categories/home' },
  { label: 'Sale', href: '/categories/sale' },
];

export const CATEGORIES = [
  { name: 'Women', slug: 'women', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
  { name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400' },
  { name: 'Kids', slug: 'kids', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e4?w=400' },
  { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=400' },
];

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
];

export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const PRODUCT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Gray', hex: '#6B7280' },
];

export const PRICE_RANGES = [
  { label: 'Under Rs 25', min: 0, max: 25 },
  { label: 'Rs 25 - Rs 50', min: 25, max: 50 },
  { label: 'Rs 50 - Rs 100', min: 50, max: 100 },
  { label: 'Rs 100 - Rs 200', min: 100, max: 200 },
  { label: 'Over Rs 200', min: 200, max: Infinity },
];

export const FOOTER_LINKS = {
  shop: [
    { label: 'Women', href: '/categories/women' },
    { label: 'Men', href: '/categories/men' },
    { label: 'Kids', href: '/categories/kids' },
    { label: 'Accessories', href: '/categories/accessories' },
    { label: 'Sale', href: '/categories/sale' },
  ],
  customerService: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Store Locator', href: '/stores' },
    { label: 'Sustainability', href: '/sustainability' },
  ],
};

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com',
  youtube: 'https://youtube.com',
};

export const SHIPPING_INFO = {
  free: { threshold: 75, message: 'Free Shipping On Orders Over Rs 75' },
  standard: { days: '5-7', cost: 0 },
  express: { days: '2-3', cost: 15 },
};

export const RETURN_POLICY = {
  days: 30,
  message: 'Returns accepted within 30 days of purchase',
};