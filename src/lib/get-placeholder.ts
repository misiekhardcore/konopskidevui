/**
 * Appends `(optional)` to a placeholder for fields that are not required, so a
 * form never has to say it twice. Mirrors konopskidev's `components/ui/helpers`.
 */
export function getPlaceholder(placeholder?: string, required?: boolean) {
  if (!placeholder || required) return placeholder;

  return `${placeholder} (optional)`;
}
