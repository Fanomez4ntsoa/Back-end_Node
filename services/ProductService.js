const BaseService = require("./BaseService");
const Product = require('../models/ProductModel');

class ProductService extends BaseService {

    /**
     * Récuperer tous les produits
     * 
     * @param {number} pageNumber 
     * @param {number} pageSize 
     * @param {string} keywords 
     * @returns 
     */
    async allProducts(pageNumber = 1, pageSize = 10, keywords = '') {
        const skip = pageSize * (pageNumber - 1);
        const query = keyword ? {
            name: { 
                $regex : keywords,
                $options: 'i',
            }
        } : {};

        const count = await this.model.countDocuments(query);
        const products = await this.model
            .find(query)
            .limit(pageSize)
            .skip(skip);

        return {
            products,
            page: pageNumber,
            pages: Math.ceil(count / pageSize),
        };
    }

    /**
     * Creation d'un nouveau review
     * 
     * @param {string} productId 
     * @param {object} user 
     * @param {number} rating 
     * @param {string} comment
     * @returns {Promise<void>}
     */
    async productReview(productId, user, rating, comment) {
        const product = await this.getById(productId);

        if(product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === user._id.toString()
            )

            if(alreadyReviewed) {
                throw new Error('Product already reviewed');
            }

            const review = {
                name: user.name,
                rating: Number(rating),
                comment,
                user: user._id,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = 
                product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

            await product.save();
        } else {
            throw new Error('Product not found');
        }
    }

    /**
     * Recuperation des produits les mieux notés
     * 
     * @throws {Error}
     * @returns {Promise<Array>}
     */
    async topProducts() {
        return Product.find({}).sort({range: -1}).limit(3);
    }
}

module.exports = ProductService;