// lib/pages/orders/export_service.dart
//
// SellerPulse - Export Service (Web Compatible)

import 'dart:convert';
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:csv/csv.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

class ExportService {

  // ═══════════════════════════════════════════════════════════
  // CSV EXPORT - Web Compatible
  // ═══════════════════════════════════════════════════════════
  static Future<void> exportOrdersToCSV({
    required BuildContext context,
    required List<Map<String, dynamic>> orders,
    required String filterLabel,
  }) async {
    try {
      _showLoadingSnackbar(context, 'Generating CSV...');

      // Build CSV rows
      final rows = <List<dynamic>>[];

      // Header
      rows.add([
        'Order ID', 'Item Title', 'Price', 'Buyer',
        'Risk Level', 'Risk Score', 'Order Status',
        'Protection Status', 'Carrier', 'Tracking Number',
        'Created Date', 'Shipped Date',
      ]);

      // Data rows
      for (var order in orders) {
        final createdAt = DateTime.tryParse(order['created_at'] ?? '');
        final shippedAt = DateTime.tryParse(order['shipped_at'] ?? '');
        rows.add([
          order['ebay_order_id'] ?? '',
          order['item_title'] ?? '',
          '\$${(order['item_price'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
          order['buyer_username'] ?? '',
          order['risk_level'] ?? '',
          order['risk_score']?.toString() ?? '0',
          order['order_status'] ?? '',
          (order['checklist_completed'] == true) ? 'Protected' : 'Not Protected',
          order['carrier'] ?? '',
          order['tracking_number'] ?? '',
          createdAt != null ? _formatDate(createdAt) : '',
          shippedAt != null ? _formatDate(shippedAt) : '',
        ]);
      }

      // Convert to CSV
      final csvString = const ListToCsvConverter().convert(rows);

      // ✅ Web download using dart:html
      final bytes = utf8.encode(csvString);
      final blob = html.Blob([bytes], 'text/csv');
      final url = html.Url.createObjectUrlFromBlob(blob);
      final anchor = html.AnchorElement(href: url)
        ..setAttribute('download',
            'sellerpulse_${filterLabel.toLowerCase().replaceAll(' ', '_')}_${DateTime.now().millisecondsSinceEpoch}.csv')
        ..click();
      html.Url.revokeObjectUrl(url);

      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.black, size: 18),
                const SizedBox(width: 8),
                Text('✅ CSV downloaded! ${orders.length} orders',
                  style: GoogleFonts.inter(
                    color: Colors.black,
                    fontWeight: FontWeight.w600,
                  )),
              ],
            ),
            backgroundColor: const Color(0xFF8FFF00),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('CSV export failed: $e'),
            backgroundColor: const Color(0xFFFF4D6A),
          ),
        );
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PDF EXPORT - Web Compatible
  // ═══════════════════════════════════════════════════════════
  static Future<void> exportAnalyticsToPDF({
    required BuildContext context,
    required List<Map<String, dynamic>> orders,
    required String timeRange,
    required int totalOrders,
    required int protectedOrders,
    required int shippedOrders,
    required int highRiskOrders,
    required int mediumRiskOrders,
    required int lowRiskOrders,
    required double totalValue,
    required double protectedValue,
    required double estimatedSaved,
  }) async {
    try {
      _showLoadingSnackbar(context, 'Generating PDF report...');

      final now = DateTime.now();
      final timeLabel = timeRange == '7' ? 'Last 7 Days'
          : timeRange == '30' ? 'Last 30 Days' : 'All Time';

      // Build monthly data
      final Map<String, Map<String, dynamic>> monthly = {};
      for (var o in orders) {
        final date = DateTime.tryParse(o['created_at'] ?? '');
        if (date == null) continue;
        final key = '${date.year}-${date.month.toString().padLeft(2, '0')}';
        if (!monthly.containsKey(key)) {
          monthly[key] = {'total': 0, 'protected': 0, 'value': 0.0, 'high': 0};
        }
        monthly[key]!['total'] = (monthly[key]!['total'] as int) + 1;
        if (o['checklist_completed'] == true) {
          monthly[key]!['protected'] = (monthly[key]!['protected'] as int) + 1;
        }
        monthly[key]!['value'] = (monthly[key]!['value'] as double) +
            ((o['item_price'] as num?)?.toDouble() ?? 0);
        if (o['risk_level'] == 'HIGH') {
          monthly[key]!['high'] = (monthly[key]!['high'] as int) + 1;
        }
      }
      final sortedMonths = monthly.keys.toList()..sort((a, b) => b.compareTo(a));
      final monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      final protectionRate = totalOrders > 0
          ? (protectedOrders / totalOrders * 100).toStringAsFixed(0) : '0';

      // Build PDF
      final pdf = pw.Document();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(40),
          header: (_) => pw.Container(
            padding: const pw.EdgeInsets.only(bottom: 16),
            decoration: const pw.BoxDecoration(
              border: pw.Border(
                bottom: pw.BorderSide(
                  color: PdfColor.fromInt(0xFF8FFF00), width: 2),
              ),
            ),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text('SellerPulse',
                      style: pw.TextStyle(fontSize: 22,
                          fontWeight: pw.FontWeight.bold,
                          color: const PdfColor.fromInt(0xFF131B2F))),
                    pw.Text('Protection Analytics Report',
                      style: pw.TextStyle(fontSize: 12,
                          color: const PdfColor.fromInt(0xFF64748B))),
                  ],
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Text(timeLabel,
                      style: pw.TextStyle(fontSize: 12,
                          fontWeight: pw.FontWeight.bold,
                          color: const PdfColor.fromInt(0xFF131B2F))),
                    pw.Text('Generated: ${_formatDate(now)}',
                      style: pw.TextStyle(fontSize: 10,
                          color: const PdfColor.fromInt(0xFF94A3B8))),
                  ],
                ),
              ],
            ),
          ),
          build: (_) => [
            pw.SizedBox(height: 24),

            // Title
            pw.Text('Executive Summary',
              style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold,
                  color: const PdfColor.fromInt(0xFF131B2F))),
            pw.SizedBox(height: 12),

            // Stats Row 1
            pw.Row(children: [
              _statCard('Total Orders', '$totalOrders', 0xFF131B2F),
              pw.SizedBox(width: 12),
              _statCard('Protected', '$protectedOrders ($protectionRate%)', 0xFF00C48C),
              pw.SizedBox(width: 12),
              _statCard('Shipped', '$shippedOrders', 0xFF1976D2),
              pw.SizedBox(width: 12),
              _statCard('Est. Saved', '\$${estimatedSaved.toStringAsFixed(2)}', 0xFF131B2F),
            ]),
            pw.SizedBox(height: 12),

            // Stats Row 2
            pw.Row(children: [
              _statCard('High Risk', '$highRiskOrders', 0xFFFF4D6A),
              pw.SizedBox(width: 12),
              _statCard('Medium Risk', '$mediumRiskOrders', 0xFFFFB800),
              pw.SizedBox(width: 12),
              _statCard('Low Risk', '$lowRiskOrders', 0xFF00C48C),
              pw.SizedBox(width: 12),
              _statCard('Total Value', '\$${totalValue.toStringAsFixed(2)}', 0xFF131B2F),
            ]),
            pw.SizedBox(height: 24),

            // Risk Breakdown
            pw.Text('Risk Level Breakdown',
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold,
                  color: const PdfColor.fromInt(0xFF131B2F))),
            pw.SizedBox(height: 8),
            if (totalOrders > 0) ...[
              _riskBar('HIGH RISK', highRiskOrders, totalOrders, 0xFFFF4D6A),
              pw.SizedBox(height: 6),
              _riskBar('MEDIUM RISK', mediumRiskOrders, totalOrders, 0xFFFFB800),
              pw.SizedBox(height: 6),
              _riskBar('LOW RISK', lowRiskOrders, totalOrders, 0xFF00C48C),
            ],
            pw.SizedBox(height: 24),

            // Protection Impact
            pw.Text('Protection Impact',
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold,
                  color: const PdfColor.fromInt(0xFF131B2F))),
            pw.SizedBox(height: 8),
            pw.Container(
              padding: const pw.EdgeInsets.all(16),
              decoration: pw.BoxDecoration(
                color: const PdfColor.fromInt(0xFFEEFFCC),
                borderRadius: pw.BorderRadius.circular(8),
                border: pw.Border.all(
                    color: const PdfColor.fromInt(0xFF8FFF00), width: 1),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                children: [
                  _impactStat('Total Value', '\$${totalValue.toStringAsFixed(2)}', 0xFF131B2F),
                  _impactStat('Value Protected', '\$${protectedValue.toStringAsFixed(2)}', 0xFF00C48C),
                  _impactStat('Est. Disputes Saved', '\$${estimatedSaved.toStringAsFixed(2)}', 0xFF131B2F),
                ],
              ),
            ),
            pw.SizedBox(height: 24),

            // Monthly Table
            pw.Text('Monthly Protection Report',
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold,
                  color: const PdfColor.fromInt(0xFF131B2F))),
            pw.SizedBox(height: 8),
            pw.Table(
              border: pw.TableBorder.all(
                  color: const PdfColor.fromInt(0xFFE2E8F0), width: 1),
              columnWidths: {
                0: const pw.FlexColumnWidth(2),
                1: const pw.FlexColumnWidth(1),
                2: const pw.FlexColumnWidth(1),
                3: const pw.FlexColumnWidth(1),
                4: const pw.FlexColumnWidth(2),
                5: const pw.FlexColumnWidth(1),
              },
              children: [
                pw.TableRow(
                  decoration: const pw.BoxDecoration(
                      color: PdfColor.fromInt(0xFFF1F5F9)),
                  children: [
                    _tableCell('MONTH', isHeader: true),
                    _tableCell('ORDERS', isHeader: true),
                    _tableCell('PROTECTED', isHeader: true),
                    _tableCell('HIGH RISK', isHeader: true),
                    _tableCell('VALUE', isHeader: true),
                    _tableCell('RATE', isHeader: true),
                  ],
                ),
                ...sortedMonths.map((month) {
                  final data = monthly[month]!;
                  final total = data['total'] as int;
                  final protected = data['protected'] as int;
                  final high = data['high'] as int;
                  final value = data['value'] as double;
                  final rate = total > 0
                      ? (protected / total * 100).toStringAsFixed(0) : '0';
                  final parts = month.split('-');
                  final monthName =
                      '${monthNames[int.parse(parts[1])]} ${parts[0]}';
                  final rateInt = int.tryParse(rate) ?? 0;

                  return pw.TableRow(children: [
                    _tableCell(monthName),
                    _tableCell('$total'),
                    _tableCell('$protected'),
                    _tableCell('$high',
                        color: high > 0
                            ? const PdfColor.fromInt(0xFFFF4D6A)
                            : null),
                    _tableCell('\$${value.toStringAsFixed(2)}'),
                    _tableCell('$rate%',
                        color: rateInt >= 80
                            ? const PdfColor.fromInt(0xFF00C48C)
                            : rateInt >= 50
                                ? const PdfColor.fromInt(0xFFFFB800)
                                : const PdfColor.fromInt(0xFFFF4D6A)),
                  ]);
                }),
              ],
            ),
            pw.SizedBox(height: 24),

            // Footer
            pw.Container(
              padding: const pw.EdgeInsets.all(12),
              decoration: pw.BoxDecoration(
                color: const PdfColor.fromInt(0xFFF8FAFC),
                borderRadius: pw.BorderRadius.circular(6),
              ),
              child: pw.Text(
                'Generated by SellerPulse on ${_formatDate(now)} | '
                'Period: $timeLabel | Total orders: $totalOrders',
                style: pw.TextStyle(fontSize: 9,
                    color: const PdfColor.fromInt(0xFF94A3B8)),
              ),
            ),
          ],
        ),
      );

      // ✅ Web download using dart:html
      final bytes = await pdf.save();
      final blob = html.Blob([bytes], 'application/pdf');
      final url = html.Url.createObjectUrlFromBlob(blob);
      final anchor = html.AnchorElement(href: url)
        ..setAttribute('download',
            'sellerpulse_analytics_${timeLabel.toLowerCase().replaceAll(' ', '_')}_${now.millisecondsSinceEpoch}.pdf')
        ..click();
      html.Url.revokeObjectUrl(url);

      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.black, size: 18),
                const SizedBox(width: 8),
                Text('✅ PDF report downloaded!',
                  style: GoogleFonts.inter(
                    color: Colors.black,
                    fontWeight: FontWeight.w600,
                  )),
              ],
            ),
            backgroundColor: const Color(0xFF8FFF00),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('PDF export failed: $e'),
            backgroundColor: const Color(0xFFFF4D6A),
          ),
        );
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PDF WIDGET HELPERS
  // ═══════════════════════════════════════════════════════════
  static pw.Widget _statCard(String label, String value, int colorHex) {
    return pw.Expanded(
      child: pw.Container(
        padding: const pw.EdgeInsets.all(12),
        decoration: pw.BoxDecoration(
          color: const PdfColor.fromInt(0xFFFFFFFF),
          borderRadius: pw.BorderRadius.circular(8),
          border: pw.Border.all(
              color: const PdfColor.fromInt(0xFFE2E8F0), width: 1),
        ),
        child: pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Text(value,
              style: pw.TextStyle(fontSize: 16,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromInt(colorHex))),
            pw.SizedBox(height: 4),
            pw.Text(label,
              style: pw.TextStyle(fontSize: 9,
                  color: const PdfColor.fromInt(0xFF64748B))),
          ],
        ),
      ),
    );
  }

  static pw.Widget _riskBar(
      String label, int count, int total, int colorHex) {
    final pct = total > 0 ? count / total : 0.0;
    return pw.Row(
      children: [
        pw.SizedBox(width: 90,
          child: pw.Text(label,
            style: pw.TextStyle(fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: PdfColor.fromInt(colorHex)))),
        pw.Expanded(
          child: pw.Container(
            height: 12,
            decoration: pw.BoxDecoration(
              color: const PdfColor.fromInt(0xFFE2E8F0),
              borderRadius: pw.BorderRadius.circular(6),
            ),
            child: pw.Align(
              alignment: pw.Alignment.centerLeft,
              child: pw.Container(
                width: pct * 400,
                height: 12,
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromInt(colorHex),
                  borderRadius: pw.BorderRadius.circular(6),
                ),
              ),
            ),
          ),
        ),
        pw.SizedBox(width: 8),
        pw.Text('$count (${(pct * 100).toStringAsFixed(0)}%)',
          style: pw.TextStyle(fontSize: 10,
              color: const PdfColor.fromInt(0xFF64748B))),
      ],
    );
  }

  static pw.Widget _impactStat(String label, String value, int colorHex) {
    return pw.Column(
      children: [
        pw.Text(value,
          style: pw.TextStyle(fontSize: 18,
              fontWeight: pw.FontWeight.bold,
              color: PdfColor.fromInt(colorHex))),
        pw.SizedBox(height: 4),
        pw.Text(label,
          style: pw.TextStyle(fontSize: 10,
              color: const PdfColor.fromInt(0xFF64748B))),
      ],
    );
  }

  static pw.Widget _tableCell(String text,
      {bool isHeader = false, PdfColor? color}) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: pw.Text(text,
        style: pw.TextStyle(
          fontSize: isHeader ? 9 : 10,
          fontWeight:
              isHeader ? pw.FontWeight.bold : pw.FontWeight.normal,
          color: color ??
              (isHeader
                  ? const PdfColor.fromInt(0xFF94A3B8)
                  : const PdfColor.fromInt(0xFF131B2F)),
        )),
    );
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════
  static String _formatDate(DateTime d) {
    return '${d.day.toString().padLeft(2, '0')}/'
        '${d.month.toString().padLeft(2, '0')}/${d.year}';
  }

  static void _showLoadingSnackbar(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const SizedBox(width: 16, height: 16,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: Colors.black)),
            const SizedBox(width: 12),
            Text(msg,
              style: GoogleFonts.inter(color: Colors.black,
                  fontWeight: FontWeight.w500)),
          ],
        ),
        backgroundColor: const Color(0xFF8FFF00),
        duration: const Duration(seconds: 30),
      ),
    );
  }
}