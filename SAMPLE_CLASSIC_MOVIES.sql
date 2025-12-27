-- Add Sample Classic Movies to Oldflick.com
-- Created: 2025-12-27

-- Add Charlie Chaplin's "The Kid" (1921)
INSERT INTO content (
  title,
  description,
  content_type,
  genre,
  release_year,
  rating,
  runtime_minutes,
  poster_url,
  director,
  actors,
  plot_summary,
  available
) VALUES (
  'The Kid',
  'A tramp cares for an abandoned boy and forms a profound bond with him.',
  'film',
  'Comedy, Drama',
  1921,
  8.3,
  68,
  'https://image.tmdb.org/t/p/w500/sample-the-kid.jpg',
  'Charlie Chaplin',
  'Charlie Chaplin, Jackie Coogan, Edna Purviance',
  'A destitute tramp discovers an abandoned child and decides to raise him. Together they form an unbreakable bond as they navigate life''s hardships with humor and heart.',
  true
);

-- Add Buster Keaton's "The General" (1926)
INSERT INTO content (
  title,
  description,
  content_type,
  genre,
  release_year,
  rating,
  runtime_minutes,
  poster_url,
  director,
  actors,
  plot_summary,
  available
) VALUES (
  'The General',
  'When Union spies steal an engineer''s beloved locomotive, he pursues it single-handedly through enemy lines.',
  'film',
  'Comedy, Action, Adventure',
  1926,
  8.1,
  78,
  'https://image.tmdb.org/t/p/w500/sample-general.jpg',
  'Buster Keaton',
  'Buster Keaton, Marion Mack, Glen Cavender',
  'A Confederate engineer chases Union spies who have stolen his beloved locomotive, performing incredible stunts along the way.',
  true
);

-- Add "Metropolis" (1927)
INSERT INTO content (
  title,
  description,
  content_type,
  genre,
  release_year,
  rating,
  runtime_minutes,
  poster_url,
  director,
  actors,
  plot_summary,
  available
) VALUES (
  'Metropolis',
  'In a futuristic city sharply divided between the working class and the city planners, forbidden love threatens the social order.',
  'film',
  'Science Fiction, Drama',
  1927,
  8.3,
  153,
  'https://image.tmdb.org/t/p/w500/sample-metropolis.jpg',
  'Fritz Lang',
  'Alfred Abel, Gustav Fröhlich, Brigitte Helm',
  'In a futuristic city sharply divided between the working class and the city planners, the son of the city''s mastermind falls in love with a working class prophet, threatening to disrupt the carefully maintained social hierarchy.',
  true
);

-- Verify content was added
SELECT id, title, release_year, content_type, director FROM content ORDER BY release_year;
