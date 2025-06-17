/**
 * Selendra chain configuration for wagmi
 */
export const selendra = {
  id: 1961,
  name: 'Selendra',
  network: 'selendra',
  nativeCurrency: {
    decimals: 18,
    name: 'Selendra Network',
    symbol: 'SEL',
  },
  rpcUrls: {
    public: { http: ['https://rpc.selendra.org', 'https://rpcx.selendra.org'] },
    default: { http: ['https://rpc.selendra.org', 'https://rpcx.selendra.org'] },
  },
  blockExplorers: {
    default: { name: 'SelendraExplorer', url: 'http://localhost:3000', websocket: "ws://localhost:3000" },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const; 