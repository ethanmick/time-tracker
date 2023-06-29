'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateActivity(data: FormData) {
  await prisma.activity.update({
    where: {
      id: data.get('id') as string
    },
    data: {
      name: data.get('name') as string,
      startAt: data.get('startAt') as string,
      endAt: data.get('endAt') as string
    }
  })

  revalidatePath('/track')
}

export async function deleteActivity(id: string) {
  await prisma.activity.delete({
    where: {
      id
    }
  })
  revalidatePath('/track')
}
