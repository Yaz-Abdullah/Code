import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
// import { getTopInteractedTags } from '@/lib/actions/tag.action'
// import RenderTag from '../shared/RenderTag'
import { Badge } from '../ui/badge'

interface UserCardProps {
  user: {
    _id: string
    clerkId: string
    name: string
    username: string
    picture: string
  }
}
const UserCard = async({user}: UserCardProps) => {
  // const interactedTags = await getTopInteractedTags({userId: user._id});
  // console.log(interactedTags);
  return (
    <Link href={`/profile/${user.clerkId}`} className='shadow-light100_darknone max-xs:min-w-full xs:w-[260px]'>
      <article className='background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8'>
        <Image 
          src={user.picture}
          alt=' user picture'
          width={100}
          height={100}
          className='rounded-full'
        />
        
        <div className='mt-5'>
          <Badge className='text-light400_light500 background-light800_dark300'>
            {user.name}
          </Badge>
          {/* {interactedTags.length > 0 ? (
            <div className='flex items-center gap-2'>
              {interactedTags.map((tag) => (
                <RenderTag 
                  key={tag._id}
                  _id={tag._id}
                  name={tag.name}
                />
              ))}
            </div>
          ) : (
            <Badge className='text-light400_light500 background-light800_dark300'>
              No tags yet
            </Badge>
          )
          } */}
        </div>
      </article>
    </Link>
  )
}

export default UserCard