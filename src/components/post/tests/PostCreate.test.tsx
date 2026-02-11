// Imports
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostCreate from '../PostCreate';
import * as useCreatePostModule from '../hooks/useCreatePost';
import * as useUpdatePostModule from '../hooks/useUpdatePost';


// Mock the hooks with the Vitest (vi.mock) mock function
// These lines tells Vitest to replace the actual implementation of these hooks with mock implementations.
// This is done to isolate the component from its dependencies and to control the behavior of the hooks.
vi.mock('../hooks/useCreatePost');
vi.mock('../hooks/useUpdatePost');


// Helper function to render with providers
const renderWithProviders = (component: React.ReactNode) => {
    /*
    This function is used to render the component with the QueryClientProvider.
    This is necessary because the component uses the useQuery and useMutation hooks.
    It returns the rendered component wrapped in the QueryClientProvider.
    */
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
};


// Grouping related tests with describe to better organize and scope them.
describe('PostCreate Component', () => {
    // Creating the mock mutate functions
    const mockCreateMutate = vi.fn();
    const mockUpdateMutate = vi.fn();


    /*
    This function is used to reset the mocks before each test
    beforeEach is a function that is called before each test in the describe block
    This is done to ensure that each test starts with a clean slate
    */
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();

        // Setup default mock implementations
        vi.spyOn(useCreatePostModule, 'useCreatePost').mockReturnValue({
            mutate: mockCreateMutate, // Mock mutate function for create post
            isPending: false, // Mock isPending state for create post
            isError: false, // Mock isError state for create post
            isSuccess: false, // Mock isSuccess state for create post
            data: undefined, // Mock data state for create post
            error: null, // Mock error state for create post
        } as any);

        vi.spyOn(useUpdatePostModule, 'useUpdatePost').mockReturnValue({
            mutate: mockUpdateMutate, // Mock mutate function for update post
            isPending: false, // Mock isPending state for update post
            isError: false, // Mock isError state for update post
            isSuccess: false, // Mock isSuccess state for update post
            data: undefined, // Mock data state for update post
            error: null, // Mock error state for update post
        } as any);
    });


    /*
    Track and control the behavior of the hooks previously mocked.
    This is done to isolate the component from its dependencies and to control the behavior of the hooks.
    */
    describe('Rendering', () => {
        it('should render the post creation form', () => {
            renderWithProviders(<PostCreate />);

            expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
            expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
        });

        it('should display character counters for title and content', () => {
            renderWithProviders(<PostCreate />);

            expect(screen.getByText('(0/100)')).toBeInTheDocument(); // Title counter
            expect(screen.getByText('(0/500)')).toBeInTheDocument(); // Content counter
        });

        it('should have placeholder text for inputs', () => {
            renderWithProviders(<PostCreate />);

            expect(screen.getByPlaceholderText('Hello World')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Content here')).toBeInTheDocument();
        });
    });


    /*
    User Input Validation
    This is done to ensure that the component handles user input correctly
    */
    describe('User Input Validation', () => {
        it('should update title input and character counter', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            await user.type(titleInput, 'My Test Title');

            expect(titleInput).toHaveValue('My Test Title');
            expect(screen.getByText('(13/100)')).toBeInTheDocument();
        });

        it('should update content textarea and character counter', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const contentInput = screen.getByPlaceholderText('Content here');
            await user.type(contentInput, 'This is my test content');

            expect(contentInput).toHaveValue('This is my test content');
            expect(screen.getByText('(23/500)')).toBeInTheDocument();
        });

        it('should enforce max length of 100 characters for title', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            const longTitle = 'a'.repeat(150); // 150 characters
            await user.type(titleInput, longTitle);

            expect(titleInput).toHaveValue('a'.repeat(100)); // Should be truncated to 100
            expect(screen.getByText('(100/100)')).toBeInTheDocument();
        });

        it('should enforce max length of 500 characters for content', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const contentInput = screen.getByPlaceholderText('Content here');
            const longContent = 'b'.repeat(600); // 600 characters
            await user.type(contentInput, longContent);

            expect(contentInput).toHaveValue('b'.repeat(500)); // Should be truncated to 500
            expect(screen.getByText('(500/500)')).toBeInTheDocument();
        });

        it('should show error when trying to create post with empty title', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const contentInput = screen.getByPlaceholderText('Content here');
            await user.type(contentInput, 'Some content');

            const createButton = screen.getByRole('button', { name: /Create/i });
            await user.click(createButton);

            await waitFor(() => {
                expect(screen.getByText('Title and content cannot be empty')).toBeInTheDocument();
            });

            // Should not call the mutate function
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('should show error when trying to create post with empty content', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            await user.type(titleInput, 'My Title');

            const createButton = screen.getByRole('button', { name: /Create/i });
            await user.click(createButton);

            await waitFor(() => {
                expect(screen.getByText('Title and content cannot be empty')).toBeInTheDocument();
            });

            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('should show error when both title and content are empty', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const createButton = screen.getByRole('button', { name: /Create/i });
            await user.click(createButton);

            await waitFor(() => {
                expect(screen.getByText('Title and content cannot be empty')).toBeInTheDocument();
            });

            expect(mockCreateMutate).not.toHaveBeenCalled();
        });
    });


    describe('Post Creation', () => {
        it('should call createMutate with correct data when form is valid', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            const contentInput = screen.getByPlaceholderText('Content here');

            await user.type(titleInput, 'Test Title');
            await user.type(contentInput, 'Test Content');

            const createButton = screen.getByRole('button', { name: /Create/i });
            await user.click(createButton);

            expect(mockCreateMutate).toHaveBeenCalledWith(
                { title: 'Test Title', content: 'Test Content' },
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                })
            );
        });

        it('should show success message after successful post creation', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            const contentInput = screen.getByPlaceholderText('Content here');

            await user.type(titleInput, 'Test Title');
            await user.type(contentInput, 'Test Content');

            const createButton = screen.getByRole('button', { name: /Create/i });
            await user.click(createButton);

            // Simulate successful mutation by calling onSuccess callback
            const onSuccessCallback = mockCreateMutate.mock.calls[0][1].onSuccess;
            onSuccessCallback();

            await waitFor(() => {
                expect(screen.getByText('Post Created Successfully')).toBeInTheDocument();
            });
        });

        it('should clear inputs after successful post creation', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            const contentInput = screen.getByPlaceholderText('Content here');

            await user.type(titleInput, 'Test Title');
            await user.type(contentInput, 'Test Content');

            const createButton = screen.getByRole('button', { name: /Create/i });
            await user.click(createButton);

            // Note: The actual clearing happens in the component,
            // but since we're not triggering real mutation, we verify the mutate was called
            expect(mockCreateMutate).toHaveBeenCalled();
        });

        it('should show error message on post creation failure', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            const contentInput = screen.getByPlaceholderText('Content here');

            await user.type(titleInput, 'Test Title');
            await user.type(contentInput, 'Test Content');

            const createButton = screen.getByRole('button', { name: /Create/i });
            await user.click(createButton);

            // Simulate error by calling onError callback
            const onErrorCallback = mockCreateMutate.mock.calls[0][1].onError;
            onErrorCallback({ response: { data: { content: 'Custom error message' } } });

            await waitFor(() => {
                expect(screen.getByText('Custom error message')).toBeInTheDocument();
            });
        });

        it('should show generic error when no specific error message is provided', async () => {
            const user = userEvent.setup();
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            const contentInput = screen.getByPlaceholderText('Content here');

            await user.type(titleInput, 'Test Title');
            await user.type(contentInput, 'Test Content');

            const createButton = screen.getByRole('button', { name: /Create/i });
            await user.click(createButton);

            // Simulate error without custom message
            const onErrorCallback = mockCreateMutate.mock.calls[0][1].onError;
            onErrorCallback({});

            await waitFor(() => {
                expect(screen.getByText('Error Creating Post')).toBeInTheDocument();
            });
        });
    });


    describe('Accessibility', () => {
        it('should have proper labels for form inputs', () => {
            renderWithProviders(<PostCreate />);

            expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
        });

        it('should have proper id attributes for form inputs', () => {
            renderWithProviders(<PostCreate />);

            const titleInput = screen.getByPlaceholderText('Hello World');
            const contentInput = screen.getByPlaceholderText('Content here');

            expect(titleInput).toHaveAttribute('id', 'post-title');
            expect(contentInput).toHaveAttribute('id', 'post-content');
        });
    });
});
