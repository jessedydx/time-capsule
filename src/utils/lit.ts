import { LitNodeClient } from '@lit-protocol/lit-node-client';

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

        // Get authentication signature from MetaMask manually
        // @ts-ignore - window.ethereum exists when MetaMask is installed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        // Create message to sign
        const messageToSign = `I am signing this message to decrypt data with Lit Protocol`;

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
        return new TextDecoder().decode(decryptedData as unknown as Uint8Array);
    }
}

export const lit = new Lit();
