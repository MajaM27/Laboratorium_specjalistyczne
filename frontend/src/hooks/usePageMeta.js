import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

// Strony ustawiają tytuł i podtytuł nagłówka (oraz tytuł karty przeglądarki)
export function usePageMeta(title, subtitle = '') {
  const { setMeta } = useOutletContext();
  useEffect(() => {
    setMeta({ title, subtitle });
    document.title = title ? `${title} · PetCare` : 'PetCare';
  }, [title, subtitle, setMeta]);
}
