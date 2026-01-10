import { redirect } from 'next/navigation'

export default function FirmaEinrichtenPage() {
  // Just redirect to the dashboard - company setup is already handled
  redirect('/projekte')
}
