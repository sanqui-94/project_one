export function Autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return newDescriptor;
}
//# sourceMappingURL=autobind.js.map