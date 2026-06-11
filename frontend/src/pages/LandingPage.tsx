import { motion } from 'framer-motion';
import { 
  ShieldCheck, Wrench, Clock, Star, 
  MapPin, Phone, Mail, ChevronDown, 
  ArrowRight, CheckCircle2, Car, LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function LandingPage() {
  const { user } = useAuthStore();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Services', id: 'services' },
    { name: 'About', id: 'about' },
    { name: 'Experience', id: 'experience' },
    { name: 'Contact', id: 'contact' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-violet-950 transition-colors duration-500">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-violet-950/80 backdrop-blur-2xl border-b border-violet-100 dark:border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="bg-violet-600 dark:bg-gold-500 p-2.5 rounded-2xl shadow-xl group-hover:rotate-12 transition-transform">
              <Car className="text-white dark:text-violet-950" size={24} />
            </div>
            <span className="text-2xl font-black text-violet-950 dark:text-white tracking-tighter">ROYAL<span className="text-violet-500 dark:text-gold-500">GARAGE</span></span>
          </div>

          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-[11px] font-black text-violet-950 dark:text-white/60 hover:text-violet-500 dark:hover:text-gold-500 uppercase tracking-[0.3em] transition-all"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <Link 
                to="/dashboard"
                className="bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-violet-600/20 dark:shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-[11px] font-black text-violet-950 dark:text-white uppercase tracking-[0.2em] hover:opacity-70 transition-all">Log In</Link>
                <Link 
                  to="/register"
                  className="bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-violet-600/20 dark:shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Join the Club
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-100/20 dark:from-gold-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 bg-violet-50 dark:bg-gold-500/10 px-5 py-2 rounded-full border border-violet-100 dark:border-gold-500/20">
              <Star className="text-gold-500 fill-gold-500" size={14} />
              <span className="text-[10px] font-black text-violet-600 dark:text-gold-500 uppercase tracking-[0.3em]">Excellence in Motion</span>
            </div>
            <h1 className="text-7xl lg:text-8xl font-black text-violet-950 dark:text-white leading-[0.9] tracking-tighter">
              PRECISION<br />
              <span className="text-violet-600 dark:text-gold-500">ENGINEERING</span><br />
              FOR ROYALTY.
            </h1>
            <p className="text-xl text-violet-900/60 dark:text-white/40 font-medium leading-relaxed max-w-lg">
              Experience the pinnacle of automotive care. From high-performance tuning to meticulous restoration, we treat every vehicle like a masterpiece.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/register" className="bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 px-12 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-600/30 dark:shadow-gold-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                Book Royal Service <ArrowRight size={20} />
              </Link>
              <button onClick={() => scrollToSection('services')} className="px-12 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] border-2 border-violet-100 dark:border-white/10 text-violet-950 dark:text-white hover:bg-violet-50 dark:hover:bg-white/5 transition-all">
                Our Fleet
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-violet-600 dark:bg-gold-500 rounded-[100px] rotate-3 absolute inset-0 opacity-10 blur-3xl animate-pulse" />
            <div className="relative z-10 rounded-[80px] overflow-hidden shadow-2xl border-[12px] border-white dark:border-violet-900">
              <img 
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop" 
                alt="Supercar in garage"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => scrollToSection('services')}>
          <ChevronDown className="text-violet-300" size={48} />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-40 bg-violet-50 dark:bg-black/20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h4 className="text-[11px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-[0.4em]">Master Craftsman</h4>
            <h2 className="text-5xl lg:text-6xl font-black text-violet-950 dark:text-white tracking-tighter">OUR ELITE SECTORS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Wrench, title: 'Engine Mastery', desc: 'Surgical precision for your vehicles heart. We optimize every piston and valve.' },
              { icon: ShieldCheck, title: 'Asset Shield', desc: 'High-end ceramic coating and body restoration to keep the royal shine forever.' },
              { icon: Clock, title: 'Rapid Response', desc: 'Because your time is the true luxury. Elite diagnostics with swift deployment.' },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white dark:bg-violet-900/40 p-12 rounded-[56px] shadow-xl border border-violet-100 dark:border-white/5 hover:shadow-2xl transition-all group"
              >
                <div className="bg-violet-50 dark:bg-gold-500/10 w-20 h-20 rounded-[28px] flex items-center justify-center text-violet-600 dark:text-gold-500 mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <service.icon size={40} />
                </div>
                <h3 className="text-2xl font-black text-violet-950 dark:text-white mb-6 uppercase tracking-tight">{service.title}</h3>
                <p className="text-violet-900/60 dark:text-white/40 font-medium leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-last lg:order-first"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="rounded-[40px] overflow-hidden aspect-[3/4] shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
                </div>
                <div className="bg-violet-600 dark:bg-gold-500 p-10 rounded-[40px] text-white dark:text-violet-950">
                  <span className="text-5xl font-black tracking-tighter">25+</span>
                  <p className="text-xs font-black uppercase tracking-widest mt-2">Years of Mastery</p>
                </div>
              </div>
              <div className="pt-16 space-y-8">
                <div className="bg-violet-50 dark:bg-white/5 p-10 rounded-[40px] border border-violet-100 dark:border-white/10">
                  <span className="text-5xl font-black text-violet-950 dark:text-white tracking-tighter">10k+</span>
                  <p className="text-xs font-black text-violet-500 dark:text-gold-500 uppercase tracking-widest mt-2">Elite Repairs</p>
                </div>
                <div className="rounded-[40px] overflow-hidden aspect-[3/4] shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h4 className="text-[11px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-[0.4em]">The Heritage</h4>
            <h2 className="text-6xl font-black text-violet-950 dark:text-white tracking-tighter leading-none">THE KINGDOM OF<br />STEEL & POWER.</h2>
            <p className="text-xl text-violet-900/60 dark:text-white/40 leading-relaxed font-medium">
              Founded in 1998, Royal Garage began as a specialized workshop for rare European classics. Today, we stand as the premier destination for high-performance exotics and luxury fleets.
            </p>
            <ul className="space-y-6">
              {['Elite Certified Technicians', 'Original Factory Components', 'Next-Gen Diagnostic Bay'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-violet-950 dark:text-white font-black text-sm uppercase tracking-widest">
                  <CheckCircle2 className="text-gold-500" size={24} /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-40 bg-violet-950 dark:bg-black/40 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-black tracking-tighter mb-6">READY FOR THE ROYAL TREATMENT?</h2>
            <p className="text-white/60 font-medium text-xl max-w-2xl mx-auto">
              Join our exclusive registry today and unlock a new level of automotive convenience and care.
            </p>
          </div>
          <div className="flex justify-center gap-8">
            <Link to="/register" className="bg-gold-500 text-violet-950 px-16 py-8 rounded-[40px] font-black text-sm uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-gold-500/20">
              Start Registration
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1 space-y-12">
            <h2 className="text-5xl font-black text-violet-950 dark:text-white tracking-tighter">VISIT THE<br />WORKSHOP.</h2>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-white/5 flex items-center justify-center text-violet-600 dark:text-gold-500">
                  <MapPin size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-lg font-black text-violet-950 dark:text-white leading-none">123 Precision Ave, Engine City</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-white/5 flex items-center justify-center text-violet-600 dark:text-gold-500">
                  <Phone size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Secure Line</p>
                  <p className="text-lg font-black text-violet-950 dark:text-white leading-none">+1 (555) ROYAL-GP</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-white/5 flex items-center justify-center text-violet-600 dark:text-gold-500">
                  <Mail size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Digital Mail</p>
                  <p className="text-lg font-black text-violet-950 dark:text-white leading-none">concierge@royalgarage.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form className="bg-violet-50 dark:bg-violet-900/20 p-12 rounded-[64px] border border-violet-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
              <input type="text" placeholder="Your Name" className="w-full bg-white dark:bg-violet-950 px-8 py-5 rounded-3xl border border-violet-100 dark:border-white/10 outline-none font-bold text-violet-950 dark:text-white" />
              <input type="email" placeholder="Email Address" className="w-full bg-white dark:bg-violet-950 px-8 py-5 rounded-3xl border border-violet-100 dark:border-white/10 outline-none font-bold text-violet-950 dark:text-white" />
              <textarea placeholder="Tell us about your asset..." className="md:col-span-2 w-full bg-white dark:bg-violet-950 px-8 py-5 rounded-3xl border border-violet-100 dark:border-white/10 outline-none font-bold text-violet-950 dark:text-white h-48 resize-none" />
              <button className="md:col-span-2 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-violet-600/20 dark:shadow-gold-500/20">
                Send Transmission
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Royal Footer */}
      <footer className="py-12 border-t border-violet-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-violet-300 uppercase tracking-[0.5em]">© 2026 ROYAL GARAGE • ALL RIGHTS RESERVED</p>
          <div className="flex gap-8 text-[10px] font-black text-violet-950 dark:text-white/40 uppercase tracking-widest">
            <a href="#" className="hover:text-gold-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-gold-500 transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
