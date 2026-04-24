import 'package:flutter/material.dart';

// ==========================================
// 1. THE MAIN API CARD (CLEAN WHITE)
// ==========================================
class PremiumApiCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final String status;
  final Color statusColor;
  final String lastSynced;
  final String docsUrl;
  final int? expirationDays;
  final int? rateLimitUsed;
  final int? rateLimitTotal;
  final double? spendCurrent;
  final double? spendLimit;
  final List<Map<String, dynamic>> scopes;
  final List<Widget> children;

  const PremiumApiCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.status,
    required this.statusColor,
    required this.lastSynced,
    required this.docsUrl,
    this.expirationDays,
    this.rateLimitUsed,
    this.rateLimitTotal,
    this.spendCurrent,
    this.spendLimit,
    required this.scopes,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10), 
                          decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFE2E8F0))), 
                          child: Icon(icon, color: const Color(0xFF0F172A), size: 20)
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                                const SizedBox(width: 12),
                                InkWell(
                                  onTap: () {}, 
                                  child: Row(children: [Icon(Icons.open_in_new, size: 12, color: Colors.blue.shade600), const SizedBox(width: 4), Text(docsUrl, style: TextStyle(color: Colors.blue.shade600, fontSize: 11, decoration: TextDecoration.underline))])
                                )
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text(subtitle, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                                const SizedBox(width: 12),
                                Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xFFCBD5E1), shape: BoxShape.circle)),
                                const SizedBox(width: 12),
                                const Icon(Icons.sync, size: 12, color: Color(0xFF94A3B8)),
                                const SizedBox(width: 4),
                                Text("Last ping: $lastSynced", style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontStyle: FontStyle.italic)),
                              ],
                            )
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: statusColor.withOpacity(0.3))),
                      child: Row(
                        children: [
                          Container(width: 6, height: 6, decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle)),
                          const SizedBox(width: 6),
                          Text(status, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  ],
                ),

                if (expirationDays != null && expirationDays! < 30) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(color: const Color(0xFFFFFBEB), border: Border.all(color: Colors.orange.shade200), borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 20),
                        const SizedBox(width: 12),
                        Text("Action Required: Primary Key expires in $expirationDays days. Rotate keys to prevent downtime.", style: TextStyle(color: Colors.orange.shade800, fontWeight: FontWeight.bold, fontSize: 12))
                      ],
                    ),
                  )
                ],

                if (rateLimitTotal != null || spendLimit != null) ...[
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(rateLimitTotal != null ? "Daily Rate Limit" : "Monthly Spend Limit", style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 12)),
                                Text(rateLimitTotal != null ? "$rateLimitUsed / $rateLimitTotal reqs" : "\$$spendCurrent / \$$spendLimit", style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            LinearProgressIndicator(
                              value: rateLimitTotal != null ? (rateLimitUsed! / rateLimitTotal!) : (spendCurrent! / spendLimit!),
                              backgroundColor: const Color(0xFFF1F5F9),
                              color: (rateLimitTotal != null && (rateLimitUsed! / rateLimitTotal!) > 0.8) ? Colors.redAccent : const Color(0xFF1D70F5),
                              minHeight: 6,
                              borderRadius: BorderRadius.circular(3),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(width: 40),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Active Scopes", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 12)),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8, runSpacing: 8, 
                              children: scopes.map((s) => ApiScopeBadge(name: s["name"], granted: s["granted"])).toList()
                            )
                          ],
                        ),
                      )
                    ],
                  )
                ],
              ],
            ),
          ),
          
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC), 
              borderRadius: BorderRadius.only(bottomLeft: Radius.circular(16), bottomRight: Radius.circular(16))
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
          )
        ],
      ),
    );
  }
}

// ==========================================
// 2. THE SECURITY SCOPE BADGE
// ==========================================
class ApiScopeBadge extends StatelessWidget {
  final String name;
  final bool granted;

  const ApiScopeBadge({super.key, required this.name, required this.granted});

  @override
  Widget build(BuildContext context) {
    Color activeColor = granted ? Colors.green : Colors.redAccent;
    Color bgColor = granted ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2);
    Color borderColor = granted ? Colors.green.shade200 : Colors.red.shade200;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bgColor, border: Border.all(color: borderColor), borderRadius: BorderRadius.circular(4)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(granted ? Icons.check : Icons.close, size: 10, color: activeColor),
          const SizedBox(width: 4),
          Text(name, style: TextStyle(color: activeColor, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

// ==========================================
// 3. THE INPUT ROWS
// ==========================================
class ApiInputRow extends StatelessWidget {
  final String label1;
  final TextEditingController ctrl1;
  final String label2;
  final TextEditingController ctrl2;
  final bool isObscured;
  final VoidCallback onToggle;
  final bool isPrimary;

  const ApiInputRow({
    super.key,
    required this.label1,
    required this.ctrl1,
    required this.label2,
    required this.ctrl2,
    required this.isObscured,
    required this.onToggle,
    this.isPrimary = true,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(label1, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF475569))),
                  if (!isPrimary) ...[
                    const SizedBox(width: 8),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(4), border: Border.all(color: Colors.blue.shade100)), child: const Text("STANDBY", style: TextStyle(fontSize: 9, color: Colors.blue, fontWeight: FontWeight.bold)))
                  ]
                ],
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 40,
                child: TextField(
                  controller: ctrl1,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
                  decoration: InputDecoration(
                    hintText: "Paste $label1...", hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                    filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF1D70F5))),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label2, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF475569))),
              const SizedBox(height: 8),
              SizedBox(
                height: 40,
                child: TextField(
                  controller: ctrl2,
                  obscureText: isObscured,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
                  decoration: InputDecoration(
                    hintText: "Paste $label2...", hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                    filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF1D70F5))),
                    suffixIcon: IconButton(icon: Icon(isObscured ? Icons.visibility_off : Icons.visibility, color: const Color(0xFF94A3B8), size: 16), onPressed: onToggle),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ==========================================
// 4. THE TEST CONNECTION BUTTON
// ==========================================
class ApiTestButton extends StatelessWidget {
  final String platform;
  final bool isTesting;
  final VoidCallback onTest;

  const ApiTestButton({
    super.key,
    required this.platform,
    required this.isTesting,
    required this.onTest,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        OutlinedButton.icon(
          onPressed: isTesting ? null : onTest,
          icon: isTesting ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0F172A))) : const Icon(Icons.wifi_tethering, color: Color(0xFF0F172A), size: 16),
          label: Text(isTesting ? "Pinging..." : "Test $platform Connection", style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Color(0xFFE2E8F0)), 
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), 
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12)
          ),
        )
      ],
    );
  }
}