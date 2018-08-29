import generateDistinctColors from 'distinct-colors';


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

/**
 * Given an array, return a subset of that array containing only those elements
 * that would be visible assuming the array is being paginated and the specified
 * page is active.
 *
 * For example:
 * visiblePaginatorMembers(['A', 'B', 'C', 'D', 'E'], 2, 2) => ['C', 'D']
 */
export function visiblePaginatorMembers(allMembers, membersPerPage, pageNumber) {
    const firstMemberIndex = (membersPerPage * pageNumber) - membersPerPage;
    return allMembers.slice(firstMemberIndex, firstMemberIndex + membersPerPage);
}

export function debounce(fn, wait = 250) {
  let timeout;

  return function() {
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Return an array of distinct colors, with the number of distinct colors being
 * specified by the numColors argument.
 *
 * Each color is a size-3 array where index 0 represents the red component of
 * the color, index 1 represents the green component of the color, and index 2
 * represents the blue component of the color.
 *
 * For example:
 *
 * getDistinctColors(3) => [
 *     [76, 49, 40],
 *     [159, 189, 150],
 *     [152, 105, 177],
 * ]
 */
export function getDistinctColors(numColors) {
    let distinctColors;

    // The distinct-colors module does generate distinct colors, but they're
    // sort of ugly. Here's a small set of distinct yet pretty colors that we
    // can use when a huge set of colors is not needed.
    // See https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
    const prettyColors = [
        [74, 144, 226],
        [230, 25, 75],
        [60, 180, 75],
        [0, 128, 128],
        [245, 130, 49],
        [145, 30, 180],
        [70, 240, 240],
        [250, 190, 190],
    ];

    // Use prettyColors if we can. Otherwise, use the distinct-colors module to
    // generate as many distinct colors as we need. This not only gives us
    // prettier colors most of the time, but also improves performance.
    // distinct-colors can be slow.
    if (numColors <= prettyColors.length) {
        distinctColors = prettyColors;
    } else {
        distinctColors = generateDistinctColors({
            count: numColors,
        }).map(c => c.rgb());
    }

    return distinctColors;
}

// 'Sorts' the population object so the 'control' population is always first.
export function prependControlToPopulations(populations) {
    const controlPopulationKey = Object.keys(populations).find(pop => pop.toLowerCase() === 'control');
    const result = {};

    if (controlPopulationKey) {
        result[controlPopulationKey] = populations[controlPopulationKey];
        delete populations[controlPopulationKey];
        return Object.assign(result, populations);
    }

    return populations;
};
