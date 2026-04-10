import React from 'react';
/// <reference types="vite/client" />

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.glb';
declare module '*.obj';
declare module '@google/model-viewer';

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_AI_SERVER_URL: string;
    readonly VITE_GDRIVE_URL: string;
    readonly VITE_APPSCRIPT_URL: string;
    readonly VITE_APPSCRIPT_DEPLOYMENT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}



declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'ar-placement'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string;
        style?: React.CSSProperties; 
        // Add other model-viewer specific props as needed
      };
    }
  }
}
