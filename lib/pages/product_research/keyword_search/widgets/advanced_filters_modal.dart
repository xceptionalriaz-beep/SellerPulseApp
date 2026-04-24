import 'package:flutter/material.dart';

class AdvancedFiltersModal extends StatelessWidget {
  const AdvancedFiltersModal({super.key});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        width: 500, padding: const EdgeInsets.all(30),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("⚙️ Advanced Filters", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 20),
            const Text("Price Range (\$)", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            Row(
              children: [
                Expanded(child: TextField(decoration: InputDecoration(hintText: "Min", border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))))),
                const Padding(padding: EdgeInsets.symmetric(horizontal: 10), child: Text("-")),
                Expanded(child: TextField(decoration: InputDecoration(hintText: "Max", border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))))),
              ],
            ),
            const SizedBox(height: 20),
            const Text("Minimum Monthly Sales", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            const SizedBox(height: 10),
            Slider(value: 50, min: 0, max: 500, activeColor: const Color(0xFF8FFF00), thumbColor: const Color(0xFF131B2F), onChanged: (val) {}),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity, height: 50,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF131B2F), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                child: const Text("Apply Filters", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            )
          ],
        ),
      ),
    );
  }
}