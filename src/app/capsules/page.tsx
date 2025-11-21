'use client';

import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import TimeCapsuleArtifact from '../../abis/TimeCapsule.json';
import { useState } from 'react';
import { lit } from '../../utils/lit';

const CONTRACT_ADDRESS = '0x20deAfbfa1C824986E4bED5E9d0A9F345650F383';

interface DecryptedMessage {
    [capsuleId: string]: string;
}

type TabType = 'created' | 'received';

export default function ViewCapsules() {
    const { address } = useAccount();
    const [tab, setTab] = useState<TabType>('created');
    const [decryptedMessages, setDecryptedMessages] = useState<DecryptedMessage>({});
    const [decryptingIds, setDecryptingIds] = useState<Set<string>>(new Set());

    // Get capsules created by user
    const { data: createdIds } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TimeCapsuleArtifact.abi as any,
        functionName: 'getUserCapsules',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
        }
    });

    // Get capsules sent to user
    const { data: receivedIds } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TimeCapsuleArtifact.abi as any,
        functionName: 'getRecipientCapsules',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
        }
    });

    const currentIds = tab === 'created' ? createdIds : receivedIds;

    const { data: capsulesData, isLoading } = useReadContracts({
        contracts: (currentIds as bigint[] || []).map((id) => ({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: TimeCapsuleArtifact.abi as any,
            functionName: 'getCapsule',
            args: [id],
        })),
        query: {
            enabled: !!currentIds && (currentIds as bigint[]).length > 0,
        }
    });

    const handleDecrypt = async (capsule: any) => {
        const capsuleId = capsule.id.toString();

        if (decryptedMessages[capsuleId] || decryptingIds.has(capsuleId)) {
            return;
        }

        setDecryptingIds(prev => new Set(prev).add(capsuleId));

        try {
            const encryptedData = JSON.parse(capsule.message);
            const decryptedMessage = await lit.decrypt(
                encryptedData.ciphertext,
                encryptedData.dataToEncryptHash,
                encryptedData.accessControlConditions
            );

            setDecryptedMessages(prev => ({
                ...prev,
                [capsuleId]: decryptedMessage
            }));
        } catch (error) {
            console.error('Decryption failed:', error);
            setDecryptedMessages(prev => ({
                ...prev,
                [capsuleId]: '[Failed to decrypt - may still be locked or invalid data]'
            }));
        } finally {
            setDecryptingIds(prev => {
                const next = new Set(prev);
                next.delete(capsuleId);
                return next;
            });
        }
    };

    if (!address) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-700">Please connect your wallet to view your capsules.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-700">Loading capsules...</p>
            </div>
        );
    }

    const capsules = capsulesData?.map((result) => result.result) || [];

    return (
        <div className="min-h-screen p-8 flex flex-col gap-8 items-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mt-8">My Time Capsules</h1>

            {/* Tabs */}
            <div className="flex gap-4">
                <button
                    onClick={() => setTab('created')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${tab === 'created'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    📝 Created by Me ({(createdIds as bigint[] || []).length})
                </button>
                <button
                    onClick={() => setTab('received')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${tab === 'received'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    📬 Sent to Me ({(receivedIds as bigint[] || []).length})
                </button>
            </div>

            {capsules.length === 0 ? (
                <p className="text-gray-600">
                    {tab === 'created'
                        ? "You haven't created any capsules yet."
                        : "No capsules have been sent to you yet."}
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                    {capsules.map((capsule: any, index: number) => {
                        if (!capsule) return null;

                        const capsuleId = capsule.id.toString();
                        const unlockTime = Number(capsule.unlockTime) * 1000;
                        const isLocked = Date.now() < unlockTime;
                        const unlockDate = new Date(unlockTime).toLocaleString();
                        const isDecrypting = decryptingIds.has(capsuleId);
                        const decryptedMessage = decryptedMessages[capsuleId];

                        return (
                            <div key={index} className="bg-white border border-gray-300 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:border-gray-400 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono text-gray-600">ID: {capsuleId}</span>
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isLocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {isLocked ? 'LOCKED' : 'UNLOCKED'}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${capsule.isPublic ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {capsule.isPublic ? '🌍' : '🔒'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    {isLocked ? (
                                        <div className="h-24 flex flex-col items-center justify-center bg-gray-100 rounded border border-dashed border-gray-300 gap-2">
                                            <span className="text-gray-600 text-sm">🔒 Message Encrypted</span>
                                            <span className="text-gray-500 text-xs">Protected by Lit Protocol</span>
                                        </div>
                                    ) : decryptedMessage ? (
                                        <p className="text-gray-800 whitespace-pre-wrap">{decryptedMessage}</p>
                                    ) : (
                                        <button
                                            onClick={() => handleDecrypt(capsule)}
                                            disabled={isDecrypting}
                                            className="w-full h-24 flex items-center justify-center bg-blue-50 hover:bg-blue-100 rounded border border-blue-300 transition-colors disabled:opacity-50"
                                        >
                                            <span className="text-blue-700 text-sm font-medium">
                                                {isDecrypting ? '🔓 Decrypting...' : '🔓 Click to Reveal'}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* Show recipients if created by user and private */}
                                {tab === 'created' && !capsule.isPublic && capsule.recipients?.length > 0 && (
                                    <div className="pt-2 border-t border-gray-300">
                                        <p className="text-xs text-gray-600">Recipients ({capsule.recipients.length})</p>
                                        <div className="flex flex-col gap-1 mt-1">
                                            {capsule.recipients.slice(0, 2).map((r: string, i: number) => (
                                                <p key={i} className="text-xs font-mono text-purple-600 truncate">{r}</p>
                                            ))}
                                            {capsule.recipients.length > 2 && (
                                                <p className="text-xs text-gray-600">+{capsule.recipients.length - 2} more</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Show creator if received by user */}
                                {tab === 'received' && (
                                    <div className="pt-2 border-t border-gray-300">
                                        <p className="text-xs text-gray-600">From</p>
                                        <p className="text-xs font-mono text-gray-700 truncate">{capsule.creator}</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-300">
                                    <p className="text-xs text-gray-600">Unlock Time</p>
                                    <p className="text-sm font-medium text-gray-800">{unlockDate}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
