import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'signup_page.dart'; 
import '../widgets/forgot_password_dialog.dart'; 
import '../widgets/clickable_logo.dart'; 
import 'dashboard_page.dart';
import '../services/session_tracker.dart'; 

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.redAccent,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF8FFF00),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), 
      body: ScrollConfiguration(
        behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                
                const ClickableLogo(),

                const SizedBox(height: 40), 

                Container(
                  constraints: const BoxConstraints(maxWidth: 1000), 
                  height: isDesktop ? 620 : null, 
                  decoration: BoxDecoration(
                    color: const Color(0xFF131B2F), 
                    borderRadius: BorderRadius.circular(32), 
                    boxShadow: const [
                      BoxShadow(color: Color(0x1A000000), blurRadius: 40, offset: Offset(0, 20))
                    ],
                  ),
                  child: isDesktop
                      ? Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Expanded(flex: 5, child: _buildLoginForm()),
                            Expanded(flex: 4, child: _buildDarkTestimonial()),
                          ],
                        )
                      : Column(
                          children: [
                            _buildLoginForm(),
                            _buildDarkTestimonial(),
                          ],
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    return Padding(
      padding: const EdgeInsets.all(24.0), 
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 40),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("Welcome back", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              const Text("Log in to your SellerPulse account.", style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
              const SizedBox(height: 40),
              
              _inputLabel("Business Email"),
              _buildField("email@example.com", Icons.email_outlined, controller: _emailController, keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 20),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _inputLabel("Password"),
                  TextButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => ForgotPasswordDialog(initialEmail: _emailController.text),
                      );
                    },
                    child: const Text("Forgot Password?", style: TextStyle(color: Colors.black, fontSize: 13, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              _buildField("••••••••", Icons.lock_outline, isPassword: true, controller: _passwordController),
              
              const SizedBox(height: 35),

              _buildLoadingButton(
                text: "Log In", 
                onPressed: () async {
                  final email = _emailController.text.trim();
                  final password = _passwordController.text.trim();

                  if (email.isEmpty || password.isEmpty) {
                    _showError("Please enter your email and password.");
                    return; 
                  }

                  try {
                    // 1. Log the user in
                    final AuthResponse res = await Supabase.instance.client.auth.signInWithPassword(
                      email: email,
                      password: password,
                    ).timeout(const Duration(seconds: 10), onTimeout: () {
                      throw Exception("Connection timed out. Check your internet or Supabase link.");
                    });
                    
                    // ✨ 2. TRACK THE LOGIN (Profiles + History)
                    if (res.user != null) {
                      try {
                        debugPrint("📱 1. Fetching Device Info...");
                        final metadata = await SessionTracker.getLoginMetadata();
                        debugPrint("📱 2. Info Found: $metadata"); 

                        debugPrint("💾 3. Updating Profile Snapshot...");
                        
                        // A. Update the main profile (The Snapshot)
                        final updateResponse = await Supabase.instance.client
                            .from('profiles')
                            .update({
                              'last_login_ip': metadata['last_login_ip'],
                              'device_platform': metadata['device_platform'],
                              'browser_agent': metadata['browser_agent'],
                            })
                            .eq('id', res.user!.id)
                            .select(); 

                        if (updateResponse.isEmpty) {
                          debugPrint("❌ CRITICAL: Profile update failed! RLS blocked it or row missing.");
                        } else {
                          debugPrint("✅ SUCCESS! Profile updated.");
                        }

                        // B. Insert into History (The Security Vault)
                        debugPrint("📜 4. Recording Login History...");
                        await Supabase.instance.client
                            .from('login_history')
                            .insert({
                              'user_id': res.user!.id,
                              'ip_address': metadata['last_login_ip'],
                              'device_info': "${metadata['device_platform']} • ${metadata['browser_agent']}",
                            });
                        debugPrint("✅ SUCCESS! History recorded.");

                      } catch (trackingError) {
                        // Fail silently: If tracking breaks, the user STILL logs in.
                        debugPrint("❌ Tracking Crash (Ignored): $trackingError");
                      }
                    }

                    _showSuccess("Welcome back!");
                    
                    if (mounted) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const DashboardPage()),
                      );
                    }

                  } on AuthException catch (e) {
                    _showError(e.message); 
                  } catch (e) {
                    debugPrint("LOGIN CRASH: $e");
                    _showError("Login Error: ${e.toString()}");
                  }
                }
              ),
              
              const SizedBox(height: 30),

              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account? ", style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
                    _HoverLink(
                      text: "Sign Up",
                      onTap: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => const SignupPage()),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDarkTestimonial() {
    return Container(
      padding: const EdgeInsets.all(50),
      child: Column( 
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.star, color: Color(0xFF8FFF00), size: 18),
              Icon(Icons.star, color: Color(0xFF8FFF00), size: 18),
              Icon(Icons.star, color: Color(0xFF8FFF00), size: 18),
              Icon(Icons.star, color: Color(0xFF8FFF00), size: 18),
              Icon(Icons.star, color: Color(0xFF8FFF00), size: 18),
            ],
          ),
          const SizedBox(height: 20),
          
          const Text(
            "\"SellerPulse revolutionized my eBay business! We scaled from \$2k to \$45k monthly sales within just 4 months using these tools.\"",
            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600, height: 1.5),
          ),
          const SizedBox(height: 15),
          const Text("- Alex Thompson, Top-Rated Seller", style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
          
          const SizedBox(height: 40), 
          
          Center(
            child: Container(
              height: 220, 
              width: 220,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: Color(0x268FFF00), blurRadius: 100, spreadRadius: 20)],
              ),
              child: const Icon(Icons.rocket_launch, color: Color(0xFF8FFF00), size: 100),
            ),
          ),
        ],
      ),
    );
  }

  Widget _inputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
    );
  }

  Widget _buildField(String hint, IconData icon, {bool isPassword = false, TextInputType keyboardType = TextInputType.text, TextEditingController? controller}) {
    return TextField(
      controller: controller, 
      obscureText: isPassword,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
        prefixIcon: Icon(icon, color: const Color(0xFF94A3B8), size: 20),
        suffixIcon: isPassword ? const Icon(Icons.visibility_off_outlined, color: Color(0xFF94A3B8), size: 20) : null,
        filled: true,
        fillColor: const Color(0xFFF8FAFC), 
        contentPadding: const EdgeInsets.symmetric(vertical: 16),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.black, width: 1.5)),
      ),
    );
  }

  Widget _buildLoadingButton({required String text, IconData? icon, required Future<void> Function() onPressed}) {
    return _LoadingButton(text: text, icon: icon, onPressed: onPressed);
  }
}

class _HoverLink extends StatefulWidget {
  final String text;
  final VoidCallback onTap;

  const _HoverLink({required this.text, required this.onTap});

  @override
  State<_HoverLink> createState() => _HoverLinkState();
}

class _HoverLinkState extends State<_HoverLink> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _isHovering ? 1.05 : 1.0, 
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOutBack,
          child: AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 150),
            style: TextStyle(
              color: _isHovering ? const Color(0xFF8FFF00) : Colors.black, 
              fontWeight: FontWeight.bold,
              fontSize: 14, 
              fontFamily: DefaultTextStyle.of(context).style.fontFamily, 
            ),
            child: Text(widget.text),
          ),
        ),
      ),
    );
  }
}

class _LoadingButton extends StatefulWidget {
  final String text;
  final IconData? icon;
  final Future<void> Function() onPressed;

  const _LoadingButton({required this.text, required this.icon, required this.onPressed});
  @override
  State<_LoadingButton> createState() => _LoadingButtonState();
}

class _LoadingButtonState extends State<_LoadingButton> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity, height: 50,
      child: ElevatedButton(
        onPressed: _isLoading ? null : () async { 
          setState(() => _isLoading = true);
          try {
            await widget.onPressed(); 
          } finally {
            if(mounted) setState(() => _isLoading = false);
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF8FFF00), foregroundColor: Colors.black, 
          disabledBackgroundColor: const Color(0xFF8FFF00).withAlpha(128), 
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0,
        ),
        child: _isLoading 
          ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5))
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (widget.icon != null) Icon(widget.icon, size: 20),
                if (widget.icon != null) const SizedBox(width: 8),
                Text(widget.text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
      ),
    );
  }
}