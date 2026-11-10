import en from './en';
import tr from './tr';
import ar from './ar';
import ru from './ru';
import pl from './pl';
import fr from './fr';
import es from './es';

export type LangCode = 'de' | 'en' | 'tr' | 'ar' | 'ru' | 'pl' | 'fr' | 'es';
export type Dict = Record<string, string>;

export const translations: Partial<Record<LangCode, Dict>> = { en, tr, ar, ru, pl, fr, es };
