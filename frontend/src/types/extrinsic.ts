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
  block_number: number;
  extrinsic_index: number;
  is_signed: boolean;
  signer: string | null;
  call_module: string;
  call_function: string;
  args: string; // JSON serialized arguments
  timestamp: number; // Backend timestamp in milliseconds
}
