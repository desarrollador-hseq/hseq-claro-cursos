

export class DashboardRequiredError extends Error {
    constructor(message = "Dashboard is required to access this page") {
      super(message);
      this.name = "DashboardRequiredError";
    }
  }
  