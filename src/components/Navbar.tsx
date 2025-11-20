'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50 backdrop-blur-sm fixed top-0 w-full z-10">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Time Capsule
            </Link>

            <div className="flex items-center gap-4">
                <Link href="/create" className="text-sm hover:text-gray-300 transition-colors">
                    Create
                </Link>
                <Link href="/explore" className="text-sm hover:text-gray-300 transition-colors">
                    Explore
                </Link>
                <Link href="/capsules" className="text-sm hover:text-gray-300 transition-colors">
                    My Capsules
                </Link>
                <ConnectButton
                    showBalance={{
                        small: false,
                        large: true,
                    }}
                    accountStatus={{
                        small: 'avatar',
                        large: 'full',
                    }}
                />
            </div>
        </nav>
    );
}
