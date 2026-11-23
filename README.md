This project was bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).

## What it does

Implementation of the [Lexical Editor](https://lexical.dev/) for [Contentful CMS](https://www.contentful.com/).

![Bildschirmfoto 2025-03-04 um 18 10 26](https://github.com/user-attachments/assets/85b799b9-ad9c-445d-acf0-5969c9ea85f3)

## How to use

1.

```
npm install
npm run build
```

2.

Create new custom App inside Contenful and drag/drop bundle into it. Activate it on Locations like "long text" or "short text".

## API Configuration

This app requires an API connection that can be configured in two ways:

1. **Contentful App Configuration Parameters**:

   - When uploading the app to Contentful, you'll need to configure the following parameters:
   - `apiURL`: The base URL for your API
   - `authToken`: Authentication token for API requests

   These parameters can be set in the Contentful web app during the app installation process.

   **Note:** The authentication token (`authToken`) must be configured on the backend in the corresponding environment settings page in `URL Validator - Auth Token` input:

   - For development: `https://background-develop.tagesspiegel.de/settings/global`
   - For other environments: Use the appropriate settings page for that environment

2. **Environment Variables**:
   - For local development, create a `.env` file with the following variables:

## Development Notes

### Feature Flags

This project uses a hybrid feature flag system that combines local build-time flags with runtime configuration through Contentful instance parameters.

#### Overview

Feature flags allow us to:

- Merge new features while keeping them hidden in production
- Test features in development without affecting production users
- Control features at runtime through Contentful configuration
- Gradually roll out features by simply changing configuration
- Maintain a single codebase without feature branches

#### Available Flags

| Flag              | Development | Production | Contentful Parameter            | Description                                                  |
| ----------------- | ----------- | ---------- | ------------------------------- | ------------------------------------------------------------ |
| `developmentMode` | `true`      | `false`    | `cfFeatureFlag_developmentMode` | Controls advanced UI features and experimental functionality |
| `urlValidation`   | `false`     | `false`    | cfFeatureFlag_urlValidation     | Enables advanced URL validation                              |

#### Flag Priority System

Feature flags are resolved with the following priority (highest to lowest):

1. **Contentful Instance Parameters** - Set per app instance/field (highest priority)
2. **Build-time Vite Flags** - Injected during build process
3. **Default Configuration** - Fallback values in code

#### Usage

**In React Components (with Contentful support):**

```tsx
import { useFeatureFlag } from './hooks/useFeatureFlag';

function MyComponent() {
  const isDevelopmentMode = useFeatureFlag('developmentMode');

  return <div>{isDevelopmentMode ? <NewFeatureComponent /> : <LegacyComponent />}</div>;
}
```

**In Non-React Contexts (build-time flags only):**

```tsx
import { isFeatureEnabled } from './services/featureFlags';

if (isFeatureEnabled('developmentMode')) {
  // development logic
}
```

#### Contentful Configuration

To configure feature flags in Contentful:

1. Go to your app definition in Contentful
2. Navigate to **"Instance parameter definitions"**
3. Add parameters with the naming convention `cfFeatureFlag_[flagName]`

Example parameter configuration:

```
Display name: Development Mode Feature Flag
ID: cfFeatureFlag_developmentMode
Type: Short text
Required: No (unchecked)
Default value: false
Description: Enables development mode features and advanced UI components. Set to "true" to enable, "false" to disable.
```

Users can then set these parameters when configuring the app on content fields. The app will automatically read these values and override build-time defaults.

#### Implementation Details

The system uses:

- TypeScript interfaces for type safety
- React hooks (`useFeatureFlag`, `useFeatureFlags`) for component integration
- Contentful SDK integration via `useContentfulFeatureFlags` hook
- Build-time injection via Vite for optimal performance
- Automatic string-to-boolean conversion for Contentful parameters

#### Adding New Feature Flags

1. Update the `FeatureFlags` interface in `src/services/featureFlags.ts`
2. Add the flag with a default value to the `featureFlags` object
3. Add the Contentful parameter mapping in `src/hooks/useContentfulFeatureFlags.ts`
4. Update `vite.config.mts` if build-time behavior is needed
5. Add the parameter definition in Contentful with the `cfFeatureFlag_` prefix

### Husky Pre-commit Hook Permissions

If you encounter issues with Husky pre-commit hooks not running properly, you might need to make the pre-commit file executable:

```bash
# Make the pre-commit hook executable
chmod +x .husky/pre-commit
```

**Note:** On some systems, especially Windows or when using certain Git clients, you might face issues with file permissions. If the pre-commit hooks aren't running:

1. Check file permissions with `ls -la .husky/pre-commit`
2. If using Git Bash on Windows, try `git update-index --chmod=+x .husky/pre-commit`
3. Verify your Git configuration with `git config core.hooksPath`
