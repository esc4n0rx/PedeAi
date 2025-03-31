import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Valida CPF ou CNPJ
 * @param value CPF ou CNPJ para validar
 * @returns boolean indicando se é válido
 */
export function validateCpfCnpj(value: string): boolean {
  // Remove caracteres não numéricos
  const cleanValue = value.replace(/[^\d]/g, "")

  // Verifica se é CPF (11 dígitos) ou CNPJ (14 dígitos)
  if (cleanValue.length === 11) {
    return validateCpf(cleanValue)
  } else if (cleanValue.length === 14) {
    return validateCnpj(cleanValue)
  }

  return false
}

/**
 * Valida CPF
 * @param cpf CPF para validar (apenas números)
 * @returns boolean indicando se é válido
 */
function validateCpf(cpf: string): boolean {
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) {
    return false
  }

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }

  let remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }

  if (remainder !== Number.parseInt(cpf.charAt(9))) {
    return false
  }

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }

  remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }

  if (remainder !== Number.parseInt(cpf.charAt(10))) {
    return false
  }

  return true
}

/**
 * Valida CNPJ
 * @param cnpj CNPJ para validar (apenas números)
 * @returns boolean indicando se é válido
 */
function validateCnpj(cnpj: string): boolean {
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) {
    return false
  }

  // Validação do primeiro dígito verificador
  let size = cnpj.length - 2
  let numbers = cnpj.substring(0, size)
  const digits = cnpj.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += Number.parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) {
      pos = 9
    }
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== Number.parseInt(digits.charAt(0))) {
    return false
  }

  // Validação do segundo dígito verificador
  size = size + 1
  numbers = cnpj.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += Number.parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) {
      pos = 9
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== Number.parseInt(digits.charAt(1))) {
    return false
  }

  return true
}

/**
 * Formata um valor para moeda brasileira
 * @param value Valor a ser formatado
 * @returns String formatada (ex: R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formata uma data para o formato brasileiro
 * @param date Data a ser formatada
 * @returns String formatada (ex: 01/01/2023)
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR").format(dateObj)
}

/**
 * Formata uma data e hora para o formato brasileiro
 * @param date Data a ser formatada
 * @returns String formatada (ex: 01/01/2023 12:34)
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}

