'use client';

import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import TimeCapsuleArtifact from '../../abis/TimeCapsule.json';
import { useState } from 'react';

const CONTRACT_ADDRESS = '0x19B512eb920Ee17551540C017EA75dfc7950b098';

type FilterType = 'all' | 'public' | 'private';

export default function ExploreCapsules() {
    const { address } = useAccount();
    const [filter, setFilter] = useState<FilterType>('all');
    const [decryptedMessages, setDecryptedMessages] = useState<Record<number, string>>({});
    const [isDecrypting, setIsDecrypting] = useState<Record<number, boolean>>({});

    const handleDecrypt = async (index: number, messageJson: string) => {
        try {
            setIsDecrypting(prev => ({ ...prev, [index]: true }));
            const { ciphertext, dataToEncryptHash, accessControlConditions } = JSON.parse(messageJson);

            const { lit } = await import('../../utils/lit');
            const decrypted = await lit.decrypt(ciphertext, dataToEncryptHash, accessControlConditions);

            setDecryptedMessages(prev => ({ ...prev, [index]: decrypted }));
        } catch (error) {
            console.error('Decryption failed:', error);
            alert('Failed to decrypt. You may not have permission or the time lock is still active.');
        } finally {
            setIsDecrypting(prev => ({ ...prev, [index]: false }));
        }
    };

    const { data: nextCapsuleId } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TimeCapsuleArtifact.abi as any,
        functionName: 'nextCapsuleId',
    });

    const totalCapsules = Number(nextCapsuleId || 0);

    const { data: capsulesData, isLoading } = useReadContracts({
        contracts: Array.from({ length: totalCapsules }, (_, i) => ({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: TimeCapsuleArtifact.abi as any,
            functionName: 'getCapsule',
            args: [BigInt(i)],
        })),
        query: {
            enabled: totalCapsules > 0,
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading capsules...</p>
            </div>
        );
    }

    const allCapsules = capsulesData?.map((result) => result.result).filter(Boolean) || [];

    // ONLY show unlocked capsules
    const unlockedCapsules = allCapsules.filter((capsule: any) => {
        const unlockTime = Number(capsule.unlockTime) * 1000;
        return Date.now() >= unlockTime;
    });

    // Filter by privacy
    const filteredCapsules = unlockedCapsules.filter((capsule: any) => {
        if (filter === 'public') return capsule.isPublic;
        if (filter === 'private') return !capsule.isPublic;
        return true;
    });

    const publicCount = unlockedCapsules.filter((c: any) => c.isPublic).length;
    const privateCount = unlockedCapsules.filter((c: any) => !c.isPublic).length;

    return (
        <div className="min-h-screen p-8 flex flex-col gap-8 items-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold">Explore Time Capsules</h1>
                <p className="text-gray-400 mt-2">Showing only unlocked capsules</p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                    All ({unlockedCapsules.length})
                </button>
                <button
                    onClick={() => setFilter('public')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'public' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                    🌍 Public ({publicCount})
                </button>
                <button
                    onClick={() => setFilter('private')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'private' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                    🔒 Private ({privateCount})
                </button>
            </div>

            {filteredCapsules.length === 0 ? (
                <p className="text-gray-400">No unlocked capsules found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                    {filteredCapsules.map((capsule: any, index: number) => {
                        const unlockTime = Number(capsule.unlockTime) * 1000;
                        const unlockDate = new Date(unlockTime).toLocaleString();
                        const isUserRecipient = capsule.isPublic ||
                            capsule.recipients?.some((r: string) => r.toLowerCase() === address?.toLowerCase()) ||
                            capsule.creator?.toLowerCase() === address?.toLowerCase();

                        let isEncrypted = false;
                        try {
                            const parsed = JSON.parse(capsule.message);
                            if (parsed.ciphertext && parsed.dataToEncryptHash) {
                                isEncrypted = true;
                            }
                        } catch (e) { }

                        return (
                            <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono text-gray-500">ID: {capsule.id.toString()}</span>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-900/50 text-green-200">
                                            UNLOCKED
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${capsule.isPublic ? 'bg-blue-900/50 text-blue-200' : 'bg-purple-900/50 text-purple-200'}`}>
                                            {capsule.isPublic ? '🌍 PUBLIC' : '🔒 PRIVATE'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    {isEncrypted ? (
                                        decryptedMessages[index] ? (
                                            <div>
                                                <p className="text-xs text-green-400 mb-1">Decrypted:</p>
                                                <p className="text-gray-200 whitespace-pre-wrap">{decryptedMessages[index]}</p>
                                            </div>
                                        ) : !isUserRecipient ? (
                                            <div className="h-24 flex flex-col items-center justify-center bg-red-900/20 rounded border border-red-800 gap-2">
                                                <span className="text-red-400 text-sm">🚫 Not Authorized</span>
                                                <span className="text-red-500 text-xs">You're not a recipient</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3 items-center justify-center py-4">
                                                <p className="text-gray-400 text-sm italic text-center">
                                                    Encrypted with Lit Protocol
                                                </p>
                                                <button
                                                    onClick={() => handleDecrypt(index, capsule.message)}
                                                    disabled={isDecrypting[index]}
                                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-bold py-2 px-4 rounded-full transition-all disabled:opacity-50"
                                                >
                                                    {isDecrypting[index] ? '⚡ Decrypting...' : '🔥 Decrypt'}
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        <p className="text-gray-200 whitespace-pre-wrap">{capsule.message}</p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-800">
                                    <p className="text-xs text-gray-500">Creator</p>
                                    <p className="text-sm font-mono text-gray-400 truncate">{capsule.creator}</p>

                                    {!capsule.isPublic && capsule.recipients?.length > 0 && (
                                        <>
                                            <p className="text-xs text-gray-500 mt-3">Recipients ({capsule.recipients.length})</p>
                                            <div className="flex flex-col gap-1 mt-1">
                                                {capsule.recipients.slice(0, 2).map((r: string, i: number) => (
                                                    <p key={i} className="text-xs font-mono text-purple-400 truncate">{r}</p>
                                                ))}
                                                {capsule.recipients.length > 2 && (
                                                    <p className="text-xs text-gray-500">+{capsule.recipients.length - 2} more</p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <p className="text-xs text-gray-500 mt-3">Unlocked At</p>
                                    <p className="text-sm font-medium text-white">{unlockDate}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
