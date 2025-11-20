import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitNetwork } from '@lit-protocol/constants';
import {
    createSiweMessage,
    generateAuthSig,
    SiweMessageCreator,
} from '@lit-protocol/auth-helpers';
import { checkAndSignAuthMessage } from '@lit-protocol/lit-node-client';

const LIT_NETWORK = LitNetwork.Datil; // Mainnet

export class Lit {
    private client: LitNodeClient;
    private chain: string;

    constructor(chain: string = 'base') {
        this.chain = chain;
        this.client = new LitNodeClient({
            litNetwork: LIT_NETWORK,
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

        // Access Control Condition: Current block timestamp >= unlockTime
        // We use 'evmBasic' condition to check block timestamp? 
        // Actually, Lit supports 'evmContractConditions' or 'solRpcConditions'.
        // The simplest for time is checking block timestamp.
        // We can use a standard condition that checks the timestamp.

        const accessControlConditions = [
            {
                contractAddress: '',
                standardContractType: 'timestamp',
                chain: this.chain,
                method: 'eth_getBlockByNumber',
                parameters: ['latest'],
                returnValueTest: {
                    comparator: '>=',
                    value: unlockTime.toString(),
                },
            },
        ];

        // We need an authSig to encrypt? No, encryption is public in v3? 
        // In v3/v4, you usually need an authSig (or session sigs) to encrypt/decrypt.
        // Let's assume we need the user to sign to encrypt as well, or at least we need a session.

        // For simplicity in this demo, we'll use the browser wallet to sign.
        const authSig = await checkAndSignAuthMessage({
            chain: this.chain,
        });

        const { ciphertext, dataToEncryptHash } = await this.client.encrypt({
            string: message,
            accessControlConditions,
            authSig,
            chain: this.chain,
        });

        return {
            ciphertext,
            dataToEncryptHash,
            accessControlConditions,
        };
    }

    async decrypt(ciphertext: string, dataToEncryptHash: string, accessControlConditions: any[]) {
        await this.connect();

        const authSig = await checkAndSignAuthMessage({
            chain: this.chain,
        });

        const decryptedString = await this.client.decrypt({
            ciphertext,
            dataToEncryptHash,
            accessControlConditions,
            authSig,
            chain: this.chain,
        });

        return decryptedString;
    }
}

export const lit = new Lit();
