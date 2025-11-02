import { useSelector } from 'react-redux';
import { RootState } from '../service/store';
import { getCustomerIdFromToken } from '../service/modules/tokenService';

export const useAuth = () => {
  const customerIdFromStore = useSelector((state: RootState) => state.app?.customerId);
  
  const customerIdFromToken = getCustomerIdFromToken();
  
  const hasToken = typeof window !== 'undefined' && (
    localStorage.getItem('accessToken') || 
    sessionStorage.getItem('accessToken')
  );
  
  const isAuthenticated = Boolean(customerIdFromStore || customerIdFromToken);
  
  const customerId = customerIdFromStore || customerIdFromToken;
  
  return {
    isAuthenticated,
    customerId,
    hasToken,
    customerIdFromStore,
    customerIdFromToken
  };
};

