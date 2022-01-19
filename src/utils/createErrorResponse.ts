export const createErrorResponse = (field: string, error: string, errorResponse: { errors: { [key: string]: string } } = { errors: {} }) => {
	errorResponse.errors[field] = error;
	return errorResponse;
}
