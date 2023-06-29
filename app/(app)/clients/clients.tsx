'use client'

import { Button } from '@/components/ui/button'
import { Client } from '@prisma/client'
import Link from 'next/link'

type ClientListProps = {
  clients: Client[]
}

export const ClientList = ({ clients }: ClientListProps) => {
  console.log('Clients', clients)
  return (
    <ul>
      {clients.map((client) => (
        <li key={client.id + client.name}>
          <Link href={`/clients/${client.id}`}>{client.name}</Link>
        </li>
      ))}
    </ul>
  )
}

export const ClientListHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium mb-2">Clients</h2>
      <Button asChild>
        <Link href="/clients/new">Create</Link>
      </Button>
    </div>
  )
}
