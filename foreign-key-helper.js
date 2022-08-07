// http://egorpanok.com/how-to-emulate-foreign-key-constraints-with-mongoose/

// Utility to validate against a foreign key in a specified collection
module.exports = (model, id) => {

    return new Promise((resolve, reject) => {

        model.findOne({ _id: id }, (err, result) => {
            if (result) {
                return resolve(true);
            }
            else return reject(new Error(`FK Constraint 'checkObjectsExists' for '${id.toString()}' failed`));
        });
    });
};