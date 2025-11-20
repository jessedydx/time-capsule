'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const load = async () => {
            try {
                await sdk.actions.ready();
                console.log('Farcaster SDK ready');
            } catch (error) {
                console.error('Failed to initialize Farcaster SDK:', error);
            }
        };

        load();
    }, []);

    return <>{children}</>;
}
