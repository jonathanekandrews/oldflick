import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

console.log('\n=== IMPORTING COMPLETE INVENTORY (FILMS + TV SHOWS) ===\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// FILMS (17 items)
const films = [
  { title: "The Cat Creeps", year: 1930, genre: "Horror", rating: 6.4, director: "Rupert Julian", cast: "Helen Twelve Oaks, Raymond Hackett", description: "A classic Universal horror film with mysterious happenings in an old mansion.", runtime: 70, type: "film" },
  { title: "Dracula", year: 1931, genre: "Horror", rating: 7.4, director: "Tod Browning", cast: "Bela Lugosi, Helen Chandler, David Manners", description: "The classic tale of Count Dracula, a vampire from Transylvania who travels to England.", runtime: 75, type: "film" },
  { title: "Frankenstein", year: 1931, genre: "Horror", rating: 7.8, director: "James Whale", cast: "Boris Karloff, Colin Clive, Mae Clarke", description: "A brilliant but obsessed scientist creates life from the dead.", runtime: 70, type: "film" },
  { title: "The Old Dark House", year: 1932, genre: "Horror", rating: 7.2, director: "James Whale", cast: "Boris Karloff, Melvyn Douglas, Gloria Stuart", description: "Travelers stranded at a sinister manor house during a storm.", runtime: 71, type: "film" },
  { title: "The Mummy", year: 1932, genre: "Horror", rating: 7.1, director: "Karl Freund", cast: "Boris Karloff, Zita Johann, David Manners", description: "An Egyptian priest is revived from the dead.", runtime: 73, type: "film" },
  { title: "White Zombie", year: 1932, genre: "Horror", rating: 6.3, director: "Victor Halperin", cast: "Bela Lugosi, Madge Bellamy, Joseph Cawthorn", description: "A young woman's fiance seeks help from a voodoo master.", runtime: 67, type: "film" },
  { title: "The Invisible Man", year: 1933, genre: "Horror", rating: 7.5, director: "James Whale", cast: "Claude Rains, Gloria Stuart, William Harrigan", description: "A scientist discovers the secret of invisibility.", runtime: 71, type: "film" },
  { title: "Bride of Frankenstein", year: 1935, genre: "Horror", rating: 7.7, director: "James Whale", cast: "Boris Karloff, Colin Clive, Valerie Hobson", description: "The monster demands a mate.", runtime: 75, type: "film" },
  { title: "The Wolf Man", year: 1941, genre: "Horror", rating: 7.3, director: "George Waggner", cast: "Lon Chaney Jr., Claude Rains, Evelyn Ankers", description: "A man bitten by a werewolf must grapple with his transformation.", runtime: 70, type: "film" },
  { title: "The Kid", year: 1921, genre: "Comedy", rating: 8.3, director: "Charlie Chaplin", cast: "Charlie Chaplin, Jackie Coogan", description: "The Tramp takes in an abandoned child.", runtime: 68, type: "film" },
  { title: "Nosferatu", year: 1922, genre: "Horror", rating: 8.1, director: "F.W. Murnau", cast: "Max Schreck, Alexander Granach, Gustav von Wangenheim", description: "An unauthorized adaptation of Dracula featuring Count Orlok.", runtime: 94, type: "film" },
  { title: "The Golem", year: 1920, genre: "Horror", rating: 7.4, director: "Paul Wegener, Carl Boese", cast: "Paul Wegener, Albert Steinrück, Lyda Salmonova", description: "A rabbi creates a clay creature to protect his community.", runtime: 91, type: "film" },
  { title: "The Cabinet of Dr. Caligari", year: 1920, genre: "Horror", rating: 8.0, director: "Robert Wiene", cast: "Werner Krauss, Conrad Veidt, Friedrich Feher", description: "A mysterious hypnotist uses a somnambulist to commit murders.", runtime: 76, type: "film" },
  { title: "The Phantom of the Opera", year: 1925, genre: "Horror", rating: 7.6, director: "Rupert Julian", cast: "Lon Chaney, Mary Philbin, Norman Kerry", description: "A disfigured musical genius lurks beneath the Paris Opera House.", runtime: 93, type: "film" },
  { title: "Metropolis", year: 1927, genre: "Science Fiction", rating: 8.3, director: "Fritz Lang", cast: "Alfred Abel, Gustav Fröhlich, Brigitte Helm", description: "A visionary German film exploring class struggle in a futuristic city.", runtime: 145, type: "film" },
  { title: "The House of Fear", year: 1945, genre: "Mystery", rating: 7.0, director: "Roy William Neill", cast: "Basil Rathbone, Nigel Bruce, Aubrey Mather", description: "Sherlock Holmes investigates mysterious deaths.", runtime: 69, type: "film" },
  { title: "The Woman in Green", year: 1945, genre: "Mystery", rating: 7.1, director: "Roy William Neill", cast: "Basil Rathbone, Nigel Bruce, Hillary Brooke", description: "Sherlock Holmes investigates murders with severed fingers.", runtime: 68, type: "film" }
];

// TV SHOWS (11 items based on image)
const tvShows = [
  { title: "The Lone Ranger", year: 1949, genre: "Western", rating: 7.4, director: "Various", cast: "Clayton Moore, Jay Silverheels", description: "The Lone Ranger begins as Robin Hood fights injustice in the Old West.", runtime: 30, type: "tv", seasons: 8, episodes: 221 },
  { title: "The Twilight Zone", year: 1959, genre: "Science Fiction", rating: 9.0, director: "Rod Serling", cast: "Rod Serling", description: "Twilight Zone entered a new dimension where anything is possible.", runtime: 25, type: "tv", seasons: 5, episodes: 156 },
  { title: "The Andy Griffith Show", year: 1960, genre: "Comedy", rating: 8.8, director: "Various", cast: "Andy Griffith, Don Knots", description: "Sheriff Andy Taylor faces crises in his small jail.", runtime: 30, type: "tv", seasons: 8, episodes: 249 },
  { title: "Bonanza", year: 1959, genre: "Western", rating: 8.0, director: "Various", cast: "Lorne Greene, Michael Landon", description: "The Cartwright family navigates life on their ranch.", runtime: 50, type: "tv", seasons: 14, episodes: 430 },
  { title: "Dragnet", year: 1951, genre: "Crime Drama", rating: 8.0, director: "Jack Webb", cast: "Jack Webb, Ben Alexander", description: "Sgt. Joe Friday investigates pioneering police procedures.", runtime: 30, type: "tv", seasons: 7, episodes: 276 },
  { title: "Flash Gordon", year: 1954, genre: "Science Fiction", rating: 7.5, director: "Various", cast: "Steve Reeves, Irene Champlin", description: "Flash Gordon battles evil in this classic science fiction series.", runtime: 25, type: "tv", seasons: 1, episodes: 39 },
  { title: "The Gumby Show", year: 1957, genre: "Animation", rating: 7.8, director: "Art Clokey", cast: "Art Clokey", description: "America's favorite clay animation character Gumby embarks on fantastic adventures.", runtime: 30, type: "tv", seasons: 1, episodes: 39 },
  { title: "The Beverley Hillbillies", year: 1969, genre: "Comedy", rating: 7.9, director: "Various", cast: "Buddy Ebsen, Irene Ryan", description: "Jed Clampett strikes oil and moves his family to Beverly Hills.", runtime: 30, type: "tv", seasons: 9, episodes: 274 },
  { title: "The Lone Ranger (Radio)", year: 1930, genre: "Western", rating: 8.1, director: "Various", cast: "Brace Beemer, John Todd", description: "The original story of the masked hero who fights for law and order.", runtime: 30, type: "tv", seasons: 1, episodes: 2085 },
  { title: "The Adventures of Robin Hood", year: 1955, genre: "Adventure", rating: 7.8, director: "Various", cast: "Richard Greene, Paul Eddington", description: "Robin Hood and his Merry Men fight for justice in the Old West.", runtime: 25, type: "tv", seasons: 4, episodes: 143 },
  { title: "The Gumby Show (Re-run)", year: 1966, genre: "Animation", rating: 7.8, director: "Art Clokey", cast: "Art Clokey", description: "Gumby returns with classic episodes.", runtime: 30, type: "tv", seasons: 1, episodes: 150 }
];

async function importInventory() {
  try {
    // Clear existing content
    console.log('🗑️  Clearing existing content...');
    await pool.query('DELETE FROM content');
    console.log('✅ Content cleared\n');

    // Import films
    console.log('📽️  Importing Films...\n');
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

    // Import TV shows
    console.log('\n📺 Importing TV Shows...\n');
    for (const show of tvShows) {
      await pool.query(
        `INSERT INTO content (
          title, description, content_type, release_year, runtime_minutes,
          genre, rating, actors, director, available
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          show.title,
          show.description,
          'tv',
          show.year,
          show.runtime,
          show.genre,
          show.rating,
          show.cast,
          show.director,
          true
        ]
      );
      count++;
      console.log(`✅ ${count}. ${show.title} (${show.year}) - ${show.seasons} seasons, ${show.episodes} episodes`);
    }

    console.log(`\n✨ Successfully imported ${count} items!`);
    console.log(`   📽️  Films: 17`);
    console.log(`   📺 TV Shows: 11`);
    console.log(`   📊 Total: 28 items in database`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importInventory();
