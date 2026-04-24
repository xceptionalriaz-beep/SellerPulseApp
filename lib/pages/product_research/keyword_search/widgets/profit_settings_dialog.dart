import 'package:flutter/material.dart';
import '../../../../../../core/utils/profit_engine.dart';
import 'package:flutter/services.dart';

class ProfitSettingsDialog extends StatefulWidget {
  final ProfitSettings currentSettings;
  final ValueChanged<ProfitSettings> onSave;

  const ProfitSettingsDialog({super.key, required this.currentSettings, required this.onSave});

  @override
  State<ProfitSettingsDialog> createState() => _ProfitSettingsDialogState();
}

class _ProfitSettingsDialogState extends State<ProfitSettingsDialog> {
  late TextEditingController _categoryFeeCtrl;
  late TextEditingController _fixedFeeCtrl;
  late TextEditingController _adRateCtrl;
  late TextEditingController _taxCtrl;
  late TextEditingController _shippingCtrl;
  late TextEditingController _intlFeeCtrl;
  late TextEditingController _fxFeeCtrl;
  
  late bool _isAdvancedEnabled;
  late TextEditingController _defectRateCtrl;
  late TextEditingController _payoutFeeCtrl;
  late TextEditingController _cashbackCtrl;

  @override
  void initState() {
    super.initState();
    final s = widget.currentSettings;
    _categoryFeeCtrl = TextEditingController(text: s.categoryFeePercent.toString());
    _fixedFeeCtrl = TextEditingController(text: s.fixedFee.toString());
    _adRateCtrl = TextEditingController(text: s.adRatePercent.toString());
    _taxCtrl = TextEditingController(text: s.sourcingTaxPercent.toString());
    _shippingCtrl = TextEditingController(text: s.defaultShipping.toString());
    _intlFeeCtrl = TextEditingController(text: s.intlFeePercent.toString());
    _fxFeeCtrl = TextEditingController(text: s.fxFeePercent.toString());
    
    _isAdvancedEnabled = s.isAdvancedEnabled;
    _defectRateCtrl = TextEditingController(text: s.defectRatePercent.toString());
    _payoutFeeCtrl = TextEditingController(text: s.payoutFeePercent.toString());
    _cashbackCtrl = TextEditingController(text: s.cashbackPercent.toString());
  }

  @override
  void dispose() {
    _categoryFeeCtrl.dispose(); _fixedFeeCtrl.dispose(); _adRateCtrl.dispose();
    _taxCtrl.dispose(); _shippingCtrl.dispose(); _intlFeeCtrl.dispose(); _fxFeeCtrl.dispose();
    _defectRateCtrl.dispose(); _payoutFeeCtrl.dispose(); _cashbackCtrl.dispose();
    super.dispose();
  }

  void _saveSettings() {
    final newSettings = ProfitSettings(
      categoryFeePercent: double.tryParse(_categoryFeeCtrl.text) ?? 13.25,
      fixedFee: double.tryParse(_fixedFeeCtrl.text) ?? 0.30,
      adRatePercent: double.tryParse(_adRateCtrl.text) ?? 2.0,
      sourcingTaxPercent: double.tryParse(_taxCtrl.text) ?? 7.0,
      defaultShipping: double.tryParse(_shippingCtrl.text) ?? 5.0,
      intlFeePercent: double.tryParse(_intlFeeCtrl.text) ?? 1.65,
      fxFeePercent: double.tryParse(_fxFeeCtrl.text) ?? 2.0,
      isAdvancedEnabled: _isAdvancedEnabled,
      defectRatePercent: double.tryParse(_defectRateCtrl.text) ?? 2.0,
      payoutFeePercent: double.tryParse(_payoutFeeCtrl.text) ?? 1.5,
      cashbackPercent: double.tryParse(_cashbackCtrl.text) ?? 2.0,
    );
    widget.onSave(newSettings);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      child: Container(
        width: 500,
        constraints: const BoxConstraints(maxHeight: 700),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: const BorderRadius.vertical(top: Radius.circular(16))),
              child: Row(
                children: [
                  const Icon(Icons.calculate, color: Color(0xFF8FFF00)),
                  const SizedBox(width: 10),
                  const Expanded(child: Text("Global Profit Settings", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold))),
                  IconButton(icon: const Icon(Icons.close, color: Colors.white54), onPressed: () => Navigator.pop(context))
                ],
              ),
            ),
            
            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(25),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("🏢 Core Platform Fees", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF64748B))),
                    const SizedBox(height: 15),
                    Row(
                      children: [
                        Expanded(child: _buildInput("eBay Category (%)", _categoryFeeCtrl)),
                        const SizedBox(width: 15),
                        Expanded(child: _buildInput("Fixed Fee (\$)", _fixedFeeCtrl, isCurrency: true)),
                      ],
                    ),
                    const SizedBox(height: 15),
                    Row(
                      children: [
                        Expanded(child: _buildInput("Promoted Ad Rate (%)", _adRateCtrl)),
                        const SizedBox(width: 15),
                        Expanded(child: _buildInput("Default Shipping (\$)", _shippingCtrl, isCurrency: true)),
                      ],
                    ),
                    
                    const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Divider(color: Color(0xFFE2E8F0))),
                    
                    const Text("🌍 Global Sourcing & FX", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF64748B))),
                    const SizedBox(height: 15),
                    Row(
                      children: [
                        Expanded(child: _buildInput("Sourcing Tax (%)", _taxCtrl)),
                        const SizedBox(width: 15),
                        Expanded(child: _buildInput("Bank FX Fee (%)", _fxFeeCtrl)),
                      ],
                    ),
                    const SizedBox(height: 15),
                    _buildInput("eBay Intl. Cross-Border Fee (%)", _intlFeeCtrl),
                    
                    const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Divider(color: Color(0xFFE2E8F0))),
                    
                    // Advanced Toggle
                    InkWell(
                      onTap: () => setState(() => _isAdvancedEnabled = !_isAdvancedEnabled),
                      child: Row(
                        children: [
                          Icon(_isAdvancedEnabled ? Icons.toggle_on : Icons.toggle_off, color: _isAdvancedEnabled ? const Color(0xFF8FFF00) : Colors.grey, size: 36),
                          const SizedBox(width: 10),
                          const Text("Enable Advanced Pro Factors", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        ],
                      ),
                    ),
                    
                    if (_isAdvancedEnabled) ...[
                      const SizedBox(height: 15),
                      Container(
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(child: _buildInput("Defect/Return Buffer (%)", _defectRateCtrl)),
                                const SizedBox(width: 15),
                                Expanded(child: _buildInput("Payout/Withdrawal (%)", _payoutFeeCtrl)),
                              ],
                            ),
                            const SizedBox(height: 15),
                            _buildInput("Cashback/Rewards (+) (%)", _cashbackCtrl),
                          ],
                        ),
                      )
                    ]
                  ],
                ),
              ),
            ),
            
            // Footer
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFFE2E8F0)))),
              child: SizedBox(
                width: double.infinity, height: 45,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8FFF00), foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                  onPressed: _saveSettings,
                  child: const Text("Save & Recalculate", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildInput(String label, TextEditingController controller, {bool isCurrency = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*'))],
          decoration: InputDecoration(
            prefixIcon: isCurrency ? const Icon(Icons.attach_money, size: 16) : null,
            suffixText: isCurrency ? null : "%",
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            filled: true, fillColor: const Color(0xFFF1F5F9),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide.none),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF8FFF00), width: 2)),
          ),
        ),
      ],
    );
  }
}