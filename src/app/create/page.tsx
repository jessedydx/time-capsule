'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { isAddress } from 'viem';
import TimeCapsuleArtifact from '../../abis/TimeCapsule.json';

const CONTRACT_ADDRESS = '0x19B512eb920Ee17551540C017EA75dfc7950b098';
const MAX_RECIPIENTS = 5;

export default function CreateCapsule() {
    const [message, setMessage] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [recipients, setRecipients] = useState<string[]>([]);
    const [newRecipient, setNewRecipient] = useState('');
    const [recipientError, setRecipientError] = useState('');

    const { writeContract, isPending, isSuccess } = useWriteContract();

    const [isEncrypting, setIsEncrypting] = useState(false);

    const addRecipient = () => {
        setRecipientError('');

        if (!newRecipient.trim()) {
            setRecipientError('Please enter an address');
            return;
        }

        if (!isAddress(newRecipient)) {
            setRecipientError('Invalid Ethereum address');
            return;
        }

        if (recipients.includes(newRecipient.toLowerCase())) {
            setRecipientError('Address already added');
            return;
        }

        if (recipients.length >= MAX_RECIPIENTS) {
            setRecipientError(`Maximum ${MAX_RECIPIENTS} recipients allowed`);
            return;
        }

        setRecipients([...recipients, newRecipient.toLowerCase()]);
        setNewRecipient('');
    };

    const removeRecipient = (address: string) => {
        setRecipients(recipients.filter(r => r !== address));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submit triggered');

        if (!message) {
            alert('Please enter a message');
            return;
        }
        if (!unlockDate) {
            alert('Please select an unlock date');
            return;
        }

        if (!isPublic && recipients.length === 0) {
            setRecipientError('Private capsules must have at least one recipient');
            alert('Private capsules must have at least one recipient');
            return;
        }

        const timestamp = Math.floor(new Date(unlockDate).getTime() / 1000);
        console.log('Timestamp:', timestamp);

        try {
            setIsEncrypting(true);
            console.log('Starting encryption...');
            const { lit } = await import('../../utils/lit');
            const encryptedData = await lit.encrypt(message, timestamp, recipients, isPublic);
            console.log('Encryption successful');

            const messageToSend = JSON.stringify(encryptedData);

            console.log('Writing to contract...');
            writeContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: TimeCapsuleArtifact.abi as any,
                functionName: 'createCapsule',
                args: [messageToSend, BigInt(timestamp)],
            });
        } catch (error) {
            console.error('Encryption or Contract call failed:', error);
            alert('Failed to create capsule. Check console for details.');
        } finally {
            setIsEncrypting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mt-8">Create Time Capsules</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md">
                {/* Message Input */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="p-3 rounded bg-white text-black border border-gray-300 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your message for the future..."
                    />
                </div>

                {/* Unlock Date */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="date" className="text-sm font-medium text-gray-700">Unlock Date</label>
                    <input
                        type="datetime-local"
                        id="date"
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        className="p-3 rounded bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Public/Private Toggle */}
                <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Privacy</label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsPublic(true)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${isPublic
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            🌍 Public
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPublic(false)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${!isPublic
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            🔒 Private
                        </button>
                    </div>
                    <p className="text-xs text-gray-600">
                        {isPublic ? 'Anyone can view after unlock time' : 'Only selected recipients can view'}
                    </p>
                </div>

                {/* Recipients (only show for private) */}
                {!isPublic && (
                    <div className="flex flex-col gap-3 p-4 bg-purple-50 border border-purple-300 rounded-lg">
                        <label className="text-sm font-medium text-gray-700">Recipients ({recipients.length}/{MAX_RECIPIENTS})</label>

                        {/* Add Recipient Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newRecipient}
                                onChange={(e) => setNewRecipient(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                                placeholder="0x..."
                                className="flex-1 p-2 rounded bg-white text-black border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                type="button"
                                onClick={addRecipient}
                                disabled={recipients.length >= MAX_RECIPIENTS}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>

                        {recipientError && (
                            <p className="text-xs text-red-600">{recipientError}</p>
                        )}

                        {/* Recipients List */}
                        {recipients.length > 0 && (
                            <div className="flex flex-col gap-2 mt-2">
                                {recipients.map((addr) => (
                                    <div key={addr} className="flex items-center justify-between p-2 bg-white rounded border border-gray-300">
                                        <span className="text-xs font-mono truncate text-gray-700">{addr}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeRecipient(addr)}
                                            className="ml-2 text-red-600 hover:text-red-700 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending || isEncrypting}
                    className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded transition-colors disabled:opacity-50"
                >
                    {isEncrypting ? 'Encrypting...' : isPending ? 'Creating...' : 'Seal Capsule'}
                </button>

                {isSuccess && (
                    <div className="p-4 bg-green-900/50 text-green-200 rounded border border-green-800">
                        Capsule created successfully!
                    </div>
                )}
            </form>
        </div>
    );
}
