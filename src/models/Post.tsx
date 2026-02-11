
export interface Like {
    user: number;
    post: number;
    created_datetime: string;
    like: boolean;
}



export interface Post {
    id: number;
    title: string;
    content: string;
    username: string;
    created_datetime: string;
    updated_datetime: string;
    likes_count: number;
    is_liked: Like[] | boolean;
}
