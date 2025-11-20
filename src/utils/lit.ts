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

    async encrypt(message: string, unlockTime: number) {
        await this.connect();

        // Access Control Condition: Check timestamp
        const accessControlConditions = [
            {
                contractAddress: '',
                standardContractType: '',
                chain: this.chain,
                method: 'eth_getBlockByNumber',
                parameters: ['latest'],
                returnValueTest: {
                    comparator: '>=',
                    value: unlockTime.toString(),
                },
            },
        ];

        // Encrypt the message
        const { ciphertext, dataToEncryptHash } = await this.client.encrypt({
            dataToEncrypt: new TextEncoder().encode(message),
            accessControlConditions,
        });

        return {
            ciphertext,
            dataToEncryptHash,
            accessControlConditions,
        };
    }

    async decrypt(ciphertext: string, dataToEncryptHash: string, accessControlConditions: any[]): Promise<string> {
        await this.connect();

        const decryptedData = await this.client.decrypt({
            ciphertext,
            dataToEncryptHash,
            accessControlConditions,
            chain: this.chain,
        });

        // Convert Uint8Array to string
        return new TextDecoder().decode(decryptedData as unknown as Uint8Array);
    }
}

export const lit = new Lit();
