'use client';

import { useEffect, useState, createContext, useContext, useRef } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useConnect, useAccount } from 'wagmi';

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
    const { connect, connectors } = useConnect();
    const { isConnected } = useAccount();
    const hasAttemptedConnect = useRef(false);

    useEffect(() => {
        const load = async () => {
            try {
                const context = await sdk.context;
                setFid(context.user?.fid || null);
                await sdk.actions.ready();
                setIsSDKLoaded(true);
                console.log('Farcaster SDK ready, FID:', context.user?.fid);

                // Auto-connect logic moved here
                if (!isConnected && !hasAttemptedConnect.current) {
                    hasAttemptedConnect.current = true;
                    const farcasterConnector = connectors.find(c => c.id === 'farcaster-custom');
                    if (farcasterConnector) {
                        console.log('Auto-connecting to Farcaster wallet...');
                        try {
                            await connect({ connector: farcasterConnector });
                            console.log('✅ Auto-connected to Farcaster wallet');
                        } catch (e) {
                            console.error('Failed to auto-connect:', e);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to initialize Farcaster SDK:', error);
                setIsSDKLoaded(false);
            }
        };

        if (!isSDKLoaded) {
            load();
        }
    }, [isSDKLoaded, isConnected, connect, connectors]);

    return (
        <FarcasterContext.Provider value={{ isSDKLoaded, fid }}>
            {children}
        </FarcasterContext.Provider>
    );
}
