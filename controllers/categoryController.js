const Category = require('../models/categoryModel');

module.exports = {

    addCategory: async (req, res) => {
        try {

            const { name } = req.body;

            if (!name || name.trim().length === 0) return res.status(400).json({ errMsg: 'Category name required' });
            const categoryName = name.toLowerCase();
            const existingName = await Category.findOne({ categoryName });

            if (existingName) return res.status(400).json({ errMsg: 'Category already found' });

            const newCategory = new Category({
                categoryName,

            });
            await newCategory.save();
            res.status(200).json({ newCategory });

        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg : "Something went wrong at add category"});
        }
    },

    categoryList: async (req, res) => {
        try {
            const category = await Category.find()

            res.status(200).json({ category });
        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg : "Something went wrong at category listing"});
        }
    },

    editCategory: async (req, res) => {
        try {

            const { _id, categoryName } = req.body;
            const name = categoryName.toLowerCase()
            
            if(!categoryName || categoryName.trim().length === 0) return res.status(400).json({ errMsg : "Category name required"})

            const existingService = await Category.findOne({ categoryName: name, _id: { $ne: _id } });
            if (existingService) return res.status(400).json({ errMsg: 'Category name already exists' });

            const category = await Category.findById(_id);
            category.categoryName = name
            await category.save();
            return res.status(200).json({ category });
        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg : "Something went wrong at edit category"});
        }
    }
}