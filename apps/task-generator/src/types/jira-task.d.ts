export type JiraTask = {
  fields: Fields
}

type Fields = {
  comment: FieldsComment
}

type FieldsComment = {
  comments: CommentElement[]
}

type CommentElement = {
  body: Body
}

type Body = {
  content: BodyContent[]
}

type BodyContent = HeadingContent | BulletListContent | ParagraphContent

type HeadingContent = {
  type: 'heading'
  content: { type: string; text: string }[]
}

type BulletListContent = {
  type: 'bulletList'
  content: ListItemContent[]
}

type ListItemContent = {
  type: 'listItem'
  content: (ParagraphContent | BulletListContent)[]
}

type ParagraphContent = {
  type: 'paragraph'
  content: { type: 'text'; text: string }[]
}
