export default class SearchFilter {
  //queryString is req.query
  //mongooseQuery is from mongoose model find()
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    //build query
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`));
    //search via text
    let searchQuery = {}
    if(queryStr.searchField && queryStr.q){
      let searchTerm = queryStr.q || ""
      searchQuery[queryStr.searchField] = {
        $regex: searchTerm,
        $options: "i"
      }
      //delete searchField and q(searchterm)
      delete queryStr.q
      delete queryStr.searchField
    }
    // this.mongooseQuery = this.mongooseQuery.find({$and: [searchQuery, queryStr]});
    this.mongooseQuery = this.mongooseQuery.find({
      ...searchQuery, ...queryStr
    })
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const fileds = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fileds);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = Math.max(Number(this.queryString.page) || 1, 1);
    const maxLimit = 1000; // Adjust max limit based on server capability
    const limit = Math.min(Math.max(Number(this.queryString.limit) || 100, 1), maxLimit);
    const skip = (page - 1) * limit;

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip > numTours)
    //     throw new NodeError(StatusCodes.INVALID, "This page doesn't exist");
    // }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
}
