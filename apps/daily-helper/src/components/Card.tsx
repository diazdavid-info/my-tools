import type {PropsWithChildren} from "react";

type CardProps = {
  name: string
  storyName: string
  statusName: string
  storyId: string
  imageAssign: string
}

export const Card = (props: PropsWithChildren<CardProps>) => {
  const {name, storyName, statusName, storyId, imageAssign } = props

  return (
    <div className="bg-gray-700 rounded-sm m-1 p-2">
        <p className="text-sm mb-2 text-ellipsis line-clamp-3">{name}</p>
        <p className="text-xs mb-2 bg-red-500 text-gray-950 font-bold px-1 py-0.5 rounded text-ellipsis line-clamp-1 uppercase">{storyName}</p>
        <p className="text-xs mb-2">{statusName}</p>
        <div className="flex flex-row justify-between mb-2">
            <p className="text-sm">{storyId}</p>
            <img className="rounded-full w-5" src={imageAssign} alt="imagen"/>
        </div>
    </div>
  )
}


