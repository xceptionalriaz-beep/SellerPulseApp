import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart'; 
import 'login_page.dart'; 
import '../widgets/animated_progress_pill.dart'; 
import '../widgets/clickable_logo.dart'; 
import 'dashboard_page.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final PageController _pageController = PageController();
  int _currentStep = 0; 

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  
  // ✨ NEW: State variable to track the selected gender
  String _selectedGender = 'unspecified'; 

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 2) {
      _pageController.animateToPage(
        _currentStep + 1,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutBack, 
      );
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      _pageController.animateToPage(
        _currentStep - 1,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutBack,
      );
    }
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
                AnimatedProgressPill(
                  currentStep: _currentStep,
                  onStepTapped: (step) {
                    if (step < _currentStep) {
                      _pageController.animateToPage(step, duration: const Duration(milliseconds: 300), curve: Curves.ease);
                    }
                  },
                ),
                const SizedBox(height: 40), 

                Container(
                  constraints: const BoxConstraints(maxWidth: 1100), 
                  height: isDesktop ? 750 : null, 
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
                            Expanded(flex: 5, child: _buildAnimatedWhiteCard()),
                            Expanded(flex: 4, child: _buildDarkTestimonial()),
                          ],
                        )
                      : Column(
                          children: [
                            _buildAnimatedWhiteCard(),
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

  Widget _buildAnimatedWhiteCard() {
    return Padding(
      padding: const EdgeInsets.all(24.0), 
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 30),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
        child: SizedBox(
          height: 650, 
          child: PageView(
            controller: _pageController,
            physics: const NeverScrollableScrollPhysics(), 
            onPageChanged: (int page) => setState(() => _currentStep = page),
            children: [
              _buildSlideCreateAccount(),
              _buildSlideVerifyEmail(),
              _buildSlideStartTrial(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSlideCreateAccount() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const ClickableLogo(),
          const SizedBox(height: 25),
          
          const Text("Create your account", style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 6),
          const Text("Start your 7-day free trial. No credit card required.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 30),

          _inputLabel("Full Name"),
          _buildField("Enter your name", Icons.person_outline, controller: _nameController),
          const SizedBox(height: 16),
          
          _inputLabel("Business Email"),
          _buildField("email@example.com", Icons.email_outlined, controller: _emailController, keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 16),
          
          _inputLabel("Create Password"),
          _buildField("••••••••", Icons.lock_outline, isPassword: true, controller: _passwordController),
          const SizedBox(height: 16),

          // ✨ NEW: Gender Selection Dropdown
          _inputLabel("Gender"),
          _buildGenderDropdown(),
          
          const SizedBox(height: 30),

          _buildLoadingButton(
            text: "Create Account", 
            onPressed: () async {
              final name = _nameController.text.trim();
              final email = _emailController.text.trim();
              final password = _passwordController.text.trim();

              if (name.isEmpty || email.isEmpty || password.isEmpty) {
                _showError("Please fill in all fields.");
                return; 
              }

              try {
                // ✨ NEW: Sending the selected gender to Supabase!
                await Supabase.instance.client.auth.signUp(
                  email: email,
                  password: password,
                  data: {
                    'full_name': name,
                    'gender': _selectedGender, // Saves 'male', 'female', or 'unspecified'
                  },
                );
                _nextStep(); 
              } on AuthException catch (e) {
                _showError(e.message);
              } catch (e) {
                _showError("Something went wrong. Please try again.");
              }
            }
          ),
          
          const SizedBox(height: 15),

          Center(
            child: Text.rich(
              TextSpan(
                text: "By clicking \"Sign Up\" you agree to our ",
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                children: [
                  TextSpan(text: "Terms of Service", style: TextStyle(color: Colors.blue.shade700, decoration: TextDecoration.underline)),
                  const TextSpan(text: " & "),
                  TextSpan(text: "Privacy Policy", style: TextStyle(color: Colors.blue.shade700, decoration: TextDecoration.underline)),
                ],
              ),
              textAlign: TextAlign.center,
            ),
          ),

          const SizedBox(height: 30),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("Already have an account? ", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
              _HoverLink(
                text: "Log In",
                onTap: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginPage()),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ✨ NEW: The Custom Dropdown Widget
  Widget _buildGenderDropdown() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedGender,
          isExpanded: true,
          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF94A3B8)),
          style: const TextStyle(color: Colors.black, fontSize: 14),
          dropdownColor: Colors.white,
          borderRadius: BorderRadius.circular(12),
          items: const [
            DropdownMenuItem(value: 'unspecified', child: Text("Prefer not to say")),
            DropdownMenuItem(value: 'male', child: Text("Male")),
            DropdownMenuItem(value: 'female', child: Text("Female")),
          ],
          onChanged: (String? newValue) {
            if (newValue != null) {
              setState(() {
                _selectedGender = newValue;
              });
            }
          },
        ),
      ),
    );
  }

  Widget _buildSlideVerifyEmail() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(onPressed: _previousStep, icon: const Icon(Icons.arrow_back, color: Color(0xFF64748B))),
          const SizedBox(height: 10),
          
          const Text("📧", style: TextStyle(fontSize: 50)), 
          const SizedBox(height: 25),
          const Text("Verify your email", style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 6),
          const Text.rich(
            TextSpan(
              text: "We just sent a verification link to your email. Please check your inbox.",
              style: TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.5),
            )
          ),
          const SizedBox(height: 40),

          _buildLoadingButton(
            text: "I have verified my email", 
            onPressed: () async {
               await Future.delayed(const Duration(milliseconds: 800));
               _nextStep(); 
            }
          ),
          
          const SizedBox(height: 20),
          Center(
            child: TextButton(
              onPressed: () {}, 
              child: const Text("Didn't receive an email? Resend", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlideStartTrial() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 40),
          const Text("🎉", style: TextStyle(fontSize: 80)), 
          const SizedBox(height: 30),
          
          const Text("Success!", style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 10),
          const Text(
            "Your SellerPulse account is now active. Your 7-day free trial has started.", 
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF64748B), fontSize: 16, height: 1.6),
          ),
          const SizedBox(height: 60),

          _buildLoadingButton(
            text: "Go to Dashboard", 
            icon: Icons.dashboard_outlined,
            onPressed: () async {
               if (mounted) {
                 Navigator.pushAndRemoveUntil(
                   context,
                   MaterialPageRoute(builder: (context) => const DashboardPage()),
                   (route) => false, 
                 );
               }
            }
          ),
        ],
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
              fontSize: 13,
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
          await widget.onPressed(); 
          if(mounted) setState(() => _isLoading = false);
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