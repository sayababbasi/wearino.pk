class Product {
  final String productId;
  final String name;
  final String description;
  final double price;
  final String image;
  final double rating;
  final String categoryName;
  final List<String> tags;
  final int? discount;
  final String? brand;
  final String? department;
  final String? color;
  final List<String>? availableSizes;

  Product({
    required this.productId,
    required this.name,
    required this.description,
    required this.price,
    required this.image,
    required this.rating,
    required this.categoryName,
    required this.tags,
    this.discount,
    this.brand,
    this.department,
    this.color,
    this.availableSizes,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      productId: json['product_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      image: json['image'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      categoryName: json['category_name'] ?? json['category'] ?? '',
      tags: List<String>.from(json['tags'] ?? []),
      discount: json['discount'],
      brand: json['brand'],
      department: json['department'],
      color: json['color'],
      availableSizes: json['available_sizes'] != null
          ? List<String>.from(json['available_sizes'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'name': name,
      'description': description,
      'price': price,
      'image': image,
      'rating': rating,
      'category_name': categoryName,
      'tags': tags,
      'discount': discount,
      'brand': brand,
      'department': department,
      'color': color,
      'available_sizes': availableSizes,
    };
  }

  double get discountedPrice {
    if (discount != null && discount! > 0) {
      return price * (1 - discount! / 100);
    }
    return price;
  }
}

