import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/layout/WhatsAppButton';
import { PageLoader } from './components/layout/PageLoader';
import { Hero } from './components/home/Hero';
import { TrustBar } from './components/home/TrustBar';
import { Categories } from './components/home/Categories';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { BloomshellSection } from './components/home/BloomshellSection';
import { PhysicalStore } from './components/home/PhysicalStore';
import { InstagramFeed } from './components/home/InstagramFeed';
import { EmotionalSection } from './components/home/EmotionalSection';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { CartDrawer } from './components/cart/CartDrawer';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function Home() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <Categories />
      <BloomshellSection />
      <FeaturedProducts />
      <PhysicalStore />
      <InstagramFeed />
      <EmotionalSection />
    </main>
  );
}

function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <PageLoader />
          <Header />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
          <Footer />
          <WhatsAppButton />
        </BrowserRouter>
      </CartProvider>
    </ProductsProvider>
  );
}

export default App;
