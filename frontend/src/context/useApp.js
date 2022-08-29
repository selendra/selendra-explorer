import { createContext, useContext } from 'react';
import { Loading, Error } from '../components/Loading';

const AppContext = createContext({});

export const AppProvider = ({ children }) => {
  const query = (query) => {
    const { data, loading, error } = query;
    if (loading) {
      return <Loading />;
    }
    if (error) {
      return <Error />;
    }
    return data;
  };
  return (
    <AppContext.Provider value={{ query }}>{children}</AppContext.Provider>
  );
};

export const useGraphQL = () => {
  return useContext(AppContext);
};
