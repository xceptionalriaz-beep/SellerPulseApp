import 'package:flutter/material.dart';

class TbKeywordTables extends StatelessWidget {
  final String currentTitle;
  final Function(String) onInject;
  final List<Map<String, dynamic>> veroDatabase;
  
  // 🚀 NEW: The tables now accept Dynamic Data and a Loading State!
  final List<Map<String, String>> longTailData;
  final List<Map<String, String>> genericData;
  final bool isLoading;

  const TbKeywordTables({
    super.key, 
    required this.currentTitle, 
    required this.onInject,
    required this.veroDatabase,
    required this.longTailData,
    required this.genericData,
    required this.isLoading, // Tells the table if the API is currently fetching
  });

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 1100;

    // ✨ BEAUTIFUL LOADING STATE
    // This intercepts the build and shows a spinner if the API is running
    if (isLoading) {
      return Container(
        height: 400,
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: Color(0xFF8FFF00)),
            const SizedBox(height: 20),
            Text("Fetching Live Keyword Data...", style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.bold))
          ],
        ),
      );
    }

    Widget longTailTable = SmartKeywordTable(title: "LONG TAIL KEYWORDS", titleIcon: Icons.track_changes, initialData: longTailData, currentTitle: currentTitle, onInject: onInject, veroDatabase: veroDatabase);
    Widget genericTable = SmartKeywordTable(title: "GENERIC KEYWORD IDEAS", titleIcon: Icons.lightbulb_outline, initialData: genericData, currentTitle: currentTitle, onInject: onInject, veroDatabase: veroDatabase);

    if (isDesktop) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: longTailTable),
          const SizedBox(width: 20),
          Expanded(child: genericTable),
        ],
      );
    } else {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          longTailTable,
          const SizedBox(height: 30), 
          genericTable,
        ],
      );
    }
  }
}

class SmartKeywordTable extends StatefulWidget {
  final String title;
  final IconData titleIcon;
  final List<Map<String, String>> initialData;
  final String currentTitle;
  final Function(String) onInject;
  final List<Map<String, dynamic>> veroDatabase;

  const SmartKeywordTable({super.key, required this.title, required this.titleIcon, required this.initialData, required this.currentTitle, required this.onInject, required this.veroDatabase});

  @override
  State<SmartKeywordTable> createState() => _SmartKeywordTableState();
}

class _SmartKeywordTableState extends State<SmartKeywordTable> {
  late List<Map<String, String>> tableData;
  String _sortColumn = '';
  bool _sortAscending = true;
  int _currentPage = 1;
  final int _itemsPerPage = 10;

  @override
  void initState() {
    super.initState();
    tableData = List.from(widget.initialData);
  }

  // Ensure the table updates if new API data is passed down!
  @override
  void didUpdateWidget(covariant SmartKeywordTable oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialData != oldWidget.initialData) {
      setState(() {
        tableData = List.from(widget.initialData);
        _currentPage = 1; // Reset to page 1 on new search
      });
    }
  }

  void _sortData(String columnKey) {
    setState(() {
      if (_sortColumn == columnKey) {
        _sortAscending = !_sortAscending; 
      } else {
        _sortColumn = columnKey;
        _sortAscending = true; 
      }

      tableData.sort((a, b) {
        if (columnKey == 'kw') {
          return _sortAscending ? a[columnKey]!.compareTo(b[columnKey]!) : b[columnKey]!.compareTo(a[columnKey]!);
        } else {
          int valA = int.tryParse(a[columnKey]!.replaceAll(',', '')) ?? 0;
          int valB = int.tryParse(b[columnKey]!.replaceAll(',', '')) ?? 0;
          return _sortAscending ? valB.compareTo(valA) : valA.compareTo(valB); 
        }
      });
      _currentPage = 1; 
    });
  }

  @override
  Widget build(BuildContext context) {
    final titleTextLower = widget.currentTitle.toLowerCase();
    final bool isDesktop = MediaQuery.of(context).size.width > 800;
    
    int totalPages = (tableData.length / _itemsPerPage).ceil();
    // Handle edge case if table is completely empty
    if (totalPages == 0) totalPages = 1;

    int startIndex = (_currentPage - 1) * _itemsPerPage;
    int endIndex = startIndex + _itemsPerPage;
    if (endIndex > tableData.length) endIndex = tableData.length;
    
    List<Map<String, String>> currentViewData = tableData.sublist(startIndex, endIndex);

    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade300, width: 2), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16), 
            decoration: const BoxDecoration(color: Color(0xFF0F172A), borderRadius: BorderRadius.vertical(top: Radius.circular(10))), 
            child: Row(
              children: [
                Icon(widget.titleIcon, color: const Color(0xFF8FFF00), size: 20), 
                const SizedBox(width: 10), 
                Expanded(child: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 14, letterSpacing: 1.2), overflow: TextOverflow.ellipsis)), 
                if (isDesktop)
                  Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(20)), child: const Text("Hover to Inject", style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)))
              ]
            )
          ),
          
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14), 
            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), border: Border(bottom: BorderSide(color: Colors.grey.shade300, width: 1.5))), 
            child: Row(
              children: [
                Expanded(flex: 4, child: _sortableHeader("KEYWORD", 'kw', isDesktop)), 
                Expanded(flex: 2, child: _sortableHeader("SEARCHES", 'search', isDesktop)), 
                Expanded(flex: 2, child: _sortableHeader("COMP.", 'comp', isDesktop)), 
                Expanded(flex: 2, child: _sortableHeader("SALES", 'sales', isDesktop)), 
                const SizedBox(width: 30) 
              ]
            )
          ),
          
          if (tableData.isEmpty)
             const Padding(
               padding: EdgeInsets.all(40),
               child: Center(child: Text("No keywords found.", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold))),
             )
          else
            ...List.generate(currentViewData.length, (index) {
              final rowData = currentViewData[index];
              final keyword = rowData['kw']!;
              final isUsed = titleTextLower.contains(keyword.toLowerCase());

              return AnimatedTableRow(
                rowData: rowData, 
                isEven: index % 2 == 0,
                isUsed: isUsed, 
                onInject: () => widget.onInject(keyword), 
                veroDatabase: widget.veroDatabase, 
              );
            }),
          
          Container(
            padding: const EdgeInsets.all(15), 
            decoration: BoxDecoration(border: Border(top: BorderSide(color: Colors.grey.shade200))), 
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left, color: Colors.blue),
                  onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null,
                ),
                const SizedBox(width: 10),
                Text("Page $_currentPage of $totalPages", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blueGrey)),
                const SizedBox(width: 10),
                IconButton(
                  icon: const Icon(Icons.chevron_right, color: Colors.blue),
                  onPressed: _currentPage < totalPages ? () => setState(() => _currentPage++) : null,
                ),
              ],
            )
          )
        ],
      ),
    );
  }

  Widget _sortableHeader(String title, String columnKey, bool isDesktop) {
    bool isSortingThis = _sortColumn == columnKey;
    return InkWell(
      onTap: () => _sortData(columnKey),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isDesktop || columnKey == 'kw') ...[
            Flexible(
              child: Text(
                title, 
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontWeight: FontWeight.w800, color: isSortingThis ? Colors.blue.shade700 : const Color(0xFF64748B), fontSize: 11, letterSpacing: 0.8)
              ),
            ),
            const SizedBox(width: 4), 
          ],
          Icon(
            isSortingThis ? (_sortAscending ? Icons.arrow_downward : Icons.arrow_upward) : Icons.unfold_more, 
            size: 14, 
            color: isSortingThis ? Colors.blue.shade700 : Colors.blueGrey.shade300
          )
        ]
      ),
    );
  }
}

class AnimatedTableRow extends StatefulWidget {
  final Map<String, String> rowData;
  final bool isEven;
  final bool isUsed; 
  final VoidCallback onInject; 
  final List<Map<String, dynamic>> veroDatabase;

  const AnimatedTableRow({super.key, required this.rowData, required this.isEven, required this.isUsed, required this.onInject, required this.veroDatabase});

  @override
  State<AnimatedTableRow> createState() => _AnimatedTableRowState();
}

class _AnimatedTableRowState extends State<AnimatedTableRow> {
  bool _isHovered = false;

  // 🚀 THE SMART RENDERER: Turns bad words into Red Pills
  Widget _buildSmartKeyword(String fullKeyword) {
    if (widget.veroDatabase.isEmpty) {
      return Text(fullKeyword, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)));
    }

    // Creates a quick list of bad words for the scanner
    final List<String> bannedWords = widget.veroDatabase.map((e) => e['brand_name'].toString().toLowerCase()).toList();

    List<Widget> children = [];
    List<String> words = fullKeyword.split(' ');

    for (String word in words) {
      String cleanWord = word.replaceAll(RegExp(r'[^\w\s]'), '').toLowerCase();

      if (bannedWords.contains(cleanWord)) {
        // ✨ Builds the Red VeRO Pill
        children.add(
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 2),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: Colors.red.shade200),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.warning_amber_rounded, size: 12, color: Colors.red),
                const SizedBox(width: 4),
                Text(word, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.red)),
              ],
            ),
          )
        );
      } else {
        // Renders safe words normally
        children.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: Text(word, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
          )
        );
      }
    }

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      children: children,
    );
  }

  @override
  Widget build(BuildContext context) {
    Color defaultColor = widget.isEven ? Colors.white : const Color(0xFFF8FAFC);
    Color hoverColor = const Color(0xFFF0FDF4); 
    Color bgColor = widget.isUsed ? Colors.grey.shade100 : (_isHovered ? hoverColor : defaultColor);
    double rowOpacity = widget.isUsed ? 0.4 : 1.0; 

    int compValue = int.tryParse(widget.rowData['comp']!.replaceAll(',', '')) ?? 0;
    double compRatio = (compValue / 500).clamp(0.0, 1.0); 
    Color heatColor = compRatio < 0.33 ? Colors.green : (compRatio < 0.66 ? Colors.orange : Colors.red);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: widget.isUsed ? SystemMouseCursors.basic : SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          if (!widget.isUsed) widget.onInject(); 
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200), 
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(color: bgColor, border: Border(bottom: BorderSide(color: Colors.grey.shade100))),
          child: Opacity(
            opacity: rowOpacity,
            child: Row(
              children: [
                // 🚀 REPLACED STANDARD TEXT WITH THE SMART RENDERER
                Expanded(flex: 4, child: _buildSmartKeyword(widget.rowData['kw']!)),
                
                Expanded(flex: 2, child: Text(widget.rowData['search']!, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)))),
                Expanded(
                  flex: 2, 
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(widget.rowData['comp']!, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Container(
                        height: 4, width: 40,
                        decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft, 
                          widthFactor: compRatio, 
                          child: Container(decoration: BoxDecoration(color: heatColor, borderRadius: BorderRadius.circular(2)))
                        ),
                      )
                    ],
                  )
                ),
                Expanded(flex: 2, child: Text(widget.rowData['sales']!, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, color: Colors.green, fontWeight: FontWeight.bold))),
                
                AnimatedOpacity(
                  opacity: (widget.isUsed || _isHovered) ? 1.0 : 0.0, 
                  duration: const Duration(milliseconds: 200),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: widget.isUsed ? Colors.grey.shade300 : const Color(0xFF8FFF00), 
                      borderRadius: BorderRadius.circular(6), 
                      boxShadow: widget.isUsed ? [] : [BoxShadow(color: const Color(0xFF8FFF00).withOpacity(0.5), blurRadius: 5)]
                    ),
                    child: Icon(
                      widget.isUsed ? Icons.check : Icons.add, 
                      size: 16, 
                      color: widget.isUsed ? Colors.grey.shade600 : const Color(0xFF0F172A)
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}