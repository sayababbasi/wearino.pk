import 'package:flutter/foundation.dart';
import '../models/product.dart';

class CartItem {
  final Product product;
  final int quantity;
  final String? selectedSize;
  final String? selectedColor;

  CartItem({
    required this.product,
    required this.quantity,
    this.selectedSize,
    this.selectedColor,
  });

  double get total => product.discountedPrice * quantity;
}

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => _items;

  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);

  double get total => _items.fold(0.0, (sum, item) => sum + item.total);

  void addItem(Product product, {String? size, String? color, int quantity = 1}) {
    final existingIndex = _items.indexWhere(
      (item) =>
          item.product.productId == product.productId &&
          item.selectedSize == size &&
          item.selectedColor == color,
    );

    if (existingIndex >= 0) {
      _items[existingIndex] = CartItem(
        product: _items[existingIndex].product,
        quantity: _items[existingIndex].quantity + quantity,
        selectedSize: size,
        selectedColor: color,
      );
    } else {
      _items.add(CartItem(
        product: product,
        quantity: quantity,
        selectedSize: size,
        selectedColor: color,
      ));
    }
    notifyListeners();
  }

  void removeItem(String productId, {String? size, String? color}) {
    _items.removeWhere(
      (item) =>
          item.product.productId == productId &&
          item.selectedSize == size &&
          item.selectedColor == color,
    );
    notifyListeners();
  }

  void updateQuantity(String productId, int quantity, {String? size, String? color}) {
    final index = _items.indexWhere(
      (item) =>
          item.product.productId == productId &&
          item.selectedSize == size &&
          item.selectedColor == color,
    );

    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index] = CartItem(
          product: _items[index].product,
          quantity: quantity,
          selectedSize: size,
          selectedColor: color,
        );
      }
      notifyListeners();
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}

