// context/LenisContext.js
import { createContext, useContext } from 'react';

const LenisContext = createContext({
  scroll: 0, // Default value
});

export const useLenisScroll = () => useContext(LenisContext);

export default LenisContext;