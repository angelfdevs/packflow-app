import { commercialApi } from '../infrastructure/commercialApi'

export const commercialOperationService = {
  preview(payload) { return commercialApi.preview(payload) },
  createSale(payload) { return commercialApi.createSale(payload) },
  listSales(params) { return commercialApi.listSales(params) },
  getSale(saleId) { return commercialApi.getSale(saleId) },
}
