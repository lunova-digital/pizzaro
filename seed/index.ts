import mongoose from "mongoose";
import Pizza from "../models/Pizza";
import Category from "../models/Category";
import User from "../models/User";
import Combo from "../models/Combo";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pizzaro?authSource=admin";

const categories = [
  {
    name: "Regular",
    name_bn: "রেগুলার",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop",
    displayOrder: 1,
  },
  {
    name: "Premium",
    name_bn: "প্রিমিয়াম",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop",
    displayOrder: 2,
  },
  {
    name: "Garlic Bread",
    name_bn: "গার্লিক ব্রেড",
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300&h=200&fit=crop",
    displayOrder: 3,
  },
];

const pizzas = [
  // ── REGULAR PIZZAS ─────────────────────────────────────────────
  {
    name: "Margarita Pizza",
    name_bn: "মার্গারিটা পিৎজা",
    description: "Tomato sauce, origano, and creamy mozzarella cheese on a perfectly baked crust",
    description_bn: "টমেটো সস, অরিগানো এবং ক্রিমি মোৎজারেলা চিজ সহ নিখুঁতভাবে বেক করা ক্রাস্টে",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    category: "Regular",
    sizes: [
      { name: "Small", price: 179 },
      { name: "Medium", price: 299 },
      { name: "Large", price: 499 },
    ],
    toppings: ["Extra Cheese", "Origano", "Chilli Flakes"],
  },
  {
    name: "Masala Sausage Pizza",
    name_bn: "মশলা সসেজ পিৎজা",
    description: "Juicy sausage, black olive, green chilli, and mozzarella cheese with a spicy masala kick",
    description_bn: "সরস সসেজ, ব্ল্যাক অলিভ, কাঁচামরিচ এবং মোৎজারেলা চিজ সহ মশলাদার স্বাদে",
    image: "https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=600&h=400&fit=crop",
    category: "Regular",
    sizes: [
      { name: "Small", price: 219 },
      { name: "Medium", price: 379 },
      { name: "Large", price: 579 },
    ],
    toppings: ["Extra Sausage", "Extra Cheese", "Black Olive"],
  },
  {
    name: "Meatball Special Pizza",
    name_bn: "মিটবল স্পেশাল পিৎজা",
    description: "Tender meatballs, onion, capsicum, green chilli, and mozzarella cheese",
    description_bn: "নরম মিটবল, পেঁয়াজ, ক্যাপসিকাম, কাঁচামরিচ এবং মোৎজারেলা চিজ",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
    category: "Regular",
    sizes: [
      { name: "Small", price: 239 },
      { name: "Medium", price: 399 },
      { name: "Large", price: 599 },
    ],
    toppings: ["Extra Meatball", "Onion", "Green Chilli"],
  },
  {
    name: "Spicy Chicken Pizza",
    name_bn: "স্পাইসি চিকেন পিৎজা",
    description: "Spicy chicken, onion, capsicum, green chilli, tomato, and mozzarella cheese",
    description_bn: "ঝাল চিকেন, পেঁয়াজ, ক্যাপসিকাম, কাঁচামরিচ, টমেটো এবং মোৎজারেলা চিজ",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    category: "Regular",
    sizes: [
      { name: "Small", price: 279 },
      { name: "Medium", price: 499 },
      { name: "Large", price: 779 },
    ],
    toppings: ["Extra Chicken", "Jalapeño", "Extra Chilli"],
  },
  {
    name: "BBQ Chicken Pizza",
    name_bn: "বিবিকিউ চিকেন পিৎজা",
    description: "BBQ chicken, capsicum, onion, smoky BBQ sauce, and mozzarella cheese",
    description_bn: "বারবিকিউ চিকেন, ক্যাপসিকাম, পেঁয়াজ, ধোঁয়াটে বিবিকিউ সস এবং মোৎজারেলা চিজ",
    image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&h=400&fit=crop",
    category: "Regular",
    sizes: [
      { name: "Small", price: 299 },
      { name: "Medium", price: 549 },
      { name: "Large", price: 799 },
    ],
    toppings: ["Extra Chicken", "BBQ Sauce", "Capsicum"],
  },
  {
    name: "Meat Mushroom Pizza",
    name_bn: "মিট মাশরুম পিৎজা",
    description: "Mushroom, green chilli, black olive, chicken, and mozzarella cheese",
    description_bn: "মাশরুম, কাঁচামরিচ, ব্ল্যাক অলিভ, চিকেন এবং মোৎজারেলা চিজ",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop",
    category: "Regular",
    sizes: [
      { name: "Small", price: 319 },
      { name: "Medium", price: 559 },
      { name: "Large", price: 849 },
    ],
    toppings: ["Extra Mushroom", "Black Olive", "Green Chilli"],
  },

  // ── PREMIUM PIZZAS ─────────────────────────────────────────────
  {
    name: "Sausage Special Pizza",
    name_bn: "সসেজ স্পেশাল পিৎজা",
    description: "Sausage, mushroom, spicy chicken, capsicum, onion, black olive, and mozzarella cheese",
    description_bn: "সসেজ, মাশরুম, ঝাল চিকেন, ক্যাপসিকাম, পেঁয়াজ, ব্ল্যাক অলিভ এবং মোৎজারেলা চিজ",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    category: "Premium",
    sizes: [
      { name: "Small", price: 379 },
      { name: "Medium", price: 649 },
      { name: "Large", price: 869 },
    ],
    toppings: ["Extra Sausage", "Mushroom", "Black Olive"],
  },
  {
    name: "Beef Becon & Pepperoni",
    name_bn: "বিফ বেকন ও পেপেরনি",
    description: "Beef becon, pepperoni, mushroom, capsicum, onion, black olive, green chilli, and mozzarella cheese",
    description_bn: "বিফ বেকন, পেপেরনি, মাশরুম, ক্যাপসিকাম, পেঁয়াজ, ব্ল্যাক অলিভ, কাঁচামরিচ এবং মোৎজারেলা চিজ",
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop",
    category: "Premium",
    sizes: [
      { name: "Small", price: 399 },
      { name: "Medium", price: 659 },
      { name: "Large", price: 849 },
    ],
    toppings: ["Extra Pepperoni", "Beef Becon", "Mushroom"],
  },
  {
    name: "Kebab Smokey Pizza",
    name_bn: "কেবাব স্মোকি পিৎজা",
    description: "Chicken kebab, chicken pepperoni, BBQ sauce, onion, black olive, green chilli with loaded mozzarella",
    description_bn: "চিকেন কেবাব, চিকেন পেপেরনি, বিবিকিউ সস, পেঁয়াজ, ব্ল্যাক অলিভ, কাঁচামরিচ সহ প্রচুর মোৎজারেলা",
    image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&h=400&fit=crop",
    category: "Premium",
    sizes: [
      { name: "Small", price: 419 },
      { name: "Medium", price: 679 },
      { name: "Large", price: 919 },
    ],
    toppings: ["Extra Kebab", "BBQ Sauce", "Black Olive"],
  },
  {
    name: "Beef Special Pizza",
    name_bn: "বিফ স্পেশাল পিৎজা",
    description: "Beef, beef becon, capsicum, onion, green chilli with loaded mozzarella cheese",
    description_bn: "গরুর মাংস, বিফ বেকন, ক্যাপসিকাম, পেঁয়াজ, কাঁচামরিচ সহ প্রচুর মোৎজারেলা চিজ",
    image: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600&h=400&fit=crop",
    category: "Premium",
    sizes: [
      { name: "Small", price: 439 },
      { name: "Medium", price: 689 },
      { name: "Large", price: 929 },
    ],
    toppings: ["Extra Beef", "Beef Becon", "Capsicum"],
  },
  {
    name: "Caramel Mushroom Pizza",
    name_bn: "ক্যারামেল মাশরুম পিৎজা",
    description: "Saucy chicken, sausage, pepperoni, caramel mushroom, onion, green chilli with loaded mozzarella",
    description_bn: "সরস চিকেন, সসেজ, পেপেরনি, ক্যারামেল মাশরুম, পেঁয়াজ, কাঁচামরিচ সহ প্রচুর মোৎজারেলা",
    image: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=600&h=400&fit=crop",
    category: "Premium",
    sizes: [
      { name: "Small", price: 449 },
      { name: "Medium", price: 699 },
      { name: "Large", price: 949 },
    ],
    toppings: ["Caramel Mushroom", "Extra Sausage", "Pepperoni"],
  },
  {
    name: "Supreme Chatgaiya Pizza",
    name_bn: "সুপ্রিম চাটগাইয়া পিৎজা",
    description: "Saucy chicken, sausage, pepperoni, becon, mushroom, capsicum, onion, black olive, and mozzarella cheese",
    description_bn: "সরস চিকেন, সসেজ, পেপেরনি, বেকন, মাশরুম, ক্যাপসিকাম, পেঁয়াজ, ব্ল্যাক অলিভ এবং মোৎজারেলা চিজ",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&sig=2",
    category: "Premium",
    sizes: [
      { name: "Small", price: 469 },
      { name: "Medium", price: 729 },
      { name: "Large", price: 969 },
    ],
    toppings: ["Extra Sausage", "Pepperoni", "Black Olive"],
  },

  // ── STUFF GARLIC BREAD ─────────────────────────────────────────
  {
    name: "Chicken Garlic Bread",
    name_bn: "চিকেন গার্লিক ব্রেড",
    description: "Spicy chicken, mushroom, capsicum, onion, green chilli with mozzarella cheese on crispy garlic bread",
    description_bn: "ঝাল চিকেন, মাশরুম, ক্যাপসিকাম, পেঁয়াজ, কাঁচামরিচ সহ মোৎজারেলা চিজ ক্রিসপি গার্লিক ব্রেডে",
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&h=400&fit=crop",
    category: "Garlic Bread",
    sizes: [{ name: "Regular", price: 199 }],
    toppings: ["Extra Cheese", "Green Chilli", "Mushroom"],
  },
  {
    name: "Beef Garlic Bread",
    name_bn: "বিফ গার্লিক ব্রেড",
    description: "Masala beef, beef becon, capsicum, onion, green chilli with mozzarella cheese on crispy garlic bread",
    description_bn: "মশলা গরুর মাংস, বিফ বেকন, ক্যাপসিকাম, পেঁয়াজ, কাঁচামরিচ সহ মোৎজারেলা চিজ ক্রিসপি গার্লিক ব্রেডে",
    image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=600&h=400&fit=crop",
    category: "Garlic Bread",
    sizes: [{ name: "Regular", price: 299 }],
    toppings: ["Extra Beef Becon", "Green Chilli", "Capsicum"],
  },
];

const combos = [
  {
    name: "Pizza Combo",
    name_bn: "পিৎজা কম্বো",
    description: "4 classic pizzas + cold drinks — perfect for groups",
    description_bn: "৪টি ক্লাসিক পিৎজা + কোল্ড ড্রিংকস — দলের জন্য আদর্শ",
    items: [
      "BBQ Chicken Pizza",
      "Margarita Pizza",
      "Masala Sausage Pizza",
      "Meatball Special Pizza",
      "4 Cold Drinks & Wages",
    ],
    price: 999,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
  },
  {
    name: "Meatbox Pizza Combo",
    name_bn: "মিটবক্স পিৎজা কম্বো",
    description: "BBQ chicken pizza with meatbox, fries & drinks",
    description_bn: "বিবিকিউ চিকেন পিৎজা মিটবক্স, ফ্রাই ও ড্রিংকস সহ",
    items: [
      'BBQ Chicken Pizza 8"',
      "Meatbox 2pis",
      "French Fries",
      "Cold Drinks 2pis",
    ],
    price: 749,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  },
  {
    name: "Burger Pizza Combo",
    name_bn: "বার্গার পিৎজা কম্বো",
    description: "Spicy chicken pizza with burgers, fries & drinks",
    description_bn: "স্পাইসি চিকেন পিৎজা বার্গার, ফ্রাই ও ড্রিংকস সহ",
    items: [
      'Spicy Chicken Pizza 8"',
      "French Fries",
      "Chicken Burger 3pis",
      "Cold Drinks 3pis",
    ],
    price: 499,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Skip if already seeded (use FORCE_RESEED=true to override)
    if (process.env.FORCE_RESEED !== "true") {
      const existing = await Pizza.countDocuments();
      if (existing > 0) {
        console.log(`Database already has ${existing} pizzas — skipping seed. Set FORCE_RESEED=true to override.`);
        await mongoose.connection.close();
        process.exit(0);
      }
    } else {
      console.log("FORCE_RESEED=true — clearing existing data...");
      await Pizza.deleteMany({});
      await Category.deleteMany({});
      await Combo.deleteMany({});
      console.log("Cleared existing pizzas, categories, and combos");
    }

    // Seed categories
    await Category.insertMany(categories);
    console.log(`Seeded ${categories.length} categories`);

    // Seed pizzas
    await Pizza.insertMany(pizzas);
    console.log(`Seeded ${pizzas.length} pizzas`);

    // Seed combos
    await Combo.insertMany(combos);
    console.log(`Seeded ${combos.length} combos`);

    // Create admin user
    const adminExists = await User.findOne({ email: "admin@pizzaro.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@pizzaro.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Created admin user (admin@pizzaro.com / admin123)");
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
