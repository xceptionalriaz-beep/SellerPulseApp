class TitleCleanerEngine {
  // 🚀 RULE 1: The Grammar Dictionary
  // These words look robotic if capitalized. We force them to lowercase.
  static const List<String> _lowerCaseWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of'];
  
  // 🚀 RULE 2: Tech Acronyms
  // eBay buyers search for these in all-caps. We protect them.
  static const List<String> _forceUpper = ['USB', 'USB-C', 'HDMI', 'OEM', 'LED', 'LCD', 'HD', '4K', '8K', '5G', 'WIFI', 'SSD', 'HDD', 'RAM', 'PC', 'MAC', 'TV', 'NFC', 'GPS'];
  
  // 🚀 RULE 3: Brand Protectors
  // Forces specific CamelCase for premium brands.
  static const Map<String, String> _brandCases = {
    'iphone': 'iPhone',
    'ipad': 'iPad',
    'macbook': 'MacBook',
    'imac': 'iMac',
    'ios': 'iOS',
  };

  /// Instantly strips garbage characters, fixes capitalization, 
  /// and protects tech specs/models.
  static String clean(String messyTitle) {
    if (messyTitle.isEmpty) return "";

    // 1. THE PUNCTUATION & EMOJI PURGE
    // Replaces anything that is NOT a letter, number, space, hyphen, slash, ampersand, or period.
    String scrubbed = messyTitle.replaceAll(RegExp(r'''[^a-zA-Z0-9\s\-\/&\.\"\']'''), ' ');
    
    // Remove double/triple spaces left behind by the purge
    scrubbed = scrubbed.replaceAll(RegExp(r'\s+'), ' ').trim();

    if (scrubbed.isEmpty) return "";

    List<String> words = scrubbed.split(' ');
    List<String> cleanedWords = [];

    for (int i = 0; i < words.length; i++) {
      String word = words[i];
      if (word.isEmpty) continue;

      String lowerWord = word.toLowerCase();

      // 2. BRAND FIXER (e.g., iphone -> iPhone)
      if (_brandCases.containsKey(lowerWord)) {
        cleanedWords.add(_brandCases[lowerWord]!);
      } 
      // 3. TECH ACRONYM FIXER (e.g., hdmi -> HDMI)
      else if (_forceUpper.contains(word.toUpperCase())) {
        cleanedWords.add(word.toUpperCase());
      } 
      // 4. MODEL / WATTAGE FIXER (If a word has numbers AND letters, make it uppercase. e.g., 140w -> 140W)
      else if (RegExp(r'\d').hasMatch(word) && RegExp(r'[a-zA-Z]').hasMatch(word)) {
        cleanedWords.add(word.toUpperCase());
      } 
      // 5. GRAMMAR FIXER (Lowercase for small words, UNLESS it's the very first word in the title)
      else if (_lowerCaseWords.contains(lowerWord) && i != 0) {
        cleanedWords.add(lowerWord);
      } 
      // 6. STANDARD TITLE CASE (First letter uppercase, rest lowercase)
      else {
        if (word.length > 1) {
          cleanedWords.add(word[0].toUpperCase() + lowerWord.substring(1));
        } else {
          cleanedWords.add(word.toUpperCase());
        }
      }
    }

    return cleanedWords.join(' ');
  }
}