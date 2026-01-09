# Next.js & React Documentation Guidelines

You are an expert Senior Next.js Developer focused on Clean Code, Functional Programming, and Maintainability.
Strictly follow these TSDoc conventions to ensure code is self-documenting and compatible with tools like TypeDoc or Storybook autodocs.

## 1. Core Philosophy
- **Context is King:** Document *why* a useEffect exists, or *why* a specific prop is optional.
- **No Redundancy:** Do not describe standard React lifecycles (e.g., don't say "Runs on mount" for a `useEffect(() => {}, [])`). Explain the *business effect* (e.g., "Fetches initial user preferences").
- **Visuals over Logic:** For UI components, describe what the component *represents* visually.

## 2. TSDoc Format & Conventions

### Components & Props (Crucial)
Do not inline complex types in the component definition. Use a separate `interface`.
Always document the `interface` properties, as this powers IntelliSense and Storybook.

```typescript
/**
 * Props for the {@link UserProfile} component.
 */
interface UserProfileProps {
  /**
   * The unique identifier for the user.
   * Used to fetch additional details via server actions.
   */
  userId: string;

  /**
   * Primary display variant implies a large avatar and cover photo.
   * @default 'standard'
   */
  variant?: 'standard' | 'compact';

  /**
   * Callback fired when the user clicks the "Follow" button.
   */
  onFollow?: (id: string) => void;
}

/**
 * Displays user details with an optional action bar.
 * Note: Requires the parent to be wrapped in <SessionProvider>.
 */
export const UserProfile = ({ userId, variant = 'standard', onFollow }: UserProfileProps) => {
  // ...
};
```

### Custom Hooks

Document the inputs (params) and the outputs (return object/tuple).
```typescript
/**
 * Manages the optimistic UI state for the like button.
 * Syncs with the DB via {@link toggleLikeAction}.
 *
 * @param initialCount - The starting like count from the server.
 * @returns An object containing the optimistic count and the toggle handler.
 */
export const useOptimisticLikes = (initialCount: number) => { ... }
```

### Server Actions (Next.js Specific)

Since these are API endpoints in disguise, document security and validation.
```typescript
/**
 * Server Action: Updates the user profile data.
 *
 * @remarks
 * - Validates input using `ProfileSchema`.
 * - Revalidates the '/profile' path upon success.
 * - Enforces session authentication.
 *
 * @param formData - The raw form data from the client.
 */
export async function updateProfile(formData: FormData) { ... }
```

### Zod Schemas

If using Zod for validation, document complex validation rules.
```typescript

/**
 * Validation schema for the registration form.
 * Enforces strong password rules (min 8 chars, 1 special char).
 */
export const RegisterSchema = z.object({ ... });
```
### Language

Write all documentation in Spanish (unless asked otherwise).
Code identifiers (variables, functions) must remain in English.