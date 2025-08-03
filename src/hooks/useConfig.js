import { useConfigContext } from '../config/ConfigContext';

// Hook simple para consumir config y actualizarla
export default function useConfig() {
  const { config, loading, updateConfig } = useConfigContext();
  return { config, loading, updateConfig };
}
