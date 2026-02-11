// Imports
import './css/postPage.css';
import NavBar from '../navbar/NavBar';
import CreatePost from './PostCreate';
import PostCard from './PostCard';
import { useListPost } from './hooks/useListPost';
import type { Post } from '../../models/Post';
import { useEffect, useRef, useState } from 'react';


// PostPage component
const PostPage = () => {

    // State for username filter (immediate, for input value)
    const [usernameFilter, setUsernameFilter] = useState('');
    // Debounced filter state (delayed, for API calls)
    const [debouncedFilter, setDebouncedFilter] = useState('');


    // Debounce the filter to avoid losing focus on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(usernameFilter);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [usernameFilter]);


    // This is the main hook that fetches the posts and destructures the data fetched by the useListPost hook
    const {
        data, // data is an object with pages and pageParams
        fetchNextPage, // function to fetch the next page
        hasNextPage, // boolean to check if there is a next page
        isFetchingNextPage, // boolean to check if we are fetching the next page
        isLoading, // boolean to check if we are loading the first page
        isError // boolean to check if there is an error
    } = useListPost(debouncedFilter);


    // Ref to the div to be observed by the IntersectionObserver for infinite scroll
    const loadMoreRef = useRef<HTMLDivElement>(null);


    // Flatten all posts from all pages. flatMap is used to flatten the array of pages into a single array of posts.
    const allPosts: Post[] = data?.pages.flatMap(page => page.results) ?? [];


    // Infinite scroll observer
    useEffect(() => {
        // If the ref is not found, or there is no next page, or we are already fetching the next page, return.
        if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            /*
            observer is an IntersectionObserver object.
            An IntersectionObserver allows you to asynchronously observe changes in the intersection of a
            target element with an ancestor element or with the viewport.
            entries is an array of IntersectionObserverEntry objects.
            isIntersecting is a boolean that is true if the element is intersecting the viewport.
            fetchNextPage() is a function that fetches the next page.
            */
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },

            // Options for the observer
            // threshold: 0.1 means that the observer will trigger when the element is 10% visible.
            // rootMargin: '100px' means that the observer will trigger when the element is 100px from
            // the bottom of the viewport, to create a "look-ahead" effect so posts start loading before
            // the user reaches the bottom
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loadMoreRef.current);

        // The observer is disconnected when the component is unmounted
        // to prevent memory leaks from keeping the observer alive.
        return () => observer.disconnect();

    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);


    //#region Loading states and error handling for the posts used to display while loading or if there is an error
    if (isLoading) {
        return (
            <div className="post-page-main">
                <NavBar />
                <CreatePost />
                <p>Loading posts...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="post-page-main">
                <NavBar />
                <CreatePost />
                <p>Error loading posts</p>
            </div>
        );
    }
    //#endregion


    return (
        <div className="post-page-main">
            <NavBar />
            <CreatePost />

            {/* Username Filter */}
            <div className="filter-section">
                <div className="filter-section-input">
                    <input
                        type="text"
                        placeholder="Filter by username..."
                        value={usernameFilter}
                        onChange={(e) => setUsernameFilter(e.target.value)}
                        className="username-filter-input"
                    />
                </div>

                <div className="filter-section-button">
                    {usernameFilter && (
                        <button onClick={() => setUsernameFilter('')} className="clear-filter-btn">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Posts */}
            {allPosts.length > 0 ? (
                <>
                    {allPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}

                    {hasNextPage && (
                        <div ref={loadMoreRef} className="load-more-trigger">
                            {isFetchingNextPage && <p className="loading-text">Loading more...</p>}
                        </div>
                    )}

                    {/* Message when no more posts are found */}
                    {!hasNextPage && !isFetchingNextPage && <p className='post-page-paragraph'>No more posts</p>}
                </>
            ) : (
                <p className='post-page-paragraph'>No posts found</p>
            )}
        </div>
    );
};

export default PostPage;
