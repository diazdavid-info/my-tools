import * as React from 'react'

export type ButtonProps = {
  children: React.ReactNode
}

export function Button(props: ButtonProps) {
  return <button>{props.children}</button>
}

Button.displayName = 'Button'
