const { Op } = require("sequelize");

class ApiFeatures {
  constructor(model, queryString) {
    this.model = model;
    this.queryString = queryString;
    this.queryOptions = {}; // To collect Sequelize options like where, order, attributes, etc.
  }

  // Filter: Handles filtering of the query
  Filter() {
    const queryStringObj = { ...this.queryString };
    const excludedFields = ["limit", "page", "sort", "fields", "keyword"];
    excludedFields.forEach((field) => delete queryStringObj[field]);

    let queryString = JSON.stringify(queryStringObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.queryOptions.where = JSON.parse(queryString);
    return this;
  }

  // Sort: Sorts the query results
  Sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(",")
        .map((field) => [field.trim(), "ASC"]); // Default ascending
      this.queryOptions.order = sortBy;
    } else {
      this.queryOptions.order = [["createdAt", "DESC"]]; // Default sort
    }
    return this;
  }

  // Limit fields: Limits the fields returned in the response
  limitField() {
    if (this.queryString.fields) {
      this.queryOptions.attributes = this.queryString.fields.split(",");
    } else {
      this.queryOptions.attributes = { exclude: ["__v"] }; // Exclude unwanted fields
    }
    return this;
  }

  // Search: Handles searching by keyword
  Search(ModelName) {
    if (this.queryString.keyword) {
      let query = {};
      if (ModelName === "Products") {
        query = {
          [Op.or]: [
            { title: { [Op.like]: `%${this.queryString.keyword}%` } },
            { description: { [Op.like]: `%${this.queryString.keyword}%` } },
          ],
        };
      } else {
        query = { name: { [Op.like]: `%${this.queryString.keyword}%` } };
      }
      this.queryOptions.where = { ...this.queryOptions.where, ...query };
    }
    return this;
  }

  // Pagination: Handles pagination of the results
  Pagination(countDocuments) {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 50;
    const offset = (page - 1) * limit;

    this.queryOptions.limit = limit;
    this.queryOptions.offset = offset;

    const numberOfPages = Math.ceil(countDocuments / limit);
    this.PaginationResult = {
      currentPage: page,
      limit: limit,
      numberOfPages: numberOfPages,
      nextPage: page < numberOfPages ? page + 1 : undefined,
      prevPage: page > 1 ? page - 1 : undefined,
    };
    return this;
  }

  buildQuery(queryOptions = {}) {
    // Merge the passed options with the internal query options
    this.queryOptions = { ...this.queryOptions, ...queryOptions };

    // Execute the query with the final options
    return this.model.findAll(this.queryOptions);
  }
}

module.exports = ApiFeatures;
