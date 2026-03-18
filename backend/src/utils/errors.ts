export class AppError extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
        this.name = 'AppError';
    }
}

export const catchAsync = (fn: Function) => {
    return (...args: any[]) => Promise.resolve(fn(...args)).catch(args[2]);
}; 
 
console.log("Added AppError class and catchAsync utility for error handling in backend/src/utils/errors.ts");
 