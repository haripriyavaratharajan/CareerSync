import { useCallback, useEffect, useRef, useState } from 'react';
import api, { errMsg } from '../services/api';

// GET helper. Keeps the previous data on screen while reloading (no flicker) and ignores out-of-order responses.
export default function useFetch(url, params, { skip = false } = {}) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(!skip), [error, setError] = useState(null);
  const key = JSON.stringify(params), seq = useRef(0);
  const load = useCallback(() => {
    if (skip) return;
    const id = ++seq.current; setLoading(true); setError(null);
    api.get(url, { params }).then((r) => id === seq.current && setData(r.data)).catch((e) => id === seq.current && setError(errMsg(e))).finally(() => id === seq.current && setLoading(false));
  }, [url, key, skip]); // eslint-disable-line
  useEffect(load, [load]);
  return { data, loading, error, reload: load, setData };
}
