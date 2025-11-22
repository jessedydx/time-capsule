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

    async getLatestBlockhash() {
        await this.connect();
        return this.client.getLatestBlockhash();
    }

    async encrypt(
        message: string,
        unlockTime: number,
        recipients: string[] = [],
        isPublic: boolean = true,
        creatorAddress: string
    ) {
        await this.connect();

        // Ensure creator address is checksummed
        const checksummedCreator = getAddress(creatorAddress);

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
            const allRecipients = new Set([checksummedCreator, ...recipients.map(r => getAddress(r))]);
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

    async decrypt(
        ciphertext: string,
        dataToEncryptHash: string,
        accessControlConditions: any[],
        authSig: any
    ): Promise<string> {
        await this.connect();

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

