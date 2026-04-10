class SearchFilters {
  String marketplace; 
  String shippingTo;
  double? minPrice;
  double? maxPrice;
  int minFeedback;
  int maxFeedback;
  int minSales;
  String condition; 
  bool hideVero;

  SearchFilters({
    this.marketplace = 'US',
    this.shippingTo = 'US',
    this.minPrice,
    this.maxPrice,
    this.minFeedback = 0,
    this.maxFeedback = 1000000,
    this.minSales = 0,
    this.condition = 'New',
    this.hideVero = true,
  });

  // Automatically switches currency symbols based on the marketplace!
  String get currencySymbol {
    switch (marketplace) {
      case 'UK': return '£';
      case 'DE': 
      case 'IT': 
      case 'FR': return '€';
      default: return '\$';
    }
  }
}