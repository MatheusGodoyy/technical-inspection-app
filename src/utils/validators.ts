import { isValidDate, isNotEmpty, isNextDateAfterCurrent } from './validation';

export const validators = {
  required: (value: string | null | undefined): string | undefined => {
    if (!isNotEmpty(value)) {
      return 'Este campo é obrigatório';
    }
  },

  date: (value: string): string | undefined => {
    if (!isNotEmpty(value)) {
      return 'Data é obrigatória';
    }
    if (!isValidDate(value)) {
      return 'Data inválida. Use o formato DD/MM/YYYY';
    }
  },

  dateGreaterThan: (minDate: string) => (value: string): string | undefined => {
    if (!isNotEmpty(value)) {
      return 'Data é obrigatória';
    }
    if (!isValidDate(value)) {
      return 'Data inválida. Use o formato DD/MM/YYYY';
    }
    if (!isNextDateAfterCurrent(minDate, value)) {
      return 'A data deve ser maior que a data anterior';
    }
  },

  minLength: (min: number) => (value: string): string | undefined => {
    if (isNotEmpty(value) && value!.length < min) {
      return `Mínimo de ${min} caracteres`;
    }
  },

  maxLength: (max: number) => (value: string): string | undefined => {
    if (isNotEmpty(value) && value!.length > max) {
      return `Máximo de ${max} caracteres`;
    }
  },
};
