import { Contract, Wallet } from 'ethers';
import { JsonRpcProvider } from 'ethers';
import { 
    DATA_INTEGRITY_CONTRACT_ADDRESS,
    DATA_INTEGRITY_CONTACT_ABI,
    PK,
} from './constants.js';


//const provider = new WebSocketProvider('wss://sepolia.infura.io/ws/v3/82f0375fcd6844948892bf0305a6ba2a');

export default function getMedicalDataIntegrityContract() {
    const provider = new JsonRpcProvider('https://sepolia.infura.io/v3/82f0375fcd6844948892bf0305a6ba2a')
    const wallet = new Wallet(PK, provider);

    return new Contract(
        DATA_INTEGRITY_CONTRACT_ADDRESS, 
        DATA_INTEGRITY_CONTACT_ABI, 
        wallet
    );
};
