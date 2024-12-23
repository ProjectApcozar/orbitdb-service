import { healthHubABI } from '../../abis/HealthHubABI.js';
import { JsonRpcProvider, ethers  } from 'ethers';

const CONTRACT_ADDRESS = '0x899F7b9ddab3924d67F4571B4155C2D261fCaF54';
const CONTRACT_ABI = healthHubABI;
const provider = new JsonRpcProvider('https://sepolia.infura.io/v3/82f0375fcd6844948892bf0305a6ba2a');

export default async function getContract() {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};
