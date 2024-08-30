const generateConsoleScript = () => {
  return `<script>
    const customConsole = (w) => {
      const pushToConsole = (payload, type) => {
        w.parent.postMessage({
          console: {
            payload: payload,
            type:    type
          }
        }, "*")
      }

      pushToConsole("clear", "system")

      w.onerror = (message, url, line, column) => {
        const DEFAULT_LINE_HEIGHT = 48
        const fixedLine = line - DEFAULT_LINE_HEIGHT
        pushToConsole({line:fixedLine, column, message}, "error")
      }

      const console = {
        log: function(...args){
          pushToConsole(args, "log:log")
        },
        error: function(...args){
          pushToConsole(args, "log:error")
        },
        warn: function(...args){
          pushToConsole(args, "log:warn")
        },
        info: function(...args){
          pushToConsole(args, "log:info")
        }
      }

      window.console = { ...window.console, ...console }
    }

    if (window.parent){
      customConsole(window)
    }
  </script>`
}

export const createHtml = ({js }: { js: string }) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Preview</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${generateConsoleScript()}
    <script type="module">
${js}
    </script>
  </head>
  <body>
  </body>
</html>`
}
