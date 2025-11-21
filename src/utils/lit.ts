import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-helpers';

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
            // Build OR conditions for all recipients
            const recipientConditions = recipients.map((recipient, index) => ({
                conditionType: 'evmBasic',
                contractAddress: '',
                standardContractType: '',
                chain: this.chain,
                method: '',
                parameters: [':userAddress'],
                returnValueTest: {
                    comparator: '=',
                    value: recipient.toLowerCase(),
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

        // Get authentication signature from MetaMask
        const authSig = await checkAndSignAuthMessage({
            chain: this.chain,
            nonce: await this.client.getLatestBlockhash(),
        });

        // Convert base64 string back to Uint8Array
        const ciphertextUint8Array = Uint8Array.from(Buffer.from(ciphertext, 'base64'));

        const decryptedData = await this.client.decrypt({
            ciphertext: ciphertextUint8Array as any,
            dataToEncryptHash,
            accessControlConditions,
            authSig,
            chain: this.chain,
        });

        // Convert Uint8Array to string
        return new TextDecoder().decode(decryptedData as unknown as Uint8Array);
    }
}

export const lit = new Lit();
