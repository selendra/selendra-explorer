export interface SubstrateEvent {
  block_number: number;
  event_index: number;
  phase: string;
  module: string;
  event: string;
  data: string; // JSON serialized data
  timestamp: number; // Backend timestamp in milliseconds
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
