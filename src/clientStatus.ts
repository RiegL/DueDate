import type { Client, ClientStatus } from './types'

export function getClientStatus(client: Client): ClientStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  if (client.lastPaidAt) {
    const paidDate = client.lastPaidAt.toDate()
    if (
      paidDate.getMonth() === currentMonth &&
      paidDate.getFullYear() === currentYear
    ) {
      return 'paid'
    }
  }

  const dueDate = new Date(currentYear, currentMonth, client.dueDay)
  const diffDays = Math.round(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'due-today'
  if (diffDays <= 3) return 'due-soon'
  return 'ok'
}

export const STATUS_PRIORITY: Record<ClientStatus, number> = {
  overdue: 0,
  'due-today': 1,
  'due-soon': 2,
  ok: 3,
  paid: 4,
}

export const STATUS_LABEL: Record<ClientStatus, string> = {
  paid: 'Pago',
  overdue: 'Vencido',
  'due-today': 'Vence Hoje',
  'due-soon': 'Vence em breve',
  ok: 'Em dia',
}

export const STATUS_SEVERITY: Record<
  ClientStatus,
  'success' | 'danger' | 'warning' | 'info'
> = {
  paid: 'success',
  overdue: 'danger',
  'due-today': 'danger',
  'due-soon': 'warning',
  ok: 'info',
}

export function formatDueDate(dueDay: number): string {
  const today = new Date()
  const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)
  return dueDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getWhatsAppUrl(
  phone: string,
  name: string,
  dueDay: number
): string {
  const cleaned = phone.replace(/\D/g, '')
  const withCountry = cleaned.startsWith('55') ? cleaned : `55${cleaned}`
  const message = `Ola ${name}! Passando para lembrar que seu plano vence no dia *${dueDay}*. Qualquer duvida, estou a disposicao!`
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`
}
