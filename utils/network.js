import * as Network from 'expo-network';

export const temInternet = async () => {
  const state = await Network.getNetworkStateAsync();
  return state.isConnected;
};