// File: src/hooks/useMenu.js
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useMenu = (userId, lang) => {
  return useQuery({
    queryKey: ['menu', userId, lang],
    queryFn: async () => {
      const response = await api.get('/menu', {
        params: { userId, lang }
      });
      return response.data;
    },
    enabled: !!userId && !!lang
  });
};
