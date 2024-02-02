class APIFeatures {
    // 传入两个参数，第一个是node的查询，第二个是http的查询语句。
    // queryString即req.query

    // 两种检索方式：

    // const tours = await Tour.find({
    //     duraion: 5,
    //     difficulty: 'easy'
    // });

    // const tours = await Tour.find() // return all the documents
    //     .where('duration')
    //     .equals(5)
    //     .where('difficulty')
    //     .equals('easy');

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // console.log(JSON.parse(queryStr));

        // MongoDB里的形式：{ difficulty: 'easy', duration: { $gte:5 } }
        // NodeJS的形式：{ difficulty: 'easy', duration: { gte:'5' } }
        // gte, gt, lte, lt

        this.query.find(JSON.parse(queryStr));
        return this;
    };
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            // Mongoose中多字段排序的写法：`sort('price ratingsAverage')`
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt') // 设置默认顺序为按照创建时间从新到旧。
            // sort的值前面加上减号表示降序，例如`sort=-price`
        }
        return this;
    };
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
            // field的值前面加上减号表示“不包含”，例如`field=-__v`。
        }
        // 也可以直接从schema来排除字段，从而向客户端隐藏字段（在tourModel.js中设置）。    
        return this;    
    };
    paginate() {
        const page = this.queryString.page * 1 || 1; // 把默认页数设为1
        const limit = this.queryString.limit *1 || 100;
        const skip = (page-1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    };
}

module.exports = APIFeatures;