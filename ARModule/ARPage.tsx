import React, { useEffect, useState, Suspense } from "react";
const ARScene = React.lazy(() => import("./ARScene"));
import "./ar.css";
import ErrorBoundary from "./ErrorBoundary";
import { PRODUCTS } from "../data/mockData";
import { ArrowLeft } from "lucide-react";

interface ARPageProps {
  onBack?: () => void;
}

const ARPage: React.FC<ARPageProps> = ({ onBack }) => {
  // 1. Get the ID immediately before rendering (don't wait for useEffect)
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialProductId = params.get("id");

  if (typeof window === "undefined") return null;

  const modelData = PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    url: p.model,
    image: p.image
  })).filter(m => m.url);

  // 2. Find index immediately
  const initialIndex = initialProductId 
    ? modelData.findIndex(m => String(m.id) === String(initialProductId)) 
    : 0;

  // 3. Debugging: If this is -1, the 'id' in the URL doesn't match your mockData
  console.log("URL ID:", initialProductId, "Matched Index:", initialIndex);

  return (
    <div className="ar-page-container relative">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 right-6 z-[200] p-4 bg-black/80 backdrop-blur-md text-white rounded-2xl shadow-2xl hover:bg-black transition-all active:scale-90 flex items-center gap-2"
      >
        <ArrowLeft size={20} color="white" />
        <span className="text-xs font-bold uppercase tracking-widest pr-1">Back to Catalog</span>
      </button>

      <ErrorBoundary>
        <Suspense fallback={<div>Loading Workspace...</div>}>
          <ARScene 
            modelData={modelData} 
            // Use a key to force ARScene to re-mount if the ID changes
            key={initialProductId} 
            initialSelectedIndex={initialIndex >= 0 ? initialIndex : 0} 
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default ARPage;
