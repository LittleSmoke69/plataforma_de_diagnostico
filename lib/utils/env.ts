/**
 * Utilitário para validação de variáveis de ambiente
 */

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value) {
    throw new Error(`Variável de ambiente ${key} não configurada`)
  }

  return value
}

export function getOptionalEnvVar(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

