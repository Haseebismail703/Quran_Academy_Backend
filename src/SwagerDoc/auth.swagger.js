/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User Authentication and logout APIs
 */

/**
 * @swagger
 * /api/signupUser:
 *   post:
 *     summary: Register a new user 
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User registered, password sent to email
 *       400:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/signinUser:
 *   post:
 *     summary: Login as a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/updateUser/{userId}:
 *   put:
 *     summary: Update user profile and/or change password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             examples:
 *               firstNameLastNameConflict:
 *                 summary: First name and last name already exist
 *                 value: { message: "First name and last name already exist" }
 *               currentPasswordRequired:
 *                 summary: Current password is required
 *                 value: { message: "Current password is required" }
 *               newPasswordConflict:
 *                 summary: New password cannot be the same as the current password
 *                 value: { message: "New password cannot be the same as the current password" }
 *       401:
 *         description: Current password is incorrect
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/logOut:
 *   post:
 *     summary: Logout the user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */
