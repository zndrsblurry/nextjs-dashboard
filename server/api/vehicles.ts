import { Router, Request, Response } from "express";
import { getProductDetails, getVehicleSuggestions, generateProductThumbnail, checkImageAvailability } from "../anthropic";

const router = Router();

// Get vehicle suggestions based on search query
router.get("/suggestions", async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query parameter is required" });
    }
    
    const suggestions = await getVehicleSuggestions(query);
    res.json(suggestions);
  } catch (error) {
    console.error("Error fetching vehicle suggestions:", error);
    res.status(500).json({ error: "Failed to fetch vehicle suggestions" });
  }
});

// Get product details (vehicle or phone) by name
router.get("/details", async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Name parameter is required" });
    }
    
    const details = await getProductDetails(name);
    res.json(details);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

// Generate product thumbnail using AI
router.post("/generate-thumbnail", async (req: Request, res: Response) => {
  try {
    const { productName, category } = req.body;
    
    if (!productName || typeof productName !== 'string') {
      return res.status(400).json({ error: "productName parameter is required" });
    }
    
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: "category parameter is required" });
    }
    
    console.log(`API - Generating thumbnail for: ${productName} (${category})`);
    
    // Get image result from AI - now returns object with imageUrl, imageOptions and/or error
    const result = await generateProductThumbnail(productName, category);
    
    if (result.error) {
      console.error('Error finding product images:', result.error);
      return res.status(422).json({ 
        error: `Failed to find product images: ${result.error}`,
        imageUrl: null,
        imageOptions: []
      });
    }
    
    if (!result.imageUrl) {
      return res.status(422).json({ 
        error: "No image URL was found",
        imageUrl: null,
        imageOptions: []
      });
    }
    
    // Success - we have image URLs
    console.log(`API - Successfully found image: ${result.imageUrl}`);
    console.log(`API - Found ${result.imageOptions?.length || 0} image options`);
    
    return res.json({ 
      imageUrl: result.imageUrl,
      imageOptions: result.imageOptions || [result.imageUrl]
    });
  } catch (error) {
    console.error('General error in thumbnail generation endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: `Failed to process product thumbnail request: ${errorMessage}`,
      imageUrl: null,
      imageOptions: []
    });
  }
});

// Check if image URL is valid and accessible
router.get("/check-image", async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "url parameter is required" });
    }
    
    const isAvailable = await checkImageAvailability(url);
    res.json({ isAvailable });
  } catch (error) {
    console.error('Error checking image availability:', error);
    res.status(500).json({ error: "Failed to check image availability" });
  }
});

export default router;