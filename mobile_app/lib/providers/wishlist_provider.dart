import 'package:flutter/foundation.dart';
import '../models/product.dart';

class WishlistProvider with ChangeNotifier {
  final List<Product> _items = [];

  List<Product> get items => _items;

  bool isInWishlist(String productId) {
    return _items.any((item) => item.productId == productId);
  }

  void addToWishlist(Product product) {
    if (!isInWishlist(product.productId)) {
      _items.add(product);
      notifyListeners();
    }
  }

  void removeFromWishlist(String productId) {
    _items.removeWhere((item) => item.productId == productId);
    notifyListeners();
  }

  void toggleWishlist(Product product) {
    if (isInWishlist(product.productId)) {
      removeFromWishlist(product.productId);
    } else {
      addToWishlist(product);
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}

