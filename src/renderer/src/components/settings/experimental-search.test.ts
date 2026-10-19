import { afterEach, describe, expect, it } from 'vitest'

import { i18n, setRendererPluginLanguagePacks } from '@/i18n/i18n'
import { DEFAULT_LOCALE } from '@/i18n/supported-languages'
import {
  parsePluginLanguagePackArtifact,
  pluginLanguageResourceId
} from '../../../../shared/plugins/plugin-language-pack-artifact'
import { getExperimentalSearchEntry } from './experimental-search'

const PACK_ID = 'plugin:example.chinese/zh-TW' as const
const RESOURCE_LANGUAGE = pluginLanguageResourceId(PACK_ID)

function setTerminalAttentionTitle(title: string): void {
  const parsed = parsePluginLanguagePackArtifact(
    JSON.stringify({
      auto: {
        components: {
          settings: {
            experimental: {
              search: { '9e4ddf776d': title }
            }
          }
        }
      }
    })
  )
  if (!parsed.ok) {
    throw new Error(parsed.error)
  }

  setRendererPluginLanguagePacks([
    {
      id: PACK_ID,
      resourceLanguage: RESOURCE_LANGUAGE,
      pluginKey: 'example.chinese',
      locale: 'zh-TW',
      catalog: parsed.catalog
    }
  ])
}

afterEach(async () => {
  setRendererPluginLanguagePacks([])
  await i18n.changeLanguage(DEFAULT_LOCALE)
})

describe('experimental search catalog', () => {
  it('keeps the translated search entry stable while its language pack is unchanged', async () => {
    setTerminalAttentionTitle('終端關注')
    await i18n.changeLanguage(RESOURCE_LANGUAGE)

    expect(getExperimentalSearchEntry().terminalAttention.title).toBe('終端關注')
    expect(getExperimentalSearchEntry().terminalAttention.title).toBe('終端關注')
  })

  it('looks up an entry after its active plugin language pack is updated in place', async () => {
    setTerminalAttentionTitle('終端關注')
    await i18n.changeLanguage(RESOURCE_LANGUAGE)

    expect(getExperimentalSearchEntry().terminalAttention.title).toBe('終端關注')

    setTerminalAttentionTitle('終端機關注')

    expect(getExperimentalSearchEntry().terminalAttention.title).toBe('終端機關注')
  })
})
