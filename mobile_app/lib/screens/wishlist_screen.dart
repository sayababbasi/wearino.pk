import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/wishlist_provider.dart';
import '../widgets/product_card.dart';

class WishlistScreen extends StatelessWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wishlist'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () { if (context.canPop()) { context.pop(); } else { context.go('/'); } },
        ),
      ),
      body: Stack(
        children: [
          Consumer<WishlistProvider>(
            builder: (context, wishlist, child) {
              if (wishlist.items.isEmpty) {
                return const Center(
                  child: Text('Your wishlist is empty'),
                );
              }

              return GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.7,
                ),
                itemCount: wishlist.items.length,
                itemBuilder: (context, index) {
                  final product = wishlist.items[index];
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

