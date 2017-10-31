/**
 * Sort an array of objects by a given property.
 */
export function sortByProperty(objectArray, property) {
    return objectArray.sort((a, b) => {
        const aProp = a[property];
        const bProp = b[property];

        if (aProp < bProp) {
            return -1;
        } else if (aProp > bProp) {
            return 1;
        }

        return 0;
    });
}

/**
 * Reverse-sort an array of objects by a given property.
 */
export function reverseSortByProperty(objectArray, property) {
    return objectArray.sort((a, b) => {
        const aProp = a[property];
        const bProp = b[property];

        if (aProp > bProp) {
            return -1;
        } else if (aProp < bProp) {
            return 1;
        }

        return 0;
    });
}
