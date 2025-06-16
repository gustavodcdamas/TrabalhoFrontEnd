import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  // Se o campo estiver vazio, considerar válido (campo opcional)
  if (!control.value) {
    return null;
  }

  const cpf = control.value.replace(/\D/g, '');

  // Se não tem 11 dígitos, é inválido
  if (cpf.length !== 11) {
    return { invalidCpf: true };
  }

  // Verificar se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return { invalidCpf: true };
  }

  // ✅ ALGORITMO DE VALIDAÇÃO CORRIGIDO
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  let peso = 10;
  
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * peso;
    peso--;
  }
  
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;

  if (parseInt(cpf.charAt(9)) !== digito1) {
    return { invalidCpf: true };
  }

  // Validação do segundo dígito verificador
  soma = 0;
  peso = 11;
  
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * peso;
    peso--;
  }
  
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;

  if (parseInt(cpf.charAt(10)) !== digito2) {
    return { invalidCpf: true };
  }

  // Se chegou até aqui, CPF é válido
  return null;
}

// Versão que retorna ValidatorFn
export function cpfValidatorFn(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return cpfValidator(control);
  };
}

// ✅ FUNÇÃO AUXILIAR PARA TESTAR CPFs
export function testCpf(cpf: string): boolean {
  const result = cpfValidator({ value: cpf } as AbstractControl);
  return result === null;
}

// ✅ FUNÇÃO PARA FORMATAR CPF
export function formatCpf(value: string): string {
  if (!value) return '';
  
  let cpf = value.replace(/\D/g, '');
  if (cpf.length > 11) cpf = cpf.substring(0, 11);
  
  // Aplicar máscara progressivamente
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return cpf.replace(/(\d{3})(\d+)/, '$1.$2');
  if (cpf.length <= 9) return cpf.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
}

// ✅ LISTA DE CPFs VÁLIDOS PARA TESTE
export const validTestCpfs = [
  '11144477735',  // CPF válido comum
  '12345678909',  // Outro CPF válido
  '98765432100',  // Outro CPF válido
];

// ✅ FUNÇÃO PARA VALIDAR APENAS NÚMEROS DO CPF
export function isValidCpfNumbers(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.length === 11 && !(/^(\d)\1{10}$/.test(numbers));
}