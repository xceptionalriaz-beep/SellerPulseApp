import 'package:flutter/material.dart';

class MarketProvider extends ChangeNotifier {
  String _currentKeyword = "";
  bool _isLoading = false;
  
  // Dummy data that will be replaced by eBay API later
  double _saturScore = 0.0;
  List<double> _trendData = [0, 0, 0, 0, 0, 0, 0];

  // Getters to show data in the UI
  String get currentKeyword => _currentKeyword;
  bool get isLoading => _isLoading;
  double get saturScore => _saturScore;
  List<double> get trendData => _trendData;

  // This function runs when the user hits 'Search'
  void updateSearch(String keyword) async {
    _currentKeyword = keyword;
    _isLoading = true;
    notifyListeners(); // Tells the UI to show a loading spinner

    // --- MOCK API CALL (We will replace this with real eBay logic next) ---
    await Future.delayed(Duration(seconds: 2)); 
    
    // Simulating real data for now
    _saturScore = 0.75; 
    _trendData = [10, 45, 32, 89, 54, 76, 95];
    
    _isLoading = false;
    notifyListeners(); // Tells the UI to show the new charts!
  }
}