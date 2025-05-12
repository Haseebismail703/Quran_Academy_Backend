import cloudinary from "../confiq/cloudinary.js";
import User from "../model/authModel.js";
import Package from "../model/packageModel.js";
import Recipe from "../model/recipeModel.js";


export let createRecipe = async (req, res) => {
    const { packageId ,courseId, studentId } = req.body;
    const file = req.file; 
//    console.log(req.body)
    try {
        let recipeUrl = null;
        let publicId = null
        if (file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'package',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                // Pipe the file buffer into the upload stream
                uploadStream.end(file.buffer);
            });

            recipeUrl = uploadResult.secure_url; // Get the uploaded image URL
            publicId = uploadResult.public_id
            // console.log(uploadResult,req.body)
        }

        // Create a new recipe in the database
        const newRecipe = await Recipe.create({
            packageId,
            courseId,
            studentId,
            recipeUrl,
            publicId
        });

        res.status(201).json({
            success: true,
            message: "Recipe created successfully",
            data: newRecipe,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the recipe",
            error: error.message,
        });
    }
};
// auto recipe generated 
export const checkAndGenerateRecipe = async (req, res) => {
  const { studentId, courseId, packageId } = req.params;

  try {
    // 1. Find the package and verify month end date
    const packageData = await Package.findOne({
      _id: packageId,
      studentId,
      courseId
    });

    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const today = new Date().toISOString().split("T")[0];
    const monthEnd = new Date(packageData.monthEnd).toISOString().split("T")[0];
    const isMonthEnd = today === monthEnd;

    // 2. Get all existing recipes (sorted by newest first)
    let allRecipes = await Recipe.find({
      studentId,
      courseId,
      packageId
    }).sort({ createdAt: -1 });

    // 3. Handle month end scenario
    if (isMonthEnd) {
      // Check if recipe already exists for today
      const todayRecipeExists = allRecipes.some(recipe => {
        const recipeDate = new Date(recipe.createdAt).toISOString().split("T")[0];
        return recipeDate === today;
      });

      // Generate new recipe if it's month end and no recipe exists for today
      if (!todayRecipeExists) {
        const newRecipe = await Recipe.create({
          studentId,
          courseId,
          packageId,
          status: "pending",
        });
        // Refresh the recipes list after creation
        allRecipes = await Recipe.find({
          studentId,
          courseId,
          packageId
        }).sort({ createdAt: -1 });
      }
    }

    // 4. Prepare response
    const response = {
      message: isMonthEnd 
        ? "Month end processing completed"
        : "Regular package check",
      isMonthEnd,
      data: {
        allRecipes,
        packageDetails: {
          packageName: packageData.packageName,
          monthEnd: packageData.monthEnd
        }
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

export const getLatestRecipe = async (req, res) => {
    const { studentId, courseId } = req.params

    try {
        const latestRecipe = await Recipe.find({ studentId, courseId })
            .sort({ createdAt: -1 })
            .populate('studentId','firstName')
            .populate('courseId','courseName')
            .populate('packageId','packageName')

        if (!latestRecipe) {
            return res.status(404).json({
                success: false,
                message: 'No recipe found for this student and course.',
            });
        }

        res.status(200).json(latestRecipe);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching the latest recipe.',
            error: error.message,
        });
    }
};


export const updateRecipeImage = async (req, res) => {
    const { studentId, courseId } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    try {
        // Get latest recipe entry for that student and course
        const latestRecipe = await Recipe.findOne({ studentId, courseId }).sort({ createdAt: -1 });

        if (!latestRecipe) {
            return res.status(404).json({
                success: false,
                message: 'No recipe found to update.',
            });
        }

        // Delete previous image from Cloudinary
        if (latestRecipe.publicId) {
            await cloudinary.uploader.destroy(latestRecipe.publicId);
        }

        // Upload new image
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'package',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(file.buffer);
        });

        // Update recipe with new image URL and publicId
        latestRecipe.recipeUrl = uploadResult.secure_url;
        latestRecipe.publicId = uploadResult.public_id;
        await latestRecipe.save();

        res.status(200).json({
            success: true,
            message: 'Recipe image updated successfully',
            data: latestRecipe,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update recipe image.',
            error: error.message,
        });
    }
};

// update recipe status and package update 
export const updateRecipeStatus = async (req, res) => {
  const { studentId, courseId, status, recipeId } = req.body;

  try {
    // Validate student existence
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate recipe existence
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Reject: only update recipe status
    if (status === 'rejected') {
      recipe.status = 'rejected';
      await recipe.save();

      return res.status(200).json({
        message: "Recipe rejected successfully",
        data: recipe
      });
    }

    // Approve: update recipe and run course logic
    if (status === 'approved') {
      // Update recipe status
      recipe.status = 'approved';
      await recipe.save();

      // Dates
      const currentDate = new Date();
      const startDate = currentDate.toISOString().split("T")[0];

      const endDateObj = new Date(currentDate);
      endDateObj.setMonth(endDateObj.getMonth() + 1);
      if (endDateObj.getDate() !== currentDate.getDate()) {
        endDateObj.setDate(0); // Handle overflow days
      }
      const endDate = endDateObj.toISOString().split("T")[0];

      // Check if student already joined course
      const alreadyJoined = student.classes.find(
        (cls) => cls.courseId.toString() === courseId && cls.status === 'join'
      );

      if (!alreadyJoined) {
        student.classes.push({
          teacherId: null,
          courseId,
          status: 'waiting',
        });
      }

      // Update package info
      const updatedPackage = await Package.findOneAndUpdate(
        { studentId, courseId },
        {
          monthStart: startDate,
          monthEnd: endDate,
          paymentStatus: 'completed',
          status: 'approved',
        },
        { new: true }
      );

      if (!updatedPackage) {
        return res.status(404).json({ message: "Package not found" });
      }

      await student.save();

      return res.status(200).json({
        message: "Recipe approved and course added successfully",
        data: student
      });
    }

    // Invalid status
    return res.status(400).json({ message: "Invalid status provided" });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};



