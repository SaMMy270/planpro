import React, { useState, useRef } from 'react';
import { Box, Sparkles, Scale, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAR: (p: Product) => void;
  onAI: (p: Product) => void;
  onCompare: (p: Product) => void;
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onViewDetails: (p: Product) => void;
  isWishlisted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, onAR, onAI, onCompare, onAddToCart, onToggleWishlist, onViewDetails, isWishlisted 
}) => {
  const [isDepressing, setIsDepressing] = useState(false);

  const handleCartClick = () => {
    setIsDepressing(true);
    onAddToCart(product.id);
    setTimeout(() => setIsDepressing(false), 200);
  };

  return (
    <div
      className="group relative rounded-[32px] overflow-hidden border border-[#2A3E54] border-l-[3px] border-l-[#1EBBD7] transition-all duration-500 gpu-accelerated product-card-glow"
      style={{
        background: '#1A2E42',
      }}
      onClick={() => onViewDetails(product)}
    >
      {/* Image area */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer"
        style={{ background: 'rgba(30,37,53,0.5)' }}
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
          {product.arEnabled && (
            <div className="product-badge badge-ar">
              AR AVAILABLE
            </div>
          )}
          {product.priceMatch && (
            <div className="product-badge badge-price-match">
              PRICE MATCHED
            </div>
          )}
        </div>

        {/* Wishlist — 44×44 touch target */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className="touch-target absolute top-3 right-3 p-2.5 rounded-full shadow-lg hover:scale-110 transition-all active:scale-90 z-10"
          style={{
            background: 'rgba(10,12,16,0.82)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(193,200,228,0.1)',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <Heart
            size={17}
            className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
            style={{ color: isWishlisted ? undefined : 'var(--secondary-text)' }}
          />
        </button>

        {/* Quick Actions Overlay — slides up on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        >
          {/* AR Preview — 44px hit target */}
          <button
            onClick={(e) => { e.stopPropagation(); onAR(product); }}
            className="w-12 h-12 rounded-full bg-primary text-[#0F1B2E] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group/btn"
            title="AR Preview"
          >
            <Box size={20} className="group-hover/btn:rotate-12 transition-transform" />
          </button>

          {/* AI Price Comparison — 44px hit target */}
          <button
            onClick={(e) => { e.stopPropagation(); onCompare(product); }}
            className="w-12 h-12 rounded-full bg-[#9D4EDD] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group/btn"
            title="AI Price Comparison"
          >
            <Scale size={20} className="group-hover/btn:-rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div
        className="p-5 space-y-2"
        style={{ background: '#1A2E42' }}
      >
        <div
          className="flex justify-between items-start"
        >
          <div className="flex-1 min-w-0 pr-2">
            <span
              className="text-[10px] uppercase tracking-widest font-semibold block"
              style={{ color: '#B8D4D0' }}
            >
              {product.category}
            </span>
            <h4 className="font-bold text-lg mt-0.5 text-white group-hover:text-primary transition-colors truncate">
              {product.name}
            </h4>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-bold flex-shrink-0 text-primary">
              ₹{product.price.toLocaleString()}
            </span>
            {product.savings && (
              <span className="badge-savings px-2 py-0.5 rounded text-[10px] font-bold mt-1">
                Save {product.savings}%
              </span>
            )}
          </div>
        </div>

        <p className="text-sm line-clamp-2 leading-relaxed text-[#B8D4D0]">
          {product.description}
        </p>

        {/* Add to Collection — New Gold (Teal) CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); handleCartClick(); }}
          className="btn-add-to-collection mt-4 rounded-2xl text-sm font-bold gap-2 shadow-lg transition-all group/atc btn-gold"
          style={{
            minHeight: '44px',
          }}
        >
          <ShoppingCart size={16} className="group-hover/atc:scale-110 transition-transform" />
          Add to Collection
        </button>
      </div>
    </div>
  );
};

export default ProductCard;