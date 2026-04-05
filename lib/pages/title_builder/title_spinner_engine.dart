import 'dart:math';

class TitleSpinnerEngine {
  // 🚀 ORIGINAL PRO RULES
  static const List<String> _bindWords = ['for', 'with', 'to', 'and', 'in', 'on', 'of', '-', '&', '+', 'fits'];
  static const List<String> _powerWords = ['new', 'genuine', 'oem', 'fast', 'premium', 'pro', 'heavy-duty', 'original', 'authentic', 'quality'];

  // 🚀 GOD-TIER UPGRADE 1: The Policy Guard (Assassins List)
  // These words get eBay accounts shadow-banned. We will silently delete them.
  static const List<String> _bannedWords = ['free shipping', 'wow', 'look', 'cheap', 'guaranteed', 'bonus', 'gift', 'sale', 'hot'];

  // 🚀 GOD-TIER UPGRADE 2: The Space Maximizer (Safe Fillers)
  // If the title is too short, we inject these to hit exactly 80 characters.
  static const List<String> _fillerWords = ['Premium', 'Quality', 'USA', 'Top Rated', 'Durable', 'Reliable', 'Pro', 'Elite', 'Best'];

  // 🚀 GOD-TIER UPGRADE 3: The Mini-Thesaurus
  // Maps common adjectives to high-converting synonyms for true variations.
  static const Map<String, List<String>> _thesaurus = {
    'genuine': ['Authentic', 'OEM', 'Original', '100% Real'],
    'fast': ['Quick', 'Rapid', 'High-Speed', 'Swift'],
    'charger': ['Adapter', 'Power Supply', 'Block'],
    'new': ['Brand New', 'Unused', 'Pristine'],
    'strong': ['Heavy-Duty', 'Durable', 'Rugged'],
    'cable': ['Cord', 'Wire', 'Line'],
  };

  /// Spins an eBay title intelligently by locking core keywords, protecting models, 
  /// synonym swapping, deleting clickbait, and maximizing the 80-character limit!
  static String spin(String originalTitle, {int lockCount = 3}) {
    Random rand = Random();

    // 1. POLICY GUARD (Silent Assassination)
    String safeTitle = originalTitle;
    for (String banned in _bannedWords) {
      // Regex ensures we delete banned words regardless of uppercase/lowercase
      safeTitle = safeTitle.replaceAll(RegExp(r'\b' + RegExp.escape(banned) + r'\b', caseSensitive: false), '');
    }
    // Specific wipe for that annoying "L@@K" trick some sellers use
    safeTitle = safeTitle.replaceAll(RegExp(r'L@@K', caseSensitive: false), '');

    String cleanTitle = safeTitle.trim().replaceAll(RegExp(r'\s+'), ' ');
    if (cleanTitle.isEmpty) return "";

    List<String> words = cleanTitle.split(' ');
    if (words.length <= lockCount) return originalTitle;

    // 2. TRUE SYNONYM SWAPPING & Deduplication
    List<String> uniqueWords = [];
    Set<String> seen = {};
    for (int i = 0; i < words.length; i++) {
      String originalWord = words[i];
      String lower = originalWord.toLowerCase();

      // SYNONYM LOGIC: 50% chance to swap, BUT we never swap the first few words 
      // (the locked core) because we don't want to accidentally change the core product!
      if (i >= lockCount && _thesaurus.containsKey(lower)) {
        if (rand.nextBool()) {
          List<String> synonyms = _thesaurus[lower]!;
          originalWord = synonyms[rand.nextInt(synonyms.length)];
          lower = originalWord.toLowerCase(); // Update for deduplication
        }
      }

      if (!seen.contains(lower)) {
        seen.add(lower);
        uniqueWords.add(originalWord);
      }
    }

    if (uniqueWords.length <= lockCount) return uniqueWords.join(' ');

    // 3. Extract Locked Core
    List<String> lockedCore = uniqueWords.sublist(0, lockCount);
    List<String> remainingWords = uniqueWords.sublist(lockCount);

    // 4. SMART CHUNKING
    List<String> smartChunks = [];
    int i = 0;
    final RegExp hasNumber = RegExp(r'\d');

    while (i < remainingWords.length) {
      String currentWord = remainingWords[i];
      String currentWordLower = currentWord.toLowerCase();

      if ((_bindWords.contains(currentWordLower) || hasNumber.hasMatch(currentWord)) && i + 1 < remainingWords.length) {
        smartChunks.add("$currentWord ${remainingWords[i + 1]}");
        i += 2;
        continue;
      }

      int chunkSize = rand.nextInt(2) + 1;
      if (i + chunkSize <= remainingWords.length) {
        smartChunks.add(remainingWords.sublist(i, i + chunkSize).join(' '));
        i += chunkSize;
      } else {
        smartChunks.add(remainingWords.sublist(i).join(' '));
        break;
      }
    }

    // 5. FRONT-LOAD POWER WORDS
    List<String> powerChunks = [];
    List<String> normalChunks = [];

    for (String chunk in smartChunks) {
      bool containsPowerWord = false;
      for (String pWord in _powerWords) {
        if (chunk.toLowerCase().contains(pWord)) {
          containsPowerWord = true;
          break;
        }
      }
      if (containsPowerWord) {
        powerChunks.add(chunk);
      } else {
        normalChunks.add(chunk);
      }
    }

    powerChunks.shuffle();
    normalChunks.shuffle();

    // 6. RECOMBINE
    String spunTitle = [...lockedCore, ...powerChunks, ...normalChunks].join(' ');

    // 7. THE 80-CHARACTER GUARDIAN & AUTO-FILLER
    if (spunTitle.length > 80) {
      // It's too long, safely cut it down
      int lastSpace = spunTitle.substring(0, 80).lastIndexOf(' ');
      spunTitle = lastSpace > -1 ? spunTitle.substring(0, lastSpace) : spunTitle.substring(0, 80);

      List<String> finalWords = spunTitle.split(' ');
      while (finalWords.isNotEmpty && _bindWords.contains(finalWords.last.toLowerCase())) {
        finalWords.removeLast();
      }
      spunTitle = finalWords.join(' ');
      
    } else {
      // 🚀 THE SPACE MAXIMIZER
      // The title is short! Let's inject premium fillers to boost eBay ranking.
      List<String> shuffledFillers = List.from(_fillerWords)..shuffle();
      
      for (String filler in shuffledFillers) {
        // Prevent duplicate fillers
        if (spunTitle.toLowerCase().contains(filler.toLowerCase())) continue;

        // +1 accounts for the space we are about to add
        if (spunTitle.length + 1 + filler.length <= 80) {
          spunTitle += " $filler";
        }
      }
    }

    return spunTitle;
  }
}