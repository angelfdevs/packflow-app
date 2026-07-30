import { catalogApi } from '../infrastructure/catalogApi'

export const catalogService = {
  listProducts(params) { return catalogApi.listProducts(params) },
  getProduct(productId) { return catalogApi.getProduct(productId) },
  createProduct(payload) { return catalogApi.createProduct(payload) },
  updateProduct(productId, payload, etag) { return catalogApi.updateProduct(productId, payload, etag) },
  updateStatus(productId, active, etag) { return catalogApi.updateStatus(productId, active, etag) },
  listCategories(params) { return catalogApi.listCategories(params) },
  createCategory(name) { return catalogApi.createCategory(name) },
  listMaterials(params) { return catalogApi.listMaterials(params) },
  createMaterial(name) { return catalogApi.createMaterial(name) },
}
