---
sidebar_position: 3
---

# Data Fetching Documentation

## Overview

The OpenEU Frontend implements a layered data fetching architecture combining **TanStack Query** for client-side state management with **Next.js Server Actions** for server-side operations.

## Architecture Components

### TanStack Query Configuration

```typescript
// src/lib/provider/ReactQueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60, // 1 hour
      staleTime: Infinity,
    },
  },
});
```

**Key Configuration Decisions:**

- **Aggressive caching**: `staleTime: Infinity` prevents unnecessary refetches
- **Disabled automatic refetch**: Manual cache invalidation for predictable behavior
- **Long garbage collection**: 1-hour retention for better UX on route changes

### File Structure

```
src/
├── lib/
│   └── provider/
│       └── ReactQueryProvider.tsx          # TanStack Query setup
├── domain/
│   ├── hooks/                              # Custom hooks wrapping TanStack Query
│   │   ├── legislative-hooks.ts
│   │   ├── meetingHooks.ts
│   │   ├── chat-hooks.ts
│   │   ├── alertHooks.ts
│   │   ├── notificationsHooks.ts
│   │   ├── profileHooks.ts
│   │   ├── topicHook.ts
│   │   ├── use-debounced-search.ts
│   │   └── useAuth.tsx
│   └── actions/                            # Next.js Server Actions
│       ├── monitor.ts
│       ├── chat-actions.ts
│       ├── alert-actions.ts
│       ├── auth.ts
│       └── profile.ts
├── repositories/                           # API abstraction layer
│   ├── legislationRepository.ts
│   ├── meetingRepository.ts
│   ├── chatRepository.ts
│   ├── alertRepository.ts
│   ├── notificationRepository.ts
│   ├── profileRepository.ts
│   └── topicRepository.ts
```

## Data Fetching Patterns

### 1. TanStack Query for Client-Side Operations

**Implementation Pattern:**

```typescript
// Hook Layer (src/domain/hooks/legislative-hooks.ts)
export const useLegislativeFiles = (params?: LegislativeFilesParams) =>
  useQuery({
    queryKey: ['legislative-files', params],
    queryFn: () => legislationRepository.getLegislativeFiles(params),
  });

// Repository Layer (src/repositories/legislationRepository.ts)
export const legislationRepository = {
  async getLegislativeFiles(
    params?: LegislativeFilesParams,
  ): Promise<LegislativeFile[]> {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
```

### 2. Server Actions for Server-Side Operations

**Implementation Pattern:**

```typescript
// Server Action (src/domain/actions/monitor.ts)
'use server';

export async function getLegislativeFile(
  params: LegislativeFileParams,
): Promise<LegislativeFile> {
  const { user } = await requireAuth();
  const token = (await cookies()).get('token')?.value;

  const response = await fetch(`${API_URL}?${searchParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
```

### 3. Query Key Strategies

**Structured Query Keys:**

```typescript
// src/domain/hooks/chat-hooks.ts
export const chatQueryKeys = {
  sessions: (userId: string) => ['chat-sessions', userId] as const,
  messages: (sessionId: string) => ['chat-messages', sessionId] as const,
} as const;
```

**Simple Query Keys:**

```typescript
// src/domain/hooks/topicHook.ts
export const useTopics = (enabled = true) =>
  useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: topicRepository.getTopics,
    enabled,
  });
```

## Specialized Patterns

### A. Debounced Search

```typescript
// src/domain/hooks/use-debounced-search.ts
export const useDebouncedSearch = <T>(
  fetchFn: (query: string) => Promise<T[]>,
  config: SearchConfig = {},
) => {
  const { minQueryLength = 2, debounceDelay = 300 } = config;

  const {
    data: results = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['search', fetchFn.name, debouncedSearchTerm],
    queryFn: () => fetchFn(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= minQueryLength,
  });

  return { results, isLoading, error, search, clearResults };
};
```

**Used for:**

- Meeting suggestions (`getMeetingSuggestions`)
- Legislation suggestions (`getLegislationSuggestions`)

### B. Streaming Data (Chat)

```typescript
// src/repositories/chatRepository.ts
async sendStreamingMessage(
  request: SendMessageRequest,
  onStreamUpdate?: (content: string) => void,
): Promise<string> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    accumulated += chunk;
    onStreamUpdate?.(accumulated);
  }

  return accumulated;
}
```

**Features:**

- Real-time AI chat responses
- Progressive content updates via callback
- Server-sent events parsing

### C. Optimistic Updates

```typescript
// src/domain/hooks/profileHooks.ts
export const useProfileUpdateMutation = () => {
  return useMutation({
    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['profile', userId] });

      const previousProfile = queryClient.getQueryData(['profile', userId]);
      queryClient.setQueryData(['profile', userId], (old: Profile) => ({
        ...old,
        ...data,
      }));

      return { previousProfile };
    },
    onError: (error, { userId }, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', userId], context.previousProfile);
      }
    },
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};
```

## Authentication Integration

### Token Management

**Client-Side (Repositories):**

```typescript
// All repositories use this pattern
const token = getCookie('token');

const response = await fetch(API_URL, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**Server-Side (Actions):**

```typescript
// All server actions use this pattern
const token = (await cookies()).get('token')?.value;
```

### Authentication Flow

1. **Supabase Authentication**: Login/logout via `src/domain/actions/auth.ts`
2. **Token Storage**: JWT tokens stored in cookies via `setCookie('token', session.access_token)`
3. **Session Validation**: `src/lib/dal.ts` provides `requireAuth()` for protected actions
4. **Middleware Protection**: `src/middleware.ts` validates routes using `updateSession`

## When to Use Each Approach

### Use TanStack Query When:

- **Real-time data needs**: Meeting calendars, chat messages, notifications
- **Search functionality**: Debounced search for meetings and legislation
- **Client-side filtering**: Legislative files, meeting filtering
- **Optimistic updates**: Profile updates, chat optimistic messages

### Use Server Actions When:

- **Authentication operations**: Login, signup, password updates
- **Secure data fetching**: Individual legislative files, protected resources
- **Form submissions**: Alert creation, profile creation
- **Server-side validation**: User permissions, data integrity

## Error Handling

### TanStack Query Pattern

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFunction,
  onError: (error) => {
    ToastOperations.showError({
      title: 'Error',
      message: error.message,
    });
  },
});
```

### Server Action Pattern

```typescript
export async function serverAction() {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    ToastOperations.showError({
      title: 'Operation Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
```

## Performance Optimizations

### Query Optimization

- **Selective enabling**: `enabled` flags prevent unnecessary requests
- **Stale-while-revalidate**: Cached data shown while refreshing
- **Parameterized caching**: Different parameters create separate cache entries

### Network Optimization

- **Request deduplication**: Multiple components share same requests
- **Background refetching**: Data updates without blocking UI
- **Conditional fetching**: `enabled` prevents requests when conditions not met

## Cache Management

### Manual Invalidation

```typescript
// Used in mutation success handlers
queryClient.invalidateQueries({ queryKey: ['alerts', userId] });
queryClient.invalidateQueries({ queryKey: chatQueryKeys.sessions(user.id) });
```

### Revalidation Tags (Server Actions)

```typescript
// src/domain/actions/chat-actions.ts
revalidateTag(`chat-sessions-${user.id}`);
```

## Best Practices Applied

1. **Consistent Query Keys**: Structured patterns like `['resource', params]`
2. **Error Handling**: `ToastOperations` for user-friendly error messages
3. **Loading States**: All queries return `isLoading` for UI feedback
4. **Type Safety**: TypeScript throughout hooks and repositories
5. **Authentication**: Consistent token handling across all API calls
6. **Cache Invalidation**: Strategic invalidation after mutations

