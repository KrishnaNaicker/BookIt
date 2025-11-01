import { Request, Response } from 'express';
import { ExperienceModel } from '../models/experienceModel';
import { ExperienceQueryParams } from '../types';

/**
 * Experiences Controller
 *
 * Handles all HTTP requests related to experiences.
 * Controllers contain the business logic and coordinate between
 * routes, models, and response formatting.
 */

export class ExperiencesController {
  /**
   * Get all experiences with optional filtering and pagination
   *
   * Query Parameters:
   * - limit: Number of results (default: 50, max: 100)
   * - offset: Number of results to skip (default: 0)
   * - category: Filter by category
   * - min_price: Minimum price filter
   * - max_price: Maximum price filter
   * - sort_by: Sort field (price, rating, reviews_count)
   * - sort_order: Sort direction (asc, desc)
   *
   * Example: GET /api/experiences?category=Water%20Sports&sort_by=rating&sort_order=desc&limit=10
   */
  static async getAllExperiences(req: Request, res: Response): Promise<void> {
    try {
      // Parse and validate query parameters
      const params: ExperienceQueryParams = {
        limit: Math.min(parseInt(req.query.limit as string) || 50, 100),
        offset: parseInt(req.query.offset as string) || 0,
        category: req.query.category as string,
        min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
        sort_by: (req.query.sort_by as 'price' | 'rating' | 'reviews_count') || 'rating',
        sort_order: (req.query.sort_order as 'asc' | 'desc') || 'desc'
      };

      // Validate numeric parameters
      if (params.min_price && isNaN(params.min_price)) {
        res.status(400).json({
          success: false,
          error: 'Invalid min_price parameter'
        });
        return;
      }

      if (params.max_price && isNaN(params.max_price)) {
        res.status(400).json({
          success: false,
          error: 'Invalid max_price parameter'
        });
        return;
      }

      // Fetch experiences from database
      const experiences = await ExperienceModel.findAll(params);

      res.status(200).json({
        success: true,
        data: experiences,
        pagination: {
          limit: params.limit,
          offset: params.offset,
          count: experiences.length
        }
      });

    } catch (error) {
      console.error('Error fetching experiences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch experiences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a single experience by ID with available slots
   *
   * URL Parameter:
   * - id: Experience ID
   *
   * Example: GET /api/experiences/1
   *
   * Returns:
   * - Experience details
   * - All available slots (future dates, not sold out)
   */
  static async getExperienceById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      // Validate ID
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid experience ID'
        });
        return;
      }

      // Fetch experience with available slots
      const experience = await ExperienceModel.findByIdWithSlots(id);

      // Check if experience exists
      if (!experience) {
        res.status(404).json({
          success: false,
          error: 'Experience not found',
          message: `No experience found with ID ${id}`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: experience
      });

    } catch (error) {
      console.error('Error fetching experience:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch experience',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all unique categories
   *
   * Example: GET /api/experiences/categories
   *
   * Returns: Array of category strings
   */
  static async getCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await ExperienceModel.getCategories();

      res.status(200).json({
        success: true,
        data: categories
      });

    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search experiences by title or description
   *
   * Query Parameter:
   * - q: Search term
   *
   * Example: GET /api/experiences/search?q=kayak
   */
  static async searchExperiences(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;

      // Validate search term
      if (!searchTerm || searchTerm.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Search term is required',
          message: 'Please provide a search term using the "q" query parameter'
        });
        return;
      }

      if (searchTerm.length < 2) {
        res.status(400).json({
          success: false,
          error: 'Search term too short',
          message: 'Search term must be at least 2 characters'
        });
        return;
      }

      // Search experiences
      const experiences = await ExperienceModel.search(searchTerm.trim());

      res.status(200).json({
        success: true,
        data: experiences,
        count: experiences.length
      });

    } catch (error) {
      console.error('Error searching experiences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search experiences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
