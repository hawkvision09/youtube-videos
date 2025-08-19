// Helper function to create a URL-friendly slug
export const createSlug = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters except spaces and hyphens
        .replace(/\s+/g, '-')         // replace spaces with hyphens
        .replace(/-+/g, '-')          // remove consecutive hyphens
        .trim();                      // trim leading/trailing spaces/hyphens
};

