import { db } from './db';
import { users, categories, products, cartItems as cartItemsTable } from '@shared/schema';

// Clear all tables first (in reverse order of dependencies)
async function clearTables() {
  await db.delete(cartItemsTable);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(users);
}

async function seedData() {
  try {
    // Clear existing data
    await clearTables();
    
    console.log('Seeding database...');
    
    // Add a demo user
    const [demoUser] = await db.insert(users).values({
      username: 'demo',
      password: 'password123' // In a real app, this would be hashed
    }).returning();
    
    console.log('Created demo user:', demoUser);
    
    // Add categories
    const [carsCategory] = await db.insert(categories).values({
      name: 'Cars',
      slug: 'cars',
      description: 'Luxury and sports cars from top manufacturers',
      imageSrc: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&q=80'
    }).returning();
    
    const [motorcyclesCategory] = await db.insert(categories).values({
      name: 'Motorcycles',
      slug: 'motorcycles',
      description: 'High-performance motorcycles for enthusiasts',
      imageSrc: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=500&q=80'
    }).returning();
    
    const [phonesCategory] = await db.insert(categories).values({
      name: 'Phones',
      slug: 'phones',
      description: 'Latest smartphones with cutting-edge technology',
      imageSrc: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80'
    }).returning();
    
    console.log('Created categories:', { carsCategory, motorcyclesCategory, phonesCategory });
    
    // Add products
    const carsProducts = await db.insert(products).values([
      {
        name: 'Ferrari F8 Tributo',
        price: 276000,
        description: 'The Ferrari F8 Tributo is the new mid-rear-engined sports car that represents the highest expression of the Prancing Horse\'s classic two-seater berlinetta.',
        image: 'https://images.unsplash.com/photo-1592853625501-d7d026148961?w=500&q=80',
        categoryId: carsCategory.id
      },
      {
        name: 'Lamborghini Huracán',
        price: 208571,
        description: 'The Huracán maintains the 5.2-liter naturally aspirated V10 engine from the Gallardo, tuned to generate a maximum power output of 449 kW (602 hp).',
        image: 'https://images.unsplash.com/photo-1536364127590-1594e3161294?w=500&q=80',
        categoryId: carsCategory.id
      },
      {
        name: 'Porsche 911 GT3',
        price: 161900,
        description: 'The Porsche 911 GT3 is a high-performance homologation model of the Porsche 911 sports car.',
        image: 'https://images.unsplash.com/photo-1611681887395-ad6b57bdf794?w=500&q=80',
        categoryId: carsCategory.id
      }
    ]).returning();
    
    const motorcyclesProducts = await db.insert(products).values([
      {
        name: 'Ducati Panigale V4',
        price: 23295,
        description: 'The Panigale V4 is the essence of style, sophistication and performance.',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500&q=80',
        categoryId: motorcyclesCategory.id
      },
      {
        name: 'Kawasaki Ninja H2',
        price: 29799,
        description: 'The Ninja H2 is Kawasaki\'s flagship 1,000 cc hypersport motorcycle.',
        image: 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=500&q=80',
        categoryId: motorcyclesCategory.id
      },
      {
        name: 'BMW S 1000 RR',
        price: 16995,
        description: 'The BMW S 1000 RR is a sport bike made by BMW Motorrad.',
        image: 'https://images.unsplash.com/photo-1631138437982-72f04bc9628a?w=500&q=80',
        categoryId: motorcyclesCategory.id
      }
    ]).returning();
    
    const phonesProducts = await db.insert(products).values([
      {
        name: 'iPhone 15 Pro Max',
        price: 1199,
        description: 'The iPhone 15 Pro Max is Apple\'s latest flagship smartphone featuring the A17 Pro chip.',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484bce71?w=500&q=80',
        categoryId: phonesCategory.id
      },
      {
        name: 'Samsung Galaxy S23 Ultra',
        price: 1199.99,
        description: 'The Samsung Galaxy S23 Ultra features a 200MP camera and Snapdragon 8 Gen 2 processor.',
        image: 'https://images.unsplash.com/photo-1678911820864-e5a3eb071255?w=500&q=80',
        categoryId: phonesCategory.id
      },
      {
        name: 'Google Pixel 7 Pro',
        price: 899,
        description: 'The Google Pixel 7 Pro features Google\'s Tensor G2 chip and advanced computational photography.',
        image: 'https://images.unsplash.com/photo-1667208800499-d2d37033589e?w=500&q=80',
        categoryId: phonesCategory.id
      }
    ]).returning();
    
    console.log('Created products:', {
      cars: carsProducts.length,
      motorcycles: motorcyclesProducts.length,
      phones: phonesProducts.length
    });
    
    // Add some items to demo user's cart
    const userCartItems = await db.insert(cartItemsTable).values([
      {
        userId: demoUser.id,
        productId: carsProducts[0].id,
        quantity: 1
      },
      {
        userId: demoUser.id,
        productId: phonesProducts[0].id,
        quantity: 2
      }
    ]).returning();
    
    console.log('Added items to cart:', userCartItems.length);
    
    console.log('Database seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
}

// Run the seed function directly
seedData()
  .then((result) => {
    console.log('Seed result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Unhandled error in seed script:', err);
    process.exit(1);
  });

export { seedData };