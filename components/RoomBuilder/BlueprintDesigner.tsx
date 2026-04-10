import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Camera, Download, Check, Upload, ChevronLeft, Eye, EyeOff, Menu, Sparkles, Loader2, Box, Star, X, Maximize, Save, Plus, Layout, RotateCw, Trash2, MousePointer2, PanelLeft, PanelLeftClose }
from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { BlueprintItem, Product, RoomData, RoomShape, RoomOpening } from "../../types";
import { PRODUCTS } from "../../data/mockData";
import DesignerRoom from './DesignerRoom';
import html2canvas from 'html2canvas';
import { exportSceneToGLB, uploadToAppScript } from "../../services/exporter";
import { toast } from 'sonner';
import { DimensionSetup, OpeningsSetup } from './RoomSetup';
import { calculateRoomArea, calculateFurnitureArea } from './RoomMath';
import { HexColorPicker } from 'react-colorful';
import { formatArea, toFeetDecimal, toMetersFromDecimal } from "../../services/UnitUtils";

interface BlueprintDesignerProps {
  wishlist: string[];
  toggleWishlist: (id: string) => Promise<void>;
}

const BlueprintDesigner: React.FC<BlueprintDesignerProps> = ({ wishlist, toggleWishlist }) => {
  // --- REFS ---
  const designerRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  // --- STEP STATE ---
  const [step, setStep] = useState<'selection' | 'shape-selection' | 'dimension-setup' | 'openings-setup' | 'ai-flow' | 'ai-validate' | 'designing'>('selection');

  // --- ROOM DATA STATE ---
  const [roomData, setRoomData] = useState<RoomData>({
    shape: 'SQUARE',
    dimensions: { length: 6, width: 4, ceilingHeight: 3 },
    units: 'METERS',
    openings: [],
    wallColor: '#ffffff',
    wallTexture: 'plain',
    floorTexture: 'plain',
    projectTitle: 'Untitled Project'
  });

  const [items, setItems] = useState<BlueprintItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<string>('3D');
  const [placingProduct, setPlacingProduct] = useState<Product | null>(null);

  // --- UI STATE ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'appearance' | 'library'>('appearance');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [aiImages, setAiImages] = useState<File[]>([]);
  const [libraryCategory, setLibraryCategory] = useState<string>('All');
  const [librarySubcategory, setLibrarySubcategory] = useState<string>('All');
  
  // NEW: Integrated Designer States
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showWalls, setShowWalls] = useState(true);

  // --- RESPONSIVE: track viewport width reactively ---
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = windowWidth < 640;

  const categories = useMemo(() => ['All', ...new Set(PRODUCTS.map(p => p.category))], []);

  const subCategories = useMemo(() => {
    if (libraryCategory === 'All') return [];
    const subs = PRODUCTS
      .filter(p => p.category === libraryCategory)
      .map(p => p.subcategory);
    return ['All', ...new Set(subs)];
  }, [libraryCategory]);

  useEffect(() => {
    setLibrarySubcategory('All');
  }, [libraryCategory]);

  const filteredLibraryProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesCategory = libraryCategory === 'All' || p.category === libraryCategory;
      const subcat = p.subcategory || '';
      const matchesSubcategory = librarySubcategory === 'All' || subcat.toLowerCase() === librarySubcategory.toLowerCase();
      return matchesCategory && matchesSubcategory;
    });
  }, [libraryCategory, librarySubcategory]);


  // --- HELPERS ---
  const updateRoom = (updates: Partial<RoomData>) => {
    setRoomData(prev => ({ ...prev, ...updates }));
  };

  const handleUnitToggle = (newUnits: 'METERS' | 'FEET') => {
    setRoomData(prev => ({ ...prev, units: newUnits }));
  };

  const addOpening = (type: 'DOOR' | 'WINDOW') => {
    const newOpening: RoomOpening = {
      type,
      wallIndex: 0,
      offset: 0.5
    };
    updateRoom({ openings: [...roomData.openings, newOpening] });
  };

  const removeOpening = (index: number) => {
    const newOpenings = [...roomData.openings];
    newOpenings.splice(index, 1);
    updateRoom({ openings: newOpenings });
  };

  const updateOpening = (index: number, updates: Partial<RoomOpening>) => {
    const newOpenings = [...roomData.openings];
    newOpenings[index] = { ...newOpenings[index], ...updates };
    updateRoom({ openings: newOpenings });
  };

  const handleWallClick = (_index: number) => {
    // Wall click in the main designer — no tab switch needed
  };

  const handleColorChange = (newColor: string) => {
    updateRoom({ wallColor: newColor });
  };

  const saveToRecentColors = (color: string) => {
    const presets = ['#ffffff', '#E4E4F4', '#FDE7D1', '#F5F5F3', '#000000', '#2d3436', '#636e72', '#b2bec3'];
    if (presets.includes(color.toLowerCase())) return;
    
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 4);
    });
  };

  const addItemToPlacement = (product: Product) => {
    setPlacingProduct(product);
    setSelectedItemId(null);
    setActiveSidebarTab('library');
    setViewMode('TOP');
  };

  const handlePlaceItem = (position: [number, number, number]) => {
    if (!placingProduct) return;

    const newItem: BlueprintItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: placingProduct.name,
      model: placingProduct.model,
      x: position[0],
      y: position[2],
      rotation: 0,
      position: position,
      texture: placingProduct.texture
    };

    setItems([...items, newItem]);
    setSelectedItemId(null);
    setPlacingProduct(null);
    setViewMode('3D');
  };

  const handleImageUpload = (files: FileList) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const newFiles = Array.from(files);
    
    const validFiles = newFiles.filter(file => {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setAiImages(prev => {
        const total = [...prev, ...validFiles];
        if (total.length > 20) {
          toast.error("Maximum 20 images allowed. Keeping first 20.");
          return total.slice(0, 20);
        }
        toast.success(`Added ${validFiles.length} image(s) - Total: ${total.length}/20`);
        return total;
      });
    }
  };

  const handleStitchRoom = async () => {
    if (aiImages.length < 4) {
      toast.error("Please upload at least 4 images (min 4, max 20).");
      return;
    }
    toast.info("Stitching room photos...");

    setIsProcessing(true);
    const formData = new FormData();
    aiImages.forEach(file => formData.append('files', file));

    try {
      const response = await fetch(import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:8000/process-room', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.status === 'success') {
        toast.success("Room stitched successfully!");
        console.log("AI result received:", result);
        updateRoom({
          panoramaUrl: result.panorama_url
        });
        toast.success("Room stitched successfully! Review the 3D twin on the right.");
      } else {
        toast.error(`Processing error: ${result.message}`);
      }
    } catch (error) {
      console.error("AI Processing failed:", error);
      toast.error("Failed to process room. Ensure the AI server is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScreenshot = async () => {
    if (canvasContainerRef.current) {
      const canvas = await html2canvas(canvasContainerRef.current);
      const link = document.createElement('a');
      link.download = `${roomData.projectTitle}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleExportGLB = async () => {
    if (designerRef.current) {
      const scene = designerRef.current.getScene();
      if (scene) {
        await exportSceneToGLB(scene, `${roomData.projectTitle}.glb`);
      }
    }
  };

  const handleProductHover = (e: React.MouseEvent, product: Product) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPos({ top: Math.max(100, rect.top - 100), left: rect.right + 20 });
    setHoveredProduct(product);
  };

  const togglePreview = () => {
    if (isPreviewActive) {
      // Exiting full preview
      setViewMode('3D');
      setIsPreviewActive(false);
    } else {
      // Entering full preview
      setIsPreviewActive(true);
      setSelectedItemId(null); // Clear selection for a cleaner preview
      setIsColorPickerOpen(false);
      setIsBillOpen(false);
    }
  };

  useEffect(() => {
    if (!isPreviewActive && step === 'designing') {
      setActiveSidebarTab('library');
      setIsSidebarOpen(true);   // always show sidebar when entering designer
      setIsColorPickerOpen(false);
      setIsBillOpen(false);
    }
  }, [isPreviewActive, step]);

  const carpetArea = useMemo(() => {
    const totalArea = calculateRoomArea(roomData);
    const furnitureArea = calculateFurnitureArea(items);
    return Math.max(0, totalArea - furnitureArea);
  }, [roomData, items]);

  // --- VIEWS ---

  if (step === 'selection') {
    const initializeManualFlow = () => {
      setItems([]); // Clear any previous items
      setRoomData({
        shape: 'SQUARE',
        dimensions: { length: 6, width: 6 },
        openings: [],
        wallColor: '#ffffff',
        wallTexture: 'plain',
        floorTexture: 'plain',
        projectTitle: 'Untitled Project'
      });
      setStep('shape-selection');
    };

    const initializeAiFlow = () => {
      setItems([]); // Clear any previous items
      setAiImages([]); // Clear previous photos
      setRoomData({
        shape: 'SQUARE',
        dimensions: { length: 6, width: 6 },
        openings: [],
        wallColor: '#ffffff',
        wallTexture: 'plain',
        floorTexture: 'plain',
        projectTitle: 'Untitled Project'
      });
      setStep('ai-flow');
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen md:h-screen w-full pt-24 pb-12 bg-[#FBFBF9] flex flex-col items-center justify-center p-4 sm:p-6 text-black overflow-y-auto md:overflow-hidden relative"
      >
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 border border-black/5 rounded-[40px] overflow-hidden bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)]">
          {/* Manual Designer Side */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-8 sm:p-12 md:p-24 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black/5 group hover:bg-[#FBFBF9] transition-colors duration-700"
          >
            <div className="space-y-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 block">Option 01</span>
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight leading-tight">Manual <br /><span className="font-light">Designer</span></h2>
                <p className="text-black/40 text-sm leading-relaxed max-w-xs">Precision-driven spatial planning. Build your environment from the ground up with custom dimensions and architectural modules.</p>
              </div>
            </div>
            <motion.button
              whileHover={{ x: 10 }}
              onClick={initializeManualFlow}
              className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] group-hover:text-black text-black/40 transition-all mt-12"
            >
              Enter Studio <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          {/* AI Designer Side */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-8 sm:p-12 md:p-24 flex flex-col justify-between bg-black text-white group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Sparkles size={200} strokeWidth={0.5} />
            </div>
            <div className="space-y-8 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 block">Option 02</span>
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight leading-tight">AI Image <br /><span className="font-light text-white/60">Synthesis</span></h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs">Neural reconstruction from photography. Upload your space and let our engine generate a digital twin in seconds.</p>
              </div>
            </div>
            <motion.button
              whileHover={{ x: 10 }}
              onClick={initializeAiFlow}
              className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] group-hover:text-white text-white/40 transition-all mt-12 relative z-10"
            >
              Initialize Flow <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>

        {/* Minimal Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-[9px] font-black uppercase tracking-[0.5em] text-black/10"
        >
          PlanPro Architectural Suite © 2026
        </motion.div>
      </motion.div>
    );
  }

  if (step === 'shape-selection') {
    const shapes = [
      { id: 'SQUARE' as RoomShape, name: 'Square', icon: <div className="w-12 h-12 border border-black/20 rounded-sm" /> },
      {
        id: 'L_SHAPE' as RoomShape, name: 'L-Shaped', icon: (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-black/20 stroke-[1.5]">
            <path d="M10 10V38H38V24H24V10H10Z" />
          </svg>
        )
      },
      {
        id: 'T_SHAPE' as RoomShape, name: 'T-Shaped', icon: (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-black/20 stroke-[1.5]">
            <path d="M10 10H38V24H28V38H20V24H10V10Z" />
          </svg>
        )
      },
      {
        id: 'HEXAGON' as RoomShape, name: 'Hexagon', icon: (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-black/20 stroke-[1.5]">
            <path d="M24 6L39.5885 15V33L24 42L8.41154 33V15L24 6Z" />
          </svg>
        )
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen md:h-screen w-full pt-24 pb-12 bg-[#FBFBF9] flex flex-col items-center justify-center p-4 sm:p-6 text-black overflow-y-auto md:overflow-hidden relative"
      >
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setStep('selection')}
          className="absolute top-24 sm:top-32 left-6 sm:left-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </motion.button>

        <div className="max-w-5xl w-full space-y-12 sm:space-y-24 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 block">Spatial Footprint</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight leading-tight">Select <span className="font-light">Foundation</span></h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12">
            {shapes.map((shape, idx) => (
              <motion.button
                key={shape.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => {
                  updateRoom({ shape: shape.id });
                  setStep('dimension-setup');
                }}
                className="group flex flex-col items-center gap-8"
              >
                <div className="w-full aspect-square rounded-[24px] sm:rounded-[40px] bg-white border border-black/5 flex items-center justify-center group-hover:border-black transition-all duration-500 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)]">
                  <div className="scale-75 sm:scale-100">
                    {shape.icon}
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 group-hover:text-black transition-colors">{shape.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (step === 'ai-flow') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#FBFBF9] overflow-hidden pt-20"
      >
        {/* Left Sidebar - Studio Controls */}
        <div className="w-full lg:w-[400px] shrink-0 h-full bg-white flex flex-col p-6 lg:p-8 border-r border-black/5 shadow-[20px_0_40px_rgba(0,0,0,0.02)] z-20">
          <button 
            onClick={() => setStep('selection')}
            className="flex items-center gap-3 text-black/30 hover:text-black mb-4 lg:mb-6 transition-all text-[10px] font-black uppercase tracking-[0.2em] group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Selection
          </button>

          <div className="space-y-4 lg:space-y-6 flex-1 min-h-0 overflow-y-auto no-scrollbar pt-1">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif tracking-tight text-black">AI Room Generation</h2>
            </div>
            
            <div className="space-y-5">
              {/* Ceiling Height */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Ceiling Height</label>
                <div className="relative group w-full">
                  <input 
                    type="number" 
                    min={0}
                    step="0.1"
                    value={(() => {
                      const val = roomData.dimensions.ceilingHeight || 0;
                      if (val === 0) return '';
                      return roomData.units === 'FEET' ? toFeetDecimal(val) : val;
                    })()}
                    onChange={(e) => {
                      let val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                      if (roomData.units === 'FEET') val = toMetersFromDecimal(val);
                      updateRoom({ dimensions: { ...roomData.dimensions, ceilingHeight: val } });
                    }}
                    className="w-full bg-[#F5F5F3] border border-black/5 rounded-2xl h-11 px-5 font-bold text-black text-sm outline-none focus:bg-white focus:border-black/20 transition-all"
                    placeholder="2.5"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/20">{roomData.units === 'FEET' ? 'FT' : 'M'}</span>
                </div>
              </div>
  
              {/* Wall Measurements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Wall Measurements</p>
                  <div className="flex items-center bg-[#F5F5F3] border border-black/5 rounded-full p-1">
                    <button 
                      onClick={() => handleUnitToggle('METERS')} 
                      className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-full transition-all ${roomData.units !== 'FEET' ? 'bg-white text-black shadow-sm' : 'text-black/30 hover:text-black/60'}`}
                    >
                      M
                    </button>
                    <button 
                      onClick={() => handleUnitToggle('FEET')} 
                      className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-full transition-all ${roomData.units === 'FEET' ? 'bg-white text-black shadow-sm' : 'text-black/30 hover:text-black/60'}`}
                    >
                      FT
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {['Front Wall', 'Right Wall', 'Back Wall', 'Left Wall'].map((wall, i) => (
                    <div key={wall} className="p-2.5 bg-[#F5F5F3] rounded-[20px] border border-black/5 group hover:bg-white hover:border-black/10 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em] w-14 shrink-0">{wall}</span>
                        
                        <div className="flex-1 flex items-center gap-2.5">
                          <div className="relative w-24 shrink-0">
                            <input 
                              type="number" 
                              min={0}
                              step="0.1"
                              onFocus={(e) => e.target.select()}
                              value={(() => {
                                const val = i % 2 === 0 ? roomData.dimensions.width : roomData.dimensions.length;
                                if (!val || val === 0) return '';
                                return roomData.units === 'FEET' ? toFeetDecimal(val) : val;
                              })()}
                              onChange={(e) => {
                                let val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                                if (roomData.units === 'FEET') val = toMetersFromDecimal(val);
                                
                                if (i % 2 === 0) updateRoom({ dimensions: { ...roomData.dimensions, width: val } });
                                else updateRoom({ dimensions: { ...roomData.dimensions, length: val } });
                              }}
                              className="w-full h-11 bg-white border border-black/5 rounded-xl text-sm font-bold text-black outline-none focus:border-black/20 text-center"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-black/10">{roomData.units === 'FEET' ? 'FT' : 'M'}</span>
                          </div>

                          <label className="flex-1 h-11 flex items-center justify-center gap-2 bg-black text-white rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-black/5 hover:bg-zinc-900 group-hover:bg-zinc-900">
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleImageUpload(e.target.files);
                                  e.target.value = '';
                                }
                              }} 
                            />
                            <Camera size={12} className="opacity-60" /> 
                            <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">Upload Images</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="px-6 py-3 bg-[#F5F5F3] rounded-2xl border border-black/5 flex items-center justify-between">
                <span className="text-xs font-bold text-black">{aiImages.length} Photos Recorded</span>
              </div>

              {!roomData.panoramaUrl ? (
                <button 
                  onClick={handleStitchRoom}
                  disabled={isProcessing || aiImages.length < 4}
                  className="w-full py-4 bg-black text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-black/10 hover:bg-black/80 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-black/5 disabled:text-black/20 disabled:scale-100"
                >
                  {isProcessing ? <Loader2 className="animate-spin text-white/40" size={18} /> : <Sparkles size={18} />}
                  {aiImages.length < 4 ? `Upload ${4 - aiImages.length} More Photos` : 'Generate 3D Twin'}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setStep('designing');
                      setActiveSidebarTab('library');
                    }}
                    className="w-full py-4 bg-black text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-black/10 hover:bg-black/80 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    Enter 3D Studio <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => updateRoom({ panoramaUrl: undefined })}
                    className="w-full py-3 bg-black/5 hover:bg-black/10 text-black rounded-[28px] font-black text-[9px] uppercase tracking-widest transition-all"
                  >
                    Clear Results & Re-Stitch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Viewport */}
        <div className="flex-1 relative bg-[#F5F5F3] flex flex-col items-center justify-center p-12 lg:p-24 overflow-hidden">
          {/* Decorative Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="w-full h-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:60px_60px]"></div>
          </div>

          {roomData.panoramaUrl ? (
            <div className="relative z-10 w-full h-full bg-black/5 rounded-[40px] overflow-hidden border border-black/10 backdrop-blur-sm p-2 group">
              <DesignerRoom
                roomData={roomData}
                items={[]}
                setItems={() => { }}
                viewMode="3D"
              />
              <div className="absolute top-8 left-8 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-black/5 shadow-xl">
                 <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Live Reconstruction</p>
                 <p className="text-[8px] font-medium text-black/40">AI-Synthesized environment from {aiImages.length} frames</p>
              </div>
              <div className="absolute top-8 right-8 flex gap-2">
                 <div className="px-4 py-2 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                    <Check size={12} /> Stitched
                 </div>
              </div>
            </div>
          ) : aiImages.length === 0 ? (
            <div className="relative z-10 w-full max-w-2xl space-y-20">
              <div className="space-y-6">
                <h3 className="text-4xl sm:text-5xl font-serif text-black leading-tight">Neural Reconstruction Requirements</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                {[
                  { title: "ORIENTATION", desc: "Photos can be captured in landscape or horizontal orientation." },
                  { title: "VOLUME", desc: "Upload a minimum of 4 and maximum of 20 photos for optimal results." },
                  { title: "OVERLAP", desc: "Include images of the corners of the room to ensure accurate alignment." },
                  { title: "POSITION", desc: "Shoot all photos while standing consistently in the same central spot." }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[10px] font-bold text-black/20">{idx + 1}</div>
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">{item.title}</span>
                    </div>
                    <p className="text-sm text-black/40 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-10 flex items-center gap-6">
                <div className="px-5 py-2.5 bg-white border border-black/5 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest text-black/40 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  AI Reconstruction Engine Active
                </div>
                <p className="text-[10px] font-serif italic text-black/30">Pro Tip: Higher coverage results in deeper model accuracy.</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 w-full h-full flex flex-col pt-10 px-10">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h3 className="text-3xl font-serif text-black">Captured Environment</h3>
                  <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">{aiImages.length} Images Recorded</p>
                </div>
                <button 
                  onClick={() => setAiImages([])}
                  className="px-6 py-3 bg-black/5 hover:bg-black/10 text-black rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Clear Session
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto no-scrollbar pb-20">
                <AnimatePresence>
                  {aiImages.map((file, idx) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <motion.div 
                        key={file.name + idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="aspect-[4/5] relative group bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm"
                      >
                        <img 
                          src={url} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          onLoad={() => URL.revokeObjectURL(url)}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button 
                          onClick={() => setAiImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-4 right-4 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                        >
                          <X size={18} />
                        </button>
                      </motion.div>
                    );
                  })}
                  
                  {aiImages.length < 20 && (
                    <label className="aspect-[4/5] border-2 border-dashed border-black/10 rounded-3xl flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-black/20 hover:bg-black/[0.02] transition-all group">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      />
                      <div className="w-20 h-20 bg-black/[0.02] group-hover:bg-black group-hover:text-white rounded-full flex items-center justify-center transition-all shadow-xl shadow-black/5">
                        <Plus size={32} />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="text-[12px] font-black text-black uppercase tracking-[0.2em] group-hover:text-black">Add Frame</span>
                        <p className="text-[9px] font-medium text-black/30">Capture more angles</p>
                      </div>
                    </label>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {/* Subtle Corner Accents */}
          <div className="absolute top-12 right-12 w-32 h-32 border-t border-r border-black/5" />
          <div className="absolute bottom-12 left-12 w-32 h-32 border-b border-l border-black/5" />
        </div>
      </motion.div>
    );
  }



  if (step === 'dimension-setup') {
    return (
      <div className="w-full min-h-[calc(100dvh-72px)] pt-20 bg-[#FBFBF9]">
        <DimensionSetup
          data={roomData}
          onUpdate={updateRoom}
          onNext={() => setStep('openings-setup')}
          onBack={() => setStep('shape-selection')}
        />
      </div>
    );
  }

  if (step === 'openings-setup') {
    return (
      <div className="w-full min-h-[calc(100dvh-72px)] pt-20 bg-[#FBFBF9]">
        <OpeningsSetup
          data={roomData}
          onUpdate={updateRoom}
          onNext={() => {
            setStep('designing');
            setActiveSidebarTab('library');
          }}
          onBack={() => setStep('dimension-setup')}
        />
      </div>
    );
  }

  const handleSaveProject = async () => {
    const saveToast = toast.loading("Initializing save process...");
    try {
      const APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
      if (!APPSCRIPT_URL) throw new Error("VITE_APPSCRIPT_URL is missing.");
      const timestamp = Date.now();
      const projectTitle = roomData.projectTitle || 'Project';

      // 1. Capture Thumbnail
      if (canvasContainerRef.current) {
        toast.loading("Capturing workspace preview...", { id: saveToast });
        const canvas = await html2canvas(canvasContainerRef.current, { 
          useCORS: true, 
          allowTaint: true,
          backgroundColor: '#FBFBF9',
          ignoreElements: (element) => element.tagName === 'ASIDE' || element.classList.contains('z-[100]')
        });
        const pngData = canvas.toDataURL('image/png');
        const blob = await (await fetch(pngData)).blob();
        await uploadToAppScript(blob, `Preview_${projectTitle}_${timestamp}.png`, 'image/png');
      }

      // 2. Export 3D Model
      if (designerRef.current) {
        toast.loading("Processing 3D Scene...", { id: saveToast });
        const scene = designerRef.current.getScene();
        if (scene) await exportSceneToGLB(scene, `${projectTitle}_${timestamp}.glb`);
      }

      // 3. Upload AI Source Images
      if (aiImages && aiImages.length > 0) {
        toast.loading(`Uploading ${aiImages.length} source images...`, { id: saveToast });
        for (const imgFile of aiImages) {
          await uploadToAppScript(imgFile, `Source_${timestamp}_${imgFile.name}`, imgFile.type);
        }
      }

      toast.success("Project saved successfully!", { id: saveToast });
    } catch (err) {
      console.error("Save failure:", err);
      toast.error(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`, { id: saveToast });
    }
  };

  // --- DESIGNER VIEW ---
  return (
    <div className="flex flex-col h-screen w-full bg-[#F5F5F3] overflow-hidden relative">
      <AnimatePresence>
        {hoveredProduct && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed z-[300] w-[320px] bg-white border border-black/5 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.15)] pointer-events-none flex flex-col overflow-hidden max-h-[85vh]"
            style={{ top: `${popupPos.top}px`, left: `${popupPos.left}px` }}
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5F5F3]">
              <img
                src={hoveredProduct.image}
                className="w-full h-full object-cover"
                alt={hoveredProduct.name}
              />
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-[0.3em] text-black/30 font-black block">
                  {hoveredProduct.category}
                </span>
                <h5 className="font-serif text-2xl leading-tight text-black">
                  {hoveredProduct.name}
                </h5>
              </div>
              <div className="flex justify-between items-center py-4 border-y border-black/5">
                <span className="text-2xl font-bold tracking-tighter text-black">
                  ${hoveredProduct.price}
                </span>
                <div className="flex items-center gap-1.5 bg-black/5 px-3 py-1.5 rounded-full">
                  <Star size={10} className="fill-black text-black" />
                  <span className="text-[10px] font-black">{hoveredProduct.rating}</span>
                </div>
              </div>
              <p className="text-[11px] text-black/40 leading-relaxed font-medium italic">
                {hoveredProduct.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-4 sm:px-8 z-[100]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setStep('selection')}
            className="p-1.5 sm:p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Sidebar toggle — always visible on all screen sizes */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1.5"
            title={isSidebarOpen ? 'Hide Panel' : 'Show Panel'}
          >
            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          <div className="flex flex-col min-w-0">
            {isEditingTitle ? (
              <input
                autoFocus
                className="text-sm sm:text-lg md:text-xl font-serif border-b border-black/20 focus:outline-none bg-transparent truncate"
                value={roomData.projectTitle}
                onBlur={() => setIsEditingTitle(false)}
                onChange={(e) => updateRoom({ projectTitle: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              />
            ) : (
              <h2
                className="text-sm sm:text-lg md:text-xl font-serif flex items-center gap-1 sm:gap-2 cursor-pointer truncate"
                onClick={() => setIsEditingTitle(true)}
              >
                <span className="truncate">{roomData.projectTitle}</span>
                <span className="text-[10px] opacity-20 flex-shrink-0">✏️</span>
              </h2>
            )}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-black/30 whitespace-nowrap">
                Carpet Area:
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-black/60 whitespace-nowrap">
                {formatArea(carpetArea, roomData.units === 'METERS' ? 'METRIC' : 'IMPERIAL')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-4">
          <button
            className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
              isPreviewActive
                ? 'bg-black text-white shadow-xl'
                : 'bg-black/5 text-black hover:bg-black/10'
            }`}
            onClick={togglePreview}
          >
            <span className="sm:hidden">{isPreviewActive ? '' : ''}</span>
            <span className="hidden sm:inline">{isPreviewActive ? ' Exit Preview' : ' Full Preview'}</span>
          </button>

          <div className="w-px h-6 bg-black/10" />

          <div className="hidden sm:flex items-center gap-2 bg-black/5 p-1 rounded-full">
            <button
              onClick={() => setViewMode('TOP')}
              className={`p-2.5 rounded-full transition-all ${
                viewMode === 'TOP' 
                  ? 'bg-black text-white shadow-lg' 
                  : 'text-black/40 hover:text-black hover:bg-black/5'
              }`}
              title="Blueprint View"
            >
              <Maximize size={16} />
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`p-2.5 rounded-full transition-all ${
                viewMode === '3D' 
                  ? 'bg-black text-white shadow-lg' 
                  : 'text-black/40 hover:text-black hover:bg-black/5'
              }`}
              title="Perspective View"
            >
              <Box size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-black/10 mx-2" />

          <button
            onClick={() => setShowWalls(!showWalls)}
            className={`p-2 sm:p-2.5 rounded-full transition-all flex items-center gap-1 sm:gap-2 ${
              showWalls 
                ? 'bg-black text-white shadow-lg' 
                : 'bg-black/5 text-black hover:bg-black/10'
            }`}
            title={showWalls ? "Hide Walls" : "Show Walls"}
          >
            {showWalls ? <Eye size={16} className="sm:w-[18px] sm:h-[18px]" /> : <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" />}
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest pr-1 hidden sm:inline">Walls</span>
          </button>

          <button
            onClick={handleExportGLB}
            className="p-2 sm:p-3 bg-black text-white rounded-full hover:scale-110 transition-transform shadow-lg"
          >
            <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {!isPreviewActive && isSidebarOpen && (
          <aside
            key="designer-sidebar"
            style={isMobile ? { width: '100%', height: 'auto', maxHeight: '420px' } : { width: '450px' }}
            className={`fixed z-[150] bg-white border-black/5 flex flex-col overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-t-[2.5rem] lg:rounded-none lg:shadow-2xl ${
              isMobile 
                ? `bottom-0 left-0 border-t ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full opacity-0'}` 
                : `top-20 bottom-0 left-0 border-r ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full opacity-0'}`
            }`}
          >
              {/* Color Picker Overlay - Integrated into Sidebar */}
              <AnimatePresence>
                {isColorPickerOpen && (
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-[100] bg-white flex flex-col p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30">Color Studio</span>
                        <h3 className="text-xl font-serif mt-1">Wall Palette</h3>
                      </div>
                      <button 
                        onClick={() => {
                          saveToRecentColors(roomData.wallColor);
                          setIsColorPickerOpen(false);
                        }}
                        className="p-3 hover:bg-black/5 rounded-full transition-all group"
                      >
                        <X size={20} className="text-black/30 group-hover:text-black" />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center space-y-10">
                      <div className="relative group">
                        <div className="absolute -inset-4 bg-black/5 rounded-[48px] blur-xl group-hover:bg-black/10 transition-all" />
                        <HexColorPicker 
                          color={roomData.wallColor} 
                          onChange={handleColorChange} 
                          style={{ width: '280px', height: '280px' }}
                          className="relative"
                        />
                      </div>

                      <div className="w-full grid grid-cols-2 gap-4">
                        <div className="bg-black/[0.02] border border-black/5 rounded-[32px] p-6 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-black uppercase tracking-widest text-black/20 mb-3">Live Result</span>
                          <div className="w-14 h-14 rounded-full border-4 border-white shadow-2xl" style={{ backgroundColor: roomData.wallColor }} />
                        </div>
                        <div className="bg-black/[0.02] border border-black/5 rounded-[32px] p-6 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-black uppercase tracking-widest text-black/20 mb-3">Hex Pattern</span>
                          <span className="text-xs font-bold tracking-tight text-black/80">{roomData.wallColor.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        saveToRecentColors(roomData.wallColor);
                        setIsColorPickerOpen(false);
                      }}
                      className="w-full mt-10 py-6 rounded-[28px] bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20"
                    >
                      Apply Selection
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* ── Menu-style tab navigation ── */}
              <div className="px-5 pt-4 pb-2 border-b border-black/[0.1] flex items-center justify-between lg:justify-start gap-4 sticky top-0 bg-white z-[60]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSidebarTab('appearance')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      activeSidebarTab === 'appearance'
                        ? 'bg-black text-white border-black shadow-xl shadow-black/20'
                        : 'bg-transparent text-black/40 border-black/5 hover:border-black/20'
                    }`}
                  >
                    <Layout size={12} />
                    Appearance
                  </button>
                  <button
                    onClick={() => setActiveSidebarTab('library')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      activeSidebarTab === 'library'
                        ? 'bg-black text-white border-black shadow-xl shadow-black/20'
                        : 'bg-transparent text-black/40 border-black/5 hover:border-black/20'
                    }`}
                  >
                    <Box size={12} />
                    Library
                  </button>
                </div>

                {isMobile && (
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-3 bg-black/5 rounded-full text-black/20 hover:text-black transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className={`flex-1 ${isMobile ? 'overflow-x-auto min-h-[180px]' : 'overflow-y-auto'} custom-scrollbar px-5 py-6 space-y-8 lg:space-y-6 pb-24`}>
                <AnimatePresence>
                  {/* Selection Panel Removed from here, moved to Header */}
                </AnimatePresence>

                {activeSidebarTab === 'appearance' && (
                  <div className={`flex ${isMobile ? 'flex-row items-start gap-12 pb-4' : 'flex-col space-y-8'}`}>
                    <section className="space-y-4 shrink-0">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-black/20" />
                        Wall Color
                      </h4>
                      <div className={`grid ${isMobile ? 'grid-flow-col grid-rows-2' : 'grid-cols-6'} gap-3`}>
                        {(() => {
                          const presets = [
                            '#ffffff', '#E4E4F4', '#FDE7D1', '#F5F5F3', '#000000', '#2d3436', '#636e72', '#b2bec3'
                          ];
                          const isCustom = !presets.includes(roomData.wallColor);
                          
                          return (
                            <>
                              {presets.map((col) => (
                                <button
                                  key={col}
                                  onClick={() => updateRoom({ wallColor: col })}
                                  className={`aspect-square rounded-full border-2 transition-all ${
                                    roomData.wallColor === col
                                      ? 'border-black scale-110 shadow-lg shadow-black/5'
                                      : 'border-black/5'
                                  }`}
                                  style={{ backgroundColor: col }}
                                />
                              ))}

                              {/* Recent Colors Slots */}
                              {[0, 1, 2, 3].map((idx) => {
                                const col = recentColors[idx];
                                return (
                                  <button
                                    key={`recent-${idx}`}
                                    onClick={() => col && updateRoom({ wallColor: col })}
                                    className={`aspect-square rounded-full border-2 transition-all ${
                                      col && roomData.wallColor === col
                                        ? 'border-black scale-110 shadow-lg shadow-black/5'
                                        : 'border-black/5'
                                    } flex items-center justify-center ${!col ? 'border-dashed border-black/10 bg-black/[0.02]' : ''}`}
                                    style={{ backgroundColor: col || 'transparent' }}
                                  >
                                    {!col && <div className="w-1.5 h-1.5 rounded-full bg-black/10" />}
                                  </button>
                                );
                              })}

                              {/* Custom Color Picker Button */}
                              <button
                                onClick={() => setIsColorPickerOpen(true)}
                                className={`aspect-square rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center overflow-hidden ${
                                  isCustom ? 'border-black shadow-lg shadow-black/10' : 'border-black/5 bg-black/5'
                                }`}
                                style={{ backgroundColor: isCustom ? roomData.wallColor : undefined }}
                              >
                                <Plus 
                                  size={14} 
                                  className={`transition-colors ${isCustom ? (['#ffffff','#FBFBF9','#F5F5F3'].includes(roomData.wallColor.toLowerCase()) ? 'text-black' : 'text-white') : 'text-black/30'}`} 
                                />
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </section>
                    <section className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-black/30">
                        Wall Materials
                      </h4>
                      <div className="flex gap-2 p-1 bg-black/5 rounded-2xl">
                        {['plain', 'brick', 'concrete', 'plaster'].map((mat) => (
                          <button
                            key={mat}
                            onClick={() => updateRoom({ wallTexture: mat as any })}
                            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              roomData.wallTexture === mat
                                ? 'bg-black text-white shadow-lg'
                                : 'text-black/40 hover:text-black'
                            }`}
                          >
                            {mat}
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-black/30">
                        Floor Materials
                      </h4>
                      {['plain', 'wood', 'tiles'].map((mat) => (
                        <button
                          key={mat}
                          onClick={() => updateRoom({ floorTexture: mat as any })}
                          className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${
                            roomData.floorTexture === mat
                              ? 'bg-black text-white border-black'
                              : 'bg-white border-black/5 text-black'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {mat}
                          </span>
                          {roomData.floorTexture === mat && <Check size={16} />}
                        </button>
                      ))}
                    </section>

                    {/* Manipulation controls moved to top level */}
                  </div>
                )}

                {activeSidebarTab === 'library' && (
                  <div className={`flex ${isMobile ? 'flex-row items-center gap-8' : 'flex-col gap-6'}`}>
                    {/* Categories UI */}
                    <div className={`space-y-4 ${isMobile ? 'w-48 shrink-0' : ''}`}>
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">Collections</h4>
                        {!isMobile && <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest">{filteredLibraryProducts.length} Items</span>}
                      </div>
                      
                      <div className="relative group/select">
                        <select
                          value={libraryCategory}
                          onChange={(e) => setLibraryCategory(e.target.value)}
                          className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer transition-all hover:bg-black/10"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black/20">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>

                      {libraryCategory !== 'All' && subCategories.length > 1 && !isMobile && (
                        <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
                          {subCategories.map(sub => (
                            <button
                              key={sub}
                              onClick={() => setLibrarySubcategory(sub)}
                              className={`whitespace-nowrap px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${librarySubcategory.toLowerCase() === sub.toLowerCase() ? 'bg-black text-white shadow-lg' : 'bg-white/50 border-black/5 text-black/30 hover:text-black hover:border-black/20'}`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={`grid ${isMobile ? 'grid-flow-col grid-rows-2 auto-cols-[80px]' : 'grid-cols-3'} gap-3 overflow-x-auto no-scrollbar`}>
                      {filteredLibraryProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addItemToPlacement(p)}
                          onMouseEnter={(e) => handleProductHover(e, p)}
                          onMouseLeave={() => setHoveredProduct(null)}
                          className="aspect-square group bg-[#F5F5F3] rounded-2xl p-3 hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all relative border border-transparent hover:border-black/5 overflow-hidden"
                        >
                          <img
                            src={p.image}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            alt={p.name}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus size={20} className="text-white scale-75 group-hover:scale-100 transition-transform" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!isMobile && (
                <div className="p-8 border-t border-black/5 bg-white">
                  <button 
                    onClick={() => setIsBillOpen(true)}
                    className="w-full relative group mb-6 overflow-hidden bg-[#F5F5F3] hover:bg-black transition-all duration-500 rounded-[32px] p-6 text-left"
                  >
                    <div className="flex justify-between items-start mb-1 relative z-10 transition-colors duration-500 group-hover:text-white">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-60 transition-opacity">
                          Statement Total
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black/5 group-hover:bg-white/10 rounded-full transition-colors">
                            {items.length} Items
                          </span>
                        </div>
                      </div>
                      <span className="text-3xl font-bold tracking-tighter">
                        ${items.reduce((acc, it) => acc + (PRODUCTS.find((p) => p.name === it.type)?.price || 0), 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-[9px] font-black uppercase tracking-widest text-black/20 group-hover:text-white/40 relative z-10 transition-colors duration-500">
                      <Layout size={12} />
                      <span>Click to view detailed receipt</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </button>
                  <button
                    onClick={handleSaveProject}
                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Save Project
                  </button>
                </div>
              )}
            </aside>
        )}

        <section
          className="w-full mt-20 bg-[#F5F5F3] relative transition-all duration-500"
          style={isPreviewActive
            ? { height: '100%', marginTop: 0, paddingTop: 0 }
            : {
                height: isMobile ? (isSidebarOpen ? 'calc(100% - 320px)' : 'calc(100% - 5rem)') : 'calc(100% - 5rem)',
                paddingLeft: (!isMobile && isSidebarOpen) ? '467px' : '1rem',
                paddingRight: '1rem',
                paddingBottom: '1rem'
              }
          }
        >
          <div
            ref={canvasContainerRef}
            className={`w-full h-full overflow-hidden transition-all duration-700 ${
              isPreviewActive ? 'rounded-none shadow-none' : 'rounded-[28px] shadow-xl bg-white'
            }`}
          >
            <DesignerRoom
              ref={designerRef}
              roomData={roomData}
              items={items}
              setItems={setItems}
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              viewMode={viewMode}
              placingProduct={placingProduct}
              onPlaceItem={handlePlaceItem}
              onCancelPlacement={() => setPlacingProduct(null)}
              onWallClick={handleWallClick}
              isPreviewActive={isPreviewActive}
              showWalls={showWalls}
            />

            {/* Mobile Floating Bill & Saved Buttons */}
            {isMobile && !isPreviewActive && (
              <div className="absolute top-4 right-4 z-[100] flex flex-col gap-3">
                <button
                  onClick={() => setIsBillOpen(true)}
                  className="h-12 px-5 bg-white/80 backdrop-blur-xl border border-black/5 rounded-full flex items-center justify-center gap-2 shadow-xl group hover:bg-black transition-all"
                >
                  <Layout size={18} className="text-black group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black group-hover:text-white">Bill</span>
                  <div className="w-5 h-5 bg-black text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white group-hover:bg-white group-hover:text-black transition-colors">
                    {items.length}
                  </div>
                </button>
                <button
                  onClick={handleSaveProject}
                  className="w-12 h-12 bg-white/80 backdrop-blur-xl border border-black/5 rounded-full flex items-center justify-center shadow-xl group hover:bg-black transition-all"
                >
                  <Save size={20} className="text-black group-hover:text-white transition-colors" />
                </button>
              </div>
            )}

            {/* Action Panel - Positioned at Bottom Center of Canvas */}
            <AnimatePresence>
              {selectedItemId && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white/80 backdrop-blur-xl p-2 rounded-[32px] border border-black/5 shadow-2xl gap-3"
                >
                  <div className="flex flex-col px-4 border-r border-black/5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-black/20 mb-0.5">Editing</span>
                    <h4 className="text-[10px] font-bold truncate max-w-[120px]">
                      {items.find(it => it.id === selectedItemId)?.type || 'Object'}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setItems(
                          items.map((it) =>
                            it.id === selectedItemId
                              ? { ...it, rotation: (it.rotation + 45) % 360 }
                              : it
                          )
                        )
                      }
                      title="Rotate 45°"
                      className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                      <RotateCw size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setItems(items.filter((it) => it.id !== selectedItemId));
                        setSelectedItemId(null);
                      }}
                      title="Delete Object"
                      className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedItemId(null)}
                      title="Deselect"
                      className="w-12 h-12 bg-black/5 text-black rounded-2xl flex items-center justify-center hover:bg-black/10 transition-all border border-black/5"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {placingProduct && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
              <MousePointer2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Click floor to place {placingProduct.name}
              </span>
            </div>
          )}
        </section>
      </div>

      {/* Bill of Materials Dialog */}
      <AnimatePresence>
        {isBillOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBillOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl bg-[#FBFBF9] rounded-[48px] shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[85vh] border border-black/5"
            >
              <div className="p-10 border-b border-black/5 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-3xl font-serif">Your Curated Bill</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 px-3 py-1 bg-black/5 rounded-full">
                      Project: {roomData.projectTitle}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 px-3 py-1 bg-black/5 rounded-full">
                      {items.length} Products
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBillOpen(false)}
                  className="p-4 hover:bg-black/5 rounded-full transition-all hover:rotate-90 group"
                >
                  <X size={24} className="text-black/20 group-hover:text-black" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-white/50">
                {items.length === 0 ? (
                  <div className="py-24 text-center space-y-4">
                    <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto">
                      <Plus size={32} className="text-black/10" />
                    </div>
                    <div>
                      <p className="text-lg font-serif text-black/40">Your receipt is empty</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/20 mt-1">Add items from the library to build your project</p>
                    </div>
                  </div>
                ) : (
                  items.map((item) => {
                    const product = PRODUCTS.find(p => p.name === item.type);
                    return (
                      <div key={item.id} className="flex items-center gap-6 p-6 rounded-[32px] bg-white border border-black/5 shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all group">
                        <div className="w-24 h-24 bg-[#F5F5F3] rounded-[24px] overflow-hidden p-4 group-hover:scale-105 transition-transform duration-500">
                          <img src={product?.image} className="w-full h-full object-contain" alt={item.type} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">{product?.category}</span>
                          <h4 className="text-lg font-serif leading-tight">{item.type}</h4>
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-[9px] font-bold text-black/40">ID: {item.id}</span>
                            <div className="w-1 h-1 rounded-full bg-black/10" />
                            <span className="text-[9px] font-bold text-black/40">Status: In Scene</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold tracking-tighter">${product?.price}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-10 bg-white border-t border-black/5">
                <div className="flex justify-between items-center mb-10 px-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 block">Statement Total</span>
                    <span className="text-[8px] font-bold text-[#1AA06D] uppercase tracking-widest">Inclusive of all taxes</span>
                  </div>
                  <span className="text-4xl font-bold tracking-tighter">
                    $
                    {items.reduce((acc, it) => acc + (PRODUCTS.find((p) => p.name === it.type)?.price || 0), 0)}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsBillOpen(false)}
                    className="flex-1 py-6 rounded-[24px] border border-black/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/5 transition-all text-black/40 hover:text-black"
                  >
                    Back to Design
                  </button>
                  <button
                    onClick={() => {
                      toast.success("Design catalog added to cart!");
                      setIsBillOpen(false);
                    }}
                    className="flex-[1.5] py-6 rounded-[24px] bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3"
                  >
                    <Plus size={16} />
                    Checkout All Items
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlueprintDesigner;