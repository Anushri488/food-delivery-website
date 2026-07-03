const restaurantsData = [
  {
    id: 1,
    name: "Spice Hub",
    cuisine: "Indian",
    rating: 4.5,
    deliveryTime: "30-40 min",
    deliveryFee: 30,
    image: "🍛",
    category: "Indian",
    menu: [
      { id: 101, name: "Paneer Tikka", price: 250, badge: "Best Seller", description: "Marinated paneer grilled to perfection", category: "Starters", isSpicy: true },
      { id: 102, name: "Butter Chicken", price: 320, badge: "New", description: "Creamy tomato-based chicken curry", category: "Main Course", isSpicy: false },
      { id: 103, name: "Dal Makhani", price: 200, badge: "", description: "Slow cooked black lentils in rich gravy", category: "Main Course", isSpicy: false },
      { id: 104, name: "Garlic Naan", price: 60, badge: "", description: "Freshly baked garlic bread", category: "Breads", isSpicy: false },
      { id: 105, name: "Chicken Biryani", price: 350, badge: "Spicy", description: "Aromatic basmati rice with tender chicken", category: "Rice", isSpicy: true },
      { id: 106, name: "Mango Lassi", price: 120, badge: "", description: "Sweet yogurt mango drink", category: "Drinks", isSpicy: false }
    ]
  },
  {
    id: 2,
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.2,
    deliveryTime: "25-35 min",
    deliveryFee: 40,
    image: "🍕",
    category: "Italian",
    menu: [
      { id: 201, name: "Margherita Pizza", price: 299, badge: "Best Seller", description: "Classic tomato sauce with mozzarella", category: "Pizzas", isSpicy: false },
      { id: 202, name: "Pepperoni Pizza", price: 399, badge: "", description: "Loaded with spicy pepperoni slices", category: "Pizzas", isSpicy: true },
      { id: 203, name: "BBQ Chicken Pizza", price: 449, badge: "New", description: "Smoky BBQ sauce with grilled chicken", category: "Pizzas", isSpicy: false },
      { id: 204, name: "Garlic Bread", price: 149, badge: "", description: "Crispy bread with garlic butter", category: "Sides", isSpicy: false },
      { id: 205, name: "Pasta Arrabbiata", price: 249, badge: "Spicy", description: "Penne in spicy tomato sauce", category: "Pasta", isSpicy: true },
      { id: 206, name: "Tiramisu", price: 199, badge: "", description: "Classic Italian coffee dessert", category: "Desserts", isSpicy: false }
    ]
  },
  {
    id: 3,
    name: "Burger Barn",
    cuisine: "American",
    rating: 4.0,
    deliveryTime: "20-30 min",
    deliveryFee: 25,
    image: "🍔",
    category: "American",
    menu: [
      { id: 301, name: "Classic Cheeseburger", price: 199, badge: "Best Seller", description: "Juicy beef patty with melted cheese", category: "Burgers", isSpicy: false },
      { id: 302, name: "Spicy Chicken Burger", price: 229, badge: "Spicy", description: "Crispy chicken with hot sauce", category: "Burgers", isSpicy: true },
      { id: 303, name: "Veggie Burger", price: 179, badge: "New", description: "Plant-based patty with fresh veggies", category: "Burgers", isSpicy: false },
      { id: 304, name: "Loaded Fries", price: 149, badge: "", description: "Fries topped with cheese and jalapeños", category: "Sides", isSpicy: true },
      { id: 305, name: "Onion Rings", price: 99, badge: "", description: "Golden crispy onion rings", category: "Sides", isSpicy: false },
      { id: 306, name: "Chocolate Milkshake", price: 179, badge: "", description: "Thick and creamy chocolate shake", category: "Drinks", isSpicy: false }
    ]
  },
  {
    id: 4,
    name: "Sushi Sakura",
    cuisine: "Japanese",
    rating: 4.7,
    deliveryTime: "40-50 min",
    deliveryFee: 50,
    image: "🍱",
    category: "Japanese",
    menu: [
      { id: 401, name: "Salmon Nigiri", price: 299, badge: "Best Seller", description: "Fresh salmon over seasoned rice", category: "Nigiri", isSpicy: false },
      { id: 402, name: "Spicy Tuna Roll", price: 349, badge: "Spicy", description: "Tuna with spicy mayo inside out roll", category: "Rolls", isSpicy: true },
      { id: 403, name: "Dragon Roll", price: 449, badge: "New", description: "Avocado topped shrimp tempura roll", category: "Rolls", isSpicy: false },
      { id: 404, name: "Miso Soup", price: 99, badge: "", description: "Traditional Japanese miso broth", category: "Soups", isSpicy: false },
      { id: 405, name: "Edamame", price: 149, badge: "", description: "Steamed salted soybeans", category: "Starters", isSpicy: false },
      { id: 406, name: "Matcha Ice Cream", price: 199, badge: "", description: "Green tea flavored ice cream", category: "Desserts", isSpicy: false }
    ]
  },
  {
    id: 5,
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.3,
    deliveryTime: "25-35 min",
    deliveryFee: 35,
    image: "🌮",
    category: "Mexican",
    menu: [
      { id: 501, name: "Chicken Tacos (3pc)", price: 249, badge: "Best Seller", description: "Soft shell tacos with grilled chicken", category: "Tacos", isSpicy: false },
      { id: 502, name: "Beef Burrito", price: 299, badge: "", description: "Large flour tortilla stuffed with beef", category: "Burritos", isSpicy: true },
      { id: 503, name: "Nachos Supreme", price: 229, badge: "New", description: "Tortilla chips with all the toppings", category: "Starters", isSpicy: true },
      { id: 504, name: "Guacamole & Chips", price: 179, badge: "", description: "Fresh avocado dip with crispy chips", category: "Starters", isSpicy: false },
      { id: 505, name: "Veggie Quesadilla", price: 219, badge: "", description: "Cheesy vegetable filled quesadilla", category: "Quesadillas", isSpicy: false },
      { id: 506, name: "Horchata", price: 129, badge: "", description: "Traditional rice and cinnamon drink", category: "Drinks", isSpicy: false }
    ]
  },
  {
    id: 6,
    name: "Dragon Wok",
    cuisine: "Chinese",
    rating: 4.1,
    deliveryTime: "30-40 min",
    deliveryFee: 30,
    image: "🥡",
    category: "Chinese",
    menu: [
      { id: 601, name: "Kung Pao Chicken", price: 280, badge: "Spicy", description: "Spicy stir-fried chicken with peanuts", category: "Main Course", isSpicy: true },
      { id: 602, name: "Fried Rice", price: 200, badge: "Best Seller", description: "Wok-tossed rice with vegetables and egg", category: "Rice", isSpicy: false },
      { id: 603, name: "Dim Sum Basket", price: 250, badge: "New", description: "Assorted steamed dumplings", category: "Dumplings", isSpicy: false },
      { id: 604, name: "Spring Rolls (4pc)", price: 150, badge: "", description: "Crispy vegetable filled spring rolls", category: "Starters", isSpicy: false },
      { id: 605, name: "Hakka Noodles", price: 220, badge: "", description: "Stir-fried noodles with veggies", category: "Noodles", isSpicy: false },
      { id: 606, name: "Sweet & Sour Pork", price: 320, badge: "", description: "Crispy pork in tangy sweet sauce", category: "Main Course", isSpicy: false }
    ]
  }
];
module.exports = restaurantsData;