import { WebSocketProvider } from 'ethers';
import { healthHubABI } from '../../abis/HealthHubABI.js';
import { ethers  } from 'ethers';

const CONTRACT_ADDRESS = '0xB515202ebAd40D6171097283C7A9eaA92fD89597';
const CONTRACT_ABI = healthHubABI;
const provider = new WebSocketProvider('wss://sepolia.infura.io/ws/v3/82f0375fcd6844948892bf0305a6ba2a');

export default async function getContract() {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};
