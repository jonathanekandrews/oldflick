import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

console.log('\n=== CLEARING AND IMPORTING CORRECT FILM INVENTORY ===\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Complete inventory from provided list
const films = [
  // Row 1
  {
    title: "The Cat Creeps",
    year: 1930,
    genre: "Horror",
    rating: 6.4,
    director: "Rupert Julian",
    cast: "Helen Twelve Oaks, Raymond Hackett",
    description: "A classic Universal horror film with mysterious happenings in an old mansion.",
    runtime: 70
  },
  // Row 2
  {
    title: "Dracula",
    year: 1931,
    genre: "Horror",
    rating: 7.4,
    director: "Tod Browning",
    cast: "Bela Lugosi, Helen Chandler, David Manners",
    description: "The classic tale of Count Dracula, a vampire from Transylvania who travels to England to spread the undead curse.",
    runtime: 75
  },
  // Row 3
  {
    title: "Frankenstein",
    year: 1931,
    genre: "Horror",
    rating: 7.8,
    director: "James Whale",
    cast: "Boris Karloff, Colin Clive, Mae Clarke",
    description: "A brilliant but obsessed scientist creates life from the dead, but his creation becomes a monster.",
    runtime: 70
  },
  // Row 4
  {
    title: "The Old Dark House",
    year: 1932,
    genre: "Horror",
    rating: 7.2,
    director: "James Whale",
    cast: "Boris Karloff, Melvyn Douglas, Gloria Stuart",
    description: "Travelers stranded at a sinister manor house during a storm encounter the eccentric Femm family.",
    runtime: 71
  },
  // Row 5
  {
    title: "The Mummy",
    year: 1932,
    genre: "Horror",
    rating: 7.1,
    director: "Karl Freund",
    cast: "Boris Karloff, Zita Johann, David Manners",
    description: "An Egyptian priest is revived from the dead and seeks to reunite with his lost love.",
    runtime: 73
  },
  // Row 6
  {
    title: "White Zombie",
    year: 1932,
    genre: "Horror",
    rating: 6.3,
    director: "Victor Halperin",
    cast: "Bela Lugosi, Madge Bellamy, Joseph Cawthorn",
    description: "A young woman's fiance seeks help from a voodoo master to win her back.",
    runtime: 67
  },
  // Row 7
  {
    title: "The Invisible Man",
    year: 1933,
    genre: "Horror",
    rating: 7.5,
    director: "James Whale",
    cast: "Claude Rains, Gloria Stuart, William Harrigan",
    description: "A scientist discovers the secret of invisibility but gradually descends into madness and becomes a menace to society.",
    runtime: 71
  },
  // Row 8
  {
    title: "Bride of Frankenstein",
    year: 1935,
    genre: "Horror",
    rating: 7.7,
    director: "James Whale",
    cast: "Boris Karloff, Colin Clive, Valerie Hobson",
    description: "The monster demands a mate, and mad scientist Dr. Frankenstein must create a female companion.",
    runtime: 75
  },
  // Row 9
  {
    title: "The Wolf Man",
    year: 1941,
    genre: "Horror",
    rating: 7.3,
    director: "George Waggner",
    cast: "Lon Chaney Jr., Claude Rains, Evelyn Ankers",
    description: "A man bitten by a werewolf must grapple with his transformation and the curse that afflicts him.",
    runtime: 70
  },
  // Row 10
  {
    title: "The Kid (1921)",
    year: 1921,
    genre: "Comedy",
    rating: 8.3,
    director: "Charlie Chaplin",
    cast: "Charlie Chaplin, Jackie Coogan",
    description: "The Tramp takes in an abandoned child and raises him, creating a beautiful story of friendship and redemption.",
    runtime: 68
  },
  // Row 11
  {
    title: "Nosferatu",
    year: 1922,
    genre: "Horror",
    rating: 8.1,
    director: "F.W. Murnau",
    cast: "Max Schreck, Alexander Granach, Gustav von Wangenheim",
    description: "An unauthorized adaptation of Dracula featuring Count Orlok, an ancient vampire seeking fresh victims.",
    runtime: 94
  },
  // Row 12
  {
    title: "The Golem",
    year: 1920,
    genre: "Horror",
    rating: 7.4,
    director: "Paul Wegener, Carl Boese",
    cast: "Paul Wegener, Albert Steinrück, Lyda Salmonova",
    description: "A rabbi creates a clay creature to protect his community from persecution in medieval Prague.",
    runtime: 91
  },
  // Row 13
  {
    title: "The Cabinet of Dr. Caligari",
    year: 1920,
    genre: "Horror",
    rating: 8.0,
    director: "Robert Wiene",
    cast: "Werner Krauss, Conrad Veidt, Friedrich Feher",
    description: "A mysterious hypnotist uses a somnambulist to commit murders in this German Expressionist classic.",
    runtime: 76
  },
  // Row 14
  {
    title: "The Phantom of the Opera",
    year: 1925,
    genre: "Horror",
    rating: 7.6,
    director: "Rupert Julian",
    cast: "Lon Chaney, Mary Philbin, Norman Kerry",
    description: "A disfigured musical genius lurks beneath the Paris Opera House, terrorizing and falling in love.",
    runtime: 93
  },
  // Row 15
  {
    title: "Metropolis",
    year: 1927,
    genre: "Science Fiction",
    rating: 8.3,
    director: "Fritz Lang",
    cast: "Alfred Abel, Gustav Fröhlich, Brigitte Helm",
    description: "A visionary German film exploring themes of class struggle in a futuristic city.",
    runtime: 145
  },
  // Row 16
  {
    title: "The House of Fear",
    year: 1945,
    genre: "Mystery",
    rating: 7.0,
    director: "Roy William Neill",
    cast: "Basil Rathbone, Nigel Bruce, Aubrey Mather",
    description: "Sherlock Holmes and Dr. Watson investigate mysterious deaths among members of 'The Good Comrades'.",
    runtime: 69
  },
  // Row 17
  {
    title: "The Woman in Green",
    year: 1945,
    genre: "Mystery",
    rating: 7.1,
    director: "Roy William Neill",
    cast: "Basil Rathbone, Nigel Bruce, Hillary Brooke",
    description: "Sherlock Holmes investigates murders where victims are found with severed fingers.",
    runtime: 68
  },
  // Row 18
  {
    title: "Night of the Living Dead",
    year: 1968,
    genre: "Horror",
    rating: 7.8,
    director: "George A. Romero",
    cast: "Duane Jones, Judith O'Dea, Karl Hardman",
    description: "A group of people hide from bloodthirsty zombies in a farmhouse, launching the modern zombie genre.",
    runtime: 96
  },
  // Row 19
  {
    title: "The Last Man on Earth",
    year: 1964,
    genre: "Horror",
    rating: 6.9,
    director: "Ubaldo Ragona",
    cast: "Vincent Price, Franca Bettoia, Emma Danieli",
    description: "The sole survivor of a plague that turned humanity into vampires struggles to find a cure.",
    runtime: 86
  },
  // Row 20
  {
    title: "The Little Shop of Horrors",
    year: 1960,
    genre: "Comedy",
    rating: 6.5,
    director: "Roger Corman",
    cast: "Jonathan Haze, Jackie Joseph, Mel Welles",
    description: "A nerdy florist discovers a carnivorous plant that brings him success but demands human blood.",
    runtime: 72
  }
];

async function importInventory() {
  try {
    // Clear existing content
    console.log('🗑️  Clearing existing content...');
    await pool.query('DELETE FROM content');
    console.log('✅ Content cleared\n');

    // Import new inventory
    console.log('📥 Importing correct film inventory...\n');
    let count = 0;

    for (const film of films) {
      await pool.query(
        `INSERT INTO content (
          title, description, content_type, release_year, runtime_minutes,
          genre, rating, actors, director, available
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          film.title,
          film.description,
          'film',
          film.year,
          film.runtime,
          film.genre,
          film.rating,
          film.cast,
          film.director,
          true
        ]
      );
      count++;
      console.log(`✅ ${count}. ${film.title} (${film.year})`);
    }

    console.log(`\n✨ Successfully imported ${count} films!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importInventory();
