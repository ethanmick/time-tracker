import { getUserSession } from '@/lib/auth'
import Image from 'next/image'

export default async function ProfilePage() {
  const user = await getUserSession()

  return (
    <div>
      <h1 className="text-3xl mb-4">Profile</h1>
      <div className="flex">
        <div className="flex-grow flex-col flex gap-4">
          <h2 className="font-semibold">Details</h2>
          <div>
            <div className="font-semibold">Name</div>
            <div>{user.name}</div>
          </div>
          <div>
            <div className="font-semibold">email</div>
            <div>{user.email}</div>
          </div>
        </div>
        <div className="w-[150px]">
          <h2 className="font-semibold mb-4">Picture</h2>
          <Image
            className="rounded-full"
            alt="Profile Picture"
            src={user.image || ''}
            width={150}
            height={150}
          />
          <span className="text-neutral-600 text-xs">
            If you&apos;d like to change your profile picture, you can edit it
            on{' '}
            <a
              className="text-blue-500 hover:text-blue-600"
              href="https://myaccount.google.com/profile/photo/edit"
              target="_blank"
            >
              Google here.
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}
