/**
 * @swagger
 * tags:
 *   name: Review 
 *   description: Review APIs
 */

/**
 * @swagger
 * /api/creatReview:
 *   post:
 *     summary: Create a review
 *     tags: [Review]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *               - userId
 *               - review
 *               - rating
 *             properties:
 *               packageId:
 *                 type: string
 *               userId:
 *                 type: string
 *               review:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Review added successfully
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /api/getReview/{packageId}:
 *   get:
 *     summary: Get review by packageId
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         description: ID of the package to get reviews for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: No reviews found for this package
 *       500:
 *         description: Something went wrong
 */