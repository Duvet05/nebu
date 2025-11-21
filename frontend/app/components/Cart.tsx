import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "~/contexts/CartContext";

export function CartButton() {
  const { t } = useTranslation('common');
  const { totalItems, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2.5 bg-nebu-bg/50 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded-lg transition-all duration-300 group"
      aria-label={t('cart.open')}
      type="button"
    >
      <ShoppingBag className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" strokeWidth={2} />
      {totalItems > 0 && (
        <span 
          className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-md"
          suppressHydrationWarning
        >
          {totalItems}
        </span>
      )}
    </button>
  );
}

export function CartSidebar() {
  const { t } = useTranslation('common');
  const { items, removeItem, updateQuantity, totalPrice, isOpen, closeCart } = useCart();

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('cart.title')}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('cart.close')}
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-primary/30 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('cart.empty.title')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('cart.empty.description')}
                  </p>
                  <Link
                    to="/productos"
                    onClick={closeCart}
                    className="relative inline-flex items-center justify-center gap-3 font-gochi font-bold text-lg px-8 py-4 rounded-3xl bg-primary text-white shadow-[0_8px_30px_rgba(255,107,53,0.3)] hover:shadow-[0_12px_40px_rgba(255,107,53,0.5)] transition-all duration-300 ease-out group overflow-hidden hover:scale-105"
                    aria-label={t('cart.empty.viewProducts')}
                  >
                    <span className="relative z-10">{t('cart.empty.viewProducts')}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.color.id}`}
                      className="bg-nebu-bg rounded-xl p-4 border border-primary/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex gap-4">
                        {/* Product Image Placeholder */}
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/20">
                          <span className="text-3xl">
                            {item.product.id === "nebu-dino" && "🦕"}
                            {item.product.id === "nebu-gato" && "🐱"}
                            {item.product.id === "nebu-conejo" && "🐰"}
                            {item.product.id === "nebu-oso" && "🐻"}
                            {item.product.id === "nebu-dragon" && "🐉"}
                          </span>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: item.color.hex }}
                              title={item.color.name}
                            />
                            <span className="text-sm text-gray-600">
                              {item.color.name}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-primary">
                            S/ {item.product.price}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.color.id,
                                item.quantity - 1
                              )
                            }
                            className="p-2 bg-white hover:bg-primary/5 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
                            aria-label={t('cart.decreaseQuantity')}
                          >
                            <Minus className="w-4 h-4 text-primary" />
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.color.id,
                                item.quantity + 1
                              )
                            }
                            className="p-2 bg-white hover:bg-primary/5 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
                            aria-label={t('cart.increaseQuantity')}
                          >
                            <Plus className="w-4 h-4 text-primary" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.product.id, item.color.id)
                          }
                          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                          aria-label={t('cart.removeItem')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{t('cart.subtotal')}</span>
                          <span className="font-semibold text-gray-900">
                            S/ {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Total and Checkout */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.subtotal')}</span>
                    <span>S/ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.shipping')}</span>
                    <span className="text-accent font-semibold">{t('cart.free')}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>{t('cart.total')}</span>
                    <span>S/ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pre-order info */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                  <p className="text-xs text-primary/90">
                    {t('cart.reserveInfo')} <strong>50%</strong> (S/ {(totalPrice * 0.5).toFixed(2)})
                  </p>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {t('cart.checkout')}
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/productos"
                  onClick={closeCart}
                  className="block text-center text-primary hover:underline text-sm"
                >
                  {t('cart.continueShopping')}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CartSidebar;
