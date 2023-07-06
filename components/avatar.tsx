'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Session } from 'next-auth'
import Link from 'next/link'
import { Logout } from './logout'
import { AvatarFallback, AvatarImage, Avatar as RootAvatar } from './ui/avatar'

export const Avatar = ({ user }: { user: Session['user'] }) => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <RootAvatar>
        {user.image && (
          <AvatarImage src={user.image} referrerPolicy="no-referrer" />
        )}
        {!user.image && <AvatarFallback>{user.name}</AvatarFallback>}
      </RootAvatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="w-full cursor-pointer">
        <Link href="/admin/profile">Profile</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="w-full cursor-pointer">
        <Link href="/admin/team">Team</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="w-full cursor-pointer">
        <Link href="/admin/billing">Billing</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <Logout />
    </DropdownMenuContent>
  </DropdownMenu>
)
