import { useState } from 'react';
import { useApi } from './useApi';
import { apiService } from '../services';
import { isValidEvmAddress, isValidSs58Address } from '../utils';

export const useAddressConversion = () => {
  const [inputAddress, setInputAddress] = useState('');
  const [addressType, setAddressType] = useState(null);

  const ss58ToEvmApi = useApi(
    (address) => apiService.convertSs58ToEvm(address),
    {},
    { immediate: false }
  );

  const evmToSs58Api = useApi(
    (address) => apiService.convertEvmToSs58(address),
    {},
    { immediate: false }
  );

  const detectAddressType = (address) => {
    if (isValidEvmAddress(address)) {
      return 'evm';
    } else if (isValidSs58Address(address)) {
      return 'ss58';
    }
    return null;
  };

  const convertAddress = async (address) => {
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

  const reset = () => {
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