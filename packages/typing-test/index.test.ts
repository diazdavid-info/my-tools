import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { typing } from './index'
import { fireEvent, waitFor } from '@testing-library/dom'

describe('typing', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    document.body.innerHTML = `
        <p data-text="foo" id="element">
            <span data-right-char="b">b</span>
            <span data-right-char="a">a</span>
            <span data-right-char="r">r</span>
       </p>`
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('Should has focus when init typing', async () => {
    const finishCallback = vi.fn()

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    expect(document.activeElement).toBe(result)
  })
  it('Should call to callback when user typing all characters', async () => {
    const finishCallback = vi.fn()

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    fireEvent.change(result, { target: { value: 'ptu' } })

    await waitFor(() => expect(finishCallback).toHaveBeenCalledTimes(1))
  })
  it('Should add successClass in correct elements', async () => {
    const finishCallback = vi.fn()

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    fireEvent.change(result, { target: { value: 'eaw' } })

    await waitFor(() => {
      const correctElements = selectorAll<HTMLSpanElement[]>('.correct')
      const correctCharacters = correctElements.map((element: HTMLSpanElement) => element.innerText)

      expect(correctElements.length).toBe(1)
      expect(Array.from(correctCharacters)).toEqual(['a'])
    })
  })
  it('Should add successClass when typing remove and typing correct character', async () => {
    const finishCallback = vi.fn()

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    fireEvent.change(result, { target: { value: 'a' } })

    await waitFor(() => {
      const inCorrectElements = selectorAll<HTMLSpanElement[]>('.incorrect')
      const inCorrectCharacters = inCorrectElements.map((element: HTMLSpanElement) => element.innerText)

      expect(inCorrectElements.length).toBe(1)
      expect(Array.from(inCorrectCharacters)).toEqual(['b'])
    })

    fireEvent.change(result, { target: { value: 'b' } })

    await waitFor(() => {
      const inCorrectElements = selectorAll<HTMLSpanElement[]>('.incorrect')

      expect(inCorrectElements.length).toBe(0)

      const correctElements = selectorAll<HTMLSpanElement[]>('.correct')
      const correctCharacters = correctElements.map((element: HTMLSpanElement) => element.innerText)

      expect(correctElements.length).toBe(1)
      expect(Array.from(correctCharacters)).toEqual(['b'])
    })
  })
  it('Should add wrongClass in incorrect elements', async () => {
    const finishCallback = vi.fn()

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    fireEvent.change(result, { target: { value: 'eaw' } })

    await waitFor(() => {
      const correctElements = selectorAll<HTMLSpanElement[]>('.incorrect')
      const correctCharacters = correctElements.map((element: HTMLSpanElement) => element.innerText)

      expect(correctElements.length).toBe(2)
      expect(Array.from(correctCharacters)).toEqual(['b', 'r'])
    })
  })
  it('Should call finish callback with count wrong characters', async () => {
    const finishCallback = vi.fn()

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    fireEvent.change(result, { target: { value: 'eaw' } })

    await waitFor(() => expect(finishCallback).toBeCalled())
    expect(finishCallback).toHaveBeenCalledWith(expect.objectContaining({ wrongCounter: 2 }))
  })
  it('Should call finish callback with time in seconds', async () => {
    const finishCallback = vi.fn()
    vi.setSystemTime(new Date(2000, 0, 1, 0, 0, 0))

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    fireEvent.change(result, { target: { value: 'e' } })

    await waitFor(() => {
      const correctElements = selectorAll<HTMLSpanElement[]>('.incorrect')
      expect(correctElements.length).toBe(1)
    })

    vi.setSystemTime(new Date(2000, 0, 1, 0, 0, 10))
    fireEvent.change(result, { target: { value: 'bar' } })

    await waitFor(() => expect(finishCallback).toBeCalled())
    expect(finishCallback).toHaveBeenCalledWith(expect.objectContaining({ secondsStart: 10 }))
  })
  it('Should call finish callback with charactersMinute in seconds', async () => {
    const finishCallback = vi.fn()
    vi.setSystemTime(new Date(2000, 0, 1, 0, 0, 0))

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    fireEvent.change(result, { target: { value: 'b' } })

    await waitFor(() => {
      const correctElements = selectorAll<HTMLSpanElement[]>('.correct')

      expect(correctElements.length).toBe(1)
    })

    vi.setSystemTime(new Date(2000, 0, 1, 0, 0, 3))
    fireEvent.change(result, { target: { value: 'bar' } })

    await waitFor(() => expect(finishCallback).toBeCalled())
    expect(finishCallback).toHaveBeenCalledWith(expect.objectContaining({ charactersMinute: 60 }))
  })
  it('Should call finish callback with wroteCounter', async () => {
    const finishCallback = vi.fn()

    const result = typing({
      readElement: selector<HTMLParagraphElement>('#element'),
      rightClass: 'correct',
      wrongClass: 'incorrect',
      finishCallback
    })

    fireEvent.change(result, { target: { value: 'b z' } })

    await waitFor(() => expect(finishCallback).toBeCalled())
    expect(finishCallback).toHaveBeenCalledWith(expect.objectContaining({ wroteCounter: 3 }))
  })

  function selectorAll<T>(query: string): T {
    return document.querySelectorAll(query) as unknown as T
  }
  function selector<T>(query: string): T {
    return document.querySelector(query) as unknown as T
  }
})
