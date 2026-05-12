import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import Spinner from '@/components/ui/Spinner'
import { ROUTES } from '@/constants'
import AuthGuard from './guards/AuthGuard'
import GuestGuard from './guards/GuestGuard'
import PurchaseDetail from '@/pages/purchases/PurchaseDetail'

const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Signup = lazy(() => import('@/pages/auth/Signup'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ProductList = lazy(() => import('@/pages/products/ProductList'))
const ProductCreate = lazy(() => import('@/pages/products/ProductCreate'))
const ProductDetail = lazy(() => import('@/pages/products/ProductDetail'))
const IngredientList = lazy(() => import('@/pages/ingredients/IngredientList'))
const IngredientCreate = lazy(() => import('@/pages/ingredients/IngredientCreate'))
const IngredientDetail = lazy(() => import('@/pages/ingredients/IngredientDetail'))
const PurchaseList = lazy(() => import('@/pages/purchases/PurchaseList'))
const PurchaseCreate = lazy(() => import('@/pages/purchases/PurchaseCreate'))
const SaleList = lazy(() => import('@/pages/sales/SaleList'))
const SaleCreate = lazy(() => import('@/pages/sales/SaleCreate'))
const SaleDetail = lazy(() => import('@/pages/sales/SaleDetail'))
const Reports = lazy(() => import('@/pages/reports/Reports'))
const BudgetExport = lazy(() => import('@/pages/budget/BudgetExport'))
const Settings = lazy(() => import('@/pages/settings/Settings'))
const SupplierList = lazy(() => import('@/pages/suppliers/SupplierList'))
const SupplierCreate = lazy(() => import('@/pages/suppliers/SupplierCreate'))
const SupplierDetail = lazy(() => import('@/pages/suppliers/SupplierDetail'))
const CustomerList = lazy(() => import('@/pages/customers/CustomerList'))
const CustomerCreate = lazy(() => import('@/pages/customers/CustomerCreate'))
const CustomerDetail = lazy(() => import('@/pages/customers/CustomerDetail'))

function Fallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner />
    </div>
  )
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Fallback />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME, element: <Wrap><Landing /></Wrap> },
      {
        element: <GuestGuard />,
        children: [
          { path: ROUTES.LOGIN, element: <Wrap><Login /></Wrap> },
          { path: ROUTES.SIGNUP, element: <Wrap><Signup /></Wrap> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <Wrap><Dashboard /></Wrap> },
          { path: ROUTES.PRODUCTS, element: <Wrap><ProductList /></Wrap> },
          { path: ROUTES.PRODUCT_NEW, element: <Wrap><ProductCreate /></Wrap> },
          { path: ROUTES.PRODUCT_DETAIL, element: <Wrap><ProductDetail /></Wrap> },
          { path: ROUTES.INGREDIENTS, element: <Wrap><IngredientList /></Wrap> },
          { path: ROUTES.INGREDIENT_NEW, element: <Wrap><IngredientCreate /></Wrap> },
          { path: ROUTES.INGREDIENT_DETAIL, element: <Wrap><IngredientDetail /></Wrap> },
          { path: ROUTES.PURCHASES, element: <Wrap><PurchaseList /></Wrap> },
          { path: ROUTES.PURCHASE_NEW, element: <Wrap><PurchaseCreate /></Wrap> },
          { path: ROUTES.PURCHASE_DETAIL, element: <Wrap><PurchaseDetail /></Wrap> },
          { path: ROUTES.SALES, element: <Wrap><SaleList /></Wrap> },
          { path: ROUTES.SALE_NEW, element: <Wrap><SaleCreate /></Wrap> },
          { path: ROUTES.SALE_DETAIL, element: <Wrap><SaleDetail /></Wrap> },
          { path: ROUTES.REPORTS, element: <Wrap><Reports /></Wrap> },
          { path: ROUTES.BUDGET, element: <Wrap><BudgetExport /></Wrap> },
          { path: ROUTES.SETTINGS, element: <Wrap><Settings /></Wrap> },
          { path: ROUTES.SUPPLIERS, element: <Wrap><SupplierList /></Wrap> },
          { path: ROUTES.SUPPLIER_NEW, element: <Wrap><SupplierCreate /></Wrap> },
          { path: ROUTES.SUPPLIER_DETAIL, element: <Wrap><SupplierDetail /></Wrap> },
          { path: ROUTES.CUSTOMERS, element: <Wrap><CustomerList /></Wrap> },
          { path: ROUTES.CUSTOMER_NEW, element: <Wrap><CustomerCreate /></Wrap> },
          { path: ROUTES.CUSTOMER_DETAIL, element: <Wrap><CustomerDetail /></Wrap> },
        ],
      },
    ],
  },
])
