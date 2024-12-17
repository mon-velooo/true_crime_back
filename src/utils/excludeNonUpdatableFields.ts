/**
 * Excludes specified non-updatable fields from the given fields object.
 *
 * @param {any} fields - The fields to be updated.
 * @param {string[]} nonUpdatableFields - The array of field names to be excluded from updates.
 * @returns {any} The sanitized fields with non-updatable fields excluded.
 */
export function excludeNonUpdatableFields(fields: any, nonUpdatableFields: string[]) {
    const sanitizedFields = { ...fields };
    nonUpdatableFields.forEach((field) => {
        delete sanitizedFields[field];
    });
    return sanitizedFields;
}