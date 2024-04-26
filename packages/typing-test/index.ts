export type OptionsTyping = {
  readElement: HTMLElement
  rightClass: string
  wrongClass: string
  finishCallback: ({
    wrongCounter,
    secondsStart,
    charactersMinute,
    wroteCounter
  }: {
    wrongCounter: number
    secondsStart: number
    charactersMinute: number
    wroteCounter: number
  }) => void
}

export function typing(options: OptionsTyping) {
  const input = createInput()
  const spanElements = options.readElement.querySelectorAll('span')

  run(input, spanElements, options)

  return input
}

function run(input: HTMLInputElement, spanElements: NodeListOf<HTMLSpanElement>, options: OptionsTyping) {
  const textWrote = input.value
  const textWroteList = textWrote.split('')

  input.focus()

  spanElements.forEach((spanElement, index) => {
    spanElement.classList.remove(options.rightClass, options.wrongClass)
    const isFirstInputChar = textWroteList.length === 1 && !spanElements[0].dataset.startCurrentTime
    const isRightChar = spanElement.dataset.rightChar === textWroteList[index]
    const isValidChar = /\w|\s|,|\./.test(textWroteList[index])
    const isWrongChar = isValidChar && textWroteList[index] !== undefined && !isRightChar

    if (isFirstInputChar) spanElements[0].dataset.startCurrentTime = (new Date().valueOf() / 1000).toString()

    if (isRightChar) spanElement.classList.add(options.rightClass)
    if (isWrongChar) {
      spanElement.classList.add(options.wrongClass)
      spanElement.dataset.wrongChar = textWroteList[index]
    }
  })

  const rightCharacters = options.readElement.querySelectorAll(`.${options.rightClass}`).length
  const wrongCharacters = options.readElement.querySelectorAll('[data-wrong-char]').length
  const startCurrentTime = parseInt(spanElements[0].dataset.startCurrentTime ?? '0')

  if (textWroteList.length === spanElements.length) {
    options.finishCallback &&
      options.finishCallback({
        wrongCounter: wrongCharacters,
        secondsStart: startCurrentTime ? Math.round(new Date().valueOf() / 1000 - startCurrentTime) : 0,
        charactersMinute: Math.round((60 * rightCharacters) / (new Date().valueOf() / 1000 - startCurrentTime)),
        wroteCounter: textWroteList.length
      })
    // input.blur()
    return
  }

  //Math.round((60 * rightCharacters) / (new Date().valueOf() / 1000 - startCurrentTime)),

  window.requestAnimationFrame(() => run(input, spanElements, options))

  // const textWrote = input.value
  // const textWroteList = textWrote.split('')
  //
  // input.focus()
  //
  // spanElements.forEach((spanElement, index) => {
  //   spanElement.classList.remove('text-violet-600', 'text-red-500')
  //   const isFirstInputChar = textWroteList.length === 1 && !spanElements[0].dataset.startCurrentTime
  //   const isRightChar = spanElement.dataset.rightChar === textWroteList[index]
  //   const isValidChar = /\w|\s|,|\./.test(textWroteList[index])
  //   const isWrongChar = isValidChar && textWroteList[index] !== undefined && !isRightChar
  //
  //   if (isFirstInputChar) spanElements[0].dataset.startCurrentTime = (new Date().valueOf() / 1000).toString()
  //   if (isRightChar) spanElement.classList.add('text-violet-600')
  //   if (isWrongChar) {
  //     spanElement.classList.add('text-red-500')
  //     spanElement.dataset.wrongChar = textWroteList[index]
  //   }
  // })
  //
  // const wrongCharacters = options.readElement.querySelectorAll('[data-wrong-char]').length
  // const rightCharacters = options.readElement.querySelectorAll('.text-violet-600').length
  // const startCurrentTime = parseInt(spanElements[0].dataset.startCurrentTime ?? '0')
  //
  // options.statisticsCallback &&
  //   options.statisticsCallback({
  //     wrongCounter: wrongCharacters,
  //     wroteCounter: textWroteList.length,
  //     charactersMinute: Math.round((60 * rightCharacters) / (new Date().valueOf() / 1000 - startCurrentTime)),
  //     wordsMinute: 0, //Math.round((60 * countWords) / (new Date().valueOf() / 1000 - startCurrentTime))
  //     secondsStart: startCurrentTime ? Math.round(new Date().valueOf() / 1000 - startCurrentTime) : 0
  //   })
  //
  // if (textWroteList.length === spanElements.length) {
  //   options.finishCallback && options.finishCallback()
  //   input.blur()
  //   return
  // }
  //
  // window.requestAnimationFrame(() => run(input, spanElements, options))
}

function createInput() {
  const input = document.createElement('input')
  input.setAttribute('type', 'text')
  // input.setAttribute('aria-label', 'Text')
  // input.setAttribute('autocomplete', 'off')
  // input.setAttribute('autocapitalize', 'off')
  // input.setAttribute('inputmode', 'text')
  // input.setAttribute('autocorrect', 'off')
  // input.setAttribute('spellcheck', 'false')
  // if(!debug) input.classList.add('opacity-0')
  document.querySelector('body')?.appendChild(input)
  return input
}
