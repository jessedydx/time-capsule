import { useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

/**
 * Formats an Ethereum address to show first 6 and last 4 characters
 * Example: 0x1234567890abcdef -> 0x123456...cdef
 */
export function formatAddress(address: string | undefined): string {
    if (!address) return '';
    if (address.length < 10) return address;

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Hook to resolve ENS name for an address
 * Returns ENS name if available, otherwise returns undefined
 */
export function useAddressDisplay(address: string | undefined) {
    const { data: ensName } = useEnsName({
        address: address as `0x${string}`,
        chainId: mainnet.id,
        query: {
            enabled: !!address,
        }
    });

    return ensName || (address ? formatAddress(address) : '');
}
