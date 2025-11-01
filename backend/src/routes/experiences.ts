import { Router } from 'express';
import { ExperiencesController } from '../controllers/experiencesController';

/**
 * Experiences Routes
 *
 * Defines all endpoints related to experiences.
 * Routes are organized by resource and HTTP method.
 */

const router = Router();

/**
 * @route   GET /api/experiences/categories
 * @desc    Get all unique categories
 * @access  Public
 */
router.get('/categories', ExperiencesController.getCategories);

/**
 * @route   GET /api/experiences/search
 * @desc    Search experiences by title or description
 * @query   q - Search term
 * @access  Public
 */
router.get('/search', ExperiencesController.searchExperiences);

/**
 * @route   GET /api/experiences/:id
 * @desc    Get single experience by ID with available slots
 * @param   id - Experience ID
 * @access  Public
 */
router.get('/:id', ExperiencesController.getExperienceById);

/**
 * @route   GET /api/experiences
 * @desc    Get all experiences with optional filtering
 * @query   limit, offset, category, min_price, max_price, sort_by, sort_order
 * @access  Public
 */
router.get('/', ExperiencesController.getAllExperiences);

export default router;
