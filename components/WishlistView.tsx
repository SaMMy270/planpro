import React from 'react';
import { Heart, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import ProductCard from './ProductCard';

interface WishlistViewProps {
    wishlist: string[];
    onToggleWishlist: (id: string) => void;
    onAddToCart: (id: string) => void;
    onViewDetails: (p: Product) => void;
    onAR: (p: Product) => void;
    onAI: (p: Product) => void;
    onCompare: (p: Product) => void;
    onSmartCompare: () => void;
    onContinueShopping: () => void;
}

const WishlistView: React.FC<WishlistViewProps> = ({
    wishlist, onToggleWishlist, onAddToCart, onViewDetails, onAR, onAI, onCompare, onSmartCompare, onContinueShopping
}) => {
    const wishlistedProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

    if (wishlist.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-8">
                <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center animate-pulse">
                    <Heart size={40} className="text-primary/20" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-text lowercase first-letter:uppercase">Your wishlist is empty</h2>
                    <p className="text-text/40 text-sm max-w-xs mx-auto">Save items you love to your wishlist to keep track of them.</p>
                </div>
                <button
                    onClick={onContinueShopping}
                    className="px-8 py-4 bg-highlight text-background rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                    Explore Collection <ArrowRight size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-12">
            <div className="flex items-center justify-between border-b border-text/10 pb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-serif tracking-tight text-text">Your Wishlist</h2>
                    <p className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em]">Saved Items for later</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSmartCompare}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1754cf] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1754cf]/90 transition-all shadow-lg active:scale-95 group"
                    >
                        <Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> AI Smart Compare
                    </button>
                    <span className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em]">{wishlist.length} Items</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {wishlistedProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProductCard
                                product={product}
                                isWishlisted={true}
                                onToggleWishlist={onToggleWishlist}
                                onAddToCart={onAddToCart}
                                onViewDetails={onViewDetails}
                                onAR={onAR}
                                onAI={onAI}
                                onCompare={onCompare}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex justify-center pt-12">
                <button
                    onClick={onContinueShopping}
                    className="px-8 py-4 border border-text/10 rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-text transition-all flex items-center gap-2"
                >
                    Continue Shopping <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default WishlistView;
