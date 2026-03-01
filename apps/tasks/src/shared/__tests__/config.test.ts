import * as fileSystem from '../file-system'
import * as encoder from '../encoder'
import { init, isJiraConfigured } from '../config'
import { contentConfig } from '../config-template'

describe('config', () => {
  const createDirSpy = jest.spyOn(fileSystem, 'createDir').mockResolvedValue()
  const pathExistSpy = jest
    .spyOn(fileSystem, 'pathExists')
    .mockReturnValue(false)
  const homeDirSpy = jest.spyOn(fileSystem, 'homeDir').mockReturnValue('')
  const writeFileSpy = jest.spyOn(fileSystem, 'writeFile').mockResolvedValue()
  const processDirSpy = jest.spyOn(fileSystem, 'processDir').mockReturnValue('')
  const readFileSpy = jest.spyOn(fileSystem, 'readFile').mockResolvedValue('')
  const base64EncodeSpy = jest
    .spyOn(encoder, 'base64Encode')
    .mockReturnValue('')

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('init', () => {
    it('Should init config when not exist', async () => {
      pathExistSpy.mockReturnValue(false)
      homeDirSpy.mockReturnValue('/homeFake')

      await init()

        expect(createDirSpy).toHaveBeenCalledWith('/homeFake/.mytools')
        expect(pathExistSpy).toHaveBeenCalledWith('/homeFake/.mytools/config')
        expect(pathExistSpy).toHaveBeenCalledWith('/homeFake/.mytools')
        expect(writeFileSpy).toHaveBeenCalledWith(
          '/homeFake/.mytools/config',
          JSON.stringify(contentConfig, null, 2)
        )
    })
    it('Should not init config when exist', async () => {
      pathExistSpy.mockReturnValue(true)

      await init()

        expect(createDirSpy).toHaveBeenCalledTimes(0)
        expect(writeFileSpy).toHaveBeenCalledTimes(0)
    })
  })
  describe('isJiraConfigured', () => {
    it('Should be true when jira is general configured', async () => {
      const contentFile = contentConfig
      contentFile.tools.jira.domain = 'fakeDomain'
      contentFile.tools.jira.authorization = 'key'
      processDirSpy.mockReturnValue('/fakeDir')
      base64EncodeSpy.mockReturnValue('base64fake')
      homeDirSpy.mockReturnValue('/homeFake')
      readFileSpy.mockResolvedValue(JSON.stringify({ ...contentFile }))

      const isConfigured = await isJiraConfigured()

        expect(base64EncodeSpy).toHaveBeenCalledWith('/fakeDir')
        expect(readFileSpy).toHaveBeenCalledWith('/homeFake/.mytools/config')
        expect(isConfigured).toBeTruthy()
      })
      it('Should be true when jira is project configured', async () => {
        const contentFile = contentConfig
        contentFile.projects = {
          base64fake: {
            tools: { jira: { domain: 'fakeDomain', authorization: 'key' } },
            createdAt: 1697575949,
            updatedAt: 1697575949,
            tasks: [],
          },
        }
        processDirSpy.mockReturnValue('/fakeDir')
        base64EncodeSpy.mockReturnValue('base64fake')
        homeDirSpy.mockReturnValue('/homeFake')
        readFileSpy.mockResolvedValue(JSON.stringify({ ...contentFile }))

        const isConfigured = await isJiraConfigured()

        expect(base64EncodeSpy).toHaveBeenCalledWith('/fakeDir')
        expect(readFileSpy).toHaveBeenCalledWith('/homeFake/.mytools/config')
      expect(isConfigured).toBeTruthy()
    })
  })
})
