export const responseHandlerMiddleware =  (req, res, next) => {
    const oldJson = res.json;
    const body = {
        status: res.statusCode,
        data: null,
        error: null
    }
    res.json = (data) => {
        if (res.statusCode === 200) {
            body.data = data
            body.error = undefined
        } else {
            body.data = undefined
            body.error = data.error
        }
        oldJson.call(res, body);
    }
    next();
    // try {
    //     const oldJSON = res.json;
    //     res.json = (data) => {
    //         let body = {
    //             status: res.statusCode,
    //             body: data,
    //             error: null
    //         }
    //         // For Async call, handle the promise and then set the data to `oldJson`
    //         if (data && data.then != undefined) {
    //             // Resetting json to original to avoid cyclic call.
    //             return data.then((responseData) => {
    //                 // Custom logic/code.
    //                 body.data = responseData
    //                 res.json = oldJSON;
    //                 return oldJSON.call(res, body);
    //             }).catch((error) => {
    //                 next(error);
    //             });
    //         } else {
    //             // For non-async interceptor functions
    //             // Resetting json to original to avoid cyclic call.
    //             // Custom logic/code.
    //             res.json = oldJSON;
    //             return oldJSON.call(res, body);
    //         }
    //     }
    // } catch (error) {
    //     next(error);
    // }
}
