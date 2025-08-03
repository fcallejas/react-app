import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { loadConfig, writeLocalOverrides, deepMerge, readLocalOverrides } from './loader';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // carga inicial
  useEffect(() => {
    (async () => {
      const cfg = await loadConfig();
      setConfig(cfg);
      setLoading(false);
    })();
  }, []);

  // actualizar en caliente (y persistir como override)
  const updateConfig = useCallback((partial) => {
    setConfig((prev) => {
      const merged = deepMerge(prev || {}, partial || {});
      // persistir solo la parte override (respecto a defaults+env+remote sería más fino;
      // aquí guardamos "partial" como override directo)
      const currentOverrides = readLocalOverrides();
      const newOverrides = deepMerge(currentOverrides, partial);
      writeLocalOverrides(newOverrides);
      return merged;
    });
  }, []);

  const value = useMemo(() => ({ config, loading, updateConfig }), [config, loading, updateConfig]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfigContext() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfigContext must be used within <ConfigProvider>');
  return ctx;
}
