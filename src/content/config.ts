import { defineCollection, z } from 'astro:content';

const casesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updateDate: z.date().optional(),
    featured: z.boolean().default(false),
    // 空间标签（多选）
    spaces: z.array(z.string()),
    // 风格标签（多选）
    styles: z.array(z.string()),
    // 面积（平方米）
    area: z.number().optional(),
    // 项目地点
    location: z.string().optional(),
    // 来源链接（小红书/抖音等）
    sourceUrl: z.string().url().optional(),
    sourcePlatform: z.enum(['xiaohongshu', 'douyin', 'original']).default('original'),
    // 封面图
    cover: z.string(),
    // 详情图集
    gallery: z.array(z.string()).default([]),
    // SEO
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = {
  cases: casesCollection,
};
