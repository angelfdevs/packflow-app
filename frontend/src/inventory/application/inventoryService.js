import { inventoryApi } from '../infrastructure/inventoryApi'

export const inventoryService = {
  listStock(params) { return inventoryApi.listStock(params) },
  receive(payload) { return inventoryApi.receive(payload) },
  adjust(payload) { return inventoryApi.adjust(payload) },
  listMovements(params) { return inventoryApi.listMovements(params) },
}
