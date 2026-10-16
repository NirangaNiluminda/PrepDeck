---
topic: react/forms
difficulty: medium
type: code
tags: [react, forms, validation, zod, joi, mosh-react]
source: mosh-react-s07
---

## Question
Replace hand-written `if (!username.trim()) …` checks with a declarative schema. Validate the whole form, turn the library's result into `{ field: message }`, and validate a single field too.

## Answer
Declare the rules **once**, as a schema. **Today: Zod** (also common: Yup;
the course uses **Joi**, via `joi-browser`).

```js
import { z } from 'zod';

const schema = z.object({
  username: z.string().email('Username must be a valid email'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
});

// whole form, into the app's simple { field: message } shape
function validate(data) {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const errors = {};
  for (const issue of result.error.issues) errors[issue.path[0]] ??= issue.message;
  return errors;
}

// one field: validate against just that field's rule
function validateProperty(name, value) {
  const result = schema.shape[name].safeParse(value);
  return result.success ? null : result.error.issues[0].message;
}
```

**Course (Joi) equivalents:**
- `Joi.validate(data, schema, { abortEarly: false })`, then loop over
  `error.details`, using `item.path[0]` and `item.message`.
- For one field, build a one-key object and sub-schema with computed keys:
  `Joi.validate({ [name]: value }, { [name]: this.schema[name] })`.
- `.label('Username')` gives the field a friendly name in error messages.

Either way, the **library's error format is mapped into your own simple
structure**, so components don't depend on the library.

## Key points
- declare the rules once in a schema (Zod/Yup today; Joi in the course)
- whole form: collect every issue and map it to { field: message }
- single field: validate against that field's sub-schema
- map library errors to your own shape so components stay independent
