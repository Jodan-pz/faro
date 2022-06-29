export function debounce<F extends Function>(func: F, wait: number = 300): F {
    let timeoutID: number;

    // conversion through any necessary as it wont satisfy criteria otherwise
    return <any>function (this: any, ...args: any[]) {
        clearTimeout(timeoutID);
        const context = this;

        timeoutID = window.setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
}