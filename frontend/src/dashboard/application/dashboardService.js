import { dashboardApi } from '../infrastructure/dashboardApi'

export const dashboardService = {
  getSummary() { return dashboardApi.getSummary() },
}
