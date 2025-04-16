import mongoose from "mongoose";

let packageSchema = new mongoose.Schema({
    packageName: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    packagePrice: {
        type: mongoose.Schema.Types.Number,
        required: true
    },
    packageDuration: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    classPerMonth: {
        type: mongoose.Schema.Types.Number,
        default : 5
    },
    classPerWeek: {
        type: mongoose.Schema.Types.Number,
        default : 1
    },
    classType: {
        type: mongoose.Schema.Types.String,
        required: true,
        default: 'One to One'
      },
      sessionDuration: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: 30
      },
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

let Package = mongoose.model('Packages', packageSchema);
export default Package;