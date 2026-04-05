import 'package:flutter/material.dart';

class InventoryStore {
  // 📻 The "Walkie-Talkie" holding the list
  static ValueNotifier<List<Map<String, String>>> savedProducts = ValueNotifier([]);

  // ⚡ Add a product
  static void addProduct(Map<String, String> product) {
    savedProducts.value = [...savedProducts.value, product];
    print("✅ Product Added to Global Memory!");
  }

  // ✨ NEW: Remove a product by its exact position (index) in the list!
  static void removeProduct(int index) {
    final List<Map<String, String>> currentList = List.from(savedProducts.value);
    currentList.removeAt(index); // Deletes it
    savedProducts.value = currentList; // Updates the walkie-talkie
    print("🗑️ Product Removed!");
  }
}