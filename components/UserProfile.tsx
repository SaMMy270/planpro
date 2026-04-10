
import React, { useEffect, useState, useMemo } from 'react';
import {
    User, MapPin, ShieldCheck, Box, Bookmark, ArrowRight,
    Trash2, CreditCard, Ruler, Layout as LayoutIcon,
    Settings, LogOut, ChevronRight, Armchair, Star,
    Verified, MapPin as LocationIcon, CheckCircle,
    ShoppingBag, Trash, Upload, Camera, Sparkles,
    Image as ImageIcon, MoreVertical, Edit2, Save, X, Globe,
    ChevronLeft, Loader2
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import { supabase } from '../services/supabase';
import { gdriveService, GDriveFile } from '../services/gdriveService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileProps {
    wishlist: string[];
    onToggleWishlist: (id: string) => void;
    onViewProduct: (product: Product) => void;
    onTabChange: (tab: any) => void;
}

type ProfileTab = 'settings' | 'manual' | 'ai';

const UserProfile: React.FC<UserProfileProps> = ({
    wishlist,
    onToggleWishlist,
    onViewProduct,
    onTabChange
}) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('manual');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [manualDesigns, setManualDesigns] = useState<any[]>([]);
    const [aiDesigns, setAiDesigns] = useState<any[]>([]);
    const [driveFiles, setDriveFiles] = useState<GDriveFile[]>([]);
    
    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        fetchInitialData();
        setupSubscriptions();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            setUser(authUser);
            await Promise.all([
                fetchProfile(authUser.id),
                fetchManualDesigns(authUser.id),
                fetchAiDesigns(authUser.id),
                fetchDriveFiles()
            ]);
        }
        setLoading(false);
    };

    const setupSubscriptions = () => {
        const manualSub = supabase
            .channel('manual_designs_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'RoomDesign' }, payload => {
                console.log('Manual design change received:', payload);
                fetchManualDesigns(user?.id || '');
            })
            .subscribe();

        const aiSub = supabase
            .channel('ai_designs_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'AiDesign' }, payload => {
                console.log('AI design change received:', payload);
                fetchAiDesigns(user?.id || '');
            })
            .subscribe();

        const profileSub = supabase
            .channel('profile_realtime')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'User' }, payload => {
                if (payload.new.id === user?.id) {
                    setProfile(payload.new);
                }
            })
            .subscribe();

        return () => {
            manualSub.unsubscribe();
            aiSub.unsubscribe();
            profileSub.unsubscribe();
        };
    };

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase.from('User').select('*').eq('id', userId).maybeSingle();
        if (data) {
            setProfile(data);
            setEditName(data.name || '');
            setEditAvatar(data.avatarUrl || '');
        }
    };

    const fetchManualDesigns = async (userId: string) => {
        const { data } = await supabase.from('RoomDesign').select('*').eq('userId', userId).order('createdAt', { ascending: false });
        if (data) setManualDesigns(data);
    };

    const fetchAiDesigns = async (userId: string) => {
        const { data } = await supabase.from('AiDesign').select('*').eq('userId', userId).order('createdAt', { ascending: false });
        if (data) setAiDesigns(data);
    };

    const fetchDriveFiles = async () => {
        const files = await gdriveService.listFiles('all');
        setDriveFiles(files);
    };

    const handleUpdateProfile = async () => {
        setSavingProfile(true);
        try {
            const { error } = await supabase
                .from('User')
                .update({
                    name: editName,
                    avatarUrl: editAvatar,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            toast.success("Profile updated successfully");
            setIsEditing(false);
            fetchProfile(user.id);
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const getFileUrl = (filename: string) => {
        const file = driveFiles.find(f => f.name === filename);
        return file ? file.url : `https://via.placeholder.com/400x300?text=${filename}`;
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onTabChange('home');
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
                <Loader2 className="animate-spin text-black/20" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Initializing Profile</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-20 space-y-12">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-6 md:gap-10">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-black/5 overflow-hidden border-4 border-white shadow-2xl transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                    <User size={48} className="text-black/10" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-2xl shadow-xl border-2 border-white">
                            <Sparkles size={16} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-black">{profile?.name || user?.email?.split('@')[0]}</h1>
                            <Verified className="text-[#1754cf]" size={20} />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/40 bg-black/5 px-3 py-1 rounded-full">{user?.email}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1754cf] bg-[#1754cf]/10 px-3 py-1 rounded-full">PRO DESIGNER</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className="px-8 py-4 bg-white border border-black/5 text-black rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white hover:shadow-2xl transition-all shadow-xl shadow-black/5 flex items-center gap-3"
                    >
                        <Settings size={16} /> Edit Account
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="p-4 bg-red-50 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 border-b border-black/5 pb-2 overflow-x-auto no-scrollbar">
                {[
                    { id: 'manual', name: 'Manual Designs', icon: Box, count: manualDesigns.length },
                    { id: 'ai', name: 'AI Generation', icon: Sparkles, count: aiDesigns.length },
                    { id: 'settings', name: 'Settings', icon: Settings, count: 0 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ProfileTab)}
                        className={`group flex items-center gap-4 pb-4 border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'border-black text-black' 
                            : 'border-transparent text-black/20 hover:text-black/40'
                        }`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? 'opacity-100' : 'opacity-40'} />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tab.name}</span>
                        {tab.count > 0 && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                activeTab === tab.id ? 'bg-black text-white' : 'bg-black/5 text-black/30'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'manual' && (
                        <motion.div
                            key="manual-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Architectural Modules</p>
                                <button onClick={() => onTabChange('blueprint')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1754cf] hover:underline">
                                    New Studio Project <ArrowRight size={14} />
                                </button>
                            </div>

                            {manualDesigns.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {manualDesigns.map((design) => (
                                        <div key={design.id} className="group bg-white rounded-[48px] overflow-hidden border border-black/5 shadow-xl hover:shadow-2xl transition-all duration-700">
                                            <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden">
                                                <img 
                                                    src={getFileUrl(design.thumbnailUrl)} 
                                                    alt={design.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <button className="px-6 py-2.5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">View Project</button>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-serif text-black">{design.name}</h3>
                                                    <button className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-black/30 bg-zinc-50 px-3 py-1 rounded-full">
                                                        {new Date(design.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-black/30 bg-zinc-50 px-3 py-1 rounded-full">
                                                        {design.layoutData?.items?.length || 0} Models
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[60px] border-2 border-dashed border-black/5 space-y-6">
                                    <div className="p-10 bg-black/5 rounded-[40px] text-black/10">
                                        <Box size={64} />
                                    </div>
                                    <h4 className="text-2xl font-serif text-black/40">No Manual Designs Yet</h4>
                                    <button onClick={() => onTabChange('blueprint')} className="px-10 py-5 bg-black text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all">Start Your First Design</button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'ai' && (
                        <motion.div
                            key="ai-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Neural Generations</p>
                                <button onClick={() => onTabChange('blueprint')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600 hover:underline">
                                    Capture New Space <Sparkles size={14} />
                                </button>
                            </div>

                            {aiDesigns.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {aiDesigns.map((design) => (
                                        <div key={design.id} className="group bg-black text-white rounded-[48px] overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-700">
                                            <div className="aspect-[16/9] bg-zinc-900 relative">
                                                {design.panoramaUrl ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-purple-900/10">
                                                        <Globe size={48} className="text-purple-500 animate-pulse" />
                                                        <span className="absolute bottom-4 left-4 text-[8px] font-black uppercase tracking-widest bg-purple-500 px-2 py-0.5 rounded">Panorama Active</span>
                                                    </div>
                                                ) : (
                                                    <img 
                                                        src={getFileUrl(design.imageUrls?.[0])} 
                                                        alt={design.name} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8">
                                                    <h3 className="text-2xl font-serif text-white">{design.name}</h3>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-3 overflow-hidden">
                                                        {design.imageUrls?.slice(0, 3).map((img: string, i: number) => (
                                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                                                                <img src={getFileUrl(img)} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                        {design.imageUrls?.length > 3 && (
                                                            <div className="w-10 h-10 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center text-[10px] font-black">
                                                                +{design.imageUrls.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Source Captures</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 bg-white/10 px-4 py-1.5 rounded-full">
                                                        AI SYNC: {new Date(design.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400">View Details <ArrowRight size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 flex flex-col items-center justify-center bg-black rounded-[60px] border border-white/5 space-y-6">
                                    <div className="p-10 bg-white/5 rounded-[40px] text-white/5">
                                        <Sparkles size={64} />
                                    </div>
                                    <h4 className="text-2xl font-serif text-white/20">No Neural Models Yet</h4>
                                    <button onClick={() => onTabChange('blueprint')} className="px-10 py-5 bg-white text-black rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Capture Your Room</button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-2xl mx-auto space-y-16"
                        >
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Account Configuration</p>
                                    <h2 className="text-4xl font-serif tracking-tight text-black">Personal Information</h2>
                                </div>

                                <div className="space-y-8 p-10 bg-white rounded-[48px] border border-black/5 shadow-2xl shadow-black/5">
                                    {/* Avatar Selection */}
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
                                            <div className="w-32 h-32 rounded-[40px] bg-black/5 overflow-hidden border-4 border-white shadow-2xl">
                                                {editAvatar ? (
                                                    <img src={editAvatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><User size={48} className="text-black/10" /></div>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[40px]">
                                                <Camera size={24} className="text-white" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Tap to Change Avatar</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 px-4">Full Name</label>
                                            <input 
                                                type="text" 
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full p-6 bg-zinc-50 rounded-3xl border border-black/5 focus:bg-white focus:border-black/20 focus:outline-none font-bold text-black transition-all disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 px-4">Email Address (Read-only)</label>
                                            <input 
                                                type="email" 
                                                value={user?.email}
                                                disabled
                                                className="w-full p-6 bg-zinc-50/50 rounded-3xl border border-black/5 font-bold text-black/30 outline-none"
                                            />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 px-4">Avatar URL</label>
                                            <input 
                                                type="text" 
                                                value={editAvatar}
                                                onChange={(e) => setEditAvatar(e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="https://..."
                                                className="w-full p-6 bg-zinc-50 rounded-3xl border border-black/5 focus:bg-white focus:border-black/20 focus:outline-none font-bold text-black transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        {isEditing ? (
                                            <>
                                                <button 
                                                    onClick={handleUpdateProfile}
                                                    disabled={savingProfile}
                                                    className="flex-1 py-5 bg-black text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                                >
                                                    {savingProfile ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                                                    Save Changes
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditName(profile?.name || '');
                                                        setEditAvatar(profile?.avatarUrl || '');
                                                    }}
                                                    className="px-8 py-5 bg-zinc-100 text-black rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="w-full py-5 bg-white border border-black/5 text-black rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl shadow-black/5 flex items-center justify-center gap-3"
                                            >
                                                <Edit2 size={16} /> Enter Edit Mode
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/40">Danger Zone</p>
                                <button className="w-full p-8 border border-red-100 rounded-[48px] flex items-center justify-between hover:bg-red-50 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-red-100 text-red-500 rounded-3xl group-hover:bg-red-500 group-hover:text-white transition-all">
                                            <Trash size={20} />
                                        </div>
                                        <div className="text-left space-y-1">
                                            <p className="font-bold text-black">Deactivate Account</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/20">Permanently remove all your design data</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-black/10" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UserProfile;
