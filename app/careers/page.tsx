// app/careers/page.tsx
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  MapPin, TrendingUp, Users, Zap, Code, Megaphone,
  Headphones, BarChart2, Briefcase, Mail, Shield,
  Target, ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers | Riazify',
  description: 'Join the team building the future of eBay selling. Remote-first roles at Riazify.',
}

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
}

const WHY = [
  { icon: MapPin,     title: 'Remote First',       desc: 'Work from anywhere in the world. We hire globally and operate async.' },
  { icon: TrendingUp, title: 'Real Equity',         desc: 'Own a meaningful piece of what you build. We share the upside.' },
  { icon: Users,      title: 'Small Team',          desc: 'Your work ships immediately. No bureaucracy, no approval chains.' },
  { icon: Zap,        title: 'Huge Opportunity',    desc: 'eBay has 135M active buyers. We\'re early in a massive market.' },
]

const FUTURE_ROLES = [
  { icon: Code,        role: 'Frontend Developer',  type: 'Engineering',  desc: 'Build beautiful, fast UI for our seller tools platform.' },
  { icon: Megaphone,   role: 'Growth Marketer',     type: 'Marketing',    desc: 'Drive acquisition and revenue growth across paid and organic channels.' },
  { icon: Headphones,  role: 'Customer Success',    type: 'Support',      desc: 'Help sellers get the most out of Riazify and grow their businesses.' },
  { icon: BarChart2,   role: 'Data Analyst',        type: 'Analytics',    desc: 'Turn seller data into insights that drive product decisions.' },
]

const VALUES = [
  { icon: Target,  title: 'Seller obsessed',    desc: 'Every decision starts with what\'s best for the seller. We live in their world.' },
  { icon: Zap,     title: 'Bias for action',    desc: 'We ship fast, iterate faster. Done today beats perfect next month.' },
  { icon: Shield,  title: 'Honest always',      desc: 'We say what we mean — to sellers, to each other and about our product.' },
  { icon: Users,   title: 'Own it',             desc: 'Everyone operates like a founder. No hand-holding, full accountability.' },
]

const FAQS = [
  { q: 'Is Riazify fully remote?',          a: 'Yes — we hire globally and work async-first. You can work from anywhere.' },
  { q: 'When will new roles open?',         a: 'We plan to begin hiring in Q3 2026. Follow us on social or submit a speculative application to be first in line.' },
  { q: 'Can I send a speculative CV?',      a: 'Absolutely. Use the form below — we read every application and respond to strong ones.' },
  { q: 'What does the hiring process look like?', a: 'For most roles: a short intro call, a small take-home task, then a final conversation with the founder.' },
]

export default function CareersPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>

        {/* ── 1. HERO ── */}
        <div style={{ backgroundColor: C.dark, position: 'relative', overflow: 'hidden' }}>
          <div className="max-w-5xl mx-auto px-6 py-24 text-center" style={{ position: 'relative', zIndex: 1 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                 style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.lime }}/>
              <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>WE'RE HIRING SOON</span>
            </div>
            <h1 className="text-[44px] md:text-[60px] font-black leading-tight mb-6" style={{ color: '#fff' }}>
              Join the team building<br/>
              <span style={{ color: C.lime }}>the future of eBay selling</span>
            </h1>
            <p className="text-[16px] leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
              We're a small team with a big mission. If you're passionate about helping eBay sellers win — and you want to own what you build — we want to hear from you.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a href="#apply"
                 className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[14px] hover:opacity-90 transition-all"
                 style={{ backgroundColor: C.lime, color: C.dark }}>
                <Mail size={16}/>Send your CV
              </a>
              <a href="#roles"
                 className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[14px] border hover:opacity-80 transition-all"
                 style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                View open roles ↓
              </a>
            </div>
          </div>
        </div>

        {/* ── 2. PERKS BAR ── */}
        <div style={{ backgroundColor: C.lime }}>
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {['Remote first', 'Equity opportunity', 'Real impact', 'Fast growth'].map((perk, i) => (
                <p key={i} className="text-[13px] font-black" style={{ color: C.dark }}>{perk}</p>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. WHY RIAZIFY ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>WHY RIAZIFY</p>
            <h2 className="text-[32px] font-black mb-10" style={{ color: C.dark }}>
              A place where your work <span style={{ color: C.limeDeep }}>actually matters</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {WHY.map((item, i) => (
                <div key={i} className="flex gap-5 p-6 rounded-2xl border"
                     style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.dark }}>
                    <item.icon size={20} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p className="text-[16px] font-black mb-2" style={{ color: C.dark }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. OPEN POSITIONS ── */}
        <div id="roles" style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>OPEN POSITIONS</p>
            <h2 className="text-[32px] font-black mb-10" style={{ color: C.dark }}>Current openings</h2>
            <div className="rounded-3xl border-2 p-12 text-center flex flex-col items-center gap-5"
                 style={{ borderColor: C.border, borderStyle: 'dashed', backgroundColor: '#fff' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ backgroundColor: C.dark }}>
                <Briefcase size={28} style={{ color: C.lime }}/>
              </div>
              <div>
                <p className="text-[20px] font-black mb-2" style={{ color: C.dark }}>No open roles right now</p>
                <p className="text-[14px] max-w-md mx-auto" style={{ color: C.muted }}>
                  We're growing fast and will be hiring soon. Submit a speculative application below to be first in line when roles open.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <a href="#apply"
                   className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[13px] hover:opacity-90 transition-all"
                   style={{ backgroundColor: C.dark, color: C.lime }}>
                  <ArrowRight size={15}/>Send speculative application
                </a>
                <a href="#notify"
                   className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[13px] border hover:opacity-80 transition-all"
                   style={{ borderColor: C.border, color: C.muted, backgroundColor: '#fff' }}>
                  Get notified when roles open
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. FUTURE ROLES ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>ROLES WE'LL NEED</p>
            <h2 className="text-[32px] font-black mb-3" style={{ color: C.dark }}>Coming soon</h2>
            <p className="text-[14px] mb-10" style={{ color: C.muted }}>These are the kinds of roles we'll be hiring for as Riazify grows.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {FUTURE_ROLES.map((item, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl border hover:shadow-md transition-all"
                     style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.dark }}>
                    <item.icon size={20} style={{ color: C.lime }}/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[15px] font-black" style={{ color: C.dark }}>{item.role}</p>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>Soon</span>
                    </div>
                    <p className="text-[11px] font-bold mb-2" style={{ color: C.muted }}>{item.type}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. VALUES ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>OUR VALUES</p>
            <h2 className="text-[32px] font-black mb-3" style={{ color: '#fff' }}>
              Who thrives at <span style={{ color: C.lime }}>Riazify</span>
            </h2>
            <p className="text-[14px] mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              We hire for these traits above everything else.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {VALUES.map((item, i) => (
                <div key={i} className="flex gap-5 p-6 rounded-2xl"
                     style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: 'rgba(143,255,0,0.15)' }}>
                    <item.icon size={20} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p className="text-[16px] font-black mb-2" style={{ color: '#fff' }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. LIFE AT RIAZIFY ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>LIFE AT RIAZIFY</p>
            <h2 className="text-[32px] font-black mb-10" style={{ color: C.dark }}>What working here looks like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: '100%', label: 'Remote',          desc: 'Work from anywhere', num: '100', suffix: '%', prefix: '' },
                { val: 'Day 1', label: 'Equity',         desc: 'From your first day', num: null,  suffix: '',  prefix: '' },
                { val: 'Async', label: 'Communication',  desc: 'No pointless meetings', num: null, suffix: '', prefix: '' },
                { val: '∞',    label: 'Learning budget', desc: 'Courses, books, tools', num: null, suffix: '', prefix: '' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border"
                     style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <p className={item.num ? 'life-counter text-[28px] font-black mb-1' : 'text-[28px] font-black mb-1'}
                     data-num={item.num || undefined}
                     data-suffix={item.suffix}
                     data-prefix={item.prefix}
                     data-original={item.val}
                     style={{ color: C.limeDeep }}>{item.val}</p>
                  <p className="text-[13px] font-black mb-1" style={{ color: C.dark }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 8. SPECULATIVE APPLICATION ── */}
        <div id="apply" style={{ backgroundColor: '#fff' }}>
          <div className="max-w-3xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center" style={{ color: C.muted }}>SPECULATIVE APPLICATION</p>
            <h2 className="text-[32px] font-black mb-3 text-center" style={{ color: C.dark }}>Think you'd be a great fit?</h2>
            <p className="text-[14px] text-center mb-10" style={{ color: C.muted }}>
              Tell us who you are and what you'd bring to Riazify. We read every email and respond to strong ones.
            </p>
            <div className="rounded-3xl border p-8 flex flex-col gap-4"
                 style={{ backgroundColor: C.bg, borderColor: C.border }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>YOUR NAME</label>
                  <input type="text" placeholder="Reaz Uddin"
                         className="h-11 px-4 rounded-xl border text-[13px] outline-none"
                         style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>EMAIL ADDRESS</label>
                  <input type="email" placeholder="your@email.com"
                         className="h-11 px-4 rounded-xl border text-[13px] outline-none"
                         style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}/>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>ROLE YOU'RE INTERESTED IN</label>
                <input type="text" placeholder="e.g. Frontend Developer, Growth Marketer..."
                       className="h-11 px-4 rounded-xl border text-[13px] outline-none"
                       style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>TELL US ABOUT YOURSELF</label>
                <textarea placeholder="Share your background, what you've built, and why you want to join Riazify..."
                          className="px-4 py-3 rounded-xl border text-[13px] outline-none resize-none"
                          rows={5}
                          style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>PORTFOLIO / LINKEDIN / CV LINK (OPTIONAL)</label>
                <input type="url" placeholder="https://linkedin.com/in/yourname"
                       className="h-11 px-4 rounded-xl border text-[13px] outline-none"
                       style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}/>
              </div>
              <button id="apply-btn"
                      className="h-12 rounded-xl font-black text-[14px] hover:opacity-90 transition-all mt-2"
                      style={{ backgroundColor: C.lime, color: C.dark }}>
                Send Application →
              </button>
              <p id="apply-msg" className="text-[12px] text-center" style={{ minHeight: 20, color: C.muted }}></p>
              <p className="text-[11px] text-center" style={{ color: C.muted }}>
                We respond to all strong applications within 5 business days.
              </p>
            </div>
          </div>
        </div>

        {/* ── 9. FAQ ── */}
        <div id="notify" style={{ backgroundColor: C.bg }}>
          <div className="max-w-3xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>QUICK ANSWERS</p>
            <h2 className="text-[28px] font-black text-center mb-10" style={{ color: C.dark }}>Frequently asked questions</h2>
            <div className="flex flex-col gap-3">
              {FAQS.map((item, i) => (
                <div key={i} className="faq-item rounded-2xl border overflow-hidden"
                     style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <button className="faq-btn w-full flex items-center justify-between gap-4 p-5 text-left"
                          style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span className="text-[15px] font-black" style={{ color: C.dark }}>{item.q}</span>
                    <span className="faq-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[20px] font-bold"
                          style={{ backgroundColor: C.lime, color: C.dark }}>+</span>
                  </button>
                  <div className="faq-answer px-5 overflow-hidden" style={{ maxHeight: 0, transition: 'max-height 0.3s ease' }}>
                    <p className="pb-5 text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 10. CTA ── */}
        <div style={{ backgroundColor: C.bg, paddingBottom: 40 }}>
          <div className="max-w-5xl mx-auto px-6">
            <div style={{ backgroundColor: C.dark, borderRadius: 32, position: 'relative', overflow: 'hidden', padding: '56px 48px', textAlign: 'center' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p className="text-[11px] font-black tracking-wider mb-4" style={{ color: C.muted }}>STAY IN THE LOOP</p>
                <h2 className="text-[32px] font-black mb-3" style={{ color: '#fff' }}>Not ready to apply yet?</h2>
                <p className="text-[15px] mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Follow Riazify on social media to be the first to know when new roles open.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {[
                    { label: 'Follow on X',        url: 'https://twitter.com/riazify' },
                    { label: 'Follow on LinkedIn',  url: 'https://linkedin.com/company/riazify' },
                  ].map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                       className="px-6 py-3 rounded-xl font-bold text-[13px] border hover:opacity-80 transition-all"
                       style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                      {s.label}
                    </a>
                  ))}
                  <Link href="/about"
                     className="px-6 py-3 rounded-xl font-black text-[13px] hover:opacity-90 transition-all"
                     style={{ backgroundColor: C.lime, color: C.dark }}>
                    Learn about Riazify →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Styles + Scripts */}
      <style dangerouslySetInnerHTML={{ __html: [
        '.fade-in-up { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }',
        '.fade-in-up.visible { opacity: 1; transform: translateY(0); }',
      ].join(' ') }} />
      <script dangerouslySetInnerHTML={{ __html:
        'function initCareers() {' +
        '  var faqItems = document.querySelectorAll(".faq-item");' +
        '  if(!faqItems.length){ setTimeout(initCareers, 200); return; }' +
        '  faqItems.forEach(function(item) {' +
        '    var btn = item.querySelector(".faq-btn");' +
        '    var answer = item.querySelector(".faq-answer");' +
        '    var icon = item.querySelector(".faq-icon");' +
        '    btn.addEventListener("click", function() {' +
        '      var isOpen = answer.style.maxHeight && answer.style.maxHeight !== "0px";' +
        '      document.querySelectorAll(".faq-answer").forEach(function(a) { a.style.maxHeight = "0px"; });' +
        '      document.querySelectorAll(".faq-icon").forEach(function(ic) { ic.textContent = "+"; });' +
        '      if(!isOpen) { answer.style.maxHeight = answer.scrollHeight + "px"; icon.textContent = "×"; }' +
        '    });' +
        '  });' +
        '  var applyBtn = document.getElementById("apply-btn");' +
        '  var applyMsg = document.getElementById("apply-msg");' +
        '  if(applyBtn) applyBtn.addEventListener("click", function() {' +
        '    var inputs = document.querySelectorAll("#apply input, #apply textarea");' +
        '    var name = inputs[0].value.trim();' +
        '    var email = inputs[1].value.trim();' +
        '    var message = inputs[3].value.trim();' +
        '    if(!name || !email || !message) { applyMsg.textContent = "Please fill in your name, email and message."; applyMsg.style.color = "#ef4444"; return; }' +
        '    if(!email.includes("@")) { applyMsg.textContent = "Please enter a valid email address."; applyMsg.style.color = "#ef4444"; return; }' +
        '    applyBtn.textContent = "Sending...";' +
        '    setTimeout(function() {' +
        '      applyBtn.textContent = "Application Sent ✓";' +
        '      applyBtn.style.backgroundColor = "#4a8f00";' +
        '      applyMsg.textContent = "Thank you! We\'ll review your application and be in touch within 5 business days.";' +
        '      applyMsg.style.color = "#4a8f00";' +
        '    }, 1500);' +
        '  });' +
        '  var allDivs = document.querySelectorAll(".max-w-5xl, .max-w-3xl");' +
        '  var scrollObs = new IntersectionObserver(function(entries) {' +
        '    entries.forEach(function(e) { if(e.isIntersecting){ e.target.classList.add("visible"); scrollObs.unobserve(e.target); }});' +
        '  }, { threshold: 0.1 });' +
        '  allDivs.forEach(function(el) {' +
        '    var rect = el.getBoundingClientRect();' +
        '    if(rect.top > window.innerHeight) {' +
        '      el.classList.add("fade-in-up");' +
        '    } else {' +
        '      el.classList.add("visible");' +
        '    }' +
        '    scrollObs.observe(el);' +
        '  });' +
        '  var counters = document.querySelectorAll(".life-counter");' +
        '  var cObs = new IntersectionObserver(function(entries) {' +
        '    entries.forEach(function(entry) {' +
        '      if(!entry.isIntersecting) return;' +
        '      var el = entry.target;' +
        '      var target = el.getAttribute("data-num");' +
        '      var suffix = el.getAttribute("data-suffix") || "";' +
        '      var prefix = el.getAttribute("data-prefix") || "";' +
        '      if(!target) return;' +
        '      var num = parseFloat(target);' +
        '      var duration = 1500; var start = null;' +
        '      function step(ts) {' +
        '        if(!start) start = ts;' +
        '        var progress = Math.min((ts-start)/duration,1);' +
        '        var ease = 1 - Math.pow(1-progress,3);' +
        '        el.textContent = prefix + Math.floor(num * ease) + suffix;' +
        '        if(progress < 1) requestAnimationFrame(step);' +
        '        else el.textContent = el.getAttribute("data-original");' +
        '      }' +
        '      requestAnimationFrame(step);' +
        '      cObs.unobserve(el);' +
        '    });' +
        '  }, { threshold: 0.5 });' +
        '  counters.forEach(function(el) { cObs.observe(el); });' +
        '}' +
        'initCareers();'
      }} />
    </div>
  )
}