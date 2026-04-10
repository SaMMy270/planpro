import React, { useState, useRef, useEffect } from 'react';
import {
  X, QrCode, Smartphone, Scan, Camera, Layers, Plus,
  RotateCw, Maximize2, Trash2, Check, Sparkles, Download,
  ChevronLeft, Layout, Loader2, Cpu, Info, MousePointer2
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import ARScene3D from './ARScene3D';
import Scene3D from './RoomBuilder/Scene3D';

interface PlacedItem {
  instanceId: string;
  product: Product;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface ARPreviewModalProps {
  product: Product;
  onClose: () => void;
  initialViewMode?: 'inspect' | 'live' | 'qr';
}

const ARPreviewModal: React.FC<ARPreviewModalProps> = ({ product, onClose, initialViewMode = 'inspect' }) => {
  const [viewMode, setViewMode] = useState<'inspect' | 'live' | 'qr'>(initialViewMode);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([
    { instanceId: 'init', product, x: 50, y: 50, scale: 1, rotation: 0 }
  ]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>('init');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showStudioOnMobile, setShowStudioOnMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'live' && !isCameraActive) {
      startCamera();
    }
    return () => {
      if (viewMode !== 'live') stopCamera();
    };
  }, [viewMode]);

  const startCamera = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setViewMode('inspect');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const addItemToStage = (p: Product) => {
    const newItem: PlacedItem = {
      instanceId: Math.random().toString(36).substr(2, 9),
      product: p,
      x: 40 + (placedItems.length * 2),
      y: 40 + (placedItems.length * 2),
      scale: 0.8,
      rotation: 0
    };
    setPlacedItems([...placedItems, newItem]);
    setSelectedInstanceId(newItem.instanceId);
  };

  const updateItem = (id: string, updates: Partial<PlacedItem>) => {
    setPlacedItems(items => items.map(item =>
      item.instanceId === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setPlacedItems(items => items.filter(i => i.instanceId !== id));
    if (selectedInstanceId === id) setSelectedInstanceId(null);
  };

  const selectedItem = placedItems.find(i => i.instanceId === selectedInstanceId);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-12">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

      <div className="relative w-full h-full max-w-6xl max-h-[850px] bg-white rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-500">

        {/* Left Panel: Viewport / Visuals */}
        <div className="flex-1 bg-[#F5F5F3] relative overflow-hidden group">
          {viewMode === 'inspect' ? (
            <div className="w-full h-full relative group">
              <ARScene3D product={product} rotation={0} scale={1.5} />
        
      
              {/* Interaction Guide */}
              <div className="absolute bottom-10 left-10 z-10 space-y-2 pointer-events-none group-hover:opacity-0 transition-all duration-700">
                <div className="flex items-center gap-4 py-2 px-5 bg-white/50 backdrop-blur-md rounded-full border border-black/5">
                  <MousePointer2 size={14} className="text-black/40" strokeWidth={3} />
                  <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Orbit & Zoom Active</span>
                </div>
              </div>

              {/* Scanline decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent animate-[scan_4s_linear_infinite] pointer-events-none" />
            </div>
          ) : (
            /* Live Camera View */
            <div className="absolute inset-0 w-full h-full" ref={stageRef}>
              {!isCameraActive && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 bg-[#F5F5F3]">
                  <Loader2 className="animate-spin text-black/10 mb-4" size={40} />
                  <p className="text-[10px] font-black tracking-widest text-black/30 uppercase">Initializing Lenses...</p>
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline className={`absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-opacity duration-1000 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`} />

              {isCameraActive && (
                <div className="absolute inset-0 z-10">
                  {placedItems.map((item) => (
                    <div
                      key={item.instanceId}
                      className={`absolute cursor-move transition-shadow duration-300 ${selectedInstanceId === item.instanceId ? 'z-50' : 'z-20'}`}
                      onPointerDown={() => setSelectedInstanceId(item.instanceId)}
                      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})` }}
                    >
                      <div className="relative">
                        {selectedInstanceId === item.instanceId && (
                          <div className="absolute -inset-4 border border-black/20 rounded-3xl animate-pulse pointer-events-none" />
                        )}
                        <ARScene3D
                          product={item.product}
                          rotation={item.rotation}
                          scale={item.scale}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[150] pointer-events-none">
            <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-black/5 pointer-events-auto shadow-sm">
              <button onClick={() => setViewMode('inspect')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'inspect' ? 'bg-black text-white shadow-lg' : 'text-black/30 hover:text-black'}`}>Inspect</button>
              <button onClick={() => setViewMode('live')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-black text-white shadow-lg' : 'text-black/30 hover:text-black'}`}>Live</button>
            </div>

            {/* Mobile Studio Toggle */}
            <button
              onClick={() => setShowStudioOnMobile(!showStudioOnMobile)}
              className="md:hidden p-3 rounded-full bg-black text-white pointer-events-auto shadow-xl flex items-center gap-2"
            >
              {showStudioOnMobile ? <X size={18} /> : <Plus size={18} />}
              <span className="text-[10px] font-bold uppercase tracking-widest pr-1">
                {showStudioOnMobile ? "Close" : "Items"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Panel: Studio Controls */}
        <div className={`w-full md:w-[400px] md:flex flex-col bg-white z-[200] border-l border-black/5 absolute inset-y-0 right-0 md:relative transition-transform duration-500 ease-in-out ${showStudioOnMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>

          {/* Fixed Header */}
          <div className="p-10 pb-6 flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-3xl font-serif">Spatial Studio</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">BYPASSING QR SYSTEM</p>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-black/5 transition-all active:scale-90">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 space-y-12">
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
                {/* Immediate AR Trigger */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Action Engine</h4>
                   <button
                    onClick={() => {
                        onClose();
                        window.dispatchEvent(new CustomEvent('trigger-ar', { detail: { productId: product.id } }));
                    }}
                    className="w-full py-8 bg-black text-white rounded-[40px] flex flex-col items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl group overflow-hidden relative"
                    >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent group-hover:opacity-50 transition-opacity" />
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                        <Scan size={32} />
                    </div>
                    <div className="text-center">
                        <span className="block text-[11px] font-black uppercase tracking-[0.3em] mb-1">Enter Immersive AR</span>
                        <span className="block text-[9px] text-white/40 uppercase tracking-[0.1em]">Bypass Proxy Handshake</span>
                    </div>
                    </button>
                </div>

                {/* Instructions Unfolded */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Workflow</h4>
                  <div className="space-y-6">
                    {[
                      { step: 1, title: 'Inspect Piece', desc: 'Use the 3D viewer to examine textures and details.' },
                      { step: 2, title: 'Augmented View', desc: 'Switch to Live mode for an on-page camera overlay.' },
                      { step: 3, title: 'Immersive Mode', desc: 'Click Enter Immersive AR for full floor-tracking capability.' }
                    ].map((step) => (
                      <div key={step.step} className="flex items-start gap-4 group">
                        <div className="w-8 h-8 rounded-xl bg-black/5 text-black flex items-center justify-center text-[10px] font-black flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                          {step.step}
                        </div>
                        <div className="pt-1.5">
                          <p className="text-xs font-black text-black uppercase tracking-tight">{step.title}</p>
                          <p className="text-[11px] text-black/40 font-medium leading-relaxed mt-1">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Local Network Info */}
                <div className="p-6 bg-[#F5F5F3] rounded-[32px] border border-black/5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/5">
                        <Cpu size={18} className="text-black/40" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black">Local Node Active</p>
                        <p className="text-[9px] text-black/40 uppercase font-bold mt-0.5">HTTPS Secure Context Verified</p>
                      </div>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARPreviewModal;
