import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { getAddress } from 'viem';

export class Lit {
    private client: LitNodeClient;
    private chain: string;

    constructor(chain: string = 'base') {
        this.chain = chain;
        this.client = new LitNodeClient({
            litNetwork: 'datil-dev',
            debug: false,
        });
    }

    async connect() {
        if (!this.client.ready) {
            await this.client.connect();
        }
    }

    async encrypt(message: string, unlockTime: number, recipients: string[] = [], isPublic: boolean = true) {
        await this.connect();

        // Get current user address to ensure they can always decrypt their own capsule
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const creatorAddress = getAddress(accounts[0]);

        let accessControlConditions;

        if (isPublic) {
            // Public capsule: Time-based access only
            accessControlConditions = [
                {
                    conditionType: 'evmBasic',
                    contractAddress: '',
                    standardContractType: 'timestamp',
                    chain: this.chain,
                    method: 'timestamp',
                    parameters: [],
                    returnValueTest: {
                        comparator: '>=',
                        value: unlockTime.toString(),
                    },
                },
            ];
        } else {
            // Private capsule: Time-based + Recipient check

            // Ensure creator is in the recipients list and all addresses are checksummed
            const allRecipients = new Set([creatorAddress, ...recipients.map(r => getAddress(r))]);
            const uniqueRecipients = Array.from(allRecipients);

            // Build OR conditions for all recipients
            const recipientConditions = uniqueRecipients.map((recipient, index) => ({
                conditionType: 'evmBasic',
                contractAddress: '',
                standardContractType: '',
                chain: this.chain,
                method: '',
                parameters: [':userAddress'],
                returnValueTest: {
                    comparator: '=',
                    value: recipient, // Checksummed address
                },
            }));

            // Add OR operators between recipient conditions
            const recipientConditionsWithOperators: any[] = [];
            recipientConditions.forEach((condition, index) => {
                recipientConditionsWithOperators.push(condition);
                if (index < recipientConditions.length - 1) {
                    recipientConditionsWithOperators.push({ operator: 'or' });
                }
            });

            // Time condition
            const timeCondition = {
                conditionType: 'evmBasic',
                contractAddress: '',
                standardContractType: 'timestamp',
                chain: this.chain,
                method: 'timestamp',
                parameters: [],
                returnValueTest: {
                    comparator: '>=',
                    value: unlockTime.toString(),
                },
            };

            // Combine: (recipient1 OR recipient2 OR ...) AND time
            accessControlConditions = [
                ...recipientConditionsWithOperators,
                { operator: 'and' },
                timeCondition,
            ];
        }

        // Encrypt the message
        const { ciphertext, dataToEncryptHash } = await this.client.encrypt({
            dataToEncrypt: new TextEncoder().encode(message),
            accessControlConditions,
        });

        // Convert ciphertext to base64 string for storage
        const ciphertextString = Buffer.from(ciphertext).toString('base64');

        return {
            ciphertext: ciphertextString,
            dataToEncryptHash,
            accessControlConditions,
        };
    }

    async decrypt(ciphertext: string, dataToEncryptHash: string, accessControlConditions: any[]): Promise<string> {
        await this.connect();

        // Get authentication signature from MetaMask manually
        // @ts-ignore - window.ethereum exists when MetaMask is installed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = getAddress(accounts[0]);

        // Generate SIWE message
        const domain = window.location.host;
        const origin = window.location.origin;
        const statement = "Sign this message to decrypt data with Lit Protocol";
        const nonce = await this.client.getLatestBlockhash();
        const issuedAt = new Date().toISOString();
        const expirationTime = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 24 hours
        const version = "1";
        const chainId = 8453; // Base mainnet

        const messageToSign = `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${origin}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;

        // @ts-ignore
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [messageToSign, address],
        });

        const authSig = {
            sig: signature,
            derivedVia: 'web3.eth.personal.sign',
            signedMessage: messageToSign,
            address: address,
        };

        // Convert base64 string back to original ciphertext string
        const originalCiphertext = Buffer.from(ciphertext, 'base64').toString();

        const decryptedData = await this.client.decrypt({
            ciphertext: originalCiphertext,
            dataToEncryptHash,
            accessControlConditions,
            authSig,
            chain: this.chain,
        });

        // Convert Uint8Array to string
        return new TextDecoder().decode(decryptedData.decryptedData);
    }
}

export const lit = new Lit();
