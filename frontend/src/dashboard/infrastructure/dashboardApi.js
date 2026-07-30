import { apiClient } from '../../shared/infrastructure/http/httpClient'

export const dashboardApi = {
  getSummary() {
    return apiClient.get('/dashboard/summary')
  },
}
