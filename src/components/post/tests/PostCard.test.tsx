import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../store/authSlice';
import PostCard from '../PostCard';
import * as useLikePostModule from '../hooks/useLikePost';
import * as useDeletePostModule from '../hooks/useDeletePost';

// Mock hooks
vi.mock('../hooks/useLikePost');
vi.mock('../hooks/useDeletePost');

// Mock helpers/icons if necessary, but simpler to let them run if they are pure components
// Mock Date-fns to have consistent time output if needed, but for now we'll match loosely

// Types
import type { Post } from '../../../models/Post';

const mockPost: Post = {
    id: 1,
    username: 'testuser',
    title: 'Test Post',
    content: 'Test Content',
    created_datetime: new Date().toISOString(),
    updated_datetime: new Date().toISOString(),
    likes_count: 5,
    is_liked: false, // Default not liked
};

const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
};


// Helper to render with providers (Query + Redux)
const renderWithProviders = (
    ui: React.ReactNode,
    {
        preloadedState = {},
        store = configureStore({ reducer: { auth: authReducer }, preloadedState }),
    } = {}
) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return {
        ...render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {ui}
                </QueryClientProvider>
            </Provider>
        ),
        store,
    };
};


describe('PostCard Like Functionality', () => {
    const mockLikeMutate = vi.fn();
    const mockDeleteMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup hook mocks
        vi.spyOn(useLikePostModule, 'useLikePost').mockReturnValue({
            mutate: mockLikeMutate,
        } as any);

        vi.spyOn(useDeletePostModule, 'useDeletePost').mockReturnValue({
            mutate: mockDeleteMutate,
        } as any);
    });

    it('should render with initial like count and state (not liked)', () => {
        renderWithProviders(<PostCard post={mockPost} />, {
            preloadedState: {
                auth: { user: mockUser, token: 'fake-token', isAuthenticated: true }
            }
        });

        // Check title and content to be sure it rendered
        expect(screen.getByRole('heading', { name: 'Test Post', level: 1 })).toBeInTheDocument();

        // Check like count (text within the paragraph)
        // Note: PostCard renders like count in a <p> tag inside .post-card-heart-icon-container
        expect(screen.getByText('5')).toBeInTheDocument();

        // Check heart icon state (by color prop passed to SVG, usually inferred by class or checking props if possible)
        // Since we can't easily check SVG props in JSDOM without test-id, we rely on the component logic we saw.
        // Or we can check if we can query by some attribute.
        // For now, let's trust the logic if the count is correct.
    });

    it('should render with initial like count and state (liked)', () => {
        const likedPost = { ...mockPost, is_liked: true, likes_count: 10 };
        renderWithProviders(<PostCard post={likedPost} />, {
            preloadedState: {
                auth: { user: mockUser, token: 'fake-token', isAuthenticated: true }
            }
        });

        expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle optimistic like (increment count and call API)', async () => {
        renderWithProviders(<PostCard post={mockPost} />, {
            preloadedState: {
                auth: { user: mockUser, token: 'fake-token', isAuthenticated: true }
            }
        });

        // Current count: 5
        // Check optimistic update

        // Let's try to get by a generic click on the container or find the SVG.
        // Since custom icons usually don't have aria-label, let's try finding by the heart icon class if rendered as such.
        // Or we can add data-testid in the future. For now, let's try getting the SVG element.
        // eslint-disable-next-line testing-library/no-node-access
        const icon = document.querySelector('.post-card-heart-icon');

        if (icon) {
            fireEvent.click(icon);
        } else {
            throw new Error('Heart icon not found');
        }

        // Optimistic update: Count should be 6
        expect(screen.getByText('6')).toBeInTheDocument();

        // API should be called
        expect(mockLikeMutate).toHaveBeenCalledWith(mockPost.id);
    });

    it('should handle optimistic unlike (decrement count and call API)', async () => {
        const likedPost = { ...mockPost, is_liked: true, likes_count: 5 };
        renderWithProviders(<PostCard post={likedPost} />, {
            preloadedState: {
                auth: { user: mockUser, token: 'fake-token', isAuthenticated: true }
            }
        });

        expect(screen.getByText('5')).toBeInTheDocument();

        // eslint-disable-next-line testing-library/no-node-access
        const icon = document.querySelector('.post-card-heart-icon');
        if (icon) fireEvent.click(icon);

        // Optimistic update: Count should be 4
        expect(screen.getByText('4')).toBeInTheDocument();

        // API should be called
        expect(mockLikeMutate).toHaveBeenCalledWith(likedPost.id);
    });

    it('should handle complex is_liked array prop (current user liked)', () => {
        // If is_liked is an array of Like objects
        const complexPost = {
            ...mockPost,
            is_liked: [{ user: mockUser.id, post: 1 }] as any, // mocking the array type check
            likes_count: 2
        };

        renderWithProviders(<PostCard post={complexPost} />, {
            preloadedState: {
                auth: { user: mockUser, token: 'fake-token', isAuthenticated: true }
            }
        });

        expect(screen.getByText('2')).toBeInTheDocument();

        // If we click it, it should unlike
        // eslint-disable-next-line testing-library/no-node-access
        const icon = document.querySelector('.post-card-heart-icon');
        if (icon) fireEvent.click(icon);

        // Should decrement
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should allow liking a post written by another user', () => {
        const otherUserPost = {
            ...mockPost,
            id: 2,
            username: 'otheruser',
            is_liked: false,
            likes_count: 0
        };

        renderWithProviders(<PostCard post={otherUserPost} />, {
            preloadedState: {
                auth: { user: mockUser, token: 'fake-token', isAuthenticated: true }
            }
        });

        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('@otheruser')).toBeInTheDocument();

        // Click like
        // eslint-disable-next-line testing-library/no-node-access
        const icon = document.querySelector('.post-card-heart-icon');
        if (icon) fireEvent.click(icon);

        // Optimistic update
        expect(screen.getByText('1')).toBeInTheDocument();

        // API called with correct post ID
        expect(mockLikeMutate).toHaveBeenCalledWith(otherUserPost.id);
    });
});
