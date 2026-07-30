import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders the localized low-stock state', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'LOW' } })
    expect(wrapper.text()).toContain('Stock bajo')
    expect(wrapper.classes()).toContain('pf-badge-warning')
  })
})
