const handleErrors = (errs) => {
    errors = {}
    try {
        const error = JSON.parse(errs.message);
        errors[Object.keys(error)[0]] = Object.values(error)[0];
    }
    catch (err) {

    }
    // //console.log(typeof errs.errors);
    if (errs.errors) {
        for (let err of errs?.errors) {
            if (err.type === "Validation error") {
                errors[err.path] = err.message;
            }
            if (err.type === "unique violation") {
                errors[err.path] = err.path + " is Registered with another account";
            }
        }
    }
    // //console.log(errors[0]);
    //console.log("ERRORRRRRS======", errors)
    return errors;
}

module.exports = handleErrors;