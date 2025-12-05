'use client'

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import { fetchCart, assignCart } from '../../../lib/service/modules/cartService';
import { getCustomerIdFromToken } from '../../../lib/service/modules/tokenService';
import { getCookie, setCookie, generateUUID } from '../../utils/cartUtils';
import type { AppDispatch } from '../../../lib/service/store';

export default function CartInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const lastCustomerIdRef = useRef<number | null>(null);
  const lastCookieIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      return;
    }

    let cookieId = getCookie('cookieId');
    const customerId = getCustomerIdFromToken();

    const customerIdChanged = lastCustomerIdRef.current !== customerId;
    const cookieIdChanged = lastCookieIdRef.current !== cookieId;
    
    if (isInitializedRef.current && !customerIdChanged && !cookieIdChanged) {
      return;
    }

    isInitializedRef.current = true;
    lastCustomerIdRef.current = customerId;
    lastCookieIdRef.current = cookieId;

    if (customerId) {
      if (cookieId) {
        dispatch(assignCart({ customerId, cookieId }))
          .unwrap()
          .then(() => {
            document.cookie = 'cookieId=; Max-Age=0; path=/';
            lastCookieIdRef.current = null;
            dispatch(fetchCart({ customerId }));
          })
          .catch(() => {
            dispatch(fetchCart({ customerId }));
          });
      } else {
        dispatch(fetchCart({ customerId }));
      }
    } else {
      if (!cookieId) {
        cookieId = generateUUID();
        setCookie('cookieId', cookieId, 5);
        lastCookieIdRef.current = cookieId;
      }
      dispatch(fetchCart({ cookieId }));
    }
  }, [pathname]);

  return null;
}

