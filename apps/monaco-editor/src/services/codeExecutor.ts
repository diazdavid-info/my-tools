export const execute = async (code: string): Promise<string> => {
  const responseFetch = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: 'javascript',
      version: '18.15.0',
      files: [{
        content: code
      }]
    })
  })

  const responseJson = await responseFetch.json()

  const {run} = responseJson
  const {output} = run

  return output
}
