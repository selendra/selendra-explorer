import { useState } from 'react';
import { useApi } from './useApi';
import { apiService } from '../services';
import { isValidEvmAddress, isValidSs58Address } from '../utils';
import { UseAddressConversionReturn } from '../types';

export const useAddressConversion = (): UseAddressConversionReturn => {
  const [inputAddress, setInputAddress] = useState<string>('');
  const [addressType, setAddressType] = useState<"evm" | "ss58" | null>(null);

  const ss58ToEvmApi = useApi(
    (address: string) => apiService.convertSs58ToEvm(address),
    {},
    { immediate: false }
  );

  const evmToSs58Api = useApi(
    (address: string) => apiService.convertEvmToSs58(address),
    {},
    { immediate: false }
  );

  const detectAddressType = (address: string): "evm" | "ss58" | null => {
    if (isValidEvmAddress(address)) {
      return 'evm';
    } else if (isValidSs58Address(address)) {
      return 'ss58';
    }
    return null;
  };

  const convertAddress = async (address: string): Promise<any> => {
    const type = detectAddressType(address);
    setAddressType(type);
    
    if (type === 'evm') {
      return evmToSs58Api.execute(address);
    } else if (type === 'ss58') {
      return ss58ToEvmApi.execute(address);
    } else {
      throw new Error('Invalid address format');
    }
  };

  const reset = (): void => {
    setInputAddress('');
    setAddressType(null);
  };

  return {
    inputAddress,
    setInputAddress,
    addressType,
    convertAddress,
    reset,
    ss58Result: ss58ToEvmApi.data,
    evmResult: evmToSs58Api.data,
    loading: ss58ToEvmApi.loading || evmToSs58Api.loading,
    error: ss58ToEvmApi.error || evmToSs58Api.error,
  };
};