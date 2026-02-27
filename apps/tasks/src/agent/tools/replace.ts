type Replacer = (content: string, find: string) => Generator<string, void, unknown>
type LineRange = { startLine: number; endLine: number }

const MULTI_CANDIDATE_MIN_SIMILARITY = 0.3

function levenshtein(a: string, b: string): number {
  if (a === '' || b === '') return Math.max(a.length, b.length)

  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  )

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[a.length][b.length]
}

const splitLines = (text: string): string[] => text.split('\n')

const splitLinesWithoutTrailingEmpty = (text: string): string[] => {
  const lines = splitLines(text)
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

const buildLineStartOffsets = (lines: string[]): number[] => {
  const starts = [0]
  for (const line of lines) {
    starts.push(starts[starts.length - 1] + line.length + 1)
  }
  return starts
}

const getContentByLineRange = (
  content: string,
  lineStarts: number[],
  range: LineRange
): string => {
  const start = lineStarts[range.startLine]
  const endExclusive = lineStarts[range.endLine + 1] - 1
  return content.substring(start, endExclusive)
}

const findAnchoredRanges = (
  lines: string[],
  firstLine: string,
  lastLine: string
): LineRange[] => {
  const ranges: LineRange[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== firstLine) continue
    for (let j = i + 2; j < lines.length; j++) {
      if (lines[j].trim() === lastLine) {
        ranges.push({ startLine: i, endLine: j })
        break
      }
    }
  }
  return ranges
}

const calculateLineSimilarity = (a: string, b: string): number => {
  const left = a.trim()
  const right = b.trim()
  const maxLen = Math.max(left.length, right.length)
  if (maxLen === 0) return 0
  return 1 - levenshtein(left, right) / maxLen
}

const calculateBlockSimilarity = (
  contentLines: string[],
  searchLines: string[],
  range: LineRange,
  breakOnNonNegative: boolean
): number => {
  const searchBlockSize = searchLines.length
  const actualBlockSize = range.endLine - range.startLine + 1
  const linesToCheck = Math.min(searchBlockSize - 2, actualBlockSize - 2)
  if (linesToCheck <= 0) return 1

  let similarity = 0
  for (let j = 1; j < searchBlockSize - 1 && j < actualBlockSize - 1; j++) {
    similarity +=
      calculateLineSimilarity(contentLines[range.startLine + j], searchLines[j]) /
      linesToCheck
    if (breakOnNonNegative && similarity >= 0) break
  }
  return similarity
}

const SimpleReplacer: Replacer = function* (_content, find) {
  yield find
}

const LineTrimmedReplacer: Replacer = function* (content, find) {
  const originalLines = splitLines(content)
  const searchLines = splitLinesWithoutTrailingEmpty(find)
  const lineStarts = buildLineStartOffsets(originalLines)

  for (let i = 0; i <= originalLines.length - searchLines.length; i++) {
    let matches = true
    for (let j = 0; j < searchLines.length; j++) {
      if (originalLines[i + j].trim() !== searchLines[j].trim()) {
        matches = false
        break
      }
    }

    if (matches) {
      yield getContentByLineRange(content, lineStarts, {
        startLine: i,
        endLine: i + searchLines.length - 1,
      })
    }
  }
}

const BlockAnchorReplacer: Replacer = function* (content, find) {
  const originalLines = splitLines(content)
  const searchLines = splitLines(find)

  if (searchLines.length < 3) return
  if (searchLines[searchLines.length - 1] === '') searchLines.pop()

  const firstLineSearch = searchLines[0].trim()
  const lastLineSearch = searchLines[searchLines.length - 1].trim()
  const lineStarts = buildLineStartOffsets(originalLines)

  const candidates = findAnchoredRanges(
    originalLines,
    firstLineSearch,
    lastLineSearch
  )

  if (candidates.length === 0) return

  if (candidates.length === 1) {
    const candidate = candidates[0]
    const similarity = calculateBlockSimilarity(
      originalLines,
      searchLines,
      candidate,
      true
    )
    if (similarity >= 0)
      yield getContentByLineRange(content, lineStarts, candidate)
    return
  }

  let bestMatch: LineRange | null = null
  let maxSimilarity = -1

  for (const candidate of candidates) {
    const similarity = calculateBlockSimilarity(
      originalLines,
      searchLines,
      candidate,
      false
    )
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity
      bestMatch = candidate
    }
  }

  if (maxSimilarity >= MULTI_CANDIDATE_MIN_SIMILARITY && bestMatch)
    yield getContentByLineRange(content, lineStarts, bestMatch)
}

const WhitespaceNormalizedReplacer: Replacer = function* (content, find) {
  const normalize = (text: string) => text.replace(/\s+/g, ' ').trim()
  const normalizedFind = normalize(find)
  const lines = splitLines(content)

  for (const line of lines) {
    if (normalize(line) === normalizedFind) {
      yield line
    } else {
      const normalizedLine = normalize(line)
      if (normalizedLine.includes(normalizedFind)) {
        const words = find.trim().split(/\s+/)
        if (words.length > 0) {
          const pattern = words
            .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('\\s+')
          try {
            const match = line.match(new RegExp(pattern))
            if (match) yield match[0]
          } catch {}
        }
      }
    }
  }

  const findLines = splitLines(find)
  if (findLines.length > 1) {
    for (let i = 0; i <= lines.length - findLines.length; i++) {
      const block = lines.slice(i, i + findLines.length)
      if (normalize(block.join('\n')) === normalizedFind) yield block.join('\n')
    }
  }
}

const IndentationFlexibleReplacer: Replacer = function* (content, find) {
  const removeIndentation = (text: string) => {
    const lines = splitLines(text)
    const nonEmpty = lines.filter((l) => l.trim().length > 0)
    if (nonEmpty.length === 0) return text

    const minIndent = Math.min(
      ...nonEmpty.map((l) => {
        const m = l.match(/^(\s*)/)
        return m ? m[1].length : 0
      })
    )

    return lines
      .map((l) => (l.trim().length === 0 ? l : l.slice(minIndent)))
      .join('\n')
  }

  const normalizedFind = removeIndentation(find)
  const contentLines = splitLines(content)
  const findLines = splitLines(find)

  for (let i = 0; i <= contentLines.length - findLines.length; i++) {
    const block = contentLines.slice(i, i + findLines.length).join('\n')
    if (removeIndentation(block) === normalizedFind) yield block
  }
}

const EscapeNormalizedReplacer: Replacer = function* (content, find) {
  const unescape = (str: string): string =>
    str.replace(
      /\\(n|t|r|'|"|`|\\|\n|\$)/g,
      (match, ch) =>
        ({
          n: '\n',
          t: '\t',
          r: '\r',
          "'": "'",
          '"': '"',
          '`': '`',
          '\\': '\\',
          '\n': '\n',
          $: '$',
        })[ch as string] ?? match
    )

  const unescapedFind = unescape(find)

  if (content.includes(unescapedFind)) {
    yield unescapedFind
  }

  const lines = splitLines(content)
  const findLines = splitLines(unescapedFind)

  for (let i = 0; i <= lines.length - findLines.length; i++) {
    const block = lines.slice(i, i + findLines.length).join('\n')
    if (unescape(block) === unescapedFind) yield block
  }
}

const TrimmedBoundaryReplacer: Replacer = function* (content, find) {
  const trimmedFind = find.trim()
  if (trimmedFind === find) return

  if (content.includes(trimmedFind)) {
    yield trimmedFind
  }

  const lines = splitLines(content)
  const findLines = splitLines(find)

  for (let i = 0; i <= lines.length - findLines.length; i++) {
    const block = lines.slice(i, i + findLines.length).join('\n')
    if (block.trim() === trimmedFind) yield block
  }
}

const ContextAwareReplacer: Replacer = function* (content, find) {
  const findLines = splitLines(find)
  if (findLines.length < 3) return
  if (findLines[findLines.length - 1] === '') findLines.pop()

  const contentLines = splitLines(content)
  const firstLine = findLines[0].trim()
  const lastLine = findLines[findLines.length - 1].trim()

  for (let i = 0; i < contentLines.length; i++) {
    if (contentLines[i].trim() !== firstLine) continue

    for (let j = i + 2; j < contentLines.length; j++) {
      if (contentLines[j].trim() === lastLine) {
        const blockLines = contentLines.slice(i, j + 1)

        if (blockLines.length === findLines.length) {
          let matching = 0
          let total = 0

          for (let k = 1; k < blockLines.length - 1; k++) {
            const bl = blockLines[k].trim()
            const fl = findLines[k].trim()
            if (bl.length > 0 || fl.length > 0) {
              total++
              if (bl === fl) matching++
            }
          }

          if (total === 0 || matching / total >= 0.5) {
            yield blockLines.join('\n')
            break
          }
        }
        break
      }
    }
  }
}

const replacers: Replacer[] = [
  SimpleReplacer,
  LineTrimmedReplacer,
  BlockAnchorReplacer,
  WhitespaceNormalizedReplacer,
  IndentationFlexibleReplacer,
  EscapeNormalizedReplacer,
  TrimmedBoundaryReplacer,
  ContextAwareReplacer,
]

export function replace(
  content: string,
  oldString: string,
  newString: string
): string {
  if (oldString === newString)
    throw new Error('oldString and newString are identical')

  let notFound = true

  for (const replacer of replacers) {
    for (const search of replacer(content, oldString)) {
      const index = content.indexOf(search)
      if (index === -1) continue
      notFound = false

      const lastIndex = content.lastIndexOf(search)
      if (index !== lastIndex) continue

      return (
        content.substring(0, index) +
        newString +
        content.substring(index + search.length)
      )
    }
  }

  if (notFound)
    throw new Error(
      'Could not find oldString in the file. It must match exactly, including whitespace, indentation, and line endings.'
    )

  throw new Error(
    'Found multiple matches for oldString. Provide more surrounding context to make the match unique.'
  )
}
