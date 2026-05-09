import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/product_provider.dart';
import '../widgets/product_card.dart';

class CategoryProductsScreen extends StatelessWidget {
  final String categorySlug;

  const CategoryProductsScreen({super.key, required this.categorySlug});

  @override
  Widget build(BuildContext context) {
    final categoryName = categorySlug[0].toUpperCase() + categorySlug.substring(1);

    return Scaffold(
      appBar: AppBar(
        title: Text(categoryName),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () { if (context.canPop()) { context.pop(); } else { context.go('/'); } },
        ),
      ),
      body: Stack(
        children: [
          Consumer<ProductProvider>(
            builder: (context, provider, child) {
              if (provider.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              final products = provider.products
                  .where((p) => p.categoryName.toLowerCase() == categorySlug)
                  .toList();

              if (products.isEmpty) {
                return const Center(child: Text('No products in this category'));
              }

              return GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.7,
                ),
                itemCount: products.length,
                itemBuilder: (context, index) {
                  final product = products[index];
                  return ProductCard(
                    product: product,
                    onTap: () => context.go('/products/${product.productId}'),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}

