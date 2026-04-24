import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:file_picker/file_picker.dart';
import 'package:desktop_drop/desktop_drop.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class VeroCommandCenterTab extends StatefulWidget {
  const VeroCommandCenterTab({super.key});

  @override
  State<VeroCommandCenterTab> createState() => _VeroCommandCenterTabState();
}

class _VeroCommandCenterTabState extends State<VeroCommandCenterTab> {
  final _supabase = Supabase.instance.client;
  
  final TextEditingController _brandController = TextEditingController();
  final TextEditingController _reasonController = TextEditingController(); 
  final TextEditingController _searchController = TextEditingController(); 
  
  String _selectedRisk = 'High Risk'; 
  String _searchQuery = ''; 
  String _activeFilter = 'All'; 
  
  bool _isLoading = true;
  bool _isAddingBrand = false; 
  bool _isSyncingBulk = false; 
  bool _isDragging = false; 

  List<Map<String, dynamic>> _bannedBrands = [];
  List<Map<String, dynamic>> _pendingReports = [];

  @override
  void initState() {
    super.initState();
    _fetchLiveDatabase();
  }

  // 🌐 FETCH FROM SUPABASE (With 8-Second Timeout)
  Future<void> _fetchLiveDatabase() async {
    try {
      final brandsData = await _supabase.from('vero_brands').select().order('created_at', ascending: false).timeout(const Duration(seconds: 8), onTimeout: () => throw Exception("Fetch Timeout"));
      final reportsData = await _supabase.from('vero_reports').select().eq('status', 'pending').order('created_at', ascending: false).timeout(const Duration(seconds: 8), onTimeout: () => throw Exception("Fetch Timeout"));
      
      if (mounted) {
        setState(() {
          _bannedBrands = List<Map<String, dynamic>>.from(brandsData);
          _pendingReports = List<Map<String, dynamic>>.from(reportsData);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // 🌐 ADD SINGLE BRAND (With 8-Second Timeout)
  Future<void> _addNewBrand() async {
    final brandName = _brandController.text.trim();
    final reasonUrl = _reasonController.text.trim();
    if (brandName.isEmpty) return;

    setState(() => _isAddingBrand = true);

    try {
      // ✨ The Firewall: Will never freeze for more than 8 seconds!
      await _supabase.from('vero_brands').insert({
        'brand_name': brandName,
        'risk_level': _selectedRisk,
        'evidence_url': reasonUrl.isNotEmpty ? reasonUrl : null,
        'added_by': _supabase.auth.currentUser?.email ?? 'Admin',
      }).timeout(const Duration(seconds: 8), onTimeout: () => throw Exception("Database Connection Timed Out. Check internet or Supabase."));

      _brandController.clear();
      _reasonController.clear();
      await _fetchLiveDatabase(); 
      
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$brandName added permanently!"), backgroundColor: Colors.green));
    } catch (e) {
      // Checks for duplicate brand errors from Postgres
      String errorMsg = e.toString().contains("duplicate key") ? "This brand is already banned!" : e.toString();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg), backgroundColor: Colors.redAccent, duration: const Duration(seconds: 5)));
    } finally {
      if (mounted) setState(() => _isAddingBrand = false);
    }
  }

  // 🌐 BULK UPLOAD TO SUPABASE (With Timeout)
  Future<void> _processCSVData(String csvString, String sourceName) async {
    final lines = csvString.split('\n');
    List<Map<String, dynamic>> brandsToUpload = [];

    for (int i = 0; i < lines.length; i++) {
      final line = lines[i].trim().replaceAll('"', '');
      if (line.isEmpty) continue;

      final parts = line.split(',');
      final brandName = parts[0].trim();
      if (brandName.isEmpty || brandName.toLowerCase() == 'brand name' || brandName.toLowerCase() == 'brand') continue; 

      String risk = 'High Risk';
      String? evidence;
      
      if (parts.length > 1) {
        final parsedRisk = parts[1].trim();
        if (['Critical Ban', 'High Risk', 'Caution'].contains(parsedRisk)) risk = parsedRisk;
      }
      if (parts.length > 2) evidence = parts[2].trim(); 

      brandsToUpload.add({
        'brand_name': brandName,
        'risk_level': risk,
        'evidence_url': evidence,
        'added_by': 'Bulk Sync ($sourceName)',
      });
    }

    try {
      await _supabase.from('vero_brands').upsert(brandsToUpload, onConflict: 'brand_name').timeout(const Duration(seconds: 15), onTimeout: () => throw Exception("Bulk Upload Timed Out."));
      await _fetchLiveDatabase();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Live Sync Complete! ${brandsToUpload.length} brands processed."), backgroundColor: Colors.green));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Upload failed: ${e.toString()}"), backgroundColor: Colors.redAccent, duration: const Duration(seconds: 5)));
    } finally {
      if (mounted) setState(() => _isSyncingBulk = false);
    }
  }

  Future<void> _handleReport(Map<String, dynamic> report, bool approve) async {
    try {
      if (approve) {
        await _supabase.from('vero_brands').upsert({
          'brand_name': report['brand_name'],
          'risk_level': 'High Risk',
          'evidence_url': report['reason'],
          'added_by': 'Community: ${report['reported_by']}',
        }, onConflict: 'brand_name').timeout(const Duration(seconds: 8));
      }
      
      await _supabase.from('vero_reports').update({'status': approve ? 'approved' : 'rejected'}).eq('id', report['id']).timeout(const Duration(seconds: 8));
      await _fetchLiveDatabase();
      
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(approve ? "Report Approved & Brand Banned!" : "Report Rejected."), backgroundColor: approve ? Colors.green : Colors.orange));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Error processing report."), backgroundColor: Colors.redAccent));
    }
  }

  Future<void> _removeBrand(String brandName) async {
    try {
      await _supabase.from('vero_brands').delete().eq('brand_name', brandName).timeout(const Duration(seconds: 8));
      await _fetchLiveDatabase();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Failed to delete from cloud."), backgroundColor: Colors.redAccent));
    }
  }

  Future<void> _pickCSV() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['csv'], withData: true);
      if (result != null && result.files.single.bytes != null) {
        setState(() => _isSyncingBulk = true);
        final csvString = utf8.decode(result.files.single.bytes!);
        await _processCSVData(csvString, "File Upload");
      }
    } catch (e) {
      setState(() => _isSyncingBulk = false);
    }
  }

  String _convertToCSVLink(String rawUrl) {
    if (rawUrl.contains('/pub?output=csv') || rawUrl.contains('export?format=csv')) return rawUrl;
    final RegExp regExp = RegExp(r'/d/([a-zA-Z0-9-_]+)');
    final match = regExp.firstMatch(rawUrl);
    if (match != null && match.groupCount >= 1) return 'https://docs.google.com/spreadsheets/d/${match.group(1)}/export?format=csv';
    return rawUrl;
  }

  void _showGoogleSheetDialog() {
    final TextEditingController urlController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(children: [Icon(Icons.sync, color: Color(0xFF0F172A)), SizedBox(width: 8), Text("Sync Google Sheet", style: TextStyle(fontWeight: FontWeight.bold))]),
        content: Column(
          mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Ensure your sheet is set to 'Anyone with the link can view'. Paste the normal link below.", style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
            const SizedBox(height: 16),
            TextField(controller: urlController, decoration: InputDecoration(hintText: "https://docs.google.com/spreadsheets/d/...", filled: true, fillColor: const Color(0xFFF8FAFC), border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)))),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel", style: TextStyle(color: Color(0xFF64748B)))),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              if (urlController.text.isNotEmpty) {
                setState(() => _isSyncingBulk = true);
                try {
                  final convertedLink = _convertToCSVLink(urlController.text.trim());
                  final response = await http.get(Uri.parse(convertedLink));
                  if (response.statusCode == 200) {
                    final bodyText = response.body.trim().toLowerCase();
                    if (bodyText.startsWith('<!doctype html') || bodyText.startsWith('<html')) throw Exception("HTML returned");
                    await _processCSVData(response.body, "Google Sheets");
                  } else {
                    throw Exception("Failed to load");
                  }
                } catch (e) {
                  setState(() => _isSyncingBulk = false);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Invalid Link! Ensure sharing is set to 'Anyone with the link can view'."), backgroundColor: Colors.redAccent));
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A)),
            child: const Text("Start Sync", style: TextStyle(color: Colors.white)),
          )
        ],
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    final filteredBrands = _bannedBrands.where((brand) {
      final nameMatches = brand['brand_name'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      final filterMatches = _activeFilter == 'All' || brand['risk_level'] == _activeFilter;
      return nameMatches && filterMatches;
    }).toList();

    return _isLoading 
      ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A)))
      : Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            
            if (_pendingReports.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFFDE68A))),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.inbox_rounded, color: Color(0xFFD97706)), const SizedBox(width: 8),
                        Text("${_pendingReports.length} Community Reports Pending Review", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF92400E))),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Column(
                      children: _pendingReports.map((report) => Container(
                        margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFFDE68A))),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(report['brand_name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A))),
                                      const SizedBox(width: 8),
                                      Text("Reported by ${report['reported_by'] ?? 'User'}", style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                                    ],
                                  ),
                                  if (report['reason'] != null && report['reason'].toString().isNotEmpty)
                                    Padding(padding: const EdgeInsets.only(top: 4), child: Text("Reason: ${report['reason']}", style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontStyle: FontStyle.italic))),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(icon: const Icon(Icons.close, color: Colors.redAccent), tooltip: "Reject", onPressed: () => _handleReport(report, false)),
                                ElevatedButton.icon(
                                  onPressed: () => _handleReport(report, true),
                                  icon: const Icon(Icons.check, size: 16), label: const Text("Approve & Ban"),
                                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                                )
                              ],
                            )
                          ],
                        ),
                      )).toList(),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Global VeRO Command Center", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  const SizedBox(height: 4),
                  const Text("Add restricted brands here. Changes apply globally to all users instantly.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                  const SizedBox(height: 24),
                  
                  if (isMobile) 
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TextField(controller: _brandController, decoration: InputDecoration(hintText: "Enter brand name...", filled: true, fillColor: const Color(0xFFF8FAFC), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14))),
                        const SizedBox(height: 12),
                        TextField(controller: _reasonController, decoration: InputDecoration(hintText: "Evidence Link / Reason (Optional)", filled: true, fillColor: const Color(0xFFF8FAFC), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14))),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10)),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _selectedRisk, isExpanded: true, icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF64748B)),
                              items: ['Critical Ban', 'High Risk', 'Caution'].map((String value) => DropdownMenuItem<String>(value: value, child: Row(children: [Icon(Icons.circle, size: 10, color: _getRiskColor(value)), const SizedBox(width: 8), Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF334155)))]))).toList(),
                              onChanged: (newValue) { if (newValue != null) setState(() => _selectedRisk = newValue); },
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        
                        ElevatedButton.icon(
                          onPressed: _isAddingBrand ? null : _addNewBrand, 
                          icon: _isAddingBrand 
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Icon(Icons.security, size: 18, color: Color(0xFF8FFF00)), 
                          label: Text(_isAddingBrand ? "Saving..." : "Ban Brand", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), padding: const EdgeInsets.symmetric(vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                        )
                      ],
                    )
                  else 
                    Row(
                      children: [
                        Expanded(flex: 2, child: TextField(controller: _brandController, decoration: InputDecoration(hintText: "Enter brand name...", filled: true, fillColor: const Color(0xFFF8FAFC), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)))),
                        const SizedBox(width: 12),
                        Expanded(flex: 2, child: TextField(controller: _reasonController, decoration: InputDecoration(hintText: "Evidence Link (Optional)", filled: true, fillColor: const Color(0xFFF8FAFC), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)))),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10)),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedRisk, isExpanded: true, icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF64748B)),
                                items: ['Critical Ban', 'High Risk', 'Caution'].map((String value) => DropdownMenuItem<String>(value: value, child: Row(children: [Icon(Icons.circle, size: 10, color: _getRiskColor(value)), const SizedBox(width: 8), Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF334155)))]))).toList(),
                                onChanged: (newValue) { if (newValue != null) setState(() => _selectedRisk = newValue); },
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        
                        ElevatedButton.icon(
                          onPressed: _isAddingBrand ? null : _addNewBrand, 
                          icon: _isAddingBrand 
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Icon(Icons.security, size: 18, color: Color(0xFF8FFF00)), 
                          label: Text(_isAddingBrand ? "Saving..." : "Ban Brand", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                        )
                      ],
                    ),
                  
                  const SizedBox(height: 20),
                  const Row(children: [Expanded(child: Divider(color: Color(0xFFE2E8F0))), Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text("BULK IMPORT", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), fontSize: 11, letterSpacing: 1))), Expanded(child: Divider(color: Color(0xFFE2E8F0)))]),
                  const SizedBox(height: 20),

                  if (isMobile)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [ _buildDragDropZone(), const SizedBox(height: 16), _buildGoogleSheetButton() ],
                    )
                  else
                    Row(
                      children: [ Expanded(flex: 2, child: _buildDragDropZone()), const SizedBox(width: 16), Expanded(flex: 1, child: _buildGoogleSheetButton()) ],
                    ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController, onChanged: (value) => setState(() => _searchQuery = value),
                    decoration: InputDecoration(
                      hintText: "Search database for a specific brand...", hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14), prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B)), filled: true, fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))), focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF0F172A), width: 2)), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      suffixIcon: _searchQuery.isNotEmpty ? IconButton(icon: const Icon(Icons.clear, color: Color(0xFF94A3B8), size: 18), onPressed: () { _searchController.clear(); setState(() => _searchQuery = ''); }) : null,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  decoration: BoxDecoration(color: _activeFilter != 'All' ? const Color(0xFFF1F5F9) : Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: _activeFilter != 'All' ? const Color(0xFF94A3B8) : const Color(0xFFE2E8F0))),
                  child: PopupMenuButton<String>(
                    tooltip: "Filter by Risk Level", onSelected: (value) => setState(() => _activeFilter = value), icon: Icon(Icons.filter_list, color: _activeFilter != 'All' ? const Color(0xFF0F172A) : const Color(0xFF64748B)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    itemBuilder: (context) => [
                      const PopupMenuItem(value: 'All', child: Text('Show All Brands', style: TextStyle(fontWeight: FontWeight.bold))),
                      const PopupMenuDivider(),
                      PopupMenuItem(value: 'Critical Ban', child: Row(children: [Icon(Icons.circle, size: 10, color: _getRiskColor('Critical Ban')), const SizedBox(width: 8), const Text('Critical Ban')])),
                      PopupMenuItem(value: 'High Risk', child: Row(children: [Icon(Icons.circle, size: 10, color: _getRiskColor('High Risk')), const SizedBox(width: 8), const Text('High Risk')])),
                      PopupMenuItem(value: 'Caution', child: Row(children: [Icon(Icons.circle, size: 10, color: _getRiskColor('Caution')), const SizedBox(width: 8), const Text('Caution')])),
                    ],
                  ),
                )
              ],
            ),
            
            const SizedBox(height: 24),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text("Live Cloud Database", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    if (_activeFilter != 'All' && !isMobile) ...[
                      const SizedBox(width: 12),
                      Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(6)), child: Text("Filtered by: $_activeFilter", style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)))
                    ]
                  ],
                ),
                Text("${filteredBrands.length} Protected", style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
              ],
            ),
            const SizedBox(height: 16),
            
            filteredBrands.isEmpty 
              ? _buildEmptyState()
              : Wrap(spacing: 10, runSpacing: 10, children: filteredBrands.map((brandData) => _buildBrandTag(brandData)).toList()),
          ],
        );
  }

  // --- HELPER WIDGETS ---

  Widget _buildDragDropZone() {
    return DropTarget(
      onDragEntered: (details) => setState(() => _isDragging = true),
      onDragExited: (details) => setState(() => _isDragging = false),
      onDragDone: (details) async {
        setState(() { _isDragging = false; _isSyncingBulk = true; });
        try {
          final fileBytes = await details.files.first.readAsBytes();
          final csvString = utf8.decode(fileBytes);
          await _processCSVData(csvString, "Dragged File");
        } catch (e) {
          setState(() => _isSyncingBulk = false);
        }
      },
      child: InkWell(
        onTap: _isSyncingBulk ? null : _pickCSV,
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 24),
          decoration: BoxDecoration(
            color: _isDragging ? const Color(0xFF8FFF00).withAlpha(30) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _isDragging ? const Color(0xFF8FFF00) : const Color(0xFFCBD5E1), width: 1.5, style: BorderStyle.solid),
          ),
          child: Column(
            children: [
              _isSyncingBulk 
                ? const SizedBox(height: 28, width: 28, child: CircularProgressIndicator(color: Color(0xFF0F172A), strokeWidth: 3))
                : Icon(Icons.upload_file, size: 28, color: _isDragging ? const Color(0xFF0F172A) : const Color(0xFF64748B)),
              const SizedBox(height: 8),
              Text(_isSyncingBulk ? "Syncing to Cloud..." : (_isDragging ? "Drop CSV Here!" : "Drag & Drop CSV File"), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: _isDragging ? const Color(0xFF0F172A) : const Color(0xFF334155))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGoogleSheetButton() {
    return InkWell(
      onTap: _isSyncingBulk ? null : _showGoogleSheetDialog,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
        child: const Column(
          children: [
            Icon(Icons.sync, size: 28, color: Color(0xFF8FFF00)),
            SizedBox(height: 8),
            Text("Google Sheets Sync", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
          ],
        ),
      ),
    );
  }

  Widget _buildBrandTag(Map<String, dynamic> brandData) {
    final String name = brandData['brand_name'];
    final String risk = brandData['risk_level'] ?? 'High Risk';
    final Color riskColor = _getRiskColor(risk);
    final String? evidenceUrl = brandData['evidence_url'];

    return Tooltip(
      message: evidenceUrl != null && evidenceUrl.isNotEmpty ? "Evidence: $evidenceUrl" : "No evidence attached",
      child: Container(
        constraints: const BoxConstraints(maxWidth: 250), 
        padding: const EdgeInsets.only(left: 14, right: 8, top: 8, bottom: 8),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 4, offset: Offset(0, 2))]),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shield, size: 14, color: riskColor),
            const SizedBox(width: 8),
            Flexible(child: Text(name, style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 13), overflow: TextOverflow.ellipsis)),
            if (evidenceUrl != null && evidenceUrl.isNotEmpty) ...[
              const SizedBox(width: 4),
              const Icon(Icons.link, size: 12, color: Color(0xFF94A3B8)),
            ],
            const SizedBox(width: 12),
            InkWell(
              onTap: () => _removeBrand(name), borderRadius: BorderRadius.circular(12),
              child: Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.close, size: 14, color: Color(0xFF64748B))),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity, padding: const EdgeInsets.all(40), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0), style: BorderStyle.solid)),
      child: Column(
        children: [
          Icon(Icons.cloud_done_outlined, size: 48, color: Colors.grey.shade300), const SizedBox(height: 16),
          const Text("Cloud Database is empty.", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF64748B))),
          const Text("Sync your sheet or add a brand to protect your users.", style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8))),
        ],
      ),
    );
  }

  Color _getRiskColor(String riskLevel) {
    if (riskLevel == 'Critical Ban') return Colors.redAccent;
    if (riskLevel == 'High Risk') return Colors.orange;
    return Colors.amber; 
  }
}