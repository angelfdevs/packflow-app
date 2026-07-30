import { afterEach, vi } from 'vitest'
import { config } from '@vue/test-utils'

config.global.stubs = {
  RouterLink: { template: '<a><slot /></a>' },
  RouterView: { template: '<div><slot /></div>' },
  CIcon: { template: '<span aria-hidden="true"></span>' },
}

afterEach(() => {
  vi.restoreAllMocks()
})
