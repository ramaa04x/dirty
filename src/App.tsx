import { Suspense, lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { FloatingWhatsAppButton } from './components/layout/FloatingWhatsAppButton'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { OrderResult } from './pages/OrderResult'
import { Contacto } from './pages/Contacto'
import { Ustedes } from './pages/Ustedes'

// Admin routes are only ever visited by Rama, not customers — split them into
// their own chunk so storefront visitors don't download the admin panel's JS.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const RequireAdmin = lazy(() => import('./components/admin/RequireAdmin').then((m) => ({ default: m.RequireAdmin })))
const ProductsList = lazy(() => import('./pages/admin/ProductsList').then((m) => ({ default: m.ProductsList })))
const ProductEdit = lazy(() => import('./pages/admin/ProductEdit').then((m) => ({ default: m.ProductEdit })))
const OrdersList = lazy(() => import('./pages/admin/OrdersList').then((m) => ({ default: m.OrdersList })))
const AcademiesManager = lazy(() => import('./pages/admin/AcademiesManager').then((m) => ({ default: m.AcademiesManager })))
const InstagramManager = lazy(() => import('./pages/admin/InstagramManager').then((m) => ({ default: m.InstagramManager })))

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Shop />} />
          <Route path="/tienda/:category" element={<Shop />} />
          <Route path="/producto/:slug" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orden/:id/resultado" element={<OrderResult />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/ustedes" element={<Ustedes />} />

          <Route
            path="/admin/login"
            element={
              <Suspense fallback={null}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={null}>
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              </Suspense>
            }
          >
            <Route path="productos" element={<ProductsList />} />
            <Route path="productos/:id" element={<ProductEdit />} />
            <Route path="pedidos" element={<OrdersList />} />
            <Route path="academias" element={<AcademiesManager />} />
            <Route path="instagram" element={<InstagramManager />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingWhatsAppButton />}
    </div>
  )
}

export default App
