/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Billing address APIs
 */

/**
 * @swagger
 * /api/createBillingAdress:
 *   post:
 *     summary: Create a billing address
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - companyName
 *               - countryRegion
 *               - streetAddress
 *               - townCity
 *               - postCode
 *               - phone
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               companyName:
 *                 type: string
 *               countryRegion:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               townCity:
 *                 type: string
 *               postCode:
 *                 type: number
 *               phone:
 *                 type: number
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Billing address added successfully
 *       500:
 *         description: Internal server error
 */