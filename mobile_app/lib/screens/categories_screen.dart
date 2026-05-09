import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  final List<Map<String, dynamic>> _categories = const [
    {'name': 'Women', 'slug': 'women', 'icon': Icons.woman},
    {'name': 'Men', 'slug': 'men', 'icon': Icons.man},
    {'name': 'Kids', 'slug': 'kids', 'icon': Icons.child_care},
    {'name': 'Accessories', 'slug': 'accessories', 'icon': Icons.watch},
    {'name': 'Beauty', 'slug': 'beauty', 'icon': Icons.face},
    {'name': 'Home', 'slug': 'home', 'icon': Icons.home},
    {'name': 'Sale', 'slug': 'sale', 'icon': Icons.local_offer},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Categories'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () { if (context.canPop()) { context.pop(); } else { context.go('/'); } },
        ),
      ),
      body: Stack(
        children: [
          GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final category = _categories[index];
              return Card(
                child: InkWell(
                  onTap: () => context.go('/categories/${category['slug']}'),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        category['icon'] as IconData,
                        size: 48,
                        color: Colors.black,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        category['name'] as String,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

