
import React, { useState, useEffect } from 'react';
import { X, Scale, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { geminiService } from '../services/geminiService';
import { comparisonService } from '../services/comparisonService';
import * as PricingCard from './ui/pricing-card';
import { Button } from './ui/button';

interface ComparisonModalProps {
  product: Product;
  onClose: () => void;
}

/* ── Neural Pulse Loader ────────────────────────────────────────────────────
   Thin glowing lines that trace/scan the product image instead of a spinner.
   Uses the neuralTraceLine + scanLine keyframes defined in index.css.
   ──────────────────────────────────────────────────────────────────────── */
const NeuralPulseLoader: React.FC<{ productImage: string }> = ({ productImage }) => (
  <div className="py-32 flex flex-col items-center justify-center gap-8">
    {/* Product image with animated scan overlay */}
    <div
      className="relative w-48 h-48 rounded-[28px] overflow-hidden animate-neural-scan shadow-2xl"
      style={{ border: '1px solid rgba(193,200,228,0.15)' }}
    >
      <img
        src={productImage}
        alt="Scanning"
        className="w-full h-full object-cover"
        style={{ filter: 'brightness(0.65) saturate(0.7)' }}
      />
      {/* Neural trace lines overlay */}
      <div className="absolute inset-0 flex flex-col justify-around px-4 py-3 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="neural-line h-px w-full rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(163, 123, 71,${0.5 + i * 0.08}), transparent)`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: '0 0 6px rgba(163, 123, 71,0.4)',
            }}
          />
        ))}
      </div>
      {/* Gold scanning frame */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none"
        style={{ border: '1px solid rgba(163, 123, 71,0.3)', boxShadow: 'inset 0 0 24px rgba(163, 123, 71,0.08)' }}
      />
    </div>

    {/* Status text with animated ellipsis */}
    <div className="text-center space-y-2">
      <p
        className="text-xs font-black uppercase tracking-[0.3em]"
        style={{ color: 'var(--secondary-text)' }}
      >
        Gathering Intelligence
      </p>
      <div className="flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              background: 'var(--gold)',
              animationDelay: `${i * 0.2}s`,
              boxShadow: '0 0 6px var(--gold-glow)',
            }}
          />
        ))}
      </div>
      <p className="text-[10px]" style={{ color: 'rgba(160,170,184,0.5)' }}>
        Scanning market data across retailers…
      </p>
    </div>
  </div>
);

const ComparisonModal: React.FC<ComparisonModalProps> = ({ product, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ text: string; links: any[] } | null>(null);
  const [localData, setLocalData] = useState<any | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCardsVisible(false);

      // Fetch Gemini data
      try {
        const geminiResult = await geminiService.compareProducts(product.name, product.category);
        setData(geminiResult);
      } catch (err) {
        console.error('Gemini comparison failed:', err);
        setData({
          text: 'Market analysis currently unavailable. Please check your connection or API configuration.',
          links: [],
        });
      }

      // Fetch local market data
      try {
        const localResult = await comparisonService.getInterComparison(product.id);
        if (localResult?.rawOutput) {
          const start = localResult.rawOutput.indexOf('JSON_START');
          const end = localResult.rawOutput.indexOf('JSON_END');
          if (start !== -1 && end !== -1) {
            const jsonStr = localResult.rawOutput.substring(start + 10, end).trim();
            setLocalData(JSON.parse(jsonStr));
          }
        }
      } catch (err) {
        console.error('Local market comparison failed:', err);
      }

      setLoading(false);
      // Trigger staggered card reveal after a short delay
      setTimeout(() => setCardsVisible(true), 100);
    };
    fetchData();
  }, [product]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16">
      <div
        className="absolute inset-0 backdrop-blur-md transition-all duration-500"
        style={{ background: 'rgba(139, 86, 51, 0.15)' }}
        onClick={onClose}
      />

      <div
        className="relative w-[95%] max-w-5xl h-full sm:max-h-[85vh] md:max-h-[80vh] sm:rounded-[32px] md:rounded-[48px] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] flex flex-col gpu-accelerated"
        style={{
          background: 'var(--background)',
          border: '1px solid rgba(193,200,228,0.08)',
          animation: 'heroZoomIn 0.45s cubic-bezier(0.25,1,0.5,1) forwards',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full transition-all duration-300 z-50 hover:scale-110 active:scale-90"
          style={{ background: 'var(--secondary)', border: '1px solid rgba(193,200,228,0.1)' }}
        >
          <X size={18} className="hover:rotate-90 transition-transform duration-300" style={{ color: 'var(--primary)' }} />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Header */}
          <div
            className="p-5 sm:p-8 md:p-10 lg:p-14 pb-6 sm:pb-8"
            style={{
              background: 'var(--background)',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-3 sm:mb-5"
              style={{
                background: 'rgba(139, 86, 51, 0.08)',
                border: '1px solid rgba(139, 86, 51, 0.2)',
                color: 'var(--primary)',
              }}
            >
              <Scale size={13} /> Intelligence Comparison
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif" style={{ color: 'var(--primary)' }}>
              Price &amp; Quality Benchmark
            </h3>
            <p className="text-sm sm:text-base mt-2 sm:mt-3 max-w-2xl leading-relaxed" style={{ color: 'var(--secondary-text)' }}>
              Sophisticated market analysis comparing your{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{product.name}</span> with
              premium global alternatives.
            </p>
          </div>

          <div className="p-5 sm:p-8 md:p-10 lg:p-14 pt-6 sm:pt-8">
            {loading ? (
              <NeuralPulseLoader productImage={product.image} />
            ) : (
              <div className="space-y-8 sm:space-y-14">
                {/* ── Benchmark cards — staggered spring reveal ── */}
                {localData?.results && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {Object.entries(localData.results)
                      .flatMap(([site, matches]: [string, any]) =>
                        (matches as any[]).slice(0, 1).map((m: any) => ({ ...m, site }))
                      )
                      .sort((a: any, b: any) => (b.similarity || 0) - (a.similarity || 0))
                      .map((m: any, idx: number) => (
                        <PricingCard.Card
                          key={`${m.site}-${idx}`}
                          className={`flex flex-col rounded-[28px] overflow-hidden group transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${
                            cardsVisible ? 'animate-spring-reveal' : 'opacity-0'
                          }`}
                          style={{
                            background: 'var(--secondary)',
                            border: '1px solid rgba(193,200,228,0.07)',
                            /* 100ms delay per card — staggered */
                            animationDelay: `${idx * 100}ms`,
                          }}
                        >
                          {/* Image */}
                          <PricingCard.Header
                            className="p-0 border-0 h-[180px] relative overflow-hidden"
                            style={{ background: 'var(--background)' }}
                          >
                            <img
                              src={
                                m.imageUrl ||
                                'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600'
                              }
                              alt={m.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Site badge */}
                            <div
                              className="absolute top-3 left-3 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm"
                              style={{
                                background: 'var(--background)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid var(--border-light)',
                              }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background:
                                    m.site === 'IKEA'
                                      ? '#FACC15'
                                      : m.site === 'Amazon'
                                      ? '#FB923C'
                                      : m.site === 'Flipkart'
                                      ? '#60A5FA'
                                      : 'var(--primary)',
                                }}
                              />
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider"
                                style={{ color: 'var(--secondary-text)' }}
                              >
                                {m.site}
                              </span>
                            </div>
                          </PricingCard.Header>

                          <PricingCard.Body className="p-5 flex flex-col flex-1">
                            <div className="mb-4 flex-shrink-0">
                              <h4
                                className="text-sm font-semibold line-clamp-2 leading-snug min-h-[36px] transition-colors group-hover:text-primary"
                                style={{ color: 'var(--text)' }}
                              >
                                {m.name || `${m.site} Alternative`}
                              </h4>
                            </div>

                            <div className="mb-5">
                              <p
                                className="text-[9px] uppercase font-bold tracking-widest mb-1"
                                style={{ color: 'var(--secondary-text)' }}
                              >
                                Market Price
                              </p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-base font-light font-serif" style={{ color: 'var(--secondary-text)' }}>₹</span>
                                <span className="text-2xl font-serif" style={{ color: 'var(--primary)' }}>
                                  {m.price?.toLocaleString() || 'Contact'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2.5 mb-6 flex-1">
                              {[
                                { label: 'Dimensions', value: m.dimension || 'Standard' },
                                { label: 'Brand', value: m.brand || 'Premium' },
                              ].map(({ label, value }) => (
                                <div
                                  key={label}
                                  className="flex justify-between items-center py-2"
                                  style={{ borderBottom: '1px solid rgba(193,200,228,0.06)' }}
                                >
                                  <span className="text-[10px] font-serif" style={{ color: 'var(--secondary-text)' }}>
                                    {label}
                                  </span>
                                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>
                                    {value}
                                  </span>
                                </div>
                              ))}
                              {/* Confidence bar */}
                              <div
                                className="flex justify-between items-center py-2"
                                style={{ borderBottom: '1px solid rgba(193,200,228,0.06)' }}
                              >
                                <span className="text-[10px] font-serif" style={{ color: 'var(--secondary-text)' }}>
                                  Confidence
                                </span>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-14 h-1 rounded-full overflow-hidden"
                                    style={{ background: 'rgba(193,200,228,0.1)' }}
                                  >
                                    <div
                                      className="h-full rounded-full transition-all duration-1000"
                                      style={{
                                        width: `${(m.similarity * 100).toFixed(0)}%`,
                                        background: 'linear-gradient(90deg, var(--gold), #FFA000)',
                                        boxShadow: '0 0 8px rgba(163, 123, 71,0.4)',
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold" style={{ color: 'var(--gold)' }}>
                                    {(m.similarity * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => window.open(m.productUrl, '_blank')}
                              className="w-full h-11 rounded-xl font-bold text-xs gap-2 transition-all duration-300 active:scale-95"
                              style={{
                                background: 'var(--primary)',
                                color: 'var(--background)',
                                boxShadow: '0 4px 16px rgba(163, 123, 71,0.2)',
                              }}
                            >
                              View Deal
                            </Button>
                          </PricingCard.Body>
                        </PricingCard.Card>
                      ))}
                  </div>
                )}

                {/* Data Sources */}
                <div
                  className="space-y-5 pt-8"
                  style={{ borderTop: '1px solid rgba(193,200,228,0.06)' }}
                >
                  <h5
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Intelligence Data Sources
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {data?.links?.map((chunk: any, i: number) => {
                      if (!chunk?.web) return null;
                      return (
                        <a
                          key={`link-${i}`}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 active:scale-95"
                          style={{
                            background: 'var(--secondary)',
                            border: '1px solid rgba(193,200,228,0.08)',
                            color: 'var(--secondary-text)',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(193,200,228,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color = 'var(--secondary-text)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(193,200,228,0.08)';
                          }}
                        >
                          <span>{chunk.web.title}</span>
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
