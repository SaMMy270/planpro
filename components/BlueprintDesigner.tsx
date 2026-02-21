import React, { useState, useRef, useEffect } from 'react';
import { Layout, Move, RotateCw, Plus, Trash2, Save, Sparkles, Loader2, AlertCircle, X, Box, MousePointer2, Info, Star, Maximize } from 'lucide-react';
import { BlueprintItem, Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import html2canvas from 'html2canvas';

const BlueprintDesigner: React.FC = () => {
  const [items, setItems] = useState<BlueprintItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [isScrollableMode, setIsScrollableMode] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const addItem = (type: string) => {
    const newItem: BlueprintItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: isScrollableMode ? 1800 : 300,
      y: isScrollableMode ? 1800 : 300,
      rotation: 0
    };
    setItems([...items, newItem]);
    setSelectedItem(newItem.id);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    if (selectedItem === id) setSelectedItem(null);
  };

  const updateItem = (id: string, updates: Partial<BlueprintItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const initiateExport = () => {
    if (items.length === 0) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmExport = async () => {
    if (!canvasRef.current) return;
    setShowConfirmDialog(false);
    setIsExporting(true);
    setSelectedItem(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        backgroundColor: '#FBFBF9',
        scale: 2,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `PlanPro-Floor-Plan-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export plan:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleProductHover = (e: React.MouseEvent, product: Product) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popupExpectedHeight = 520;
    const margin = 20;
    const safeTop = Math.max(
      margin + 80,
      Math.min(rect.top, window.innerHeight - popupExpectedHeight - margin)
    );
    setPopupPos({ top: safeTop, left: rect.right + 20 });
    setHoveredProduct(product);
  };

  const archModules = [
    { name: 'Living Room', category: 'Architecture', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600&auto=format&fit=crop' },
    { name: 'Bedroom', category: 'Architecture', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop' },
    { name: 'Dining Area', category: 'Architecture', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600&auto=format&fit=crop' },
    { name: 'Suite Studio', category: 'Architecture', image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=600&auto=format&fit=crop' }
  ];

  return (
    <div className="flex h-screen pt-24 bg-[#F5F5F3] overflow-hidden relative">
      {/* Product Info Popup */}
      {hoveredProduct && (
        <div
          className="fixed z-[300] w-[320px] bg-white border border-black/5 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.15)] pointer-events-none animate-in fade-in zoom-in duration-300 flex flex-col overflow-hidden max-h-[85vh]"
          style={{ top: `${popupPos.top}px`, left: `${popupPos.left}px` }}
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5F5F3]">
            <img src={hoveredProduct.image} className="w-full h-full object-cover" alt={hoveredProduct.name} />
          </div>
          <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-[0.3em] text-black/30 font-black block">{hoveredProduct.category}</span>
              <h5 className="font-serif text-2xl leading-tight text-black">{hoveredProduct.name}</h5>
            </div>
            <div className="flex justify-between items-center py-4 border-y border-black/5">
              <span className="text-2xl font-bold tracking-tighter text-black">${hoveredProduct.price}</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="text-[11px] font-black text-black">{hoveredProduct.rating}</span>
              </div>
            </div>
            <p className="text-[11px] text-black/40 leading-relaxed font-medium italic">{hoveredProduct.description}</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside ref={sidebarRef} className="w-80 h-full bg-white border-r border-black/5 flex flex-col z-10 shadow-xl shadow-black/5">
        <div className="p-8 border-b border-black/5">
          <h2 className="text-2xl font-serif text-black/80">Library</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Drag components</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-12 pb-32">
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-1">Spatial Modules</h3>
            <div className="grid grid-cols-2 gap-3">
              {archModules.map(module => (
                <button key={module.name} onClick={() => addItem(module.name)} className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 hover:border-black/20 hover:shadow-lg transition-all">
                  <img src={module.image} className="w-full h-full object-cover brightness-[0.7] group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end p-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white leading-tight">{module.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-1">Furniture Pieces</h3>
            <div className="grid grid-cols-2 gap-3">
              {PRODUCTS.map(p => (
                <button key={p.id} onClick={() => addItem(p.name)} onMouseEnter={(e) => handleProductHover(e, p)} onMouseLeave={() => setHoveredProduct(null)} className="group flex flex-col gap-2">
                  <div className="aspect-square bg-[#F5F5F3] rounded-2xl overflow-hidden border border-black/5 group-hover:border-black transition-all p-3 relative shadow-sm">
                    <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100"><Info size={10} /></div>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black truncate px-1">{p.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-black/5 bg-white/50 sticky bottom-0">
          <div className="bg-[#F5F5F3] p-4 rounded-2xl flex items-center gap-4 border border-black/5">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center"><Layout size={18} /></div>
            <div><p className="text-[10px] font-black text-black uppercase tracking-widest">Active Plan</p></div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Viewport */}
      <main className={`flex-1 relative bg-[#FBFBF9] custom-scrollbar ${isScrollableMode ? 'overflow-auto' : 'overflow-hidden'}`}>

        {/* Floating Controls - Moved down to top-40 to avoid overlap with navbar */}
        <div className="fixed top-40 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl px-8 py-5 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-black/5 flex items-center gap-10 z-[100] animate-fade-up">
          <div className="flex items-center gap-6">
            <h3 className="text-xs font-black tracking-[0.15em] text-black/30 uppercase pr-6 border-r border-black/10">Spatial Canvas</h3>
            <button
              onClick={() => setIsScrollableMode(!isScrollableMode)}
              className={`flex items-center gap-3 px-6 py-2 rounded-full transition-all text-[10px] font-black uppercase tracking-widest ${isScrollableMode ? 'bg-black text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}
            >
              <Maximize size={14} /> {isScrollableMode ? 'Infinite Mode' : 'Fixed View'}
            </button>
          </div>
          <div className="flex items-center gap-8">
            <button
              onClick={initiateExport}
              disabled={isExporting || items.length === 0}
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-black/40 hover:text-black disabled:opacity-20 transition-all"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isExporting ? 'Exporting' : 'Export Plan'}
            </button>
            <button className="px-7 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all">
              <Sparkles size={16} /> AI Optimize
            </button>
          </div>
        </div>

        {/* Static Empty State (Centered in Viewport) */}
        {items.length === 0 && (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-black/10 pointer-events-none animate-fade-up">
            <Layout size={80} strokeWidth={1} className="opacity-40 animate-subtle-bounce" />
            <h2 className="font-serif text-5xl text-black/10 tracking-tight mt-10">Empty Workspace</h2>
            <p className="text-[10px] mt-6 font-black uppercase tracking-[0.4em] text-black/5">Drag modules to begin designing</p>
          </div>
        )}

        {/* Scrollable Canvas Area */}
        <div
          ref={canvasRef}
          className={`relative z-10 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:50px_50px] ${isScrollableMode ? 'w-[4000px] h-[4000px]' : 'w-full h-full'}`}
          onClick={() => setSelectedItem(null)}
        >
          <div className="relative w-full h-full p-20 overflow-visible">
            {items.map(item => (
              <div
                key={item.id}
                onClick={(e) => { e.stopPropagation(); setSelectedItem(item.id); }}
                className={`absolute p-6 border-2 transition-all cursor-move shadow-[0_20px_40px_rgba(0,0,0,0.1)] group/item ${selectedItem === item.id ? 'bg-black text-white border-black scale-105 z-20' : 'bg-white text-black border-black/10'
                  }`}
                style={{ left: item.x, top: item.y, transform: `rotate(${item.rotation}deg)`, minWidth: '200px', borderRadius: '28px' }}
                draggable
                onDragEnd={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    const scrollLeft = canvasRef.current?.parentElement?.scrollLeft || 0;
                    const scrollTop = canvasRef.current?.parentElement?.scrollTop || 0;
                    updateItem(item.id, {
                      x: e.clientX - rect.left + scrollLeft - 100,
                      y: e.clientY - rect.top + scrollTop - 50
                    });
                  }
                }}
              >
                <div className="flex justify-between items-center gap-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate">{item.type}</span>
                  {selectedItem === item.id && (
                    <div className="flex gap-3 animate-in fade-in zoom-in duration-300">
                      <button onClick={(e) => { e.stopPropagation(); updateItem(item.id, { rotation: item.rotation + 45 }) }}><RotateCw size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); removeItem(item.id) }} className="text-red-400"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlueprintDesigner;