export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCT_NEW: '/products/new',
  PRODUCT_DETAIL: '/products/:id',
  INGREDIENTS: '/ingredients',
  INGREDIENT_NEW: '/ingredients/new',
  INGREDIENT_DETAIL: '/ingredients/:id',
  PURCHASES: '/purchases',
  PURCHASE_NEW: '/purchases/new',
  PURCHASE_DETAIL: '/purchases/:id',
  SALES: '/sales',
  SALE_NEW: '/sales/new',
  SALE_DETAIL: '/sales/:id',
  REPORTS: '/reports',
  BUDGET: '/budget',
  SETTINGS: '/settings',
  SUPPLIERS: '/suppliers',
  SUPPLIER_NEW: '/suppliers/new',
  SUPPLIER_DETAIL: '/suppliers/:id',
  CUSTOMERS: '/customers',
  CUSTOMER_NEW: '/customers/new',
  CUSTOMER_DETAIL: '/customers/:id',
} as const

export const STORAGE_KEYS = {
  AUTH: 'monli_auth',
} as const

export const BRAND = {
  PRIMARY: '#EA1D2C',
  DARK: '#C0111E',
  LIGHT: '#F5424F',
} as const
