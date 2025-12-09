import express from 'express';

const router = express.Router();

// Get all articles (from Notion when connected)
// TODO: Connect to Notion API using NOTION_TOKEN and NOTION_DATABASE_ID
router.get('/', async (req, res) => {
  try {
    // Placeholder: Return empty array until Notion is configured
    // When ready, replace with:
    // const notionClient = new Client({ auth: process.env.NOTION_TOKEN });
    // const response = await notionClient.databases.query({
    //   database_id: process.env.NOTION_DATABASE_ID,
    // });
    // const articles = response.results.map(page => ({
    //   id: page.id,
    //   title: page.properties.Title.title[0].plain_text,
    //   excerpt: page.properties.Excerpt?.rich_text[0]?.plain_text || '',
    //   author: page.properties.Author?.rich_text[0]?.plain_text || '',
    //   published_date: page.properties.PublishedDate?.date?.start,
    //   cover_image: page.properties.CoverImage?.files[0]?.file?.url,
    // }));
    
    res.json([]);
  } catch (error) {
    console.error('Articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article by ID
router.get('/:id', async (req, res) => {
  try {
    // TODO: Fetch from Notion
    res.status(404).json({ error: 'Article not found' });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to get article' });
  }
});

export default router;
