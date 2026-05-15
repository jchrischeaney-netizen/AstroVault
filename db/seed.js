// Run once to seed the objects catalog: node db/seed.js
// Requires NETLIFY_DATABASE_URL (or DATABASE_URL) to be set in the environment.
// Pull it locally with: netlify env:pull .env.local && node --env-file=.env.local db/seed.js
const { neon } = require('@netlify/neon');

const MESSIER_CATALOG = [
  [1,1952,'Crab Nebula','Supernova Remnant','Taurus'],
  [2,7089,null,'Globular Cluster','Aquarius'],
  [3,5272,null,'Globular Cluster','Canes Venatici'],
  [4,6121,null,'Globular Cluster','Scorpius'],
  [5,5904,null,'Globular Cluster','Serpens'],
  [6,6405,'Butterfly Cluster','Open Cluster','Scorpius'],
  [7,6475,'Ptolemy Cluster','Open Cluster','Scorpius'],
  [8,6523,'Lagoon Nebula','Nebula','Sagittarius'],
  [9,6333,null,'Globular Cluster','Ophiuchus'],
  [10,6254,null,'Globular Cluster','Ophiuchus'],
  [11,6705,'Wild Duck Cluster','Open Cluster','Scutum'],
  [12,6218,null,'Globular Cluster','Ophiuchus'],
  [13,6205,'Hercules Cluster','Globular Cluster','Hercules'],
  [14,6402,null,'Globular Cluster','Ophiuchus'],
  [15,7078,null,'Globular Cluster','Pegasus'],
  [16,6611,'Eagle Nebula','Nebula','Serpens'],
  [17,6618,'Omega Nebula','Nebula','Sagittarius'],
  [18,6613,null,'Open Cluster','Sagittarius'],
  [19,6273,null,'Globular Cluster','Ophiuchus'],
  [20,6514,'Trifid Nebula','Nebula','Sagittarius'],
  [21,6531,null,'Open Cluster','Sagittarius'],
  [22,6656,'Sagittarius Cluster','Globular Cluster','Sagittarius'],
  [23,6494,null,'Open Cluster','Sagittarius'],
  [24,null,'Sagittarius Star Cloud','Star Cloud','Sagittarius'],
  [25,null,null,'Open Cluster','Sagittarius'],
  [26,6694,null,'Open Cluster','Scutum'],
  [27,6853,'Dumbbell Nebula','Planetary Nebula','Vulpecula'],
  [28,6626,null,'Globular Cluster','Sagittarius'],
  [29,6913,null,'Open Cluster','Cygnus'],
  [30,7099,null,'Globular Cluster','Capricornus'],
  [31,224,'Andromeda Galaxy','Galaxy','Andromeda'],
  [32,221,null,'Galaxy','Andromeda'],
  [33,598,'Triangulum Galaxy','Galaxy','Triangulum'],
  [34,1039,null,'Open Cluster','Perseus'],
  [35,2168,null,'Open Cluster','Gemini'],
  [36,1960,null,'Open Cluster','Auriga'],
  [37,2099,null,'Open Cluster','Auriga'],
  [38,1912,null,'Open Cluster','Auriga'],
  [39,7092,null,'Open Cluster','Cygnus'],
  [40,null,'Winnecke 4','Double Star','Ursa Major'],
  [41,2287,null,'Open Cluster','Canis Major'],
  [42,1976,'Orion Nebula','Nebula','Orion'],
  [43,1982,"De Mairan's Nebula",'Nebula','Orion'],
  [44,2632,'Beehive Cluster','Open Cluster','Cancer'],
  [45,null,'Pleiades','Open Cluster','Taurus'],
  [46,2437,null,'Open Cluster','Puppis'],
  [47,2422,null,'Open Cluster','Puppis'],
  [48,2548,null,'Open Cluster','Hydra'],
  [49,4472,null,'Galaxy','Virgo'],
  [50,2323,null,'Open Cluster','Monoceros'],
  [51,5194,'Whirlpool Galaxy','Galaxy','Canes Venatici'],
  [52,7654,null,'Open Cluster','Cassiopeia'],
  [53,5024,null,'Globular Cluster','Coma Berenices'],
  [54,6715,null,'Globular Cluster','Sagittarius'],
  [55,6809,null,'Globular Cluster','Sagittarius'],
  [56,6779,null,'Globular Cluster','Lyra'],
  [57,6720,'Ring Nebula','Planetary Nebula','Lyra'],
  [58,4579,null,'Galaxy','Virgo'],
  [59,4621,null,'Galaxy','Virgo'],
  [60,4649,null,'Galaxy','Virgo'],
  [61,4303,null,'Galaxy','Virgo'],
  [62,6266,null,'Globular Cluster','Ophiuchus'],
  [63,5055,'Sunflower Galaxy','Galaxy','Canes Venatici'],
  [64,4826,'Black Eye Galaxy','Galaxy','Coma Berenices'],
  [65,3623,null,'Galaxy','Leo'],
  [66,3627,null,'Galaxy','Leo'],
  [67,2682,null,'Open Cluster','Cancer'],
  [68,4590,null,'Globular Cluster','Hydra'],
  [69,6637,null,'Globular Cluster','Sagittarius'],
  [70,6681,null,'Globular Cluster','Sagittarius'],
  [71,6838,null,'Globular Cluster','Sagitta'],
  [72,6981,null,'Globular Cluster','Aquarius'],
  [73,6994,null,'Asterism','Aquarius'],
  [74,628,'Phantom Galaxy','Galaxy','Pisces'],
  [75,6864,null,'Globular Cluster','Sagittarius'],
  [76,650,'Little Dumbbell Nebula','Planetary Nebula','Perseus'],
  [77,1068,'Cetus A','Galaxy','Cetus'],
  [78,2068,null,'Reflection Nebula','Orion'],
  [79,1904,null,'Globular Cluster','Lepus'],
  [80,6093,null,'Globular Cluster','Scorpius'],
  [81,3031,"Bode's Galaxy",'Galaxy','Ursa Major'],
  [82,3034,'Cigar Galaxy','Galaxy','Ursa Major'],
  [83,5236,'Southern Pinwheel','Galaxy','Hydra'],
  [84,4374,null,'Galaxy','Virgo'],
  [85,4382,null,'Galaxy','Coma Berenices'],
  [86,4406,null,'Galaxy','Virgo'],
  [87,4486,'Virgo A','Galaxy','Virgo'],
  [88,4501,null,'Galaxy','Coma Berenices'],
  [89,4552,null,'Galaxy','Virgo'],
  [90,4569,null,'Galaxy','Virgo'],
  [91,4548,null,'Galaxy','Coma Berenices'],
  [92,6341,null,'Globular Cluster','Hercules'],
  [93,2447,null,'Open Cluster','Puppis'],
  [94,4736,"Cat's Eye Galaxy",'Galaxy','Canes Venatici'],
  [95,3351,null,'Galaxy','Leo'],
  [96,3368,null,'Galaxy','Leo'],
  [97,3587,'Owl Nebula','Planetary Nebula','Ursa Major'],
  [98,4192,null,'Galaxy','Coma Berenices'],
  [99,4254,'Coma Pinwheel','Galaxy','Coma Berenices'],
  [100,4321,null,'Galaxy','Coma Berenices'],
  [101,5457,'Pinwheel Galaxy','Galaxy','Ursa Major'],
  [102,5866,'Spindle Galaxy','Galaxy','Draco'],
  [103,581,null,'Open Cluster','Cassiopeia'],
  [104,4594,'Sombrero Galaxy','Galaxy','Virgo'],
  [105,3379,null,'Galaxy','Leo'],
  [106,4258,null,'Galaxy','Canes Venatici'],
  [107,6171,null,'Globular Cluster','Ophiuchus'],
  [108,3556,'Surfboard Galaxy','Galaxy','Ursa Major'],
  [109,3992,null,'Galaxy','Ursa Major'],
  [110,205,null,'Galaxy','Andromeda'],
];

const NGC_EXTRA_CATALOG = [
  [869,'Double Cluster h Per','Open Cluster','Perseus'],
  [884,'Double Cluster Chi Per','Open Cluster','Perseus'],
  [891,null,'Galaxy','Andromeda'],
  [1499,'California Nebula','Emission Nebula','Perseus'],
  [1502,"Kemble's Cascade",'Open Cluster','Camelopardalis'],
  [1977,'Running Man Nebula','Reflection Nebula','Orion'],
  [2237,'Rosette Nebula','Emission Nebula','Monoceros'],
  [2244,'Rosette Cluster','Open Cluster','Monoceros'],
  [2264,'Cone Nebula','Emission Nebula','Monoceros'],
  [2359,"Thor's Helmet",'Emission Nebula','Canis Major'],
  [2392,'Eskimo Nebula','Planetary Nebula','Gemini'],
  [3372,'Eta Carinae Nebula','Emission Nebula','Carina'],
  [3532,'Wishing Well Cluster','Open Cluster','Carina'],
  [3628,'Hamburger Galaxy','Galaxy','Leo'],
  [4038,'Antennae Galaxies','Galaxy','Corvus'],
  [4244,'Silver Needle Galaxy','Galaxy','Canes Venatici'],
  [4449,null,'Galaxy','Canes Venatici'],
  [4565,'Needle Galaxy','Galaxy','Coma Berenices'],
  [4631,'Whale Galaxy','Galaxy','Canes Venatici'],
  [5128,'Centaurus A','Galaxy','Centaurus'],
  [5139,'Omega Centauri','Globular Cluster','Centaurus'],
  [5907,'Splinter Galaxy','Galaxy','Draco'],
  [6188,'Fighting Dragons Nebula','Emission Nebula','Ara'],
  [6334,"Cat's Paw Nebula",'Emission Nebula','Scorpius'],
  [6357,'Lobster Nebula','Emission Nebula','Scorpius'],
  [6822,"Barnard's Galaxy",'Galaxy','Sagittarius'],
  [6888,'Crescent Nebula','Emission Nebula','Cygnus'],
  [6960,'Western Veil Nebula','Supernova Remnant','Cygnus'],
  [6992,'Eastern Veil Nebula','Supernova Remnant','Cygnus'],
  [6995,'Bat Nebula','Supernova Remnant','Cygnus'],
  [7000,'North America Nebula','Emission Nebula','Cygnus'],
  [7023,'Iris Nebula','Reflection Nebula','Cepheus'],
  [7293,'Helix Nebula','Planetary Nebula','Aquarius'],
  [7331,null,'Galaxy','Pegasus'],
  [7380,'Wizard Nebula','Emission Nebula','Cepheus'],
  [7479,null,'Galaxy','Pegasus'],
  [7635,'Bubble Nebula','Emission Nebula','Cassiopeia'],
  [7789,"Caroline's Rose",'Open Cluster','Cassiopeia'],
];

async function seed() {
  const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM objects`;
  if (count > 0) {
    console.log(`Already seeded (${count} objects). Skipping.`);
    return;
  }

  console.log('Seeding catalog...');
  for (const [m, n, name, type, con] of MESSIER_CATALOG) {
    await sql`
      INSERT INTO objects (messier_number, ngc_number, common_name, object_type, constellation)
      VALUES (${m}, ${n}, ${name}, ${type}, ${con})
    `;
  }
  for (const [n, name, type, con] of NGC_EXTRA_CATALOG) {
    await sql`
      INSERT INTO objects (messier_number, ngc_number, common_name, object_type, constellation)
      VALUES (NULL, ${n}, ${name}, ${type}, ${con})
    `;
  }
  console.log(`Seeded ${MESSIER_CATALOG.length + NGC_EXTRA_CATALOG.length} objects.`);
}

seed().catch(err => { console.error(err); process.exit(1); });
