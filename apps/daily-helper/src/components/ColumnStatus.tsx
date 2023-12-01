import React from "preact/compat";
import type {PropsWithChildren} from "react";

type ColumnStatusProps = {
  name: string
}

export const ColumnStatus = ({name, children}: PropsWithChildren<ColumnStatusProps>) => {
  return (
    <section className="bg-black rounded flex-1">
        <header className="px-3 py-4 text-sm">{name}</header>
        {children}
    </section>
  )
}
