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
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminLayout } from './components/admin/AdminLayout'
import { RequireAdmin } from './components/admin/RequireAdmin'
import { ProductsList } from './pages/admin/ProductsList'
import { ProductEdit } from './pages/admin/ProductEdit'
import { OrdersList } from './pages/admin/OrdersList'
import { AcademiesManager } from './pages/admin/AcademiesManager'
import { InstagramManager } from './pages/admin/InstagramManager'

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

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
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
