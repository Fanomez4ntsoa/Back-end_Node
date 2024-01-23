const BaseServiceInterface = require("../contracts/BaseServiceInterface");

/**
 * @implements (BaseServiceInterface)
 */
class BaseService {
    constructor(model) {
        this.model = model;
    }

    async getById(id) {
        try {
            return await this.model.findById(id);
        } catch (error) {
            throw new Error(`Error while retrieving this item : ${error.message}`);
        }
    }

    async create(data) {
        try {
            const newItem = new this.model(data);
            return await newItem.save();
        } catch (error) {
            throw new Error(`Error creating item : ${error.message}`);
        }
    }

    async update(id, data) {
        try {
            const item = await this.model.findById(id);
            if(!item) {
                throw new Error(`${this.model.modelName} not found`);
            }
            Object.assign(item, data)
            return item.save();
        } catch (error) {
            throw new Error(`Error on updating item : ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const item = await this.model.findById(id);
            if(!item) {
                throw new Error(`${this.model.modelName} not found`);
            }
            return item.remove();
        } catch (error) {
            throw new Error(`Error on deleting item : ${error.message}`);
        }
    }
}

module.exports = BaseService;