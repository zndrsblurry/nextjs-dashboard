import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "Warning: ANTHROPIC_API_KEY is not set. Vehicle search functionality will not work."
  );
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PhoneDetails {
  name: string;
  description: string;
  image: string;
  price: number;
  category: "phones";
  status: "available";
  condition: "new" | "pre-owned";
  year: number;
  processor: string;
  ram: string;
  storage: string;
  batteryCapacity: string;
  screenSize: string;
  screenType: string;
  refreshRate: string;
  camera: string;
  operatingSystem: string;
  connectivity: string;
  dimensions?: string;
  weight?: string;
  waterResistance?: string;
}

export interface VehicleDetails {
  name: string;
  description: string;
  image: string;
  price: number;
  category: "cars" | "motorcycles";
  status: "available";
  condition: "new" | "pre-owned";
  year: number;
  transmission?: "automatic" | "manual";
  horsepower?: number;
  engineSize?: string;
  fuelType?: string;
  vehicleType?: string;
  displacement?: number;
}

export async function getVehicleDetailsBySearch(
  vehicleName: string
): Promise<VehicleDetails> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: `You are a vehicle database expert. Given a vehicle name, return detailed and accurate information about that vehicle as a JSON object. For vehicle images, use realistic and relevant image URLs. Always return a JSON response with the following structure:
      {
        "name": "full vehicle name",
        "description": "detailed description with key features",
        "image": "URL to a representative image",
        "price": estimated market price as a number,
        "category": either "cars" or "motorcycles",
        "status": "available",
        "condition": either "new" or "pre-owned",
        "year": manufacturing year as a number,
        "transmission": either "automatic" or "manual",
        "horsepower": horsepower as a number,
        "engineSize": engine size as a string (e.g. "2.0L", "5.0L"),
        "fuelType": type of fuel (e.g. "gasoline", "diesel", "electric"),
        "vehicleType": type of vehicle (e.g. "sedan", "SUV", "sports car", "cruiser" for motorcycles),
        "displacement": for motorcycles, displacement in cc as a number
      }
      Use realistic values and accurate information. If the query appears to be a motorcycle, use motorcycle-specific fields. If you don't know a specific value, provide a reasonable estimate.`,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Provide detailed information for: ${vehicleName}`,
        },
      ],
    });

    // Parse the JSON response
    if (response.content[0].type !== "text") {
      throw new Error("Unexpected response format from Anthropic API");
    }

    // Extract JSON from possible markdown code block
    let jsonText = response.content[0].text;

    // Check if the response is wrapped in a markdown code block
    const jsonBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonText = jsonBlockMatch[1];
    }

    const result = JSON.parse(jsonText);

    // Ensure the result conforms to VehicleDetails interface
    const vehicleDetails: VehicleDetails = {
      name: result.name || vehicleName,
      description: result.description || "",
      image: result.image || "",
      price: result.price || 0,
      category:
        result.category === "cars" || result.category === "motorcycles"
          ? result.category
          : "cars",
      status: "available",
      condition:
        result.condition === "new" || result.condition === "pre-owned"
          ? result.condition
          : "new",
      year: result.year || new Date().getFullYear(),
      transmission: result.transmission,
      horsepower: result.horsepower,
      engineSize: result.engineSize,
      fuelType: result.fuelType,
      vehicleType: result.vehicleType,
      displacement: result.displacement,
    };

    return vehicleDetails;
  } catch (error: unknown) {
    console.error("Error fetching vehicle details:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch vehicle details: ${errorMessage}`);
  }
}

export async function getPhoneDetailsBySearch(
  phoneName: string
): Promise<PhoneDetails> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: `You are a smartphone database expert. Given a smartphone name, return detailed and accurate information about that phone as a JSON object. For phone images, use realistic and relevant image URLs. Always return a JSON response with the following structure:
      {
        "name": "full phone name",
        "description": "detailed description with key features",
        "image": "URL to a representative image",
        "price": estimated market price as a number,
        "category": "phones",
        "status": "available",
        "condition": "new",
        "year": release year as a number,
        "processor": "processor name and details",
        "ram": "RAM amount (e.g. '8GB')",
        "storage": "storage capacity (e.g. '128GB')",
        "batteryCapacity": "battery capacity in mAh",
        "screenSize": "screen size in inches",
        "screenType": "screen technology (e.g. 'AMOLED', 'IPS LCD')",
        "refreshRate": "screen refresh rate (e.g. '60Hz', '120Hz')",
        "camera": "camera specifications",
        "operatingSystem": "OS and version",
        "connectivity": "connectivity options",
        "dimensions": "dimensions in mm",
        "weight": "weight in grams",
        "waterResistance": "water/dust resistance rating if applicable"
      }
      Use realistic values and accurate information. If you don't know a specific value, provide a reasonable estimate based on the phone model and year.`,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Provide detailed information for: ${phoneName}`,
        },
      ],
    });

    // Parse the JSON response
    if (response.content[0].type !== "text") {
      throw new Error("Unexpected response format from Anthropic API");
    }

    // Extract JSON from possible markdown code block
    let jsonText = response.content[0].text;

    // Check if the response is wrapped in a markdown code block
    const jsonBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonText = jsonBlockMatch[1];
    }

    const result = JSON.parse(jsonText);

    // Ensure the result conforms to PhoneDetails interface
    const phoneDetails: PhoneDetails = {
      name: result.name || phoneName,
      description: result.description || "",
      image: result.image || "",
      price: result.price || 0,
      category: "phones",
      status: "available",
      condition:
        result.condition === "new" || result.condition === "pre-owned"
          ? result.condition
          : "new",
      year: result.year || new Date().getFullYear(),
      processor: result.processor || "",
      ram: result.ram || "",
      storage: result.storage || "",
      batteryCapacity: result.batteryCapacity || "",
      screenSize: result.screenSize || "",
      screenType: result.screenType || "",
      refreshRate: result.refreshRate || "",
      camera: result.camera || "",
      operatingSystem: result.operatingSystem || "",
      connectivity: result.connectivity || "",
      dimensions: result.dimensions,
      weight: result.weight,
      waterResistance: result.waterResistance,
    };

    return phoneDetails;
  } catch (error: unknown) {
    console.error("Error fetching phone details:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch phone details: ${errorMessage}`);
  }
}

export type ProductDetails = VehicleDetails | PhoneDetails;

export async function getProductDetails(
  query: string
): Promise<ProductDetails> {
  // Check if the query is likely a phone based on common keywords
  const phoneKeywords = [
    "iphone",
    "samsung",
    "galaxy",
    "pixel",
    "xiaomi",
    "redmi",
    "oppo",
    "vivo",
    "oneplus",
    "huawei",
    "honor",
    "realme",
    "poco",
    "phone",
    "smartphone",
  ];

  const isLikelyPhone = phoneKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );

  if (isLikelyPhone) {
    return getPhoneDetailsBySearch(query);
  } else {
    return getVehicleDetailsBySearch(query);
  }
}

export async function generateProductThumbnail(
  productName: string,
  category: string
): Promise<{ imageUrl?: string; imageOptions?: string[]; error?: string }> {
  try {
    console.log(`Requesting images for ${productName} (${category})...`);

    // Format a Google-friendly search query
    const searchQuery = encodeURIComponent(
      `${productName} ${category} product image`
    );

    // Use Claude to find multiple image results from Google Images
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: `You are a Google Images search expert. Given a product name and category, your task is to:

      1. Find 4-5 high-quality images for this product from Google Images search results
      2. Provide direct image URLs that would appear in Google Images search
      
      IMPORTANT: The image URLs must be from one of these trusted sources ONLY:
      - unsplash.com
      - pexels.com
      - flickr.com
      - wikimedia.org
      - pixabay.com
      - shutterstock.com (preview images only)
      - istockphoto.com (preview images only)
      - adobe.stock.com (preview images only)
      
      Format your response as a JSON array with this structure:
      { "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg", "https://example.com/image3.jpg"] }
      
      Each URL should directly link to a JPG, PNG, or WEBP image file. 
      For each image, verify that the URL is directly to an image file, not to a webpage.
      Include only clear, high-quality images that accurately represent the product.`,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Find me 4-5 image results from Google Images for: ${productName} (${category})`,
        },
      ],
    });

    // Parse the response
    if (response.content[0].type !== "text") {
      throw new Error("Unexpected response format from Anthropic API");
    }

    // Extract JSON or URLs from text
    const content = response.content[0].text;

    // Try to parse JSON response first
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        if (
          jsonData.imageUrls &&
          Array.isArray(jsonData.imageUrls) &&
          jsonData.imageUrls.length > 0
        ) {
          // Verify the URLs are valid
          const validatedUrls: string[] = [];

          for (const url of jsonData.imageUrls) {
            try {
              const isValid = await checkImageAvailability(url);
              if (isValid) {
                validatedUrls.push(url);
              }
            } catch (e) {
              // Skip invalid URLs
              console.log(`Skipping invalid URL: ${url}`);
            }
          }

          if (validatedUrls.length > 0) {
            console.log(
              `Found ${validatedUrls.length} valid image URLs from JSON`
            );
            return {
              imageUrl: validatedUrls[0],
              imageOptions: validatedUrls,
            };
          }
        }
      }
    } catch (jsonError) {
      console.log(
        "Failed to parse JSON response, falling back to regex extraction"
      );
    }

    // Try to find image URLs directly in the text with a regex pattern
    const urlRegex =
      /(https?:\/\/(?:www\.)?(?:unsplash\.com|pexels\.com|flickr\.com|wikimedia\.org|pixabay\.com|shutterstock\.com|istockphoto\.com|stock\.adobe\.com)\/[^\s"'<>()]+\.(jpg|jpeg|png|webp))/gi;
    const matchedUrls = content.match(urlRegex);

    if (matchedUrls && matchedUrls.length > 0) {
      // Remove duplicate URLs
      const uniqueUrls = Array.from(new Set(matchedUrls));

      // Validate all URLs
      const validatedUrls: string[] = [];

      for (const url of uniqueUrls) {
        try {
          const isValid = await checkImageAvailability(url);
          if (isValid) {
            validatedUrls.push(url);
          }
        } catch (e) {
          // Skip invalid URLs
          console.log(`Skipping invalid URL: ${url}`);
        }
      }

      if (validatedUrls.length > 0) {
        console.log(
          `Found ${validatedUrls.length} valid image URLs from regex match`
        );
        return {
          imageUrl: validatedUrls[0],
          imageOptions: validatedUrls,
        };
      }
    }

    // Fallback to stock images if no valid URLs found
    const stockImages = {
      cars: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&q=80",
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500&q=80",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80",
      ],
      motorcycles: [
        "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=500&q=80",
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&q=80",
        "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=500&q=80",
      ],
      phones: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80",
      ],
    };

    // Use stock images based on category
    const categoryKey = category as keyof typeof stockImages;
    if (stockImages[categoryKey]) {
      console.log(`Using stock images for ${category}`);
      return {
        imageUrl: stockImages[categoryKey][0],
        imageOptions: stockImages[categoryKey],
      };
    }

    // If still no image, use a generic placeholder
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1586952518485-11b180e92764?w=500&q=80",
      imageOptions: [
        "https://images.unsplash.com/photo-1586952518485-11b180e92764?w=500&q=80",
      ],
    };
  } catch (error: unknown) {
    console.error("Error generating product thumbnail:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error finding real product images:", error);
    return { error: errorMessage };
  }
}

export async function checkImageAvailability(
  imageUrl: string
): Promise<boolean> {
  try {
    // Make a HEAD request to the image URL to check if it's available
    const response = await fetch(imageUrl, { method: "HEAD" });
    const contentType = response.headers.get("content-type");
    return (
      response.ok && contentType !== null && contentType.startsWith("image/")
    );
  } catch (error) {
    console.error("Error checking image availability:", error);
    return false;
  }
}

export async function getVehicleSuggestions(query: string): Promise<string[]> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: `You are a vehicle and smartphone search assistant. Given a partial query, return a list of 5-10 matching vehicle or smartphone suggestions as a JSON array of strings. Only return the JSON array, no additional commentary. Prioritize popular models that match the query.`,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Provide vehicle or smartphone suggestions matching: ${query}`,
        },
      ],
    });

    // Parse the JSON response
    if (response.content[0].type !== "text") {
      throw new Error("Unexpected response format from Anthropic API");
    }

    // Extract JSON from possible markdown code block
    let jsonText = response.content[0].text;

    // Check if the response is wrapped in a markdown code block
    const jsonBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonText = jsonBlockMatch[1];
    }

    const result = JSON.parse(jsonText);

    // Ensure the result is an array of strings
    return Array.isArray(result) ? result : [];
  } catch (error: unknown) {
    console.error("Error fetching vehicle suggestions:", error);
    return [];
  }
}
