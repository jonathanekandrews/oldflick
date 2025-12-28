import express from 'express';
import { Client } from '@notionhq/client';

const router = express.Router();

// Initialize Notion client
const notionClient = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Get all articles from Notion database
router.get('/', async (req, res) => {
  try {
    if (!process.env.NOTION_DATABASE_ID || !process.env.NOTION_TOKEN) {
      return res.status(400).json({ 
        error: 'Notion configuration missing: NOTION_TOKEN and NOTION_DATABASE_ID required',
        articles: []
      });
    }

    const response = await notionClient.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [
        {
          property: 'Published Date',
          direction: 'descending',
        }
      ],
      filter: {
        property: 'Status',
        select: {
          equals: 'Published'
        }
      }
    });

    const articles = response.results.map((page) => {
      const props = page.properties;
      
      return {
        id: page.id,
        title: props.Title?.title?.[0]?.plain_text || 'Untitled',
        excerpt: props.Excerpt?.rich_text?.[0]?.plain_text || '',
        author: props.Author?.rich_text?.[0]?.plain_text || 'Oldflick',
        published_date: props['Published Date']?.date?.start,
        cover_image: props['Cover Image']?.files?.[0]?.file?.url || 
                     props['Cover Image']?.files?.[0]?.external?.url,
        content_url: page.public_url,
      };
    });

    res.json(articles);
  } catch (error) {
    console.error('Articles fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch articles',
      details: error.message 
    });
  }
});

// Get single article by ID
router.get('/:id', async (req, res) => {
  try {
    const page = await notionClient.pages.retrieve({
      page_id: req.params.id,
    });

    const props = page.properties;

    const article = {
      id: page.id,
      title: props.Title?.title?.[0]?.plain_text || 'Untitled',
      excerpt: props.Excerpt?.rich_text?.[0]?.plain_text || '',
      author: props.Author?.rich_text?.[0]?.plain_text || 'Oldflick',
      published_date: props['Published Date']?.date?.start,
      cover_image: props['Cover Image']?.files?.[0]?.file?.url || 
                   props['Cover Image']?.files?.[0]?.external?.url,
      content_url: page.public_url,
    };

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(404).json({ error: 'Article not found' });
  }
});

export default router;
