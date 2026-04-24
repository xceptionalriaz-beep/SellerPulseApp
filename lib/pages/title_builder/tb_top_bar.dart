import 'package:flutter/material.dart';

class TbTopBar extends StatefulWidget {
  final String selectedTimeframe;
  final Function(String) onTimeframeChanged;
  
  final String selectedMarket;
  final Function(String) onMarketChanged;
  
  final String selectedLocation;
  final Function(String) onLocationChanged;

  // 🚀 NEW: Action Callbacks to trigger the API logic in the main file
  final Function(String) onExtract;
  final Function(String) onSearch;

  const TbTopBar({
    super.key, 
    required this.selectedTimeframe, 
    required this.onTimeframeChanged,
    required this.selectedMarket,
    required this.onMarketChanged,
    required this.selectedLocation,
    required this.onLocationChanged,
    required this.onExtract,
    required this.onSearch,
  });

  @override
  State<TbTopBar> createState() => _TbTopBarState();
}

class _TbTopBarState extends State<TbTopBar> {
  // 🚀 Controllers to capture user input
  final TextEditingController _extractCtrl = TextEditingController();
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _extractCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;
    final bool showSettingsText = MediaQuery.of(context).size.width > 600;

    final List<Map<String, dynamic>> marketOptions = [
      {"val": "eBay", "label": "eBay", "enabled": true},
      {"val": "Amazon", "label": "Amazon (Coming Soon)", "enabled": false},
      {"val": "Walmart", "label": "Walmart (Coming Soon)", "enabled": false},
    ];

    final List<Map<String, dynamic>> locationOptions = [
      {"val": "All", "label": "All Locations 🌍", "enabled": true},
      {"val": "US", "label": "United States 🇺🇸", "enabled": true},
      {"val": "UK", "label": "United Kingdom 🇬🇧", "enabled": true},
      {"val": "CA", "label": "Canada 🇨🇦", "enabled": true},
      {"val": "AU", "label": "Australia 🇦🇺", "enabled": true},
    ];

    final List<Map<String, dynamic>> timeOptions = [
      {"val": "7D", "label": "Time: 7D", "enabled": true},
      {"val": "30D", "label": "Time: 30D", "enabled": true},
      {"val": "12M", "label": "Time: 12M", "enabled": true},
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(12), 
        border: Border.all(color: Colors.grey.shade200)
      ),
      child: Column(
        children: [
          if (isDesktop)
            Row(
              children: [
                Expanded(child: _searchField(Icons.link, "Paste Competitor Item ID...", "Extract", const Color(0xFF1D70F5), _extractCtrl, () => widget.onExtract(_extractCtrl.text))),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: Text("|", style: TextStyle(color: Colors.grey, fontSize: 24, fontWeight: FontWeight.w300)),
                ),
                Expanded(child: _searchField(Icons.search, "Enter Seed Keyword...", "Search", const Color(0xFF8FFF00), _searchCtrl, () => widget.onSearch(_searchCtrl.text), textColor: Colors.black)),
              ],
            )
          else
            Column(
              children: [
                _searchField(Icons.link, "Paste Competitor Item ID...", "Extract", const Color(0xFF1D70F5), _extractCtrl, () => widget.onExtract(_extractCtrl.text)),
                const SizedBox(height: 15),
                _searchField(Icons.search, "Enter Seed Keyword...", "Search", const Color(0xFF8FFF00), _searchCtrl, () => widget.onSearch(_searchCtrl.text), textColor: Colors.black),
              ],
            ),
          
          const SizedBox(height: 15),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    ProDropdown(prefix: "Market:", currentValue: widget.selectedMarket, options: marketOptions, onChanged: widget.onMarketChanged),
                    ProDropdown(prefix: "Location:", currentValue: widget.selectedLocation, options: locationOptions, onChanged: widget.onLocationChanged),
                    ProDropdown(prefix: "", currentValue: widget.selectedTimeframe, options: timeOptions, onChanged: widget.onTimeframeChanged),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              
              InkWell(
                onTap: () {
                  Scaffold.of(context).openEndDrawer(); 
                },
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.settings, color: Colors.grey, size: 18),
                      if (showSettingsText) ...[
                        const SizedBox(width: 6),
                        const Text("Settings", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                      ]
                    ],
                  ),
                ),
              )
            ],
          )
        ],
      ),
    );
  }

  // 🚀 UPGRADED: Added Controller and onAction callback to the field
  Widget _searchField(IconData icon, String hint, String btnText, Color btnColor, TextEditingController ctrl, VoidCallback onAction, {Color textColor = Colors.white}) {
    return Container(
      padding: const EdgeInsets.only(left: 15),
      decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey.shade300)),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey.shade500, size: 20),
          const SizedBox(width: 10),
          Expanded(child: TextField(
            controller: ctrl,
            onSubmitted: (_) => onAction(), // Allows searching by pressing "Enter"
            decoration: InputDecoration(hintText: hint, hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 14), border: InputBorder.none, isDense: true)
          )),
          ElevatedButton(
            onPressed: onAction,
            style: ElevatedButton.styleFrom(
              backgroundColor: btnColor, foregroundColor: textColor, elevation: 0,
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.horizontal(right: Radius.circular(8)))
            ),
            child: Text(btnText, style: const TextStyle(fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }
}

// ======================================================================
// ✨ THE CUSTOM OVERLAY ENGINE (UNCHANGED)
// ======================================================================
class ProDropdown extends StatefulWidget {
  final String prefix;
  final String currentValue;
  final List<Map<String, dynamic>> options;
  final Function(String) onChanged;

  const ProDropdown({super.key, required this.prefix, required this.currentValue, required this.options, required this.onChanged});

  @override
  State<ProDropdown> createState() => _ProDropdownState();
}

class _ProDropdownState extends State<ProDropdown> with SingleTickerProviderStateMixin {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;

  late AnimationController _animationController;
  late Animation<double> _expandAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(vsync: this, duration: const Duration(milliseconds: 250));
    final curve = CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic);
    _expandAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(curve);
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(curve);
  }

  void _toggleDropdown() {
    if (_isOpen) {
      _closeDropdown();
    } else {
      _showDropdown();
    }
  }

  void _showDropdown() {
    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (context) => Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onTap: _closeDropdown,
              child: Container(color: Colors.transparent),
            ),
          ),
          CompositedTransformFollower(
            link: _layerLink,
            offset: Offset(0, size.height + 8), 
            showWhenUnlinked: false,
            child: Material(
              color: Colors.transparent,
              child: AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Opacity(
                    opacity: _fadeAnimation.value,
                    child: SizeTransition(
                      sizeFactor: _expandAnimation,
                      axisAlignment: -1.0, 
                      child: child,
                    ),
                  );
                },
                child: Container(
                  width: 220, 
                  constraints: const BoxConstraints(maxHeight: 300),
                  padding: const EdgeInsets.all(8), 
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 20, offset: const Offset(0, 8))],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: ListView.builder(
                      shrinkWrap: true,
                      padding: EdgeInsets.zero,
                      physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()), 
                      itemCount: widget.options.length,
                      itemBuilder: (context, index) {
                        final option = widget.options[index];
                        return _DropdownPill(
                          option: option,
                          isSelected: option['val'] == widget.currentValue,
                          onTap: option['enabled'] ? () {
                            widget.onChanged(option['val']);
                            _closeDropdown();
                          } : null,
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);
    _animationController.forward();
  }

  void _closeDropdown() {
    _animationController.reverse().then((_) {
      _overlayEntry?.remove();
      _overlayEntry = null;
      if (mounted) setState(() => _isOpen = false);
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _overlayEntry?.remove();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String displayLabel = widget.currentValue;
    for (var option in widget.options) {
      if (option['val'] == widget.currentValue) {
        displayLabel = option['label'].split(' ').first; 
        break;
      }
    }

    return CompositedTransformTarget(
      link: _layerLink,
      child: GestureDetector(
        onTap: _toggleDropdown,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: _isOpen ? const Color(0xFFF1F5F9) : Colors.white, 
            border: Border.all(color: _isOpen ? const Color(0xFF8FFF00) : Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("${widget.prefix} $displayLabel".trim(), style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B), fontWeight: FontWeight.w600)),
              const SizedBox(width: 8),
              Icon(_isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, size: 16, color: _isOpen ? const Color(0xFF8FFF00) : Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}

class _DropdownPill extends StatefulWidget {
  final Map<String, dynamic> option;
  final bool isSelected;
  final VoidCallback? onTap;

  const _DropdownPill({required this.option, required this.isSelected, this.onTap});

  @override
  State<_DropdownPill> createState() => _DropdownPillState();
}

class _DropdownPillState extends State<_DropdownPill> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    bool isEnabled = widget.option['enabled'];
    
    Color bgColor = Colors.transparent;
    Color textColor = const Color(0xFF1E293B);
    Border? border = Border.all(color: Colors.transparent);

    if (!isEnabled) {
      textColor = Colors.grey.shade400; 
    } else if (widget.isSelected) {
      bgColor = const Color(0xFF8FFF00); 
      textColor = const Color(0xFF0F172A); 
    } else if (_isHovered) {
      border = Border.all(color: const Color(0xFF8FFF00), width: 1.5); 
      textColor = const Color(0xFF0F172A);
    }

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: isEnabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          margin: const EdgeInsets.only(bottom: 4), 
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(30), 
            border: border,
          ),
          child: Text(
            widget.option['label'],
            style: TextStyle(
              fontSize: 13,
              fontWeight: widget.isSelected ? FontWeight.bold : FontWeight.w500,
              color: textColor,
              fontStyle: isEnabled ? FontStyle.normal : FontStyle.italic,
            ),
          ),
        ),
      ),
    );
  }
}