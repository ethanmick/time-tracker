'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Role } from '@prisma/client'
import React, { useState, useTransition } from 'react'

const roles: Role[] = ['OWNER', 'ADMIN', 'BILLING', 'USER', 'TRACKER', 'VIEWER']

function capitalizeWord(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

type Props = React.FormHTMLAttributes<'form'> & {
  onRoleUpdate: (data: { id: string; role: Role }) => void
  role: string
  id: string
}

export const UpdateRoleForm = ({ id, onRoleUpdate, role: initial }: Props) => {
  const [role, setRole] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const onChange = (role: Role) => {
    setRole(role)
    startTransition(() => onRoleUpdate({ id, role }))
  }

  return (
    <form>
      <Select value={role} onValueChange={(value) => onChange(value as Role)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>User Roles</SelectLabel>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {capitalizeWord(role)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </form>
  )
}
