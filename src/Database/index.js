const mongoose = require('mongoose');
const GuildSchema = require('./Schema/GuildScheme')


class db {
    constructor(URL, Options, Schema, callback) {
        this.URL = URL || process.env.DB_URL;
        if (!this.URL) throw new Error('There must be a database connection url')
        this.Options = Options || {};
        this.Schema = Schema || null;

        this.connect().then(callback)
    }

    async connect() {
        await mongoose.connect(this.URL, this.Options).catch(e => { throw e });
        return mongoose;
    }

    async findOne(query) {
        //await this.connect()
        let result = await this.Schema.findOne(query).catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }

    async findOneAndUpdate(query, update) {
        //await this.connect()
        let result = await this.Schema.findOneAndUpdate(query, update).catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }

    async findOneAndRemove(query) {
        //await this.connect()
        let result = await this.Schema.findOneAndRemove(query).catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }

    async find(query) {
        //await this.connect()
        let result = await this.Schema.find(query).catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }

    async findById(id) {
        //await this.connect()
        let result = await this.Schema.findById(id).catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }

    async findByIdAndUpdate(id, update) {
        //await this.connect()
        let result = await this.Schema.findByIdAndUpdate(id, update).catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }

    async findByIdAndRemove(id) {
        //await this.connect()
        let result = await this.Schema.findByIdAndRemove(id).catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }

    async aggregate(query) {
        //await this.connect()
        let result = await this.Schema.aggregate(query).catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }

    async save(data) {
        //await this.connect()
        let result = await this.Schema(data).save().catch(err => { throw err })
        //mongoose.connection.close()
        return result
    }
}

module.exports = {db, GuildSchema}