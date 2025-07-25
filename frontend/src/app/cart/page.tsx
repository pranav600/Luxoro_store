"use client";
import React from "react";
import { useCart } from "../../context/cart-context";
import { FiShoppingCart } from "react-icons/fi";
export default function CartPage() {
  const { cart, totalItems, removeFromCart, updateQuantity } = useCart();
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row gap-8 pt-25">
      {/* Cart Table */}
      <div className="flex-1 bg-white shadow rounded-lg p-10">
        <h2 className="text-4xl font-bold border-b py-2 border-gray-300 text-black text-center font-mono">
          <FiShoppingCart className="inline-block mr-2" />
          Cart
        </h2>
        {cart.length === 0 ? (
          <p className="text-gray-600 px-6 py-8">Your cart is empty.</p>
        ) : (
          <div>
            <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-gray-300 text-gray-600 text-xs font-mono">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Each</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
              <div className="col-span-1"></div>
            </div>
            {cart.map((item) => (
              <div
                key={item.id + (item.size || "")}
                className="grid grid-cols-12 gap-2 px-6 py-4 items-center border-b border-gray-300 hover:bg-gray-50 transition"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-20 object-cover rounded-md border"
                  />
                  <div>
                    <div className="font-semibold text-sm text-gray-600 leading-tight">
                      {item.name}
                    </div>
                    {item.size && (
                      <div className="text-xs text-gray-400 mt-1">
                        Size: {item.size}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-center text-gray-600 font-mono">
                  ₹{item.price}
                </div>
                <div className="col-span-2 flex justify-center items-center gap-2">
                  <button
                    className="w-7 h-7 border rounded text-gray-500 text-lg font-bold cursor-pointer"
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                  >
                    -
                  </button>
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, Number(e.target.value))
                    }
                    className="border rounded text-gray-500 px-1 py-0.5 text-sm cursor-pointer font-mono"
                  >
                    {[...Array(5).keys()].map((i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    className="w-7 h-7 border rounded text-gray-500 text-lg font-bold cursor-pointer"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="col-span-2 text-center font-semibold text-gray-600 font-mono">
                  ₹{item.price * item.quantity}
                </div>
                <div className="col-span-1 text-center">
                  <button
                    className="text-xs text-red-500 hover:underline cursor-pointer font-mono"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center px-6 py-4 text-sm font-mono text-gray-700">
              <div>
                {cart.length} Item{cart.length !== 1 && "s"}
              </div>
              <div className="font-semibold">₹{totalAmount}</div>
            </div>
          </div>
        )}
      </div>
      {/* Summary */}
      <div className="w-full md:w-96 bg-white rounded-lg shadow p-6 h-max flex flex-col gap-4">
        <form className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Promo Code"
            className="flex-1 border rounded text-gray-500 border-gray-300 px-3 py-2 text-sm outline-none font-mono"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded font-semibold text-sm cursor-pointer font-mono"
            disabled
          >
            Submit
          </button>
        </form>
        <div className="flex justify-between text-sm font-mono text-gray-600">
          <span>Shipping cost</span>
          <span>TBD</span>
        </div>
        <div className="flex justify-between text-sm font-mono text-gray-600">
          <span>Discount</span>
          <span>- ₹0</span>
        </div>
        <div className="flex justify-between text-sm font-mono text-gray-600">
          <span>Tax</span>
          <span>TBD</span>
        </div>
        <div className="flex justify-between text-lg font-mono font-bold mt-2 text-gray-600">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>
        <button className="w-full mt-4 bg-black text-white py-3 rounded-lg font-mono font-bold text-lg shadow transition-colors cursor-pointer">
          Checkout
        </button>
      </div>
    </div>
  );
}
