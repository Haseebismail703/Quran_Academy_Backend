import Package from "../model/packageModel.js";

// create a new package
 const createPackage = async (req, res) => {
    try {
        const { packageName, packagePrice, packageDuration, classPerMonth,classPerWeek,classType, sessionDuration } = req.body;
        const newPackage = new Package({
            packageName,
            packagePrice,
            packageDuration,
            classPerMonth,
            classPerWeek,
            classType,
            sessionDuration
        });
        await newPackage.save();
        res.status(200).json({ message: "Package created successfully", data: newPackage });
    } catch (error) {
        res.status(500).json({ message: "Error creating package", error: error.message });
    }
};
// get all packages
 const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(200).json({ message: "Packages retrieved successfully", data: packages });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving packages", error: error.message });
    }
};

export { createPackage, getAllPackages };