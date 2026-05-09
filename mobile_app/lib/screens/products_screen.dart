import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/product_provider.dart';
import '../widgets/product_card.dart';
import 'product_detail_screen.dart';

enum ViewMode { grid2, grid3, list }

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  ViewMode _viewMode = ViewMode.grid3;
  String _sortBy = 'featured';
  final Map<String, List<String>> _selectedFilters = {};
  bool _showFilters = false;
  int _currentPage = 1;
  final int _itemsPerPage = 12;

  final List<Map<String, dynamic>> _filterSections = [
    {
      'id': 'brand',
      'title': 'BRAND',
      'options': ['Forever 21', 'Z Supply', 'Love & Harmony', 'Premium Label', 'Others']
    },
    {
      'id': 'department',
      'title': 'DEPARTMENT',
      'options': ['Women', 'Men', 'Kids', 'Plus Size', 'Petite']
    },
    {
      'id': 'category',
      'title': 'CATEGORY',
      'options': ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories']
    },
    {
      'id': 'price',
      'title': 'PRICE',
      'options': ['Under \$20', '\$20 - \$50', '\$50 - \$100', 'Over \$100']
    },
    {
      'id': 'size',
      'title': 'SIZE',
      'options': ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
      'id': 'color',
      'title': 'COLOR',
      'options': ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Brown', 'Gray']
    },
  ];

  final List<Map<String, String>> _sortOptions = [
    {'value': 'featured', 'label': 'Featured'},
    {'value': 'newest', 'label': 'Newest'},
    {'value': 'price_asc', 'label': 'Price: Low to High'},
    {'value': 'price_desc', 'label': 'Price: High to Low'},
    {'value': 'rating', 'label': 'Top Rated'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().loadProducts();
    });
  }

  List<Product> _getFilteredAndSortedProducts(List<Product> products) {
    var filtered = List<Product>.from(products);

    // Apply filters
    if (_selectedFilters.containsKey('brand') && _selectedFilters['brand']!.isNotEmpty) {
      filtered = filtered.where((p) {
        // Assuming product has a brand field - adjust based on your model
        return _selectedFilters['brand']!.any((brand) => 
          p.name.toLowerCase().contains(brand.toLowerCase()));
      }).toList();
    }

    if (_selectedFilters.containsKey('department') && _selectedFilters['department']!.isNotEmpty) {
      filtered = filtered.where((p) {
        return _selectedFilters['department']!.any((dept) => 
          (p.department ?? '').toLowerCase() == dept.toLowerCase());
      }).toList();
    }

    if (_selectedFilters.containsKey('category') && _selectedFilters['category']!.isNotEmpty) {
      filtered = filtered.where((p) {
        return _selectedFilters['category']!.any((cat) => 
          p.categoryName.toLowerCase() == cat.toLowerCase());
      }).toList();
    }

    if (_selectedFilters.containsKey('price') && _selectedFilters['price']!.isNotEmpty) {
      filtered = filtered.where((p) {
        return _selectedFilters['price']!.any((priceRange) {
          final price = p.discountedPrice;
          if (priceRange == 'Under \$20') return price < 20;
          if (priceRange == '\$20 - \$50') return price >= 20 && price <= 50;
          if (priceRange == '\$50 - \$100') return price >= 50 && price <= 100;
          if (priceRange == 'Over \$100') return price > 100;
          return false;
        });
      }).toList();
    }

    // Apply sorting
    switch (_sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.productId.compareTo(a.productId));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.discountedPrice.compareTo(b.discountedPrice));
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.discountedPrice.compareTo(a.discountedPrice));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      default: // featured
        break;
    }

    return filtered;
  }

  void _toggleFilter(String sectionId, String option) {
    setState(() {
      if (!_selectedFilters.containsKey(sectionId)) {
        _selectedFilters[sectionId] = [];
      }
      if (_selectedFilters[sectionId]!.contains(option)) {
        _selectedFilters[sectionId]!.remove(option);
      } else {
        _selectedFilters[sectionId]!.add(option);
      }
      _currentPage = 1; // Reset to first page when filters change
    });
  }

  void _clearFilters() {
    setState(() {
      _selectedFilters.clear();
      _currentPage = 1;
    });
  }

  int _getTotalPages(List<Product> products) {
    return (products.length / _itemsPerPage).ceil();
  }

  List<Product> _getPaginatedProducts(List<Product> products) {
    final start = (_currentPage - 1) * _itemsPerPage;
    final end = start + _itemsPerPage;
    return products.sublist(
      start,
      end > products.length ? products.length : end,
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: context.canPop(),
      onPopInvoked: (didPop) {
        if (!didPop && context.canPop()) {
          context.pop();
        } else if (!didPop) {
          context.go('/');
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('All Products'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () { 
              if (context.canPop()) { 
                context.pop(); 
              } else { 
                context.go('/'); 
              } 
            },
          ),
        actions: [
          // View mode toggle
          IconButton(
            icon: Icon(_viewMode == ViewMode.grid2 ? Icons.grid_view : Icons.view_module),
            onPressed: () {
              setState(() {
                _viewMode = _viewMode == ViewMode.grid2 
                  ? ViewMode.grid3 
                  : _viewMode == ViewMode.grid3 
                    ? ViewMode.list 
                    : ViewMode.grid2;
              });
            },
          ),
          // Sort
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort),
            onSelected: (value) {
              setState(() {
                _sortBy = value;
                _currentPage = 1;
              });
            },
            itemBuilder: (context) => _sortOptions.map((option) {
              return PopupMenuItem(
                value: option['value'],
                child: Text(option['label']!),
              );
            }).toList(),
          ),
          // Filters
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.filter_list),
                if (_selectedFilters.values.any((list) => list.isNotEmpty))
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 8,
                        minHeight: 8,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: () {
              setState(() {
                _showFilters = !_showFilters;
              });
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          Consumer<ProductProvider>(
            builder: (context, provider, child) {
              if (provider.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              if (provider.error != null) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: ${provider.error}'),
                      ElevatedButton(
                        onPressed: () => provider.loadProducts(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                );
              }

              final filteredProducts = _getFilteredAndSortedProducts(provider.products);
              final totalPages = _getTotalPages(filteredProducts);
              final paginatedProducts = _getPaginatedProducts(filteredProducts);

              if (filteredProducts.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('No products found'),
                      if (_selectedFilters.values.any((list) => list.isNotEmpty))
                        TextButton(
                          onPressed: _clearFilters,
                          child: const Text('Clear Filters'),
                        ),
                    ],
                  ),
                );
              }

              return Column(
                children: [
                  // Filter panel
                  if (_showFilters)
                    Container(
                      height: 300,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Filters',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Row(
                                  children: [
                                    if (_selectedFilters.values.any((list) => list.isNotEmpty))
                                      TextButton(
                                        onPressed: _clearFilters,
                                        child: const Text('Clear All'),
                                      ),
                                    IconButton(
                                      icon: const Icon(Icons.close),
                                      onPressed: () {
                                        setState(() {
                                          _showFilters = false;
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: _filterSections.length,
                              itemBuilder: (context, index) {
                                final section = _filterSections[index];
                                final selected = _selectedFilters[section['id']] ?? [];
                                return Container(
                                  width: 200,
                                  margin: const EdgeInsets.only(right: 16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        section['title'] as String,
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Expanded(
                                        child: ListView(
                                          children: (section['options'] as List<String>).map((option) {
                                            final isSelected = selected.contains(option);
                                            return CheckboxListTile(
                                              title: Text(option),
                                              value: isSelected,
                                              onChanged: (value) {
                                                _toggleFilter(section['id'] as String, option);
                                              },
                                              dense: true,
                                            );
                                          }).toList(),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Products grid/list
                  Expanded(
                    child: _viewMode == ViewMode.list
                        ? ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: paginatedProducts.length,
                            itemBuilder: (context, index) {
                              final product = paginatedProducts[index];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: ListTile(
                                  leading: Image.network(
                                    product.image,
                                    width: 80,
                                    height: 80,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        width: 80,
                                        height: 80,
                                        color: Colors.grey[300],
                                      );
                                    },
                                  ),
                                  title: Text(product.name),
                                  subtitle: Text('\$${product.discountedPrice.toStringAsFixed(2)}'),
                                  onTap: () => context.go('/products/${product.productId}'),
                                ),
                              );
                            },
                          )
                        : GridView.builder(
                            padding: const EdgeInsets.all(16),
                            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: _viewMode == ViewMode.grid2 ? 2 : 3,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 0.7,
                            ),
                            itemCount: paginatedProducts.length,
                            itemBuilder: (context, index) {
                              final product = paginatedProducts[index];
                              return ProductCard(
                                product: product,
                                onTap: () => context.go('/products/${product.productId}'),
                              );
                            },
                          ),
                  ),

                  // Pagination
                  if (totalPages > 1)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4,
                            offset: const Offset(0, -2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.chevron_left),
                            onPressed: _currentPage > 1
                                ? () {
                                    setState(() {
                                      _currentPage--;
                                    });
                                  }
                                : null,
                          ),
                          ...List.generate(
                            totalPages > 5 ? 5 : totalPages,
                            (index) {
                              int pageNum;
                              if (totalPages <= 5) {
                                pageNum = index + 1;
                              } else if (_currentPage <= 3) {
                                pageNum = index + 1;
                              } else if (_currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + index;
                              } else {
                                pageNum = _currentPage - 2 + index;
                              }
                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: TextButton(
                                  onPressed: () {
                                    setState(() {
                                      _currentPage = pageNum;
                                    });
                                  },
                                  style: TextButton.styleFrom(
                                    backgroundColor: _currentPage == pageNum
                                        ? Colors.black
                                        : Colors.transparent,
                                    foregroundColor: _currentPage == pageNum
                                        ? Colors.white
                                        : Colors.black,
                                  ),
                                  child: Text('$pageNum'),
                                ),
                              );
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.chevron_right),
                            onPressed: _currentPage < totalPages
                                ? () {
                                    setState(() {
                                      _currentPage++;
                                    });
                                  }
                                : null,
                          ),
                        ],
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      ),
    );
  }
}
