const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
}, {
    timestamps: true
});

// Calculate total before saving
cartSchema.pre('save', async function(next) {
    if (this.isModified('items')) {
        let total = 0;
        for (const item of this.items) {
            const product = await mongoose.model('Product').findById(item.product);
            if (product) {
                total += product.price * item.quantity;
            }
        }
        this.total = total;
    }
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 