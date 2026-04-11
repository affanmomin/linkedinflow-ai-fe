# LinkedIn OAuth Integration Guide

This guide explains how to use the LinkedIn OAuth integration in your React frontend application.

## Overview

The LinkedIn integration uses OAuth 2.0 to securely connect user accounts without storing passwords. The integration includes:

- **OAuth API endpoints** for connecting and handling callbacks
- **Zustand store** for managing LinkedIn connection state
- **Custom hook** for easy OAuth operations
- **React components** for UI integration

## Backend API Endpoints

Your backend provides these LinkedIn OAuth endpoints:

### 1. Connect to LinkedIn (`POST /linkedin/connect`)

Generates a LinkedIn OAuth authorization URL.

```typescript
// Request
{
  // No parameters required
}

// Response
{
  "url": "https://linkedin.com/oauth/...", // OAuth authorization URL
  "state": "encoded_state_data"            // State parameter for security
}
```

### 2. Handle OAuth Callback (`POST /linkedin/finish`)

Processes the OAuth callback and exchanges code for access token.

```typescript
// Request
{
  "code": "string",    // Required: OAuth authorization code
  "state": "string"    // Required: State parameter from initial request
}

// Response
{
  "success": true,
  "message": "LinkedIn connected successfully"
}
```

## Frontend Integration

### 1. LinkedIn Store

The Zustand store manages LinkedIn connection state:

```typescript
import { useLinkedInStore } from '../store/useLinkedInStore';

const {
  oauthData,        // OAuth connection data
  isLoggedIn,       // Connection status
  isLoading,        // Loading state
  setOAuthData,     // Set OAuth data
  clearOAuthData,   // Clear OAuth data
} = useLinkedInStore();
```

### 2. LinkedIn OAuth Hook

Use the custom hook for OAuth operations:

```typescript
import { useLinkedInOAuth } from '../hooks/useLinkedInOAuth';

const {
  // State
  oauthData,
  isLoggedIn,
  isLoading,
  isConnected,
  
  // Actions
  connect,
  disconnect,
  handleCallback,
  testConnection,
  
  // User info
  userProfile,
  connectedAt,
} = useLinkedInOAuth({
  onSuccess: (data) => {
    console.log('Connected successfully:', data);
  },
  onError: (error) => {
    console.error('Connection failed:', error);
  }
});
```

### 3. Connecting to LinkedIn

To initiate LinkedIn OAuth connection:

```typescript
const handleConnect = async () => {
  await connect();
};
```

This will redirect the user to LinkedIn for authorization.

### 4. Handling OAuth Callback

The `LinkedInCallback` component automatically handles the OAuth callback:

```typescript
// URL: /linkedin/callback?code=...&state=...

import LinkedInCallback from '../pages/LinkedInCallback';

// This component will:
// 1. Extract code and state from URL
// 2. Call the backend /linkedin/finish endpoint
// 3. Store OAuth data in the store
// 4. Redirect to dashboard on success
```

### 5. Using LinkedIn Connection Status

Check connection status in your components:

```typescript
const { isConnected, oauthData } = useLinkedInOAuth();

if (!isConnected) {
  return <div>Please connect to LinkedIn first</div>;
}

return (
  <div>
    Connected as: {oauthData?.userProfile?.vanityName || oauthData?.agencyId}
    Connected at: {new Date(oauthData?.connectedAt).toLocaleDateString()}
  </div>
);
```

## Route Configuration

Make sure to add the callback route to your router:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LinkedInCallback from './pages/LinkedInCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/linkedin/callback" element={<LinkedInCallback />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Environment Variables

Make sure your backend has the required LinkedIn OAuth environment variables:

```bash
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/linkedin/callback
```

## LinkedIn App Configuration

In your LinkedIn Developer App settings:

1. **Authorized Redirect URLs**: Add your callback URL
   - Development: `http://localhost:3000/linkedin/callback`
   - Production: `https://yourdomain.com/linkedin/callback`

2. **Required OAuth Scopes**:
   - `r_ads` - Read advertising accounts
   - `r_ads_reporting` - Read advertising reports
   - `rw_ads` - Manage advertising accounts
   - `r_organization_social` - Read organization posts
   - `rw_organization_admin` - Manage organization
   - `r_basicprofile` - Read basic profile

## Usage Examples

### Simple Connection Button

```typescript
import { useLinkedInOAuth } from '../hooks/useLinkedInOAuth';

function ConnectButton() {
  const { connect, isConnected, isLoading } = useLinkedInOAuth();

  if (isConnected) {
    return <div>✅ LinkedIn Connected</div>;
  }

  return (
    <button onClick={() => connect()} disabled={isLoading}>
      {isLoading ? 'Connecting...' : 'Connect LinkedIn'}
    </button>
  );
}
```

### Connection Status Display

```typescript
import { useLinkedInOAuth } from '../hooks/useLinkedInOAuth';

function ConnectionStatus() {
  const { 
    isConnected, 
    oauthData, 
    disconnect, 
    testConnection 
  } = useLinkedInOAuth();

  if (!isConnected) {
    return <div>Not connected to LinkedIn</div>;
  }

  return (
    <div>
      <h3>LinkedIn Connected</h3>
      <p>User: {oauthData?.userProfile?.vanityName || 'LinkedIn User'}</p>
      <p>Connected: {new Date(oauthData?.connectedAt).toLocaleDateString()}</p>
      <button onClick={testConnection}>Test Connection</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## Error Handling

The integration includes comprehensive error handling, including **LinkedIn token revocation**:

```typescript
const { connect, isConnected, tokenRevoked, lastError } = useLinkedInOAuth({
  onSuccess: (data) => {
    // Handle successful connection
    console.log('LinkedIn connected:', data);
  },
  onError: (error) => {
    // Handle connection errors
    console.error('LinkedIn connection failed:', error.message);
    
    // Handle specific error types
    if (error.message.includes('revoked')) {
      alert('LinkedIn access was revoked. Please reconnect your account.');
    } else if (error.message.includes('denied')) {
      alert('LinkedIn authorization was denied. Please try again.');
    } else {
      alert('Failed to connect to LinkedIn. Please check your connection.');
    }
  }
});

// Check for token revocation in your components
if (tokenRevoked) {
  return (
    <div className="error-state">
      <h3>LinkedIn Access Revoked</h3>
      <p>Your LinkedIn access was revoked: {lastError}</p>
      <button onClick={() => connect()}>Reconnect LinkedIn</button>
    </div>
  );
}
```

### Common LinkedIn API Errors:

1. **`REVOKED_ACCESS_TOKEN`** (401): The user revoked access to your app
2. **`EXPIRED_TOKEN`** (401): The access token has expired  
3. **`THROTTLE_LIMIT_EXCEEDED`** (429): Too many API requests
4. **`INVALID_REQUEST`** (400): Malformed request or missing parameters

The integration automatically handles token revocation by:
- Updating the store to mark the token as revoked
- Showing appropriate error messages to users
- Providing easy reconnection options

## Security Considerations

1. **State Parameter**: The integration uses the OAuth state parameter to prevent CSRF attacks
2. **No Password Storage**: User passwords are never stored or transmitted
3. **Token-Based**: Uses secure OAuth tokens for API access
4. **Revocable**: Users can disconnect/revoke access at any time

## Testing

The integration includes mock fallbacks for development:

- When the backend is unavailable, mock responses are returned
- This allows frontend development without a running backend
- Mock responses simulate the OAuth flow for testing UI components

## Troubleshooting

### Common Issues:

1. **"Backend API not available"**: The frontend will use mock data when the backend is not running
2. **"Invalid state parameter"**: Check that the callback URL matches your LinkedIn app settings
3. **"Failed to connect"**: Verify your LinkedIn app credentials and redirect URLs
4. **Infinite loading**: Check browser console for JavaScript errors

### Debug Mode:

Enable debug logging by checking the browser console. The integration logs all OAuth steps for debugging.

## Next Steps

After connecting LinkedIn, you can:

1. **Create Posts**: Use the existing `linkedInAPI.createAndPost()` method
2. **Schedule Posts**: Add scheduling functionality to your posts
3. **Manage Multiple Accounts**: Extend the store to handle multiple LinkedIn connections
4. **Analytics**: Add LinkedIn analytics and reporting features

For more advanced features, extend the backend API and frontend integration as needed.