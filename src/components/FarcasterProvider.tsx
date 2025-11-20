'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import sdk from '@farcaster/frame-sdk';

interface FarcasterContextType {
    isSDKLoaded: boolean;
    fid: number | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
    isSDKLoaded: false,
    fid: null,
});

export const useFarcaster = () => useContext(FarcasterContext);

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [fid, setFid] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const context = await sdk.context;
                setFid(context.user?.fid || null);
                await sdk.actions.ready();
                setIsSDKLoaded(true);
                console.log('Farcaster SDK ready, FID:', context.user?.fid);
            } catch (error) {
                console.error('Failed to initialize Farcaster SDK:', error);
                setIsSDKLoaded(false);
            }
        };

        load();
    }, []);

    return (
        <FarcasterContext.Provider value={{ isSDKLoaded, fid }}>
            {children}
        </FarcasterContext.Provider>
    );
}
