import { AstroComponentFactory } from 'astro/dist/types/runtime/server';

import readingTime from 'reading-time';


type MarkdownInstance = import('astro').MarkdownInstance<any>;
// Which mode is the environment running in? https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
const { MODE } = import.meta.env;

export type Post = {
    title: string,
    slug: string,
    description: string,
    author: string,
    timestamp: number,
    draft: boolean,
    date: string,
    file: URL,
    Content: AstroComponentFactory,
    rawContent: string,
    readingTime: number
    tags?: string[]
}

export function single(post: MarkdownInstance): Post {
    // if the file is called index.md then use the directory name, else use the filename
    const slug = (post.file.endsWith('index.md'))
        ? post.file.split('/').reverse()[1]
        : post.file.split('/').reverse()[0].replace('.md', '')
    return {
        ...post.frontmatter,
        Content: post.Content,
        rawContent: post.rawContent(),
        readingTime: Math.ceil(readingTime(post.rawContent()).minutes),
        slug: slug,
        draft: post.file.includes('drafts'),
        file: post.file,
        timestamp: (new Date(post.frontmatter.date)).valueOf()
    }
}

export function published(posts: MarkdownInstance[]): Post[] {
    return posts
        .filter(post => post.frontmatter.title)
        .map(post => single(post))
        .filter(post => MODE === 'development' || !post.draft)
        .sort((a, b) => b.timestamp - a.timestamp)
}

export function getRSS(posts: MarkdownInstance[]) {
    return {
        title: "Ed's Rambles",
        description: 'Rambles about my exploration on the internet',
        stylesheet: true,
        customData: `<language>en-us</language>`,
        items: published(posts).map((post: Post) => ({
            title: post.title,
            description: post.description,
            link: post.slug,
            pubDate: post.date,
        })),
    }
}

export function getCoverImagePath(post: Post) {
    const filePath = post.file.toString();
    const dirPath = filePath.substring(0, filePath.lastIndexOf("/"))
    return `${dirPath}/cover.jpg`
}
