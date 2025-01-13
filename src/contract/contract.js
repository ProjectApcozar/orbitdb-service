import { WebSocketProvider } from 'ethers';
import { healthhubABI } from '../../abis/HealthHubABI.js';
import { ethers  } from 'ethers';

const CONTRACT_ADDRESS = '0x693C1ad11778247dB2eB5B5D6e2436DF4F5F212B';
const CONTRACT_ABI = healthhubABI;
const provider = new WebSocketProvider('wss://sepolia.infura.io/ws/v3/82f0375fcd6844948892bf0305a6ba2a');

export default async function getContract() {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};
