"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const pizzas = [
  {
    name: "Margherita",
    description: "Classic tomato sauce, mozzarella, fresh basil",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
  },
  {
    name: "Pepperoni",
    description: "Loaded with pepperoni and mozzarella cheese",
    price: 14.99,
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
  },
  {
    name: "BBQ Chicken",
    description: "Grilled chicken, BBQ sauce, red onions, cilantro",
    price: 15.99,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
  },
  {
    name: "Veggie Supreme",
    description: "Bell peppers, mushrooms, olives, onions, tomatoes",
    price: 13.99,
    image:
      "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop",
  },
];

export default function FeaturedPizzas() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark">
            Our Bestsellers
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Loved by thousands, crafted to perfection
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pizzas.map((pizza, i) => (
            <motion.div
              key={pizza.name}
              initial={{ y: 10 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={pizza.image}
                  alt={pizza.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-dark text-lg">{pizza.name}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {pizza.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(pizza.price)}
                  </span>
                  <Link
                    href="/menu"
                    className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-colors"
                  >
                    Order
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
