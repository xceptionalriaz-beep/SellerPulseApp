import 'package:flutter/material.dart';
import '../../services/billing_service.dart';

class BillingTab extends StatefulWidget {
  const BillingTab({super.key});

  @override
  State<BillingTab> createState() => _BillingTabState();
}

class _BillingTabState extends State<BillingTab> {
  // ✨ NEW: Tracks if the secure portal is loading
  bool _isOpeningPortal = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Billing & Subscription",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 8),
        const Text(
          "Manage your payment methods, view invoices, and upgrade your plan.",
          style: TextStyle(fontSize: 14, color: Colors.grey),
        ),
        const SizedBox(height: 24),
        
        // ✨ SECTION 1: Active Plan Identity & Management
        _buildActivePlanCard(),
        
        const SizedBox(height: 24),

        // 💳 SECTION 2: The Secure Payment Card
        _buildPaymentMethodCard(),
        
        const SizedBox(height: 24),
        
        // 🧾 SECTION 3: Invoice History
        _buildInvoiceHistory(),
      ],
    );
  }

  // ✨ THE ACTIVE PLAN CARD
  Widget _buildActivePlanCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        // A subtle neon green border to indicate "Active" status
        border: Border.all(color: const Color(0xFF8FFF00).withAlpha(100), width: 1.5),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  // Neon Pro Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8FFF00).withAlpha(40),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      "PRO PLAN", 
                      style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1)
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text("Active", style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
              const Text("\$29.99 / mo", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 16),
          
          // Renewal Date
          Row(
            children: const [
              Icon(Icons.calendar_today_outlined, size: 16, color: Colors.grey),
              SizedBox(width: 8),
              Text("Your plan renews on May 27, 2026", style: TextStyle(color: Colors.grey, fontSize: 14, fontWeight: FontWeight.w500)),
            ],
          ),
          
          const SizedBox(height: 24),
          const Divider(color: Color(0xFFF1F5F9)),
          const SizedBox(height: 16),
          
          // Action Buttons (Upgrade / Cancel)
          Row(
            children: [
              ElevatedButton(
                onPressed: () {
                  // TODO: Open Pricing / Plan change table
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A), // Deep Slate
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  elevation: 0,
                ),
                child: const Text("Change Plan", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              ),
              const SizedBox(width: 16),
              TextButton(
                onPressed: () {
                  // TODO: Open Cancel Confirmation Dialog
                },
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
                child: const Text("Cancel Subscription", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w600, fontSize: 13)),
              )
            ],
          )
        ],
      ),
    );
  }

  // 💳 THE SECURE VIRTUAL CARD
  Widget _buildPaymentMethodCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.lock_outline, size: 18, color: Color(0xFF16A34A)),
                  SizedBox(width: 8),
                  Text("Secure Payment Method", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                ],
              ),
              
              // ✨ UPGRADED UPDATE BUTTON WITH LOADING STATE
              OutlinedButton(
                onPressed: _isOpeningPortal ? null : () async {
                  setState(() => _isOpeningPortal = true);
                  try {
                    await BillingService.updatePaymentMethod();
                    // Optional: Show success or info message when returning
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString()), backgroundColor: Colors.redAccent),
                      );
                    }
                  } finally {
                    if (mounted) setState(() => _isOpeningPortal = false);
                  }
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _isOpeningPortal 
                  ? const SizedBox(
                      width: 14, 
                      height: 14, 
                      child: CircularProgressIndicator(color: Color(0xFF0F172A), strokeWidth: 2)
                    )
                  : const Text("Update", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 12)),
              )
            ],
          ),
          const SizedBox(height: 20),
          
          // The Virtual Credit Card Design
          Container(
            width: 320,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: const Color(0xFF0F172A).withAlpha(40), blurRadius: 15, offset: const Offset(0, 8))
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Icon(Icons.contactless, color: Colors.white54, size: 28),
                    Text("VISA", style: TextStyle(color: Colors.white.withAlpha(200), fontSize: 22, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
                  ],
                ),
                const SizedBox(height: 24),
                const Text("••••  ••••  ••••  4242", style: TextStyle(color: Colors.white, fontSize: 20, letterSpacing: 2, fontWeight: FontWeight.w500)),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("CARDHOLDER", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1)),
                        SizedBox(height: 4),
                        Text("Reazify LLC", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text("EXPIRES", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1)),
                        SizedBox(height: 4),
                        Text("12/28", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 🧾 INVOICE PAPER TRAIL
  Widget _buildInvoiceHistory() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Invoice History", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 16),
          
          // Header Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
            child: Row(
              children: const [
                Expanded(flex: 2, child: Text("DATE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                Expanded(flex: 2, child: Text("AMOUNT", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                Expanded(flex: 2, child: Text("STATUS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                Expanded(flex: 1, child: SizedBox()), // For download icon
              ],
            ),
          ),
          const SizedBox(height: 8),
          
          // Mock Invoice Rows
          _buildInvoiceRow("May 01, 2026", "\$29.99", "Paid"),
          _buildInvoiceRow("Apr 01, 2026", "\$29.99", "Paid"),
          _buildInvoiceRow("Mar 01, 2026", "\$29.99", "Paid"),
        ],
      ),
    );
  }

  Widget _buildInvoiceRow(String date, String amount, String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.grey.shade100))),
      child: Row(
        children: [
          Expanded(flex: 2, child: Text(date, style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w500))),
          Expanded(flex: 2, child: Text(amount, style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.bold))),
          Expanded(
            flex: 2, 
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFFEBF6D4), borderRadius: BorderRadius.circular(4)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle, size: 12, color: Color(0xFF16A34A)),
                      const SizedBox(width: 4),
                      Text(status, style: const TextStyle(color: Color(0xFF16A34A), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            )
          ),
          Expanded(
            flex: 1, 
            child: Align(
              alignment: Alignment.centerRight,
              child: InkWell(
                onTap: () {
                  // TODO: Download PDF
                },
                child: const Icon(Icons.picture_as_pdf_outlined, size: 20, color: Color(0xFF64748B)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}