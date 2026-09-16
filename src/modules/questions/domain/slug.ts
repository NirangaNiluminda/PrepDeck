/** Lowercase words joined by single hyphens: "terraform-vs-ansible". */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isSlug = (value: string): boolean => SLUG_PATTERN.test(value);
