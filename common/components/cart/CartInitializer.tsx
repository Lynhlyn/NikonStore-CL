'use client'

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCart, assignCart } from '../../../lib/service/modules/cartService';
import { getCustomerIdFromToken } from '../../../lib/service/modules/tokenService';
import { getCookie, setCookie, generateUUID } from '../../utils/cartUtils';
import type { AppDispatch } from '../../../lib/service/store';

export default function CartInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let cookieId = getCookie('cookieId');
    const customerId = getCustomerIdFromToken();

    if (customerId) {
      if (cookieId) {
        dispatch(assignCart({ customerId, cookieId }))
          .unwrap()
          .then(() => {
            document.cookie = 'cookieId=; Max-Age=0; path=/';
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
      }
      dispatch(fetchCart({ cookieId }));
    }
  }, [dispatch]);

  return null;
}

