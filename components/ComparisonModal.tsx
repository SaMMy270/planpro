
import React, { useState, useEffect } from 'react';
import { X, Scale, ExternalLink, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { geminiService } from '../services/geminiService';
import { comparisonService } from '../services/comparisonService';
import * as PricingCard from './ui/pricing-card';
import { Button } from './ui/button';

interface ComparisonModalProps {
  product: Product;
  onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ product, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ text: string, links: any[] } | null>(null);
  const [localData, setLocalData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Gemini Data
      try {
        const geminiResult = await geminiService.compareProducts(product.name, product.category);
        setData(geminiResult);
      } catch (err) {
        console.error("Gemini comparison failed:", err);
        setData({ text: "Market analysis currently unavailable. Please check your connection or API configuration.", links: [] });
      }

      // Fetch Local Market Data
      try {
        const localResult = await comparisonService.getInterComparison(product.id);
        if (localResult && localResult.rawOutput) {
           const start = localResult.rawOutput.indexOf('JSON_START');
           const end = localResult.rawOutput.indexOf('JSON_END');
           if (start !== -1 && end !== -1) {
              const jsonStr = localResult.rawOutput.substring(start + 10, end).trim();
              setLocalData(JSON.parse(jsonStr));
           }
        }
      } catch (err) {
        console.error("Local market comparison failed:", err);
      }
      
      setLoading(false);
    };
    fetchData();
  }, [product]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 lg:p-14">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-500" onClick={onClose} />
      <div className="relative bg-background w-full max-w-6xl h-full max-h-[85vh] rounded-[40px] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] flex flex-col animate-in zoom-in-95 duration-500 ease-out border border-white/50 ring-1 ring-black/5">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full bg-secondary hover:bg-text hover:text-background backdrop-blur-xl transition-all duration-300 z-50 shadow-sm border border-text/5 group">
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Header */}
          <div className="p-12 lg:p-16 pb-8 bg-background/80 backdrop-blur-2xl border-b border-text/[0.03]">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-6 shadow-sm border border-blue-100/50">
              <Scale size={15} /> Intelligence Comparison
            </div>
            <h3 className="text-4xl lg:text-5xl font-serif text-text/90 leading-tight">Price & Quality Benchmark</h3>
            <p className="text-text/40 text-lg mt-4 max-w-2xl font-light">
              Sophisticated market analysis comparing your <span className="text-text font-medium">{product.name}</span> selection with premium global alternatives.
            </p>
          </div>

          <div className="p-12 lg:p-16 pt-10">
            {loading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary/200 animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 rounded-full bg-primary/200 animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 rounded-full bg-primary/200 animate-bounce"></div>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-text/30">Gathering Intelligence...</p>
              </div>
            ) : (
              <div className="space-y-16">
                {localData && localData.results && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                    {Object.entries(localData.results)
                      .flatMap(([site, matches]: [string, any]) => 
                        (matches as any[]).slice(0, 1).map((m: any) => ({ ...m, site }))
                      )
                      .sort((a: any, b: any) => (b.similarity || 0) - (a.similarity || 0))
                      .map((m: any, idx: number) => (
                        <PricingCard.Card 
                          key={`${m.site}-${idx}`} 
                          className="flex flex-col animate-in fade-in-0 slide-in-from-bottom-4 duration-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-text/[0.03] bg-background rounded-[32px] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group" 
                          style={{ animationDelay: `${idx * 150}ms` }}
                        >
                          <PricingCard.Header className="p-0 border-0 bg-secondary h-[200px] relative overflow-hidden">
                            <img 
                              src={m.imageUrl || 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600'} 
                              alt={m.name} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-md rounded-full border border-text/5 flex items-center gap-1.5 shadow-sm">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                m.site === 'IKEA' ? 'bg-yellow-400' : 
                                m.site === 'Amazon' ? 'bg-orange-400' : 
                                m.site === 'Flipkart' ? 'bg-blue-400' : 'bg-primary'
                              }`} />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text/70">{m.site}</span>
                            </div>
                          </PricingCard.Header>

                          <PricingCard.Body className="p-6 flex flex-col flex-1">
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-text/90 line-clamp-2 min-h-[40px] leading-snug group-hover:text-primary transition-colors">
                                {m.name || `${m.site} Alternative`}
                              </h4>
                            </div>

                            <div className="mb-6">
                              <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-text/20 mb-1">Market Price</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-light text-text/40 font-serif">₹</span>
                                <span className="text-3xl font-serif text-text">{m.price?.toLocaleString() || 'Contact'}</span>
                              </div>
                            </div>

                            <div className="space-y-3 mb-8 flex-1">
                               <div className="flex justify-between items-center py-2 border-b border-text/[0.03]">
                                  <span className="text-[11px] text-text/30 font-medium font-serif">Dimensions</span>
                                  <span className="text-[11px] text-text/70 font-semibold">{m.dimension || 'Standard'}</span>
                               </div>
                               <div className="flex justify-between items-center py-2 border-b border-text/[0.03]">
                                  <span className="text-[11px] text-text/30 font-medium font-serif">Brand Match</span>
                                  <span className="text-[11px] text-text/70 font-semibold">{m.brand || 'Premium'}</span>
                               </div>
                               <div className="flex justify-between items-center py-2 border-b border-text/[0.03]">
                                  <span className="text-[11px] text-text/30 font-medium font-serif">Confidence</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1 bg-black/5 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary/200 rounded-full transition-all duration-1000" 
                                        style={{ width: `${(m.similarity * 100).toFixed(0)}%` }}
                                      />
                                    </div>
                                    <span className="text-[11px] text-primary font-bold">{(m.similarity * 100).toFixed(0)}%</span>
                                  </div>
                               </div>
                            </div>

                            <Button 
                              onClick={() => window.open(m.productUrl, '_blank')}
                              className="w-full h-12 rounded-xl bg-black hover:bg-primary text-white font-bold transition-all duration-300 gap-2 text-xs shadow-lg shadow-background/5"
                            >
                              View Deal <ExternalLink size={14} />
                            </Button>
                          </PricingCard.Body>
                        </PricingCard.Card>
                      ))}
                  </div>
                )}
                
                <div className="space-y-6 pt-10 border-t border-text/[0.05]">
                  <h5 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text/30">Intelligence Data Sources</h5>
                  <div className="flex flex-wrap gap-3">
                    {data?.links?.map((chunk: any, i: number) => {
                      if (!chunk?.web) return null;
                      return (
                        <a 
                          key={`link-${i}`} 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 px-4 py-2 bg-background border border-text/5 rounded-full text-xs font-semibold hover:bg-text hover:text-background transition-all duration-300 shadow-sm"
                        >
                          <span className="opacity-70 group-hover:opacity-100 transition-opacity">{chunk.web.title}</span>
                          <ExternalLink size={12} className="opacity-40 group-hover:opacity-100" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;