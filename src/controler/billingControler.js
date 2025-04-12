import Billing from "../model/billingAddressModel.js";

// creat billing address
let billingAddress = async (req, res) => {
    try {
        const { firstName, lastName, companyName, countryRegion, streetAddress, townCity, postCode, phone, email } = req.body;
        const newBillingAddress = new Billing({
            firstName,
            lastName,
            companyName,
            countryRegion,
            streetAddress,
            townCity,
            postCode,
            phone,
            email
        });
        await newBillingAddress.save();
        res.status(200).json({ message: "Billing address added successfully", billingAddress: newBillingAddress });
    } catch (err) {
        console.error("Error adding billing address:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
}

export { billingAddress };