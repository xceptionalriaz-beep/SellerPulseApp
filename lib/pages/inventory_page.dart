import 'package:flutter/material.dart';
import '../store/inventory_store.dart'; 

class InventoryPage extends StatefulWidget {
  const InventoryPage({super.key});

  @override
  State<InventoryPage> createState() => _InventoryPageState();
}

class _InventoryPageState extends State<InventoryPage> {
  String _activeFolder = "All Saved (142)";
  bool _selectAll = false;

  final List<String> _folders = [
    "All Saved (142)",
    "Amazon Arbitrage (35)",
    "AliExpress Dropship (80)",
    "Q4 Pet Toys (27)"
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF8FAFC), 
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // --- LEFT SIDEBAR (FOLDERS) ---
          Container(
            width: 260,
            decoration: BoxDecoration(color: Colors.white, border: Border(right: BorderSide(color: Colors.grey.shade200))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.all(24.0),
                  child: Text("📁 My Folders", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: _folders.length,
                    itemBuilder: (context, index) => _buildFolderItem(_folders[index]),
                  ),
                ),
                const Divider(height: 1),
                InkWell(
                  onTap: () => print("Create new folder"),
                  child: Container(
                    padding: const EdgeInsets.all(24.0),
                    alignment: Alignment.center,
                    child: const Text("+ Create New Folder", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  ),
                )
              ],
            ),
          ),

          // --- MAIN CONTENT AREA ---
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(30.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // HEADER ROW
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Saved Inventory", style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                      Row(
                        children: [
                          Container(
                            width: 250, height: 40,
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey.shade300)),
                            child: const TextField(
                              decoration: InputDecoration(
                                hintText: "Search inventory...", prefixIcon: Icon(Icons.search, size: 18, color: Color(0xFF94A3B8)),
                                border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(width: 15),
                          OutlinedButton.icon(
                            onPressed: () {}, icon: const Icon(Icons.download, size: 16, color: Color(0xFF64748B)), label: const Text("Export CSV", style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                            style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16), side: BorderSide(color: Colors.grey.shade300), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                          ),
                          const SizedBox(width: 10),
                          ElevatedButton.icon(
                            onPressed: () {}, icon: const Icon(Icons.sync, size: 16, color: Colors.white), label: const Text("Sync Prices", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF131B2F), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                          ),
                        ],
                      )
                    ],
                  ),
                  const SizedBox(height: 25),

                  // DATA TABLE
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 5))],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Column(
                          children: [
                            // TABLE HEADER
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
                              color: const Color(0xFFF1F5F9),
                              child: Row(
                                children: [
                                  Checkbox(value: _selectAll, onChanged: (val) => setState(() => _selectAll = val!), activeColor: const Color(0xFF8FFF00), checkColor: Colors.black),
                                  const SizedBox(width: 10),
                                  _headerText("PRODUCT", flex: 4),
                                  _headerText("SUPPLIER", flex: 2),
                                  _headerText("COST / SELL", flex: 2),
                                  _headerText("MARGIN", flex: 1),
                                  _headerText("STATUS", flex: 2),
                                  _headerText("UPDATED", flex: 1),
                                  const SizedBox(width: 32), // ✨ Spacer to make room for the trash can
                                ],
                              ),
                            ),
                            const Divider(height: 1, color: Color(0xFFE2E8F0)),
                            
                            // ✨ THE LISTENER: Builds rows and handles deletion
                            Expanded(
                              child: ValueListenableBuilder<List<Map<String, String>>>(
                                valueListenable: InventoryStore.savedProducts,
                                builder: (context, savedList, child) {
                                  if (savedList.isEmpty) {
                                    return Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(Icons.inventory_2_outlined, size: 60, color: Colors.grey.shade300),
                                          const SizedBox(height: 16),
                                          const Text("No products saved yet.", style: TextStyle(color: Color(0xFF64748B), fontSize: 16, fontWeight: FontWeight.bold)),
                                          const Text("Go to Product Research and click 'Save' on a winner!", style: TextStyle(color: Colors.grey, fontSize: 13)),
                                        ],
                                      ),
                                    );
                                  }

                                  return ListView.builder(
                                    itemCount: savedList.length,
                                    itemBuilder: (context, index) {
                                      final item = savedList[index];
                                      return _InventoryDataRow(
                                        imageUrl: item["imageUrl"]!, title: item["title"]!,
                                        supplier: item["supplier"]!, supplierColor: Colors.blue, 
                                        cost: item["cost"]!, sell: item["sell"]!, 
                                        margin: item["margin"]!, marginColor: Colors.green.shade700,
                                        initialStatus: "🟡 Researching", updated: "Just now", updatedColor: Colors.green, 
                                        isSelected: _selectAll,
                                        
                                        // ✨ FIX: This calls the delete function when the trash can is clicked!
                                        onDelete: () {
                                          InventoryStore.removeProduct(index);
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(content: Text("🗑️ Product removed!"), backgroundColor: Colors.redAccent, duration: Duration(seconds: 2))
                                          );
                                        },
                                      );
                                    },
                                  );
                                },
                              ),
                            )
                          ],
                        ),
                      ),
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFolderItem(String title) {
    bool isActive = _activeFolder == title;
    return InkWell(
      onTap: () => setState(() => _activeFolder = title),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF8FFF00).withAlpha(25) : Colors.transparent,
          border: Border(right: BorderSide(color: isActive ? const Color(0xFF8FFF00) : Colors.transparent, width: 3))
        ),
        child: Row(
          children: [
            Icon(isActive ? Icons.folder_open : Icons.folder, size: 18, color: isActive ? const Color(0xFF1E293B) : const Color(0xFF94A3B8)),
            const SizedBox(width: 10),
            Text(title, style: TextStyle(fontWeight: isActive ? FontWeight.bold : FontWeight.normal, color: isActive ? const Color(0xFF1E293B) : const Color(0xFF64748B), fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _headerText(String text, {required int flex}) {
    return Expanded(flex: flex, child: Text(text, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF64748B))));
  }
}

class _InventoryDataRow extends StatefulWidget {
  final String imageUrl, title, supplier, cost, sell, margin, initialStatus, updated;
  final Color supplierColor, marginColor, updatedColor;
  final bool isSelected;
  final VoidCallback onDelete; // ✨ NEW: Accepts the delete command from above

  const _InventoryDataRow({
    required this.imageUrl, required this.title, required this.supplier, required this.cost, required this.sell, required this.margin, required this.initialStatus, required this.updated,
    required this.supplierColor, required this.marginColor, required this.updatedColor, required this.isSelected, required this.onDelete
  });

  @override
  State<_InventoryDataRow> createState() => _InventoryDataRowState();
}

class _InventoryDataRowState extends State<_InventoryDataRow> {
  bool _isHovering = false;
  late bool _isChecked;
  late String _status;

  final List<String> _statusOptions = ["🟡 Researching", "🟢 Listed", "🔴 Out of Stock"];

  @override
  void initState() {
    super.initState();
    _isChecked = widget.isSelected;
    _status = widget.initialStatus;
  }

  @override
  void didUpdateWidget(covariant _InventoryDataRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSelected != oldWidget.isSelected) _isChecked = widget.isSelected;
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: _isHovering ? const Color(0xFFF8FAFC) : Colors.transparent,
          border: const Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))
        ),
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Checkbox(value: _isChecked, onChanged: (val) => setState(() => _isChecked = val!), activeColor: const Color(0xFF8FFF00), checkColor: Colors.black),
            const SizedBox(width: 10),
            
            Expanded(
              flex: 4,
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Image.network(widget.imageUrl, width: 40, height: 40, fit: BoxFit.cover, errorBuilder: (c, e, s) => Container(width: 40, height: 40, color: Colors.grey.shade200)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Row(
                      children: [
                        Flexible(child: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 13), overflow: TextOverflow.ellipsis)),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: () => print("Copied Title!"),
                          child: Icon(Icons.copy, size: 14, color: _isHovering ? const Color(0xFF64748B) : Colors.transparent),
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            Expanded(flex: 2, child: Text(widget.supplier, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: widget.supplierColor, decoration: TextDecoration.underline))),
            Expanded(flex: 2, child: Text("${widget.cost} → ${widget.sell}", style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1E293B), fontSize: 13))),
            Expanded(flex: 1, child: Text(widget.margin, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: widget.marginColor))),
            
            Expanded(
              flex: 2, 
              child: Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  height: 28, padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: _status.contains("🟢") ? Colors.green.shade50 : _status.contains("🔴") ? Colors.red.shade50 : Colors.yellow.shade50,
                    borderRadius: BorderRadius.circular(6), border: Border.all(color: _status.contains("🟢") ? Colors.green.shade200 : _status.contains("🔴") ? Colors.red.shade200 : Colors.yellow.shade300)
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _status, icon: const Icon(Icons.arrow_drop_down, size: 16),
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _status.contains("🟢") ? Colors.green.shade800 : _status.contains("🔴") ? Colors.red.shade800 : Colors.yellow.shade900),
                      onChanged: (String? newValue) => setState(() => _status = newValue!),
                      items: _statusOptions.map((String value) => DropdownMenuItem(value: value, child: Text(value))).toList(),
                    ),
                  ),
                ),
              )
            ),
            
            Expanded(flex: 1, child: Text(widget.updated, style: TextStyle(fontSize: 12, color: widget.updatedColor))),
            
            // ✨ FIX: The invisible trash can that appears when hovering!
            SizedBox(
              width: 32,
              child: IconButton(
                icon: Icon(Icons.delete_outline, size: 18, color: _isHovering ? Colors.red.shade400 : Colors.transparent),
                onPressed: widget.onDelete,
                splashRadius: 20,
              ),
            )
          ],
        ),
      ),
    );
  }
}