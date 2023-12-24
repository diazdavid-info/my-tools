import { useMDXComponent } from 'next-contentlayer/hooks'
import { FC } from 'react'
import { Preview } from '@/components/preview'

const mdxComponents = {
  Preview
}

type MdxProps = {
  code: string
}

export const Mdx: FC<MdxProps> = function ({ code }) {
  const Component = useMDXComponent(code)
  return <Component components={mdxComponents} />
}
