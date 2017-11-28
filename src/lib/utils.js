/**
 * Sort an array of objects by a given property. Don't sort the array in place,
 * but instead return a copy.
 */
export function sortedByProperty(objectArray, property) {
    return objectArray.concat().sort((a, b) => {
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
 * Reverse-sort an array of objects by a given property. Don't sort the array in
 * place, but instead return a copy.
 */
export function reverseSortedByProperty(objectArray, property) {
    return objectArray.concat().sort((a, b) => {
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
