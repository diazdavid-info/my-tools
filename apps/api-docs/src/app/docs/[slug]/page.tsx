import { allPosts } from 'contentlayer/generated'
import { Mdx } from '@/components/mdx'

export const generateStaticParams = async () => allPosts.map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`)
  return { title: post.title }
}

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`)

  return (
    <article className="mx-auto max-w-xl py-8">
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{post.description}</p>
      <Mdx code={post.body.code} />
    </article>
  )
}

export default PostLayout
