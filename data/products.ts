import { Product, Collection } from '@/types';

export const collections: Collection[] = [
  {
    id: 'col-001',
    title: 'VOID SEASON 01',
    slug: 'void-season-01',
    hero_text: 'DRESSED FOR THE VOID',
    banner_image: '/images/collection-void.jpg',
    description: 'The inaugural collection. Built for those who move through darkness with intention. Every piece is a statement. Every thread, a choice.',
  },
  {
    id: 'col-002',
    title: 'GHOST PROTOCOL',
    slug: 'ghost-protocol',
    hero_text: 'INVISIBLE. INEVITABLE.',
    banner_image: '/images/collection-ghost.jpg',
    description: 'Disappear into the noise. Emerge when it matters. Ghost Protocol is about presence through absence.',
  },
];

export const products: Product[] = [
  {
    id: 'prod-001',
    title: 'VOID OVERSIZED HOODIE',
    slug: 'void-oversized-hoodie',
    description: 'The centrepiece. 450gsm heavyweight fleece. Dropped shoulders. Oversized silhouette. Built to last decades.',
    story: 'The VOID HOODIE started as a sketch on a black wall at 3AM. It became the piece that defines the brand. No logos. No excess. Just the weight of intention.',
    price: 4999,
    images: ['/images/hoodie-1.jpg', '/images/hoodie-2.jpg', '/images/hoodie-3.jpg'],
    category: 'hoodies',
    collection_id: 'col-001',
    active: true,
    details: [
      '450gsm heavyweight cotton fleece',
      'Oversized dropped-shoulder fit',
      'Reinforced kangaroo pocket',
      'Enzyme washed for softness',
      'Double-stitched stress points',
      'Unisex sizing',
    ],
    variants: [
      { id: 'v-001-xs', product_id: 'prod-001', size: 'XS', color: 'Black', sku: 'VOID-HOD-BLK-XS', price: 4999, stock: 10 },
      { id: 'v-001-s', product_id: 'prod-001', size: 'S', color: 'Black', sku: 'VOID-HOD-BLK-S', price: 4999, stock: 15 },
      { id: 'v-001-m', product_id: 'prod-001', size: 'M', color: 'Black', sku: 'VOID-HOD-BLK-M', price: 4999, stock: 20 },
      { id: 'v-001-l', product_id: 'prod-001', size: 'L', color: 'Black', sku: 'VOID-HOD-BLK-L', price: 4999, stock: 18 },
      { id: 'v-001-xl', product_id: 'prod-001', size: 'XL', color: 'Black', sku: 'VOID-HOD-BLK-XL', price: 4999, stock: 12 },
      { id: 'v-001-xxl', product_id: 'prod-001', size: 'XXL', color: 'Black', sku: 'VOID-HOD-BLK-XXL', price: 4999, stock: 8 },
    ],
  },
  {
    id: 'prod-002',
    title: 'GHOST CARGO PANTS',
    slug: 'ghost-cargo-pants',
    description: 'Technical cargo silhouette. Ripstop nylon shell. Twelve utility pockets. For the ones always ready to move.',
    story: 'Designed for the city. Built for somewhere beyond it. The GHOST CARGO is utility dressed as art.',
    price: 5999,
    images: ['/images/cargo-1.jpg', '/images/cargo-2.jpg'],
    category: 'bottoms',
    collection_id: 'col-002',
    active: true,
    details: [
      '240gsm ripstop nylon shell',
      'Twelve utility pockets',
      'Adjustable cinch ankles',
      'Hidden zip waistband',
      'Reinforced knee panels',
      'Waterproof coating',
    ],
    variants: [
      { id: 'v-002-xs', product_id: 'prod-002', size: 'XS', color: 'Black', sku: 'GHOST-CRG-BLK-XS', price: 5999, stock: 8 },
      { id: 'v-002-s', product_id: 'prod-002', size: 'S', color: 'Black', sku: 'GHOST-CRG-BLK-S', price: 5999, stock: 12 },
      { id: 'v-002-m', product_id: 'prod-002', size: 'M', color: 'Black', sku: 'GHOST-CRG-BLK-M', price: 5999, stock: 15 },
      { id: 'v-002-l', product_id: 'prod-002', size: 'L', color: 'Black', sku: 'GHOST-CRG-BLK-L', price: 5999, stock: 10 },
      { id: 'v-002-xl', product_id: 'prod-002', size: 'XL', color: 'Black', sku: 'GHOST-CRG-BLK-XL', price: 5999, stock: 6 },
    ],
  },
  {
    id: 'prod-003',
    title: 'SIGNAL TEE',
    slug: 'signal-tee',
    description: '280gsm heavyweight jersey. Boxy fit. Single ink print on chest. The everyday uniform.',
    story: 'A tee should feel like armour. The SIGNAL TEE weighs more than most. It feels like it means something.',
    price: 2499,
    images: ['/images/tee-1.jpg', '/images/tee-2.jpg'],
    category: 'tops',
    collection_id: 'col-001',
    active: true,
    details: [
      '280gsm heavyweight cotton jersey',
      'Boxy oversized fit',
      'Single ink chest graphic',
      'Garment dyed',
      'Pre-shrunk',
      'Unisex sizing',
    ],
    variants: [
      { id: 'v-003-xs', product_id: 'prod-003', size: 'XS', color: 'Black', sku: 'SIG-TEE-BLK-XS', price: 2499, stock: 20 },
      { id: 'v-003-s', product_id: 'prod-003', size: 'S', color: 'Black', sku: 'SIG-TEE-BLK-S', price: 2499, stock: 25 },
      { id: 'v-003-m', product_id: 'prod-003', size: 'M', color: 'Black', sku: 'SIG-TEE-BLK-M', price: 2499, stock: 30 },
      { id: 'v-003-l', product_id: 'prod-003', size: 'L', color: 'Black', sku: 'SIG-TEE-BLK-L', price: 2499, stock: 22 },
      { id: 'v-003-xl', product_id: 'prod-003', size: 'XL', color: 'Black', sku: 'SIG-TEE-BLK-XL', price: 2499, stock: 15 },
      { id: 'v-003-xxl', product_id: 'prod-003', size: 'XXL', color: 'Black', sku: 'SIG-TEE-BLK-XXL', price: 2499, stock: 10 },
    ],
  },
  {
    id: 'prod-004',
    title: 'VOID COACH JACKET',
    slug: 'void-coach-jacket',
    description: 'Shell jacket. Windbreaker weight. Clean minimal. For the season between seasons.',
    story: 'No inner lining. No extra weight. The VOID COACH is about moving clean.',
    price: 7499,
    images: ['/images/jacket-1.jpg', '/images/jacket-2.jpg'],
    category: 'outerwear',
    collection_id: 'col-001',
    active: true,
    limited: true,
    drop_date: '2026-07-15T00:00:00.000Z', // Next limited drop
    details: [
      '180gsm polyester shell',
      'Full zip front closure',
      'Elastic cuffs and hem',
      'Two side zip pockets',
      'Packable into chest pocket',
      'Water resistant coating',
    ],
    variants: [
      { id: 'v-004-s', product_id: 'prod-004', size: 'S', color: 'Black', sku: 'VOID-JKT-BLK-S', price: 7499, stock: 8 },
      { id: 'v-004-m', product_id: 'prod-004', size: 'M', color: 'Black', sku: 'VOID-JKT-BLK-M', price: 7499, stock: 10 },
      { id: 'v-004-l', product_id: 'prod-004', size: 'L', color: 'Black', sku: 'VOID-JKT-BLK-L', price: 7499, stock: 8 },
      { id: 'v-004-xl', product_id: 'prod-004', size: 'XL', color: 'Black', sku: 'VOID-JKT-BLK-XL', price: 7499, stock: 0 },
    ],
  },
  {
    id: 'prod-005',
    title: 'GHOST PROTOCOL JACKET',
    slug: 'ghost-protocol-jacket',
    description: 'Drop 02. Tactical ripstop shell. Oversized fit. Concealed hood. A silhouette built for disappearing.',
    story: 'The second Ghost Protocol piece. Designed while listening to rain on concrete at 2AM.',
    price: 8999,
    images: ['/images/jacket-2.jpg'],
    category: 'outerwear',
    collection_id: 'col-002',
    active: true,
    limited: true,
    drop_date: '2026-08-01T12:00:00.000Z',
    details: [
      '210gsm ripstop nylon',
      'Oversized boxy silhouette',
      'Concealed hood in collar',
      'Magnetic closure front',
      'Two chest utility pockets',
      'Unisex sizing',
    ],
    variants: [
      { id: 'v-005-s',  product_id: 'prod-005', size: 'S',  color: 'Black', sku: 'GHOST-JKT-BLK-S',  price: 8999, stock: 0 },
      { id: 'v-005-m',  product_id: 'prod-005', size: 'M',  color: 'Black', sku: 'GHOST-JKT-BLK-M',  price: 8999, stock: 0 },
      { id: 'v-005-l',  product_id: 'prod-005', size: 'L',  color: 'Black', sku: 'GHOST-JKT-BLK-L',  price: 8999, stock: 0 },
      { id: 'v-005-xl', product_id: 'prod-005', size: 'XL', color: 'Black', sku: 'GHOST-JKT-BLK-XL', price: 8999, stock: 0 },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug);
}

export function getProductsByCollection(collectionId: string): Product[] {
  return products.filter(p => p.collection_id === collectionId && p.active);
}
