export interface SubstrateEvent {
  id: string;
  transaction_hash: string;
  event_index: number;
  section: string;
  method: string;
  phase: string;
  data: Record<string, unknown>;
}

export interface SubstrateExtrinsic {
  id: string;
  extrinsic_hash: string;
  block_number: number;
  timestamp: string;
  sender: string;
  action: string;
  nonce: number;
  result: boolean;
  parameters: string;
  signature: string;
  fee: string;
  events: SubstrateEvent[];
} 