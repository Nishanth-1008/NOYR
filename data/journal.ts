export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  tags: string[];
}

export const journalPosts: JournalPost[] = [
  {
    id: 'post-001',
    title: 'The Weight of Fabric — Why Heavyweight Cotton Changes Everything',
    slug: 'weight-of-fabric',
    excerpt: 'A deep dive into why we use 450gsm when the industry standard is 280gsm, and what that means for the person wearing it.',
    body: `We get asked this a lot.

Why is the hoodie so heavy?

The short answer: because clothing should feel like it means something. The long answer takes longer.

**280gsm is the industry standard.** It's what most brands call "premium." It's fine. It moves well. It layers well. It does its job.

But it doesn't feel like a decision.

When we started sampling for the VOID Hoodie, we went through seven different fabric weights. 280. 300. 320. 360. 400. 420. 450.

At 450gsm, something happened. The hoodie stopped being a garment and started being an object. You could feel it before you put it on. You could feel it when you held it. The sleeve had weight. The hood fell the way it was supposed to fall — not because of the wind or the cut, but because of the mass of the fabric itself.

This is what we mean by intent.

**Every NOYR piece is enzyme washed** after construction. This breaks down the surface fibres slightly, giving the fabric a worn-in softness without compromising the structural weight. It's why the hoodie feels broken in from day one.

**The double-stitched stress points** are a direct result of the fabric weight. A 450gsm cotton fleece puts more pressure on the seams than standard construction handles. We use a 5mm seam allowance and run three parallel stitch lines at every stress point.

This is not performative. This is not marketing. This is the work.

The VOID Hoodie is designed to outlast trends by a decade. The fabric weight is the foundation of that intention.`,
    cover_image: null,
    published: true,
    created_at: '2025-04-10T10:00:00Z',
    tags: ['CRAFT', 'FABRIC', 'VOID S01'],
  },
  {
    id: 'post-002',
    title: 'Ghost Protocol: The Concept Behind the Collection',
    slug: 'ghost-protocol-concept',
    excerpt: 'Absence as presence. The second NOYR collection is about moving through space without leaving a trace.',
    body: `Ghost Protocol started with a question: what does it feel like to be unseen?

Not invisible. Not irrelevant. Unseen by choice.

There's a specific kind of person who dresses not to be noticed but to move. Who chooses utility over display. Who builds their wardrobe around function first, and lets the aesthetic follow from that.

**Ghost Protocol is built for that person.**

The GHOST CARGO is the centrepiece. Twelve pockets — not as a statement, but because you need them. Ripstop nylon because it doesn't show wear and doesn't tear. Cinch ankles because loose fabric gets caught.

Every design decision in Ghost Protocol follows the same filter: does this serve the person wearing it, or does it serve the look?

When the answer is "the look," we cut it.

**On colour:** Ghost Protocol is exclusively black. Not charcoal. Not "off-black." Black. This is a deliberate restriction. When colour is removed from the equation, form becomes the only language. The silhouette has to carry everything.

**On branding:** There is none. No logo. No tag visible from the outside. The internal label is woven in the same black thread as the garment. You know it's NOYR. That's enough.

Ghost Protocol ships in limited quantities. It will not restock. When it's gone, it's gone.

That's also part of the concept.`,
    cover_image: null,
    published: true,
    created_at: '2025-05-22T10:00:00Z',
    tags: ['COLLECTION', 'GHOST PROTOCOL', 'CONCEPT'],
  },
  {
    id: 'post-003',
    title: 'On Anime, Architecture and the Aesthetic of NOYR',
    slug: 'anime-architecture-aesthetic',
    excerpt: 'The visual language of the brand — where it comes from, what it references, and why none of it is accidental.',
    body: `NOYR is not an anime brand. But NOYR would not exist without anime.

This needs explaining.

The aesthetic that shaped this brand comes from a very specific intersection: the brutalist architecture of late-Soviet buildings, the environmental design of Ghost in the Shell (1995), the graphic language of mid-90s mecha illustration, and the silhouette work of Yohji Yamamoto.

These don't obviously belong together. But when you lay them side by side, a pattern emerges.

**Dark structures. Clean lines. Weight as a design element. The human form dwarfed by its context.**

This is the visual language of NOYR.

When we designed the VOID Hoodie, we weren't thinking about trends. We were thinking about the architecture of Zaha Hadid — organic forms that feel inevitable. The oversized silhouette isn't a fashion choice. It's a structural choice. The garment is designed to interact with the body, not conform to it.

**The NOYR logo** — the diamond mark (✦) — is derived from a navigation marker used in traditional Japanese textile notation. It marks a point of orientation. Where you are. Where you're going.

This is what the brand is: a mark on a map that says "you are here, and where you're going matters."

We are building for a specific person. One who understands reference without needing it explained. One who knows where the aesthetic comes from and chooses it anyway.

If you're reading this, you probably already know.`,
    cover_image: null,
    published: true,
    created_at: '2025-06-01T10:00:00Z',
    tags: ['BRAND', 'AESTHETIC', 'DESIGN', 'ANIME'],
  },
];

export function getPostBySlug(slug: string): JournalPost | undefined {
  return journalPosts.find(p => p.slug === slug && p.published);
}
