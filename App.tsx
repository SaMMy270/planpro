
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingCart, Heart, Search, Menu, X, Box, Layout as LayoutIcon, Sparkles, Scale,
  QrCode, ArrowRight, Instagram, Twitter, Facebook, ArrowUpRight,
  User, ChevronRight, Minus, Plus as PlusIcon, Trash2, ArrowLeft,
  Camera, Map, Compass, Star, Smartphone, Download, SlidersHorizontal, Filter, ChevronDown
} from 'lucide-react';
import { PRODUCTS } from './data/mockData';
import { Product } from './types';
import { geminiService } from './services/geminiService';
import { supabase } from './services/supabase';
import { Toaster, toast } from 'sonner';

// Sub-components
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import ARPreviewModal from './components/ARPreviewModal';
import AIBuilderModal from './components/AIBuilderModal';
import ComparisonModal from './components/ComparisonModal';
import BlueprintDesigner from './components/RoomBuilder/BlueprintDesigner';
import LoginPage from './components/LoginPage';
import CartView from './components/CartView';
import WishlistView from './components/WishlistView';
import CheckoutPage from './components/CheckoutPage';
import UserProfile from './components/UserProfile';
import WishlistComparisonModal from './components/WishlistComparisonModal';
import ARPage from './ARModule/ARPage';


type View = 'home' | 'products' | 'blueprint' | 'login' | 'cart' | 'wishlist' | 'ar-preview' | 'comparison' | 'checkout' | 'profile' | 'ar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<View>('home');
  const [cart, setCart] = useState<{ id: string, qty: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [isAIBuilderOpen, setIsAIBuilderOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initialARViewMode, setInitialARViewMode] = useState<'inspect' | 'live' | 'qr'>('inspect');
  const [isWishlistCompareOpen, setIsWishlistCompareOpen] = useState(false);

  // Global search expand state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) syncUserProfile(currentUser);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      
      // Only update user if the ID has changed to prevent unnecessary re-fetches
      setUser((prevUser: any) => {
        if (prevUser?.id === currentUser?.id) return prevUser;
        return currentUser;
      });

      if (event === 'SIGNED_IN' && currentUser) {
        syncUserProfile(currentUser);
      }
      if (event === 'SIGNED_OUT') {
        setActiveTab('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserProfile = async (authUser: any) => {
    try {
      const { error } = await supabase
        .from('User')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          updatedAt: new Date().toISOString()
        });

      if (error) console.error('Error syncing profile:', error);
    } catch (err) {
      console.error('Profile sync failed:', err);
    }
  };

  // Sync Wishlist and Cart from Supabase
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setWishlist([]);
      setCart([]);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const wishlistObj = await getOrCreateWishlist();
      const cartObj = await getOrCreateCart();

      // Fetch Wishlist
      const { data: wishlistData, error: wError } = await supabase
        .from('WishlistItem')
        .select('productId')
        .eq('wishlistId', wishlistObj.id);

      if (wError) throw wError;
      if (wishlistData) {
        setWishlist(wishlistData.map(item => item.productId));
      }

      // Fetch Cart
      const { data: cartData, error: cError } = await supabase
        .from('CartItem')
        .select('productId, quantity')
        .eq('cartId', cartObj.id);

      if (cError) throw cError;
      if (cartData) {
        setCart(cartData.map(item => ({ id: item.productId, qty: item.quantity })));
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  // Deep Link Listener for AR
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setActiveTab('ar');
    }
  }, []);

  const getOrCreateWishlist = async () => {
    if (!user) throw new Error('User not authenticated');

    // Try to find existing wishlist
    const { data: wishlists, error } = await supabase
      .from('Wishlist')
      .select('id')
      .eq('userId', user.id);

    if (error) {
      console.error('Error fetching wishlist:', error);
    }

    // If wishlist exists, return the first one (handles dupes gracefully)
    if (wishlists && wishlists.length > 0) {
      return wishlists[0];
    }

    // Otherwise create one
    const { data: newWishlist, error: createError } = await supabase
      .from('Wishlist')
      .insert({ userId: user.id })
      .select()
      .maybeSingle();

    if (createError) {
      if (createError.code === '23505') { // Unique constraint violation (race condition)
        const { data: retryWishlist } = await supabase
          .from('Wishlist')
          .select('id')
          .eq('userId', user.id)
          .single();
        if (retryWishlist) return retryWishlist;
      }
      console.error('Error creating wishlist:', createError);
      throw createError;
    }
    
    return newWishlist;
  };

  const getOrCreateCart = async () => {
    if (!user) throw new Error('User not authenticated');

    const { data: carts, error } = await supabase
      .from('Cart')
      .select('id')
      .eq('userId', user.id);

    if (error) {
      console.error('Error fetching cart:', error);
    }

    if (carts && carts.length > 0) {
      return carts[0];
    }

    const { data: newCart, error: createError } = await supabase
      .from('Cart')
      .insert({ userId: user.id })
      .select()
      .maybeSingle();

    if (createError) {
      if (createError.code === '23505') {
        const { data: retryCart } = await supabase
          .from('Cart')
          .select('id')
          .eq('userId', user.id)
          .single();
        if (retryCart) return retryCart;
      }
      console.error('Error creating cart:', createError);
      throw createError;
    }
    
    return newCart;
  };

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

  // Deep Link Handling for AR QR Scanner
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('target');
    const id = params.get('id');
    const view = params.get('view') as 'qr' | 'live' | null;

    if (target === 'ar' && id) {
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        setSelectedProduct(product);
        if (view) setInitialARViewMode(view);
        setActiveTab('ar-preview');
        // Clean up URL without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

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

  const toggleWishlist = async (id: string) => {
    const isAdding = !wishlist.includes(id);
    const product = PRODUCTS.find(p => p.id === id);
    
    setWishlist(prev => isAdding ? [...prev, id] : prev.filter(i => i !== id));

    if (isAdding) {
      toast.success(`${product?.name || 'Item'} added to wishlist`, {
        icon: <Heart size={16} className="fill-red-500 text-red-500" />
      });
    } else {
      toast.info(`${product?.name || 'Item'} removed from wishlist`);
    }

    if (user) {
      const wishlistObj = await getOrCreateWishlist();
      if (isAdding) {
        await supabase.from('WishlistItem').insert({ wishlistId: wishlistObj.id, productId: id });
      } else {
        await supabase.from('WishlistItem').delete().eq('wishlistId', wishlistObj.id).eq('productId', id);
      }
    }
  };

  const addToCart = async (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id, qty: 1 }];
    });

    if (user) {
      const cartObj = await getOrCreateCart();
      const { data: existingItem } = await supabase
        .from('CartItem')
        .select('id, quantity')
        .eq('cartId', cartObj.id)
        .eq('productId', id)
        .single();

      if (existingItem) {
        await supabase.from('CartItem').update({ quantity: existingItem.quantity + 1 }).eq('id', existingItem.id);
      } else {
        await supabase.from('CartItem').insert({ cartId: cartObj.id, productId: id, quantity: 1 });
      }
    }
    
    const product = PRODUCTS.find(p => p.id === id);
    toast.success(`${product?.name || 'Item'} added to collection`, {
      description: "You can view it in your cart.",
      icon: <ShoppingCart size={16} />
    });
  };

  const removeFromCart = async (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));

    if (user) {
      const cartObj = await getOrCreateCart();
      await supabase.from('CartItem').delete().eq('cartId', cartObj.id).eq('productId', id);
    }
  };

  const updateCartQty = async (id: string, delta: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));

    if (user) {
      const cartObj = await getOrCreateCart();
      const { data: existingItem } = await supabase
        .from('CartItem')
        .select('id, quantity')
        .eq('cartId', cartObj.id)
        .eq('productId', id)
        .single();

      if (existingItem) {
        await supabase.from('CartItem').update({ quantity: Math.max(1, existingItem.quantity + delta) }).eq('id', existingItem.id);
      }
    }
  };

  const openDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const triggerAR = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(false);
    
    // If on mobile, skip the preview modal and go directly to AR session
    if (window.innerWidth < 768) {
      // Update URL so ARPage can read the correct ID
      const newUrl = `${window.location.pathname}?id=${product.id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      setActiveTab('ar');
    } else {
      setInitialARViewMode('inspect');
      setActiveTab('ar-preview');
    }
  };

  const triggerAI = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(false);
    setIsAIBuilderOpen(true);
  };

  const triggerCompare = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('comparison');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('home');
  };

  const handleGlobalSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      setSearchQuery(globalSearchQuery);
      setActiveTab('products');
      setIsSearchExpanded(false);
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery]);

  const expandSearch = useCallback(() => {
    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const collapseSearch = useCallback(() => {
    setIsSearchExpanded(false);
    setGlobalSearchQuery('');
  }, []);

  const Navbar = () => (
    <>
      {/* Frosted-glass blur overlay when search is expanded */}
      
        
      <nav
        className="sticky-header px-4 md:px-6 py-3"
        style={{ zIndex: 60 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo + Nav links */}
          <div className="flex items-center gap-8 flex-shrink-0">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {
              window.history.pushState({}, '', window.location.pathname);
              setActiveTab('home');
              collapseSearch();
            }}>
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-background rotate-[-12deg] group-hover:rotate-0 transition-all duration-500 shadow-lg">
                <LayoutIcon size={16} />
              </div>
              <h1 className="text-base md:text-lg font-bold tracking-tighter uppercase bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">PlanPro</h1>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--secondary-text)' }}>
              <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('home'); }} className={`nav-link hover:text-primary transition-colors py-1 ${activeTab === 'home' ? 'active text-primary' : ''}`}>Home</button>
              <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('products'); }} className={`nav-link hover:text-primary transition-colors py-1 ${activeTab === 'products' ? 'active text-primary' : ''}`}>Collection</button>
              <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('blueprint'); }} className={`nav-link nav-link-architect hover:text-primary transition-colors py-1 ${activeTab === 'blueprint' ? 'active text-primary' : ''}`}>Room Generation</button>
            </div>
          </div>

          {/* Global Search Bar — expands with cubic-bezier(0.4,0,0.2,1) */}
         
           

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-3 pr-3 border-r border-primary/10">
              <button
                onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('wishlist'); }}
                className="touch-target p-2 hover:bg-primary/10 rounded-full transition-all relative group"
              >
                <Heart size={18} className="group-hover:scale-110 transition-transform" />
                {wishlist.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />}
              </button>
              <button
                onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('cart'); }}
                className="touch-target p-2 hover:bg-primary/10 rounded-full transition-all relative group"
              >
                <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                {cart.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />}
              </button>
              {user && (
                <button
                  onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('profile'); }}
                  className={`touch-target p-2 hover:bg-primary/10 rounded-full transition-all group ${activeTab === 'profile' ? 'bg-primary text-background' : ''}`}
                >
                  <User size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
            <button
              onClick={() => user ? handleLogout() : setActiveTab('login')}
              className="btn-gold px-4 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg"
            >
              {user ? 'Log Out' : 'Log In'}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden touch-target p-2 hover:bg-primary/10 rounded-full transition-all">
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b border-primary/10 p-6 space-y-5 shadow-2xl" style={{ background: 'rgba(10,12,16,0.96)', backdropFilter: 'blur(20px)', animation: 'enter-from-top 0.3s var(--ease-fluid) forwards' }}>
            {/* Mobile Search */}
            <form onSubmit={handleGlobalSearch} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--secondary)', border: '1px solid rgba(193,200,228,0.1)' }}>
              <Search size={16} style={{ color: 'var(--secondary-text)' }} />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search furniture..."
                className="bg-transparent text-sm font-medium text-text placeholder:text-text/30 outline-none flex-1"
              />
            </form>
            <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" style={{ color: 'var(--secondary-text)' }}>Home</button>
            <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('products'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" style={{ color: 'var(--secondary-text)' }}>Collection</button>
            <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('blueprint'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" style={{ color: 'var(--secondary-text)' }}>Architect Tool</button>
            <div className="pt-4 border-t border-primary/10 flex gap-5">
              <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('wishlist'); setIsMobileMenuOpen(false); }} className="touch-target flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" style={{ color: 'var(--secondary-text)' }}><Heart size={15} /> Wishlist</button>
              <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('cart'); setIsMobileMenuOpen(false); }} className="touch-target flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" style={{ color: 'var(--secondary-text)' }}><ShoppingCart size={15} /> Cart</button>
              {user && <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('profile'); setIsMobileMenuOpen(false); }} className="touch-target flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" style={{ color: 'var(--secondary-text)' }}><User size={15} /> Profile</button>}
            </div>
          </div>
        )}
      </nav>
    </>
  );

  const Hero = () => (
    <section className="pt-24 md:pt-28 pb-8 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden relative">
      <div className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(207,160,98,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
      <div className="absolute bottom-10 left-0 w-72 h-72 rounded-full animate-pulse" style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(138,112,76,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start relative z-10">
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <div className="space-y-4">
            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-[104px] font-serif tracking-tight leading-[1.1] animate-fade-up text-white">
              MODERN HOME <br />
              FURNITURE <span className="italic text-primary">&</span> DECOR
            </h2>
            <div className="flex items-center gap-4 animate-fade-up stagger-1">
              <div className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg" style={{ background: 'linear-gradient(135deg, #FFB800, #FFA000)', color: '#0A0C10', boxShadow: '0 4px 16px rgba(255,184,0,0.3)' }}>
                Elegance Redefined
              </div>
              <p className="text-base md:text-lg max-w-sm leading-relaxed" style={{ color: 'var(--secondary-text)' }}>
                Discover elegant pieces for contemporary living. Instantly visualize in your space.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 pt-2 md:pt-4 animate-fade-up stagger-3">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 md:w-10 h-8 md:h-10 rounded-full border-2 overflow-hidden shadow-sm hover:scale-110 transition-transform" style={{ borderColor: 'rgba(207,160,98,0.4)', background: 'var(--secondary)' }}>
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold tracking-tight text-primary">+100k</p>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--secondary-text)' }}>Happy clients</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 relative animate-scale-in stagger-2">
          <div className="rounded-[40px] md:rounded-[60px] p-6 md:p-8 aspect-[4/5] relative overflow-hidden group shadow-2xl animate-border-glow" style={{ background: 'linear-gradient(135deg, rgba(207,160,98,0.15), rgba(138,112,76,0.15))', border: '1px solid rgba(207,160,98,0.25)' }}>
            <div className="absolute top-6 md:top-8 left-6 md:left-8 space-y-2 z-10">
              <h4 className="text-xl md:text-2xl font-bold tracking-tight leading-tight text-primary">How does your<br />space feel today?</h4>
              <div className="flex gap-2">
                <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm text-text" style={{ background: 'var(--secondary)' }}>Spacious</div>
                <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm text-text" style={{ background: 'var(--secondary)' }}>Cozy</div>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800"
              className="absolute bottom-[-10%] left-[-10%] w-[120%] rotate-[15deg] group-hover:rotate-[10deg] transition-transform duration-1000"
              alt="UI Preview"
            />
            <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 backdrop-blur-md p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-2xl w-40 md:w-48 animate-float" style={{ background: 'rgba(20,19,17,0.92)', border: '1px solid rgba(207,160,98,0.2)' }}>
              <div className="flex gap-1 mb-2">
                <Star size={10} fill="currentColor" className="text-primary" />
                <Star size={10} fill="currentColor" className="text-primary" />
                <Star size={10} fill="currentColor" className="text-primary" />
              </div>
              <p className="text-[9px] md:text-[10px] font-bold leading-tight text-text">"This transformed my studio apartment in minutes."</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
          <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] animate-fade-up stagger-3 hover:shadow-xl transition-all glass-card">
            <p className="text-xs md:text-sm font-bold text-text/70 mb-4">There is a little clutter,<br />but in general I feel good</p>
            <div className="flex gap-3">
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center shadow-sm text-base md:text-lg text-center hover:scale-110 transition-transform cursor-pointer animate-leaf-sway" style={{ background: 'var(--secondary)' }}>🏠</div>
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center shadow-sm text-base md:text-lg text-center hover:scale-110 transition-transform cursor-pointer animate-leaf-sway" style={{ animationDelay: '0.4s', background: 'var(--secondary)' }}>🌿</div>
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center shadow-sm text-base md:text-lg text-center hover:scale-110 transition-transform cursor-pointer animate-leaf-sway" style={{ animationDelay: '0.8s', background: 'var(--secondary)' }}>✨</div>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] animate-fade-up stagger-4 shadow-2xl hover-lift" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2" style={{ color: 'rgba(20,19,17,0.55)' }}>App Store Rating</p>
            <h4 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4" style={{ color: 'var(--background)' }}>4.9</h4>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" className="star-rating" style={{ color: 'var(--background)' }} />)}
            </div>
            <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(20,19,17,0.55)' }}>456 REVIEWS</p>
          </div>
        </div>
      </div>
    </section>
  );

  const ServicesSection = () => (
    <section className="py-16 md:py-20 px-4 md:px-6 max-w-7xl mx-auto relative">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, rgba(207,160,98,0.4), transparent)' }}></div>
      <div className="text-center space-y-4 mb-16 md:mb-20 animate-fade-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(207,160,98,0.6)' }}>Our Expertise</p>
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-primary">Services we provide</h3>
        <p className="text-text/40 text-base md:text-lg max-w-md mx-auto">Instant visualization, blueprint creation, and curated furniture suggestions.</p>
        <div className="flex justify-center"><div className="h-px w-24" style={{ background: 'linear-gradient(to right, transparent, var(--primary), transparent)' }}></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="p-8 md:p-10 space-y-8 animate-fade-right group hover-lift shadow-2xl rounded-[40px] md:rounded-[48px]" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <div className="space-y-4">
            <h4 className="text-2xl md:text-3xl font-bold tracking-tight text-white border-l-4 border-primary pl-4">Track your vision</h4>
            <p className="text-secondary-text text-sm leading-relaxed">We provide real-time spatial monitoring and reminders to update your design based on your needs.</p>
            <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('products'); }} className="btn-gold px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">Learn more</button>
          </div>
          <div className="pt-4 relative">
            <div className="w-full aspect-square rounded-[32px] md:rounded-[40px] flex items-center justify-center rotate-[-5deg] group-hover:rotate-0 transition-transform overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(207,160,98,0.1)' }}>
              <img src="https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=400" className="w-3/4 drop-shadow-2xl" alt="Design" />
            </div>
          </div>
        </div>

        <div className="rounded-[40px] md:rounded-[48px] p-8 md:p-10 space-y-8 animate-fade-up stagger-1 group hover-lift transition-all border-hover" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <div className="space-y-4">
            <h4 className="text-2xl md:text-3xl font-bold tracking-tight text-white border-l-4 border-primary pl-4">Control spatial data</h4>
            <p className="text-secondary-text text-sm leading-relaxed">A full cycle of diagnostics and layout recommendations from top-tier interior experts.</p>
          </div>
          <div className="relative h-56 md:h-64 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <Box size={100} className="md:size-[120px] rotate-12 animate-rotate-slow" style={{ color: 'rgba(207,160,98,0.12)' }} />
            </div>
            <div className="backdrop-blur-md p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl rotate-[10deg] group-hover:rotate-0 transition-transform" style={{ background: 'rgba(20,19,17,0.85)', border: '1px solid rgba(207,160,98,0.2)' }}>
              <div className="flex gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }}></div>
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--secondary)' }}></div>
              </div>
              <p className="text-[10px] font-bold mb-1 uppercase tracking-tighter" style={{ color: 'rgba(207,160,98,0.4)' }}>OCCUPANCY</p>
              <p className="text-lg md:text-xl font-bold tracking-tight text-primary">84% Efficiency</p>
            </div>
          </div>
        </div>

        <div className="rounded-[40px] md:rounded-[48px] p-8 md:p-10 space-y-8 animate-fade-left group hover-lift transition-all border-hover" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <div className="space-y-4">
            <h4 className="text-2xl md:text-3xl font-bold tracking-tight text-white border-l-4 border-primary pl-4">Design faster</h4>
            <p className="text-secondary-text text-sm leading-relaxed">Get advice, curated moodboards and AR previews instantly from your smartphone.</p>
          </div>
          <div className="rounded-[32px] md:rounded-[40px] p-6 md:p-8 aspect-square relative overflow-hidden" style={{ background: 'rgba(30,28,26,0.4)' }}>
            <Smartphone className="absolute bottom-[-20%] right-[-10%] w-3/4 h-3/4 rotate-[-15deg]" style={{ color: 'rgba(207,160,98,0.08)' }} />
            <div className="absolute top-6 md:top-8 left-6 md:left-8 p-4 rounded-2xl shadow-lg rotate-[-5deg] group-hover:rotate-0 transition-transform" style={{ background: 'rgba(20,19,17,0.9)', border: '1px solid rgba(207,160,98,0.2)' }}>
              <p className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'rgba(207,160,98,0.5)' }}>AI SUGGESTION</p>
              <p className="text-xs md:text-sm font-bold text-text">Cloud Sofa fits here.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const HowItWorks = () => (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-20 animate-fade-up space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(207,160,98,0.6)' }}>The Process</p>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-primary">How it works</h3>
          <div className="flex justify-center"><div className="h-px w-24" style={{ background: 'linear-gradient(to right, transparent, var(--primary), transparent)' }}></div></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="p-8 md:p-12 rounded-[40px] md:rounded-[60px] animate-fade-right space-y-8 md:space-y-10 group" style={{ background: 'rgba(30,28,26,0.5)', border: '1px solid rgba(207,160,98,0.15)', backdropFilter: 'blur(10px)' }}>
            <div className="space-y-4">
              <h4 className="text-3xl md:text-4xl font-serif tracking-tight text-primary">Select your vision</h4>
              <p className="text-text/50 text-sm md:text-base leading-relaxed">Choose styles and dimensions that accurately describe your aesthetic goal.</p>
            </div>
            <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] space-y-4" style={{ background: 'rgba(20,19,17,0.6)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(207,160,98,0.4)' }}>What vision is on your mind?</p>
              <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(20,19,17,0.8)', border: '1px solid rgba(207,160,98,0.15)' }}>
                <Search size={16} style={{ color: 'rgba(207,160,98,0.3)' }} />
                <span className="text-sm font-bold" style={{ color: 'rgba(240,235,225,0.3)' }}>Minimalist |</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-full text-[10px] font-bold cursor-pointer uppercase tracking-widest transition-all hover:scale-105" style={{ background: 'rgba(207,160,98,0.12)', border: '1px solid rgba(207,160,98,0.25)', color: 'var(--primary)' }}>Modern</span>
                <span className="px-4 py-2 rounded-full text-[10px] font-bold cursor-pointer uppercase tracking-widest transition-all hover:scale-105" style={{ background: 'rgba(207,160,98,0.12)', border: '1px solid rgba(207,160,98,0.25)', color: 'var(--primary)' }}>Industrial</span>
              </div>
            </div>
          </div>
          <div className="p-8 md:p-12 rounded-[40px] md:rounded-[60px] animate-fade-left stagger-1 space-y-8 md:space-y-10 group overflow-hidden relative shadow-lg" style={{ background: 'linear-gradient(135deg, var(--secondary), #3D5247)', border: '1px solid rgba(207,160,98,0.2)' }}>
            <div className="space-y-4 relative z-10">
              <h4 className="text-3xl md:text-4xl font-serif tracking-tight text-primary">Describe details</h4>
              <p className="text-text/50 text-sm md:text-base leading-relaxed">Tell us what's going on so we can find the best solution for your floor plan.</p>
            </div>
            <div className="relative flex justify-center h-64 md:h-72">
              <div className="w-full backdrop-blur-md rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col items-center justify-center group-hover:scale-105 transition-transform" style={{ background: 'rgba(20,19,17,0.6)', border: '1px solid rgba(207,160,98,0.1)' }}>
                <LayoutIcon size={80} className="md:size-[100px] rotate-12 mb-6 animate-rotate-slow" style={{ color: 'rgba(207,160,98,0.15)' }} />
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg" style={{ background: 'var(--primary)', color: 'var(--background)' }}>Length</span>
                  <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-sm" style={{ background: 'rgba(30,28,26,0.8)', color: 'var(--text)' }}>Width</span>
                  <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-sm" style={{ background: 'rgba(30,28,26,0.8)', color: 'var(--text)' }}>Elevation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const FEATURES = [
    {
      id: 0,
      icon: <Box size={30} style={{ color: 'var(--background)' }} />,
      iconBg: 'linear-gradient(135deg, var(--primary), var(--accent))',
      cardBg: 'linear-gradient(135deg, var(--secondary), rgba(20,24,32,0.95))',
      cardBorder: 'rgba(193,200,228,0.12)',
      headingColor: 'var(--primary)',
      bodyColor: 'var(--secondary-text)',
      badgeBg: 'rgba(193,200,228,0.1)',
      badgeColor: 'var(--secondary-text)',
      title: '3D Room Builder',
      body: 'Design and visualize your perfect space in real-time with our powerful 3D modeling tools.',
      badge: '2,500+ users',
      cta: 'Try Now',
      ctaBg: 'var(--primary)',
      ctaColor: 'var(--background)',
      tab: 'blueprint' as const,
    },
    {
      id: 1,
      // Light lavender bg — use DARK text for contrast
      icon: <Camera size={30} style={{ color: '#1E2535' }} />,
      iconBg: 'rgba(10,12,16,0.15)',
      cardBg: 'linear-gradient(135deg, var(--accent), var(--primary))',
      cardBorder: 'rgba(10,12,16,0.12)',
      headingColor: '#0F1520',
      bodyColor: '#2A3347',
      badgeBg: 'rgba(10,12,16,0.12)',
      badgeColor: '#2A3347',
      title: 'AR Technology',
      body: 'Visualize furniture in your actual space using augmented reality. See it before you buy it.',
      badge: 'Live & QR Scan',
      cta: 'Experience AR',
      ctaBg: 'rgba(10,12,16,0.85)',
      ctaColor: 'var(--primary)',
      tab: 'ar' as const,
    },
    {
      id: 2,
      icon: <Scale size={30} style={{ color: 'var(--primary)' }} />,
      iconBg: 'rgba(10,12,16,0.4)',
      cardBg: 'linear-gradient(135deg, #2A3E35, var(--secondary))',
      cardBorder: 'rgba(193,200,228,0.1)',
      headingColor: 'var(--primary)',
      bodyColor: 'var(--secondary-text)',
      badgeBg: 'rgba(193,200,228,0.1)',
      badgeColor: 'var(--secondary-text)',
      title: 'Price Comparison',
      body: 'Compare prices across multiple retailers instantly. Get the best deals without leaving the app.',
      badge: 'Save up to 40%',
      cta: 'Compare Prices',
      ctaBg: 'var(--primary)',
      ctaColor: 'var(--background)',
      tab: 'products' as const,
    },
  ];

  const FeaturesSection = () => {
    const [activeFeature, setActiveFeature] = React.useState(0);
    const [direction, setDirection] = React.useState<'left' | 'right'>('right');
    const [isAnimating, setIsAnimating] = React.useState(false);

    const goTo = (idx: number) => {
      if (idx === activeFeature || isAnimating) return;
      setDirection(idx > activeFeature ? 'right' : 'left');
      setIsAnimating(true);
      setTimeout(() => {
        setActiveFeature(idx);
        setIsAnimating(false);
      }, 260);
    };

    const feat = FEATURES[activeFeature];

    return (
    <section className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(193,200,228,0.04) 0%, transparent 70%)' }} />

      {/* Heading */}
      <div className="text-center space-y-4 mb-14 animate-fade-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--gold)' }}>Powerful Tools</p>
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-primary">
          <span className="gradient-text">Revolutionary</span> Features
        </h3>
        <p className="text-base md:text-lg max-w-md mx-auto" style={{ color: 'var(--secondary-text)' }}>
          Experience the future of interior design with our cutting-edge technology.
        </p>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 md:gap-8">
        {FEATURES.map((f, idx) => (
          <div
            key={f.id}
            className="feature-card p-8 md:p-10 rounded-[40px] md:rounded-[48px] space-y-6 group hover-lift shadow-2xl gpu-accelerated"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', animationDelay: `${idx * 0.1}s` }}
          >
            <div
              className="feature-icon w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'rgba(30, 187, 215, 0.1)', border: '1px solid var(--border-accent)', backdropFilter: 'blur(10px)' }}
            >
              {f.icon}
            </div>
            <div className="space-y-3">
              <h4 className="text-2xl font-bold tracking-tight text-white border-l-4 border-primary pl-4">{f.title}</h4>
              <p className="text-sm leading-relaxed text-secondary-text">{f.body}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest bg-primary/10 text-primary">{f.badge}</span>
            </div>
            <button
              onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab(f.tab); }}
              className="w-full py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 btn-gold"
            >
              {f.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Mobile: Single-card slider with liquid-tab dots */}
      <div className="md:hidden">
        {/* Card */}
        <div
          className="p-8 rounded-[40px] space-y-6 shadow-2xl gpu-accelerated"
          style={{
            background: feat.cardBg,
            border: `1px solid ${feat.cardBorder}`,
            // Horizontal slide-and-fade via inline style transition
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating
              ? `translate3d(${direction === 'right' ? '-40px' : '40px'},0,0)`
              : 'translate3d(0,0,0)',
            transition: 'opacity 0.25s cubic-bezier(0.25,1,0.5,1), transform 0.25s cubic-bezier(0.25,1,0.5,1)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: feat.iconBg, backdropFilter: 'blur(10px)' }}
          >
            {feat.icon}
          </div>
          <div className="space-y-3">
            <h4 className="text-2xl font-bold tracking-tight" style={{ color: feat.headingColor }}>
              {feat.title}
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: feat.bodyColor }}>{feat.body}</p>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest" style={{ background: feat.badgeBg, color: feat.badgeColor }}>
            {feat.badge}
          </span>
          <button
            onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab(feat.tab); }}
            className="w-full py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
            style={{ background: feat.ctaBg, color: feat.ctaColor, minHeight: '44px' }}
          >
            {feat.cta}
          </button>
        </div>

        {/* Liquid-tab pagination dots ── stretches to capsule on active */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="liquid-dot transition-all duration-400"
              style={{
                width: activeFeature === i ? '22px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: activeFeature === i ? 'var(--primary)' : 'rgba(193,200,228,0.25)',
                boxShadow: activeFeature === i ? '0 0 8px rgba(193,200,228,0.3)' : 'none',
                transition: 'width 0.45s cubic-bezier(0.175,0.885,0.32,1.275), background 0.3s ease, box-shadow 0.3s ease',
              }}
              aria-label={`Feature ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
    );
  };

  const ProductOfMonth = () => {
    const topProduct = PRODUCTS[0];
    return (
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-16 overflow-hidden relative animate-fade-up" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(207,160,98,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full animate-pulse" style={{ animationDelay: '1s', background: 'radial-gradient(circle, rgba(138,112,76,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
          <div className="absolute inset-0 rounded-[40px] md:rounded-[60px] gold-shimmer opacity-30 pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full product-badge" style={{ background: 'rgba(207,160,98,0.2)', border: '1px solid rgba(207,160,98,0.4)' }}>
                <Star size={14} fill="currentColor" style={{ color: 'var(--primary)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text)' }}>Best Seller - This Month</span>
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight" style={{ color: 'var(--text)' }}>{topProduct?.name || 'Cloud Comfort Sofa'}</h3>
              <div className="flex flex-wrap gap-3">
                {['Premium Quality', 'Free Shipping', 'AR Ready'].map(tag => (
                  <div key={tag} className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(207,160,98,0.15)', border: '1px solid rgba(207,160,98,0.3)', color: 'var(--text)' }}>{tag}</div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={18} fill="currentColor" className="star-rating" style={{ color: 'var(--primary)' }} />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,235,225,0.5)' }}>(128 reviews)</span>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,235,225,0.4)' }}>Key Specifications</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(207,160,98,0.1)', border: '1px solid rgba(207,160,98,0.2)' }}>
                    <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,235,225,0.4)' }}>Dimensions</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>220 x 95 x 85 cm</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(207,160,98,0.1)', border: '1px solid rgba(207,160,98,0.2)' }}>
                    <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,235,225,0.4)' }}>Material</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>Premium Bouclé</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-primary">{topProduct?.price ? `₹${(topProduct.price * 0.8).toLocaleString()}` : '₹45,999'}</p>
                  <p className="text-[10px] line-through text-white/30">₹{topProduct?.price?.toLocaleString() || '57,499'}</p>
                </div>
                <button onClick={() => { if (topProduct) addToCart(topProduct.id); }} className="btn-gold px-8 py-4 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xl">Add to Cart</button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square backdrop-blur-md rounded-[40px] md:rounded-[60px] p-8 md:p-12 flex items-center justify-center animate-float-slow" style={{ background: 'rgba(207,160,98,0.08)', border: '1px solid rgba(207,160,98,0.15)' }}>
                <div className="ripple-ring w-48 h-48" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', position: 'absolute' }}></div>
                <div className="ripple-ring w-48 h-48" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animationDelay: '0.8s', position: 'absolute' }}></div>
                <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800" alt="Product of the Month" className="w-full max-w-md object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10" />
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-badge-pop" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                <span className="text-xs font-black" style={{ color: 'var(--background)' }}>-20%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const ReviewsSection = () => {
    const reviews = [
      { id: 1, name: 'Sarah Mitchell', avatar: 20, rating: 5, text: 'The AR feature is absolutely game-changing! I could see exactly how the sofa would look in my living room. Best furniture shopping experience ever.', location: 'New York, USA' },
      { id: 2, name: 'James Chen', avatar: 25, rating: 5, text: 'The 3D room builder helped me visualize my entire apartment renovation. The precision is incredible and the results matched perfectly.', location: 'San Francisco, USA' },
      { id: 3, name: 'Emma Rodriguez', avatar: 30, rating: 5, text: 'Found amazing deals through the price comparison tool. Saved over ₹15,000 on my order! The quality exceeded my expectations.', location: 'London, UK' },
      { id: 4, name: 'Michael Park', avatar: 35, rating: 4, text: 'Outstanding customer service and the AR visualization is so realistic. Finally bought furniture without any doubt. Highly recommended!', location: 'Toronto, Canada' },
    ];
    return (
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto relative">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-48 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(207,160,98,0.5), transparent)' }}></div>
        <div className="text-center space-y-4 mb-16 md:mb-20 animate-fade-up">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(207,160,98,0.6)' }}>Testimonials</p>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-primary">What Our <span className="gradient-text">Customers</span> Say</h3>
          <p className="text-text/40 text-base md:text-lg max-w-md mx-auto">Join thousands of satisfied customers who transformed their homes with PlanPro.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {reviews.map((review, idx) => (
            <div key={review.id} className={`testimonial-card glass-card p-6 md:p-8 rounded-[32px] md:rounded-[40px] animate-fade-up stagger-${idx + 1}`} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" className="star-rating" style={{ color: 'var(--primary)' }} />
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6">"{review.text}"</p>
              <div className="flex items-center gap-3">
                <img src={`https://i.pravatar.cc/100?img=${review.avatar}`} alt={review.name} className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid var(--border-accent)' }} />
                <div>
                  <p className="text-sm font-bold text-primary">{review.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 md:mt-16 text-center animate-fade-up stagger-5">
          <div className="inline-flex items-center gap-8 px-8 py-5 rounded-full" style={{ background: 'rgba(30,28,26,0.6)', border: '1px solid rgba(207,160,98,0.2)', backdropFilter: 'blur(20px)' }}>
            <div className="flex flex-col items-center gap-1">
              <p className="text-2xl md:text-3xl font-bold text-primary">50k+</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,235,225,0.35)' }}>Happy Customers</p>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(207,160,98,0.25)' }}></div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-2xl md:text-3xl font-bold text-primary">4.9</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (<Star key={i} size={12} fill="currentColor" style={{ color: 'var(--primary)' }} />))}
              </div>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(207,160,98,0.25)' }}></div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-2xl md:text-3xl font-bold text-primary">98%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,235,225,0.35)' }}>Recommendation Rate</p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const Footer = () => (
    <footer className="pt-16 md:pt-20 pb-8 px-4 md:px-6 relative overflow-hidden" style={{ background: 'var(--background)' }}>
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(207,160,98,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full animate-pulse" style={{ animationDelay: '1.5s', background: 'radial-gradient(circle, rgba(138,112,76,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(207,160,98,0.5), transparent)' }}></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 space-y-6 animate-fade-up">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('home'); }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center rotate-[-12deg] group-hover:rotate-0 transition-transform shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                <LayoutIcon size={20} style={{ color: 'var(--background)' }} />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase text-primary">PlanPro</h1>
            </div>
            <p className="text-[10px] md:text-xs leading-relaxed font-bold uppercase tracking-tighter" style={{ color: 'rgba(240,235,225,0.35)' }}>Design, build, and visualize in one single app.</p>
            <div className="flex gap-4">
              <a href="#" className="social-link p-3 rounded-full transition-all" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
                <Instagram size={18} className="text-primary" />
              </a>
              <a href="#" className="social-link p-3 rounded-full transition-all" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
                <Twitter size={18} className="text-primary" />
              </a>
              <a href="#" className="social-link p-3 rounded-full transition-all" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
                <Facebook size={18} className="text-primary" />
              </a>
            </div>
          </div>
          {[
            { title: 'Explore', links: ['Home', 'Collection', 'Architect Tool'] },
            { title: 'Company', links: ['About Us', 'Careers', 'Press'] },
            { title: 'Support', links: ['Help Center', 'Safety', 'Privacy'] }
          ].map((section, idx) => (
            <div key={idx} className={`animate-fade-up stagger-${idx + 1}`}>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6 text-primary">{section.title}</h5>
              <ul className="space-y-3 md:space-y-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/30">
                {section.links.map(link => (
                  <li key={link} onClick={() => { window.history.pushState({}, '', window.location.pathname); if (link === 'Home') setActiveTab('home'); if (link === 'Collection') setActiveTab('products'); if (link === 'Architect Tool') setActiveTab('blueprint'); }} className="cursor-pointer transition-all hover:translate-x-2 inline-block hover:text-primary">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 text-center" style={{ borderTop: '1px solid rgba(207,160,98,0.12)' }}>
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(240,235,225,0.25)' }}>© 2024 PlanPro Design. All Rights Reserved.</p>
        </div>
      </div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50 animate-gold-glow" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
        <ArrowUpRight size={20} style={{ color: 'var(--background)' }} />
      </button>
    </footer>
  );

  if (activeTab === 'ar') {
    return (
      <div className="min-h-screen bg-black overflow-hidden relative">
        <ARPage onBack={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('products'); }} />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Toaster position="top-center" />
      {activeTab !== 'blueprint' && <Navbar />}

      <main className="transition-all duration-700 ease-in-out">
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-1000">
            <Hero />
            <ServicesSection />
            <FeaturesSection />
            <HowItWorks />
            <ProductOfMonth />
            <ReviewsSection />

            {/* Promo Section */}
            <section className="py-16 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
              <div className="overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-center shadow-2xl relative rounded-[40px] md:rounded-[60px]" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #3D5247 50%, #5A3F2B 100%)', border: '1px solid rgba(207,160,98,0.2)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(207,160,98,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full animate-pulse" style={{ animationDelay: '1s', background: 'radial-gradient(circle, rgba(138,112,76,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                <div className="absolute inset-0 gold-shimmer opacity-20 pointer-events-none"></div>
                <div className="p-8 md:p-10 space-y-10 flex flex-col items-center relative z-10">
                  <div className="relative">
                    <Smartphone className="w-56 md:w-64 h-[400px] md:h-[450px]" style={{ color: 'rgba(207,160,98,0.08)' }} />
                    <div className="absolute inset-0 flex items-center justify-center pt-8">
                      <div className="w-40 md:w-48 h-[340px] md:h-[380px] rounded-[28px] md:rounded-[32px] shadow-2xl overflow-hidden p-5 md:p-6 space-y-6 animate-float" style={{ background: 'var(--background)', border: '1px solid rgba(207,160,98,0.2)' }}>
                        <h5 className="font-bold text-[9px] md:text-[10px] uppercase tracking-widest" style={{ color: 'rgba(240,235,225,0.3)' }}>Your Space</h5>
                        <div className="p-3 md:p-4 rounded-xl shadow-sm" style={{ background: 'rgba(207,160,98,0.15)', border: '1px solid rgba(207,160,98,0.25)' }}>
                          <p className="text-[9px] md:text-[10px] font-bold uppercase text-primary">Cloud Sofa</p>
                          <p className="text-[7px] md:text-[8px] font-bold uppercase mt-1" style={{ color: 'rgba(240,235,225,0.35)' }}>Perfect corner fit.</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-7 md:w-8 h-7 md:h-8 rounded-lg" style={{ background: 'rgba(207,160,98,0.12)' }}></div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-10 md:p-16 space-y-6 md:space-y-8 relative z-10">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center shadow-lg animate-float animate-gold-glow" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                    <LayoutIcon size={20} style={{ color: 'var(--background)' }} />
                  </div>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-tight uppercase" style={{ color: 'var(--text)' }}>Design is easy <br />with PlanPro app</h3>
                  <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(240,235,225,0.6)' }}>We're constantly expanding our library of master artisans and growing our team of highly qualified interior planners.</p>
                  <button onClick={() => { window.history.pushState({}, '', window.location.pathname); setActiveTab('products'); }} className="px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl animate-gold-glow" style={{ background: 'var(--primary)', color: 'var(--background)' }}>Get Started</button>
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
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary">Featured Collection</h2>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">

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
                      className={`whitespace-nowrap px-6 md:px-8 py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${selectedCategory === cat ? 'bg-primary border-primary text-[#0F1B2E] shadow-[0_5px_15px_rgba(30,187,215,0.4)] scale-105' : 'bg-[#0F1B2E] border-[#2A3E54] text-white hover:text-primary hover:border-primary'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Dynamic Sub-Category Pills (Appears when a main category is selected) */}
                {selectedCategory !== 'All' && subCategories.length > 0 && (
                  <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-2 px-1">
                      <ChevronDown size={14} className="text-primary/20" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/20">Refine Selection</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {subCategories.map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubcategory(sub)}
                          className={`whitespace-nowrap px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${selectedSubcategory.toLowerCase() === sub.toLowerCase() ? 'bg-primary border-primary text-[#0F1B2E] shadow-[0_5px_15px_rgba(30,187,215,0.3)] scale-105' : 'bg-[#1A2E42] border-[#2A3E54] text-white hover:text-primary hover:border-primary'}`}
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
                  <div className="py-24 md:py-32 text-center space-y-6 bg-background rounded-[40px] md:rounded-[60px] border border-primary/10">
                    <div className="w-16 md:w-20 h-16 md:h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                      <Search size={28} className="md:size-[32px] text-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl md:text-2xl font-serif">No matches found</h4>
                      <p className="text-xs md:text-sm text-black/40 max-w-xs mx-auto">Try refining your search or price filters to find what you're looking for.</p>
                    </div>
                    <button
                      onClick={() => { setSelectedCategory('All'); setSelectedSubcategory('All'); setMaxPrice(50000); setSearchQuery(''); }}
                      className="px-8 py-3 bg-primary text-background rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
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
            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowFilterDrawer(false)} />
            <aside className="relative w-full max-w-md bg-secondary h-full shadow-2xl p-8 md:p-12 flex flex-col justify-between animate-in slide-in-from-right duration-500">
              <div className="space-y-10 md:space-y-12">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl md:text-3xl font-serif text-primary">Advanced Filters</h3>
                  <button onClick={() => setShowFilterDrawer(false)} className="p-3 rounded-full hover:bg-primary/5 transition-all">
                    <X size={24} className="text-primary" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/30">Budget Range</h4>
                    <span className="text-lg md:text-xl font-bold tracking-tighter text-primary">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-primary/5 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-primary/20 uppercase tracking-widest">
                    <span>₹1,000</span>
                    <span>₹50,000+</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/30">Materials</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['Oak Wood', 'Marble', 'Leather', 'Bouclé'].map(m => (
                      <button key={m} className="px-4 py-3 border border-primary/10 rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:border-primary transition-all text-body">
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="w-full py-4 md:py-5 bg-primary text-background rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-2xl hover:bg-primary/80 transition-all"
                >
                  Show {filteredProducts.length} Results
                </button>
                <button
                  onClick={() => { setMaxPrice(3000); setSearchQuery(''); setSelectedCategory('All'); setSelectedSubcategory('All'); }}
                  className="w-full py-4 border border-primary/10 rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-widest text-[9px] md:text-[10px] text-primary/40 hover:text-primary hover:border-primary transition-all"
                >
                  Reset All
                </button>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'blueprint' && (
          <div className="animate-in slide-in-from-right-8 duration-700">
            <BlueprintDesigner 
              wishlist={wishlist} 
              toggleWishlist={toggleWishlist} 
              user={user}
              onBack={() => setActiveTab('products')}
            />
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="pt-24 min-h-screen animate-in fade-in duration-700">
            <CartView
              cart={cart}
              onUpdateQty={updateCartQty}
              onRemove={removeFromCart}
              onCheckout={() => setActiveTab('checkout')}
              onContinueShopping={() => setActiveTab('products')}
            />
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="pt-24 min-h-screen animate-in fade-in duration-700">
            <WishlistView
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onAddToCart={addToCart}
              onViewDetails={openDetails}
              onAR={triggerAR}
              onAI={triggerAI}
              onCompare={triggerCompare}
              onSmartCompare={() => setIsWishlistCompareOpen(true)}
              onContinueShopping={() => setActiveTab('products')}
            />
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="animate-in fade-in duration-700">
            <CheckoutPage
              cart={cart}
              onBack={() => setActiveTab('cart')}
              onConfirm={() => {
                toast.success("Order confirmed!", {
                  description: "Thank you for choosing PlanPro. Your furniture is being prepared.",
                  duration: 5000
                });
                setCart([]);
                setActiveTab('home');
              }}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="pt-24 min-h-screen animate-in fade-in duration-700">
            <UserProfile
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onViewProduct={(product) => {
                setSelectedProduct(product);
                setShowDetails(true);
              }}
              onTabChange={setActiveTab}
            />
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
            onCompare={triggerCompare}
          />
        )}

        {isWishlistCompareOpen && (
          <WishlistComparisonModal
            wishlistIds={wishlist}
            onClose={() => setIsWishlistCompareOpen(false)}
            onViewProduct={(p) => { setSelectedProduct(p); setShowDetails(true); setIsWishlistCompareOpen(false); }}
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
          onClose={() => { setActiveTab('products'); setInitialARViewMode('inspect'); }}
          initialViewMode={initialARViewMode}
        />
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default App;
