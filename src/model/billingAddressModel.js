import mongoose from "mongoose";

const { Schema } = mongoose;

const billingAddres = new Schema({
    firstName: {
        type: Schema.Types.String,
        required: true,
    },
    lastName: {
        type: Schema.Types.String,
        required: true,
    },
    companyName: {
        type: Schema.Types.String,
        required: true,
    },
    countryRegion : {
        type: Schema.Types.String,
        required: true,
        unique: true,
        default : "United Kingdom (UK)"
    },
    streetAddress : {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    townCity : {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    postCode: {
        type: Schema.Types.Number,
        required: true,
    },
    phone: {
        type: Schema.Types.Number,
        required: true
    },
    email: {
        type: Schema.Types.String,
        required: true,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Billing = mongoose.model('billing', billingAddres);

export default Billing;