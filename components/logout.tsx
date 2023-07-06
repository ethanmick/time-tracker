'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { DropdownMenuItem } from './ui/dropdown-menu'

export const Logout = () => (
  <DropdownMenuItem
    className="text-red-500 cursor-pointer"
    onClick={() => signOut()}
  >
    <LogOut className="mr-2 h-4 w-4" />
    <span>Log out</span>
  </DropdownMenuItem>
)
