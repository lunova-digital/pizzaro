import mongoose from "mongoose";
import Pizza from "../models/Pizza";
import Category from "../models/Category";
import User from "../models/User";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pizzaro?authSource=admin";

const categories = [
  {
    name: "Classic",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop",
    displayOrder: 1,
  },
  {
    name: "Premium",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop",
    displayOrder: 2,
  },
  {
    name: "Veggie",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=300&h=200&fit=crop",
    displayOrder: 3,
  },
  {
    name: "Specialty",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop",
    displayOrder: 4,
  },
];

const pizzas = [
  {
    name: "Margherita",
    description: "Classic tomato sauce, fresh mozzarella, basil leaves, and extra virgin olive oil",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    category: "Classic",
    sizes: [
      { name: "Small", price: 9.99 },
      { name: "Medium", price: 12.99 },
      { name: "Large", price: 15.99 },
    ],
    toppings: ["Extra Cheese", "Fresh Basil", "Garlic"],
  },
  {
    name: "Pepperoni",
    description: "Loaded with pepperoni, mozzarella cheese, and our signature tomato sauce",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    category: "Classic",
    sizes: [
      { name: "Small", price: 10.99 },
      { name: "Medium", price: 14.99 },
      { name: "Large", price: 17.99 },
    ],
    toppings: ["Extra Pepperoni", "Extra Cheese", "Jalapeños"],
  },
  {
    name: "BBQ Chicken",
    description: "Grilled chicken, BBQ sauce, red onions, cilantro, and smoked gouda",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    category: "Premium",
    sizes: [
      { name: "Small", price: 12.99 },
      { name: "Medium", price: 15.99 },
      { name: "Large", price: 19.99 },
    ],
    toppings: ["Extra Chicken", "Bacon", "Pineapple"],
  },
  {
    name: "Veggie Supreme",
    description: "Bell peppers, mushrooms, black olives, red onions, tomatoes, and spinach",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop",
    category: "Veggie",
    sizes: [
      { name: "Small", price: 10.99 },
      { name: "Medium", price: 13.99 },
      { name: "Large", price: 16.99 },
    ],
    toppings: ["Artichokes", "Sun-dried Tomatoes", "Feta Cheese"],
  },
  {
    name: "Hawaiian",
    description: "Ham, pineapple, mozzarella cheese, and our signature tomato sauce",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    category: "Classic",
    sizes: [
      { name: "Small", price: 10.99 },
      { name: "Medium", price: 13.99 },
      { name: "Large", price: 16.99 },
    ],
    toppings: ["Extra Ham", "Extra Pineapple", "Bacon"],
  },
  {
    name: "Meat Lovers",
    description: "Pepperoni, sausage, bacon, ham, and ground beef with extra mozzarella",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    category: "Premium",
    sizes: [
      { name: "Small", price: 13.99 },
      { name: "Medium", price: 16.99 },
      { name: "Large", price: 20.99 },
    ],
    toppings: ["Extra Bacon", "Italian Sausage", "Extra Cheese"],
  },
  {
    name: "Mushroom Truffle",
    description: "Wild mushrooms, truffle oil, fontina cheese, and fresh thyme",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop",
    category: "Specialty",
    sizes: [
      { name: "Small", price: 14.99 },
      { name: "Medium", price: 18.99 },
      { name: "Large", price: 22.99 },
    ],
    toppings: ["Extra Truffle Oil", "Parmesan", "Arugula"],
  },
  {
    name: "Mediterranean",
    description: "Kalamata olives, feta, sun-dried tomatoes, artichokes, and fresh oregano",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    category: "Veggie",
    sizes: [
      { name: "Small", price: 11.99 },
      { name: "Medium", price: 14.99 },
      { name: "Large", price: 17.99 },
    ],
    toppings: ["Roasted Red Peppers", "Pine Nuts", "Extra Feta"],
  },
  {
    name: "Buffalo Chicken",
    description: "Spicy buffalo chicken, blue cheese crumbles, celery, and ranch drizzle",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    category: "Specialty",
    sizes: [
      { name: "Small", price: 13.99 },
      { name: "Medium", price: 16.99 },
      { name: "Large", price: 20.99 },
    ],
    toppings: ["Extra Hot Sauce", "Ranch", "Extra Chicken"],
  },
  {
    name: "Four Cheese",
    description: "Mozzarella, parmesan, gorgonzola, and ricotta with garlic butter crust",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    category: "Classic",
    sizes: [
      { name: "Small", price: 11.99 },
      { name: "Medium", price: 14.99 },
      { name: "Large", price: 18.99 },
    ],
    toppings: ["Truffle Oil", "Fresh Basil", "Honey Drizzle"],
  },
  {
    name: "Spicy Diavola",
    description: "Spicy salami, chili flakes, roasted peppers, and hot honey",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    category: "Specialty",
    sizes: [
      { name: "Small", price: 12.99 },
      { name: "Medium", price: 15.99 },
      { name: "Large", price: 19.99 },
    ],
    toppings: ["Extra Chili", "Jalapeños", "Hot Honey"],
  },
  {
    name: "Garden Fresh",
    description: "Zucchini, cherry tomatoes, corn, basil pesto, and goat cheese",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop",
    category: "Veggie",
    sizes: [
      { name: "Small", price: 11.99 },
      { name: "Medium", price: 14.99 },
      { name: "Large", price: 17.99 },
    ],
    toppings: ["Avocado", "Roasted Garlic", "Balsamic Glaze"],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Skip if already seeded
    const existing = await Pizza.countDocuments();
    if (existing > 0) {
      console.log(`Database already has ${existing} pizzas — skipping seed.`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Seed categories
    await Category.insertMany(categories);
    console.log(`Seeded ${categories.length} categories`);

    // Seed pizzas
    await Pizza.insertMany(pizzas);
    console.log(`Seeded ${pizzas.length} pizzas`);

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
