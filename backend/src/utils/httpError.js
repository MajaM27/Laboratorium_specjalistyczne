// Błąd z kodem HTTP – rzucany w trasach, obsługiwany w middleware/errorHandler.js
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
