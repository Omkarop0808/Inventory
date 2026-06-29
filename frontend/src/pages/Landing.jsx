import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { Building, ArrowRight, CheckCircle2, User, Sparkles, Globe, ShieldCheck, ChevronDown, Check, Star, Zap, PieChart, Activity, Link2, Key } from 'lucide-react';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { BorderBeam } from '../components/ui/border-beam';
import { MagicCard } from '../components/ui/magic-card';
import { AnimatedList } from '../components/ui/animated-list';
import { NumberTicker } from '../components/ui/number-ticker';
import { Marquee } from '../components/ui/marquee';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/50 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex w-full items-center justify-between text-left font-medium text-foreground hover:text-primary transition-colors"
      >
        <span className="text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOwnerLogin = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    { title: "Centralized Dashboard", desc: "Manage all your properties from one sleek interface.", icon: <PieChart /> },
    { title: "Instant Booking Pages", desc: "Generate SEO-optimized public pages for your homestays in seconds.", icon: <Globe /> },
    { title: "Smart Inventory", desc: "Never double-book again with real-time room availability syncing.", icon: <Activity /> },
    { title: "Secure Access", desc: "Role-based access control for owners and admins.", icon: <Key /> },
  ];

  const notifications = [
    { name: "New Booking!", description: "John Doe booked Sunset Villa for 3 nights.", icon: "🎉", color: "#00C9A7" },
    { name: "Payment Received", description: "$450.00 processed successfully.", icon: "💸", color: "#FFB800" },
    { name: "Low Availability", description: "Only 1 room left for this weekend.", icon: "⚠️", color: "#FF3D71" },
  ];

  const testimonials = [
    { name: "Sarah Jenkins", role: "Property Manager", text: "Mezenga completely transformed how I handle my 5 properties. The public pages are beautiful and convert like crazy." },
    { name: "David Chen", role: "Boutique Hotel Owner", text: "Finally, a platform that feels like it was built in this decade. Fast, reliable, and exactly what I needed." },
    { name: "Emma Watson", role: "Host", text: "The absence of double bookings has saved me so many headaches. It's truly a set-and-forget system." },
    { name: "Michael Rossi", role: "Villa Operator", text: "My guests love the booking experience, and I love the admin dashboard. Win-win." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary-foreground">
      
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 md:px-12 md:py-6 bg-background/80 backdrop-blur-lg border-b border-border/50"
      >
        <div className="flex items-center gap-2 text-2xl font-heading font-extrabold tracking-tight">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Building className="w-5 h-5 text-primary-foreground" />
          </div>
          Mezenga
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/guest')} className="hidden sm:flex text-muted-foreground hover:text-foreground">
            I'm a Guest
          </Button>
          <Button onClick={handleOwnerLogin} className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            {user ? 'Dashboard' : 'Owner Login'}
          </Button>
        </div>
      </motion.nav>

      <main className="flex-1 w-full flex flex-col items-center pt-32 overflow-hidden">
        
        <section className="w-full max-w-6xl mx-auto px-6 text-center space-y-8 pb-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border/50 rounded-full text-sm font-medium text-foreground backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>The premium standard for property management</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold leading-[1.1] tracking-tighter"
          >
            Manage your homestay <br className="hidden md:block"/>
            with absolute <span className="text-primary">precision.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Stop double-booking. Track inventory, manage pricing, and share beautiful booking portals with zero friction.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <ShimmerButton onClick={() => navigate(user ? '/dashboard' : '/signup')} className="shadow-2xl">
              <span className="text-center text-sm md:text-base font-semibold leading-none tracking-tight text-white flex items-center gap-2">
                {user ? 'Go to Dashboard' : 'Start for free'} <ArrowRight className="w-4 h-4" />
              </span>
            </ShimmerButton>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-border bg-transparent hover:bg-secondary transition-all" onClick={() => navigate('/guest')}>
              <User className="mr-2 w-4 h-4" /> Browse Properties
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative mt-20 mx-auto max-w-5xl rounded-xl border border-border/50 bg-background/50 shadow-2xl overflow-hidden p-2 backdrop-blur-sm"
          >
            <BorderBeam size={250} duration={12} delay={9} />
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Dashboard Preview" className="rounded-lg object-cover w-full h-[300px] md:h-[500px] opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent rounded-xl" />
          </motion.div>
        </section>

        <section className="w-full border-y border-border/50 bg-secondary/30 py-10 overflow-hidden">
          <p className="text-center text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Trusted by modern hosts worldwide</p>
          <Marquee className="max-w-6xl mx-auto" pauseOnHover>
            {['Airbnb Hosts', 'Vrbo Partners', 'Boutique Hotels', 'Villa Operators', 'Independent Hosts'].map((text, i) => (
              <div key={i} className="mx-8 text-xl font-heading font-bold text-muted-foreground/40 hover:text-foreground transition-colors cursor-default">
                {text}
              </div>
            ))}
          </Marquee>
        </section>

        <section className="w-full max-w-6xl mx-auto px-6 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-heading font-bold">Everything you need, <br/> nothing you don't.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">A carefully curated set of tools designed to make property management invisible.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <MagicCard key={i} className="p-8 cursor-pointer border-border/50 bg-background hover:bg-secondary/20 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 font-heading">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </MagicCard>
            ))}
          </div>
        </section>

        <section className="w-full bg-secondary/30 border-y border-border/50 py-24">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-heading font-bold">Real-time sync.<br/>Zero stress.</h2>
              <p className="text-lg text-muted-foreground">Watch your business operate itself. Our real-time notification engine keeps you updated on bookings, payments, and availability across all your properties.</p>
              <ul className="space-y-4">
                {[
                  "Add your property details in minutes.",
                  "Share your generated public link.",
                  "Guests book directly, calendar updates instantly."
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">{i+1}</div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[400px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-background border border-border/50 p-6 shadow-xl">
              <AnimatedList>
                {notifications.map((item, idx) => (
                  <figure
                    key={idx}
                    className="relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4 transition-all duration-200 ease-in-out hover:scale-[103%] bg-secondary/50 border border-border/50 shadow-sm backdrop-blur-md"
                  >
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: `${item.color}20` }}>
                        <span style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <figcaption className="flex flex-row items-center whitespace-pre text-base font-semibold text-foreground">
                          {item.name}
                        </figcaption>
                        <p className="text-sm font-normal text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </figure>
                ))}
              </AnimatedList>
            </div>
          </div>
        </section>

        <section className="w-full max-w-6xl mx-auto px-6 py-24 border-b border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-heading font-bold text-primary flex justify-center items-center">
                <NumberTicker value={100} />K+
              </div>
              <p className="text-lg font-medium text-muted-foreground">Bookings Processed</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-heading font-bold text-primary flex justify-center items-center">
                $<NumberTicker value={50} />M+
              </div>
              <p className="text-lg font-medium text-muted-foreground">Revenue Generated</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-heading font-bold text-primary flex justify-center items-center">
                <NumberTicker value={99} />%
              </div>
              <p className="text-lg font-medium text-muted-foreground">Uptime Reliability</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-6xl mx-auto px-6 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-heading font-bold">Simple, transparent pricing.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Start for free, upgrade when you need more power.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-3xl border border-border/50 bg-background p-8 shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold font-heading mb-2">Starter</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-muted-foreground">/ forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 2 properties', 'Basic public portal', 'Standard support', 'Manual booking entry'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <Check className="w-5 h-5 text-primary" /> {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-full h-12" onClick={() => navigate('/signup')}>Get Started</Button>
            </div>

            <div className="rounded-3xl border border-primary bg-primary/5 p-8 shadow-lg relative flex flex-col">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
              <h3 className="text-2xl font-bold font-heading mb-2">Professional</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold">$29</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited properties', 'Custom domain support', 'Priority 24/7 support', 'Automated sync & webhooks', 'Advanced analytics'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <Check className="w-5 h-5 text-primary" /> {feature}
                  </li>
                ))}
              </ul>
              <ShimmerButton className="w-full h-12" onClick={() => navigate('/signup')}>Upgrade to Pro</ShimmerButton>
            </div>
          </div>
        </section>

        <section className="w-full bg-secondary/30 border-y border-border/50 py-24 overflow-hidden">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold">Loved by hosts.</h2>
          </div>
          <Marquee className="max-w-full" pauseOnHover>
            {testimonials.map((t, i) => (
              <div key={i} className="w-[350px] mx-4 rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-foreground font-medium mb-6">"{t.text}"</p>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </Marquee>
        </section>

        <section className="w-full max-w-3xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-2">
            <FAQItem question="Do I need technical skills to use Mezenga?" answer="Not at all. If you can use email, you can use Mezenga. We've designed the interface to be as intuitive as a consumer app." />
            <FAQItem question="Can I use my own domain for the public booking page?" answer="Yes, custom domains are available on our Professional tier. Free users get a customizable mezenga.com/p/your-name link." />
            <FAQItem question="How does the inventory syncing work?" answer="Our system instantly updates availability across all your rooms the moment a booking is confirmed, preventing any possibility of double-booking." />
            <FAQItem question="Is there a setup fee?" answer="No setup fees, no hidden costs. You can start completely free and only upgrade when you need more capacity." />
          </div>
        </section>

      </main>

      <footer className="w-full border-t border-border/50 bg-background py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-2xl font-heading font-bold">
              <Building className="w-5 h-5 text-primary" /> Mezenga
            </div>
            <p className="text-muted-foreground max-w-sm">
              The premium standard for property and homestay management. Built for hosts who care about design and efficiency.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => navigate('/guest')} className="hover:text-primary transition-colors">Guest Portal</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-primary transition-colors">Owner Login</button></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><button onClick={() => navigate('/admin')} className="hover:text-primary transition-colors">Admin Access</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 Mezenga. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
