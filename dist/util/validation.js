export function validate(obj) {
    let valid = true;
    let value;
    if ("required" in obj && obj.value) {
        valid = true;
    }
    if ("minLength" in obj) {
        value = obj.value;
        valid = valid && value.trim().length >= obj.minLength;
    }
    if ("maxLength" in obj) {
        value = obj.value;
        valid = valid && value.trim().length <= obj.maxLength;
    }
    if ("min" in obj) {
        value = obj.value;
        valid = valid && value >= obj.min;
    }
    if ("max" in obj) {
        value = obj.value;
        valid = valid && value <= obj.max;
    }
    return valid;
}
//# sourceMappingURL=validation.js.map