'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import {KeyScheme} from '@/lib/types'
import { ReactNode, Dispatch } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

export const initialPreviewToken = {
    scheme: "",
    llm_api_key: "",
    llm_model: "",
    llm_base_url: "",
    tavilyserp_api_key: "",
    google_api_key: "",
    google_cse_id: "",
    bing_api_key: "",
  };
  
  export  const initialKeyScheme: KeyScheme = {
    current: { ...initialPreviewToken },
    keys1: { ...initialPreviewToken },
    keys2: { ...initialPreviewToken },
    keys3: { ...initialPreviewToken },
  };

type SettingContextValue = [KeyScheme, Dispatch<React.SetStateAction<KeyScheme>>];
const SettingContext = createContext<SettingContextValue>([initialKeyScheme, () => {}]);

export function SettingProvider({ children }: { children: ReactNode }) {
    const [Keys, setKeys] = useLocalStorage('ai-token', initialKeyScheme) as SettingContextValue;

    return (
        <SettingContext.Provider value={[Keys, setKeys]}>
            {children}
        </SettingContext.Provider>
      );
}


export function useSetting() {
    return useContext(SettingContext);
}