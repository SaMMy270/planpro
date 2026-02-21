
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Heart, Search, Menu, X, Box, Layout as LayoutIcon, Sparkles, Scale, 
  QrCode, ArrowRight, Instagram, Twitter, Facebook, ArrowUpRight, 
  User, ChevronRight, Minus, Plus as PlusIcon, Trash2, ArrowLeft,
  Camera, Map, Compass, Star, Smartphone, Download, SlidersHorizontal, Filter, ChevronDown
} from 'lucide-react';
import { PRODUCTS } from './data/mockData';
import { Product } from './types';
import { geminiService } from './services/geminiService';

// Sub-components
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import ARPreviewModal from './components/ARPreviewModal';
import AIBuilderModal from './components/AIBuilderModal';
import ComparisonModal from './components/ComparisonModal';
import BlueprintDesigner from './components/BlueprintDesigner';
import LoginPage from './components/LoginPage';

type View = 'home' | 'products' | 'blueprint' | 'login' | 'cart' | 'wishlist' | 'ar-preview' | 'comparison';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<View>('home');
  const [cart, setCart] = useState<{id: string, qty: number}[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [isAIBuilderOpen, setIsAIBuilderOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Derive categories and subcategories automatically from data
  const mainCategories = useMemo(() => ['All', ...new Set(PRODUCTS.map(p => p.category))], []);
  
  const subCategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    const subs = PRODUCTS
      .filter(p => p.category === selectedCategory)
      .map(p => p.subcategory);
    return ['All', ...new Set(subs)];
  }, [selectedCategory]);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'All' || p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, selectedSubcategory, maxPrice]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addToCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id, qty: 1 }];
    });
  };

  const openDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const triggerAR = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(false);
    setActiveTab('ar-preview');
  };

  const triggerAI = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(false);
    setIsAIBuilderOpen(true);
  };

  const triggerCompare = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(false);
    setActiveTab('comparison');
  };

  const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-md border-b border-black/5 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white rotate-[-12deg] group-hover:rotate-0 transition-transform">
              <LayoutIcon size={18} />
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tighter uppercase">PlanPro</h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[12px] font-bold uppercase tracking-widest text-black/40">
            <button onClick={() => setActiveTab('home')} className={`hover:text-black transition-colors ${activeTab === 'home' ? 'text-black' : ''}`}>Home</button>
            <button onClick={() => setActiveTab('products')} className={`hover:text-black transition-colors ${activeTab === 'products' ? 'text-black' : ''}`}>Collection</button>
            <button onClick={() => setActiveTab('blueprint')} className={`hover:text-black transition-colors ${activeTab === 'blueprint' ? 'text-black' : ''}`}>Architect Tool</button>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-4 pr-4 border-r border-black/5">
            <button onClick={() => setActiveTab('wishlist')} className="p-2 hover:bg-black/5 rounded-full transition-colors relative">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />}
            </button>
            <button onClick={() => setActiveTab('cart')} className="p-2 hover:bg-black/5 rounded-full transition-colors relative">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />}
            </button>
          </div>
          <button onClick={() => setActiveTab('login')} className="px-4 md:px-6 py-2 bg-black text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg">Log In</button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2"><Menu size={20} /></button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-black/5 p-6 space-y-6 shadow-xl animate-in slide-in-from-top-4">
          <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest">Home</button>
          <button onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest">Collection</button>
          <button onClick={() => { setActiveTab('blueprint'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest">Architect Tool</button>
          <div className="pt-4 border-t border-black/5 flex gap-6">
             <button onClick={() => { setActiveTab('wishlist'); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40"><Heart size={16}/> Wishlist</button>
             <button onClick={() => { setActiveTab('cart'); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40"><ShoppingCart size={16}/> Cart</button>
          </div>
        </div>
      )}
    </nav>
  );

  const Hero = () => (
    <section className="pt-28 md:pt-32 pb-8 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] animate-fade-up">
              YOUR SPACE <span className="inline-block bg-[#FDE7D1] px-3 md:px-4 rounded-3xl relative rotate-[-2deg]">
                <LayoutIcon className="absolute -top-4 md:-top-6 -right-4 md:-right-6 text-black/20 w-8 md:w-12 h-8 md:h-12 rotate-12" />
                INFO
              </span> <br />
              <span className="italic font-light">IN ONE APP</span>
            </h2>
            <p className="text-black/60 text-base md:text-lg max-w-sm leading-relaxed animate-fade-up stagger-1">
              Blueprints, furniture, lab-tested quality – all in one service. Real-time availability for your space.
            </p>
          </div>

          <div className="flex items-center gap-6 pt-2 md:pt-4 animate-fade-up stagger-3">
             <div className="flex -space-x-3">
               {[1,2,3].map(i => (
                 <div key={i} className="w-8 md:w-10 h-8 md:h-10 rounded-full border-2 border-white bg-black/5 overflow-hidden shadow-sm">
                   <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                 </div>
               ))}
             </div>
             <div>
               <p className="text-lg md:text-xl font-bold tracking-tight">+100k</p>
               <p className="text-[9px] md:text-[10px] font-bold text-black/30 uppercase tracking-widest">Happy clients</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 relative animate-scale-in">
          <div className="bg-[#E4E4F4] rounded-[40px] md:rounded-[60px] p-6 md:p-8 aspect-[4/5] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-6 md:top-8 left-6 md:left-8 space-y-2 z-10">
              <h4 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">How does your<br />space feel today?</h4>
              <div className="flex gap-2">
                <div className="bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm">Spacious</div>
                <div className="bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm">Cozy</div>
              </div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800" 
              className="absolute bottom-[-10%] left-[-10%] w-[120%] rotate-[15deg] group-hover:rotate-[10deg] transition-transform duration-1000"
              alt="UI Preview"
            />
            <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-2xl w-40 md:w-48 animate-float">
              <div className="flex gap-1 mb-2">
                <Star size={10} fill="black" />
                <Star size={10} fill="black" />
                <Star size={10} fill="black" />
              </div>
              <p className="text-[9px] md:text-[10px] font-bold leading-tight">"This transformed my studio apartment in minutes."</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
           <div className="bg-[#FDE7D1] p-6 md:p-8 rounded-[32px] md:rounded-[40px] animate-fade-up stagger-1 shadow-sm border border-orange-100/50">
             <p className="text-xs md:text-sm font-bold text-black/70 mb-4">There is a little clutter,<br />but in general I feel good</p>
             <div className="flex gap-3">
               <div className="w-8 md:w-10 h-8 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-base md:text-lg text-center">🏠</div>
               <div className="w-8 md:w-10 h-8 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-base md:text-lg text-center">🌿</div>
               <div className="w-8 md:w-10 h-8 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-base md:text-lg text-center">✨</div>
             </div>
           </div>

           <div className="bg-black p-6 md:p-8 rounded-[32px] md:rounded-[40px] text-white animate-fade-up stagger-2 shadow-2xl">
             <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 md:mb-2">App Store Rating</p>
             <h4 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">4.9</h4>
             <div className="flex gap-1 mb-2">
               {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#FFD700" className="text-[#FFD700]" />)}
             </div>
             <p className="text-[9px] md:text-[10px] font-bold text-white/40 tracking-widest uppercase">456 REVIEWS</p>
           </div>
        </div>
      </div>
    </section>
  );

  const ServicesSection = () => (
    <section className="py-16 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-12 md:mb-16 animate-fade-up">
        <h3 className="text-4xl md:text-5xl font-bold tracking-tighter">Services we provide</h3>
        <p className="text-black/40 text-base md:text-lg max-w-md mx-auto">Instant visualization, blueprint creation, and curated furniture suggestions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-black rounded-[40px] md:rounded-[48px] p-8 md:p-10 text-white space-y-8 animate-fade-up group hover-lift shadow-2xl">
          <div className="space-y-4">
            <h4 className="text-2xl md:text-3xl font-bold tracking-tight">Track your vision</h4>
            <p className="text-white/40 text-sm leading-relaxed">We provide real-time spatial monitoring and reminders to update your design based on your needs.</p>
            <button onClick={() => setActiveTab('products')} className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">Learn more</button>
          </div>
          <div className="pt-4 relative">
             <div className="w-full aspect-square bg-[#E4E4F4] rounded-[32px] md:rounded-[40px] flex items-center justify-center rotate-[-5deg] group-hover:rotate-0 transition-transform overflow-hidden">
               <img src="https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=400" className="w-3/4 drop-shadow-2xl" alt="Design" />
             </div>
          </div>
        </div>

        <div className="bg-[#E4E4F4] rounded-[40px] md:rounded-[48px] p-8 md:p-10 space-y-8 animate-fade-up stagger-1 group hover-lift border border-indigo-100">
          <div className="space-y-4">
            <h4 className="text-2xl md:text-3xl font-bold tracking-tight">Control spatial data</h4>
            <p className="text-black/40 text-sm leading-relaxed">A full cycle of diagnostics and layout recommendations from top-tier interior experts.</p>
          </div>
          <div className="relative h-56 md:h-64 flex items-center justify-center">
             <div className="absolute inset-0 flex items-center justify-center">
                <Box size={100} className="md:size-[120px] text-black/5 rotate-12" />
             </div>
             <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl rotate-[10deg] group-hover:rotate-0 transition-transform">
               <div className="flex gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-red-400"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                 <div className="w-2 h-2 rounded-full bg-green-400"></div>
               </div>
               <p className="text-[10px] font-bold text-black/30 mb-1 uppercase tracking-tighter">OCCUPANCY</p>
               <p className="text-lg md:text-xl font-bold tracking-tight">84% Efficiency</p>
             </div>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-[40px] md:rounded-[48px] p-8 md:p-10 space-y-8 animate-fade-up stagger-2 group hover-lift shadow-sm">
          <div className="space-y-4">
            <h4 className="text-2xl md:text-3xl font-bold tracking-tight">Design faster</h4>
            <p className="text-black/40 text-sm leading-relaxed">Get advice, curated moodboards and AR previews instantly from your smartphone.</p>
          </div>
          <div className="bg-[#FDE7D1] rounded-[32px] md:rounded-[40px] p-6 md:p-8 aspect-square relative overflow-hidden">
            <Smartphone className="absolute bottom-[-20%] right-[-10%] w-3/4 h-3/4 text-black/10 rotate-[-15deg]" />
            <div className="absolute top-6 md:top-8 left-6 md:left-8 bg-white p-4 rounded-2xl shadow-lg rotate-[-5deg] group-hover:rotate-0 transition-transform">
               <p className="text-[10px] font-bold text-black/30 uppercase tracking-tighter">AI SUGGESTION</p>
               <p className="text-xs md:text-sm font-bold">Cloud Sofa fits here.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const HowItWorks = () => (
    <section className="py-16 md:py-20 bg-[#FBFBF9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-12 md:mb-16 animate-fade-up">How it works</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm animate-fade-up border border-black/5 space-y-8 md:space-y-10 group">
             <div className="space-y-4">
               <h4 className="text-3xl md:text-4xl font-bold tracking-tight">Select your vision</h4>
               <p className="text-black/40 text-sm md:text-base leading-relaxed">Choose styles and dimensions that accurately describe your aesthetic goal.</p>
             </div>
             <div className="bg-black/5 p-6 md:p-8 rounded-[32px] md:rounded-[40px] space-y-4">
               <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">What vision is on your mind?</p>
               <div className="bg-white p-4 rounded-2xl border border-black/5 flex items-center gap-3">
                 <Search size={16} className="text-black/20" />
                 <span className="text-sm font-bold opacity-20">Minimalist |</span>
               </div>
               <div className="flex flex-wrap gap-2">
                 <span className="px-4 py-2 bg-white rounded-full text-[10px] font-bold border border-black/5 hover:bg-black hover:text-white transition-all cursor-pointer uppercase tracking-widest">Modern</span>
                 <span className="px-4 py-2 bg-white rounded-full text-[10px] font-bold border border-black/5 hover:bg-black hover:text-white transition-all cursor-pointer uppercase tracking-widest">Industrial</span>
               </div>
             </div>
          </div>

          <div className="bg-[#C1EED0] p-8 md:p-12 rounded-[40px] md:rounded-[60px] animate-fade-up stagger-1 space-y-8 md:space-y-10 group overflow-hidden relative shadow-sm">
             <div className="space-y-4 relative z-10">
               <h4 className="text-3xl md:text-4xl font-bold tracking-tight">Describe details</h4>
               <p className="text-black/40 text-sm md:text-base leading-relaxed">Tell us what's going on so we can find the best solution for your floor plan.</p>
             </div>
             <div className="relative flex justify-center h-64 md:h-72">
                <div className="w-full bg-white/40 backdrop-blur-md rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                   <LayoutIcon size={80} className="md:size-[100px] text-black/10 rotate-12 mb-6" />
                   <div className="flex flex-wrap gap-2 justify-center">
                      <span className="bg-black text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest shadow-lg">Length</span>
                      <span className="bg-white text-black px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest shadow-sm">Width</span>
                      <span className="bg-white text-black px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest shadow-sm">Elevation</span>
                </div>
             </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="bg-white border-t border-black/5 pt-16 md:pt-20 pb-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white rotate-[-12deg]">
                <LayoutIcon size={18} />
              </div>
              <h1 className="text-xl font-bold tracking-tighter uppercase">PlanPro</h1>
            </div>
            <p className="text-[10px] md:text-xs text-black/40 leading-relaxed font-bold uppercase tracking-tighter">
              Design, build, and visualize in one single app.
            </p>
            <div className="flex gap-4">
              <Instagram size={18} className="text-black/20 hover:text-black cursor-pointer transition-all" />
              <Twitter size={18} className="text-black/20 hover:text-black cursor-pointer transition-all" />
              <Facebook size={18} className="text-black/20 hover:text-black cursor-pointer transition-all" />
            </div>
          </div>
          {[
            { title: 'Explore', links: ['Home', 'Collection', 'Architect Tool'] },
            { title: 'Company', links: ['About Us', 'Careers', 'Press'] },
            { title: 'Support', links: ['Help Center', 'Safety', 'Privacy'] }
          ].map((section, idx) => (
            <div key={idx}>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">{section.title}</h5>
              <ul className="space-y-3 md:space-y-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-black/40">
                {section.links.map(link => (
                  <li key={link} onClick={() => {
                    if (link === 'Home') setActiveTab('home');
                    if (link === 'Collection') setActiveTab('products');
                    if (link === 'Architect Tool') setActiveTab('blueprint');
                  }} className="hover:text-black cursor-pointer transition-colors">{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-black/5 text-center">
          <p className="text-[8px] md:text-[9px] text-black/30 font-bold uppercase tracking-[0.3em]">© 2024 PlanPro Design. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-[#FBFBF9]">
      <Navbar />
      
      <main className="transition-all duration-700 ease-in-out">
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-1000">
            <Hero />
            <ServicesSection />
            <HowItWorks />
            
            {/* Promo Section */}
            <section className="py-16 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
               <div className="bg-[#E4E4F4] rounded-[40px] md:rounded-[60px] overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-center shadow-xl border border-indigo-50">
                  <div className="p-8 md:p-10 space-y-10 flex flex-col items-center">
                     <div className="relative">
                        <Smartphone className="w-56 md:w-64 h-[400px] md:h-[450px] text-black/10" />
                        <div className="absolute inset-0 flex items-center justify-center pt-8">
                           <div className="w-40 md:w-48 h-[340px] md:h-[380px] bg-white rounded-[28px] md:rounded-[32px] shadow-2xl overflow-hidden p-5 md:p-6 space-y-6">
                              <h5 className="font-bold text-[9px] md:text-[10px] uppercase tracking-widest opacity-30">Your Space</h5>
                              <div className="bg-[#FDE7D1] p-3 md:p-4 rounded-xl shadow-sm">
                                 <p className="text-[9px] md:text-[10px] font-bold uppercase">Cloud Sofa</p>
                                 <p className="text-[7px] md:text-[8px] opacity-40 font-bold uppercase mt-1">Perfect corner fit.</p>
                              </div>
                              <div className="flex flex-wrap gap-1.5 md:gap-2">
                                 {[1,2,3,4,5,6].map(i => <div key={i} className="w-7 md:w-8 h-7 md:h-8 rounded-lg bg-black/5"></div>)}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="p-10 md:p-16 space-y-6 md:space-y-8">
                     <div className="w-10 md:w-12 h-10 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-float">
                        <LayoutIcon size={20} className="md:size-[24px] text-black" />
                     </div>
                     <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">Design is easy with PlanPro app</h3>
                     <p className="text-black/50 text-base md:text-lg leading-relaxed">We're constantly expanding our library of master artisans and growing our team of highly qualified interior planners.</p>
                     <button onClick={() => setActiveTab('products')} className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Get Started</button>
                  </div>
               </div>
            </section>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div className="pt-24 min-h-screen animate-in slide-in-from-bottom-8 duration-700">
             <div className="px-4 md:px-6 py-10 max-w-7xl mx-auto">
               
               {/* Collection Header */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-6 md:gap-8">
                 <div className="space-y-2">
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30 block">Catalog 2024</span>
                   <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Featured Collection</h2>
                 </div>
                 
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                       <input 
                         type="text" 
                         placeholder="Search the collection..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full pl-14 pr-6 py-4 bg-white border border-black/5 rounded-[24px] text-sm font-medium focus:outline-none focus:border-black/20 focus:shadow-xl transition-all shadow-sm"
                       />
                    </div>
                    <button 
                      onClick={() => setShowFilterDrawer(true)}
                      className="p-4 rounded-[20px] bg-white border border-black/5 hover:border-black shadow-sm transition-all relative group"
                    >
                      <SlidersHorizontal size={22} />
                      {(maxPrice < 3000 || searchQuery !== '') && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full border-2 border-white" />
                      )}
                    </button>
                 </div>
               </div>

               {/* Filter Section Container */}
               <div className="space-y-6 md:space-y-8 mb-12">
                 {/* Main Category Pills */}
                 <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar animate-fade-up">
                    {mainCategories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-6 md:px-8 py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${selectedCategory === cat ? 'bg-black border-black text-white shadow-xl scale-105' : 'bg-white border-black/5 text-black/30 hover:text-black hover:border-black/20'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>

                 {/* Dynamic Sub-Category Pills (Appears when a main category is selected) */}
                 {selectedCategory !== 'All' && subCategories.length > 0 && (
                   <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-500">
                     <div className="flex items-center gap-2 px-1">
                        <ChevronDown size={14} className="text-black/20" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-black/20">Refine Selection</span>
                     </div>
                     <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {subCategories.map(sub => (
                          <button 
                            key={sub}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`whitespace-nowrap px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${selectedSubcategory.toLowerCase() === sub.toLowerCase() ? 'bg-black text-white shadow-lg scale-105' : 'bg-white/50 border-black/5 text-black/40 hover:text-black hover:border-black/20'}`}
                          >
                            {sub}
                          </button>
                        ))}
                     </div>
                   </div>
                 )}
               </div>

               {/* Product Grid */}
               <div className="animate-fade-up stagger-1">
                 {filteredProducts.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                     {filteredProducts.map(p => (
                       <ProductCard 
                         key={p.id} 
                         product={p} 
                         onAR={triggerAR} 
                         onAI={triggerAI} 
                         onCompare={triggerCompare} 
                         onAddToCart={addToCart} 
                         onToggleWishlist={toggleWishlist} 
                         onViewDetails={openDetails} 
                         isWishlisted={wishlist.includes(p.id)} 
                       />
                     ))}
                   </div>
                 ) : (
                   <div className="py-24 md:py-32 text-center space-y-6 bg-white rounded-[40px] md:rounded-[60px] border border-black/5">
                      <div className="w-16 md:w-20 h-16 md:h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto">
                        <Search size={28} className="md:size-[32px] text-black/20" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl md:text-2xl font-serif">No matches found</h4>
                        <p className="text-xs md:text-sm text-black/40 max-w-xs mx-auto">Try refining your search or price filters to find what you're looking for.</p>
                      </div>
                      <button 
                        onClick={() => { setSelectedCategory('All'); setSelectedSubcategory('All'); setMaxPrice(3000); setSearchQuery(''); }}
                        className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Reset Filters
                      </button>
                   </div>
                 )}
               </div>
             </div>
          </div>
        )}

        {/* Filter Drawer Overlay */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowFilterDrawer(false)} />
            <aside className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 md:p-12 flex flex-col justify-between animate-in slide-in-from-right duration-500">
              <div className="space-y-10 md:space-y-12">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl md:text-3xl font-serif">Advanced Filters</h3>
                  <button onClick={() => setShowFilterDrawer(false)} className="p-3 rounded-full hover:bg-black/5 transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-end">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Budget Range</h4>
                      <span className="text-lg md:text-xl font-bold tracking-tighter">${maxPrice}</span>
                   </div>
                   <input 
                     type="range" 
                     min="100" 
                     max="3000" 
                     step="100"
                     value={maxPrice}
                     onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                     className="w-full h-1.5 bg-black/5 rounded-full appearance-none cursor-pointer accent-black"
                   />
                   <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-black/20 uppercase tracking-widest">
                     <span>$100</span>
                     <span>$3,000+</span>
                   </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Materials</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['Oak Wood', 'Marble', 'Leather', 'Bouclé'].map(m => (
                      <button key={m} className="px-4 py-3 border border-black/5 rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all">
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setShowFilterDrawer(false)}
                  className="w-full py-4 md:py-5 bg-black text-white rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-2xl hover:bg-black/80 transition-all"
                >
                  Show {filteredProducts.length} Results
                </button>
                <button 
                  onClick={() => { setMaxPrice(3000); setSearchQuery(''); setSelectedCategory('All'); setSelectedSubcategory('All'); }}
                  className="w-full py-4 border border-black/5 rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-widest text-[9px] md:text-[10px] text-black/40 hover:text-black hover:border-black transition-all"
                >
                  Reset All
                </button>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'blueprint' && (
          <div className="animate-in fade-in duration-700">
            <BlueprintDesigner />
          </div>
        )}
        
        {(activeTab === 'cart' || activeTab === 'wishlist') && (
          <div className="pt-40 pb-20 px-4 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">{activeTab} section</h2>
            <p className="text-black/40 text-sm">Coming soon in the full production release.</p>
            <button onClick={() => setActiveTab('home')} className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest">Back to Home</button>
          </div>
        )}
      </main>

      {activeTab === 'login' && (
        <LoginPage 
          onBack={() => setActiveTab('home')} 
          onLoginSuccess={() => setActiveTab('home')}
        />
      )}

      {activeTab !== 'blueprint' && activeTab !== 'login' && <Footer />}

      {showDetails && selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onClose={() => setShowDetails(false)}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          onAR={triggerAR}
          onAI={triggerAI}
          onCompare={triggerCompare}
        />
      )}

      {isAIBuilderOpen && (
        <AIBuilderModal 
          product={selectedProduct} 
          onClose={() => setIsAIBuilderOpen(false)} 
        />
      )}
      
      {activeTab === 'comparison' && selectedProduct && (
        <ComparisonModal 
          product={selectedProduct} 
          onClose={() => setActiveTab('products')} 
        />
      )}
      
      {activeTab === 'ar-preview' && selectedProduct && (
        <ARPreviewModal 
          product={selectedProduct} 
          onClose={() => setActiveTab('products')} 
        />
      )}
    </div>
  );
};

export default App;
