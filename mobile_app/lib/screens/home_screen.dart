import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/product_provider.dart';
import '../widgets/product_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentSlide = 0;
  final PageController _pageController = PageController();

  final List<Map<String, dynamic>> _heroSlides = [
    {
      'image': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
      'title': 'New Season Arrivals',
      'subtitle': 'Shop the latest trends',
      'link': '/products',
    },
    {
      'image': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
      'title': 'Summer Collection',
      'subtitle': 'Fresh styles for sunny days',
      'link': '/categories/women',
    },
    {
      'image': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
      'title': 'Up to 50% Off',
      'subtitle': 'Don\'t miss out on amazing deals',
      'link': '/categories/sale',
    },
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().loadProducts();
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // App Bar
              SliverAppBar(
                expandedHeight: 60,
                floating: true,
                pinned: true,
                backgroundColor: Colors.white,
                elevation: 0,
                title: const Text(
                  'FASHION',
                  style: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                actions: [
                  IconButton(
                    icon: const Icon(Icons.search, color: Colors.black),
                    onPressed: () => context.go('/search'),
                  ),
                  IconButton(
                    icon: const Icon(Icons.shopping_bag, color: Colors.black),
                    onPressed: () => context.go('/cart'),
                  ),
                ],
              ),

              // Hero Slider
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 400,
                  child: Stack(
                    children: [
                      PageView.builder(
                        controller: _pageController,
                        onPageChanged: (index) {
                          setState(() {
                            _currentSlide = index;
                          });
                        },
                        itemCount: _heroSlides.length,
                        itemBuilder: (context, index) {
                          final slide = _heroSlides[index];
                          return GestureDetector(
                            onTap: () => context.go(slide['link']),
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                Image.network(
                                  slide['image'],
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(color: Colors.grey[300]);
                                  },
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        Colors.black.withOpacity(0.3),
                                        Colors.black.withOpacity(0.1),
                                      ],
                                    ),
                                  ),
                                ),
                                Positioned(
                                  left: 20,
                                  bottom: 40,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        slide['title'],
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 32,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        slide['subtitle'],
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 18,
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton(
                                        onPressed: () => context.go(slide['link']),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.black,
                                          foregroundColor: Colors.white,
                                        ),
                                        child: const Text('Shop Now'),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      // Dots indicator
                      Positioned(
                        bottom: 20,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            _heroSlides.length,
                            (index) => Container(
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              width: _currentSlide == index ? 24 : 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: _currentSlide == index
                                    ? Colors.white
                                    : Colors.white.withOpacity(0.5),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Flash Sale Section (products with Sale tag)
              SliverToBoxAdapter(
                child: Builder(
                  builder: (context) {
                    final allProducts = context.watch<ProductProvider>().products;
                    final saleProducts = allProducts
                        .where((p) {
                          final tags = p.tags;
                          if (tags == null || tags.isEmpty) {
                            // If no tags, check discount
                            return p.discount != null && p.discount! > 0;
                          }
                          return tags.any((tag) => 
                            tag.toString().toLowerCase().contains('sale')
                          ) || (p.discount != null && p.discount! > 0);
                        })
                        .take(7)
                        .toList();
                    return _buildSection(
                      context,
                      title: 'Flash Sale Faves',
                      products: saleProducts,
                    );
                  },
                ),
              ),

              // Banner
              SliverToBoxAdapter(
                child: _buildBanner(
                  context,
                  image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',
                  title: 'Free Shipping',
                  subtitle: 'On all orders over \$75',
                  onTap: () => context.go('/products'),
                ),
              ),

              // New Arrivals Section (products with New tag)
              SliverToBoxAdapter(
                child: Builder(
                  builder: (context) {
                    final allProducts = context.watch<ProductProvider>().products;
                    final newProducts = allProducts
                        .where((p) {
                          final tags = p.tags;
                          if (tags == null || tags.isEmpty) {
                            return false; // No tags means not a new arrival
                          }
                          return tags.any((tag) => 
                            tag.toString().toLowerCase().contains('new') ||
                            tag.toString().toLowerCase().contains('arrival')
                          );
                        })
                        .take(6)
                        .toList();
                    // If no new products, show first 6 products as fallback
                    final displayProducts = newProducts.isNotEmpty 
                        ? newProducts 
                        : allProducts.take(6).toList();
                    return _buildSection(
                      context,
                      title: 'Women\'s New Arrivals',
                      products: displayProducts,
                    );
                  },
                ),
              ),

              // Trending Now Section (products with Trending tag)
              SliverToBoxAdapter(
                child: Builder(
                  builder: (context) {
                    final allProducts = context.watch<ProductProvider>().products;
                    final trendingProducts = allProducts
                        .where((p) {
                          final tags = p.tags;
                          if (tags == null || tags.isEmpty) {
                            return false; // No tags means not trending
                          }
                          return tags.any((tag) => 
                            tag.toString().toLowerCase().contains('trending')
                          );
                        })
                        .take(6)
                        .toList();
                    // If no trending products, show next 6 products as fallback
                    final displayProducts = trendingProducts.isNotEmpty 
                        ? trendingProducts 
                        : allProducts.skip(6).take(6).toList();
                    return _buildSection(
                      context,
                      title: 'Trending Now',
                      products: displayProducts,
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSection(BuildContext context, {required String title, required List<Product> products}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              title.toUpperCase(),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w300,
                letterSpacing: 1,
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 280,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: products.length,
              itemBuilder: (context, index) {
                return SizedBox(
                  width: 180,
                  child: ProductCard(
                    product: products[index],
                    onTap: () => context.go('/products/${products[index].productId}'),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: TextButton(
              onPressed: () => context.go('/products'),
              child: const Text('View All'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBanner(
    BuildContext context, {
    required String image,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 300,
        margin: const EdgeInsets.symmetric(vertical: 16),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              image,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(color: Colors.grey[300]);
              },
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.4),
                    Colors.black.withOpacity(0.2),
                  ],
                ),
              ),
            ),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

