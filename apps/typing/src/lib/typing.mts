export type StatisticsCallback = {
  wrongCounter: number
  wroteCounter: number
  charactersMinute: number
  wordsMinute: number
  secondsStart: number
}

export type OptionsTyping = {
  readElement: HTMLElement
  statisticsCallback?: ({wrongCounter, wroteCounter}: StatisticsCallback) => void
  finishCallback?: () => void
  debug?: boolean
}

export const typing = (options: OptionsTyping) => {
  const input = createInput({debug: options.debug ?? false})
  const spanElements = options.readElement.querySelectorAll('span')
  run(input, spanElements, options)
}

const run = (input: HTMLInputElement, spanElements: NodeListOf<HTMLSpanElement>, options: OptionsTyping) => {
  const textWrote = input.value
  const textWroteList = textWrote.split('')

  input.focus()

  spanElements.forEach((spanElement, index) => {
    spanElement.classList.remove('text-violet-600', 'text-red-500')
    const isFirstInputChar = textWroteList.length === 1 && !spanElements[0].dataset.startCurrentTime
    const isRightChar = spanElement.dataset.rightChar === textWroteList[index]
    const isValidChar = /\w|\s|,|\./.test(textWroteList[index])
    const isWrongChar = isValidChar && textWroteList[index] !== undefined && !isRightChar

    if (isFirstInputChar) spanElements[0].dataset.startCurrentTime = (new Date().valueOf() / 1000).toString()
    if (isRightChar) spanElement.classList.add('text-violet-600')
    if (isWrongChar) {
      spanElement.classList.add('text-red-500')
      spanElement.dataset.wrongChar = textWroteList[index]
    }
  })

  const wrongCharacters = options.readElement.querySelectorAll('[data-wrong-char]').length
  const rightCharacters = options.readElement.querySelectorAll('.text-violet-600').length
  const startCurrentTime = parseInt(spanElements[0].dataset.startCurrentTime ?? '0')

  options.statisticsCallback && options.statisticsCallback({
    wrongCounter: wrongCharacters,
    wroteCounter: textWroteList.length,
    charactersMinute: Math.round((60 * rightCharacters) / (new Date().valueOf() / 1000 - startCurrentTime)),
    wordsMinute: 0, //Math.round((60 * countWords) / (new Date().valueOf() / 1000 - startCurrentTime))
    secondsStart: Boolean(startCurrentTime) ? Math.round(new Date().valueOf() / 1000 - startCurrentTime) : 0
  })

  if (textWroteList.length === spanElements.length) {
    options.finishCallback && options.finishCallback()
    input.blur()
    return
  }

  window.requestAnimationFrame(() => run(input, spanElements, options))
}

const createInput = ({debug}: {debug: boolean}) => {
  const input = document.createElement('input')
  input.setAttribute('type', 'text')
  input.setAttribute('aria-label', 'Text')
  input.setAttribute('autocomplete', 'off')
  input.setAttribute('autocapitalize', 'off')
  input.setAttribute('inputmode', 'text')
  input.setAttribute('autocorrect', 'off')
  input.setAttribute('spellcheck', 'false')
  if(!debug) input.classList.add('opacity-0')
  document.querySelector('body')?.appendChild(input)
  return input
}
