import type { CommunityProfile, CommunityStory, CommunityUserPost, CommunityComment } from '@/types';

// ─── Persona Details (prompts para Stability AI) ─────────
export interface PersonaDetail {
  id: string;
  age: number;
  gender: string;
  appearance: string;
  style: string;
  setting: string;
  personality: string;
  profilePrompt: string;
  postPrompts: string[];
  storyPrompt: string;
}

const PHONE_STYLE = 'phone camera quality, slightly grainy, natural lighting, amateur photography, not professional, authentic candid moment, brazilian person, no watermark, no text overlay';
const NEG_PROMPT = 'professional photography, studio lighting, perfect composition, stock photo, watermark, text, HDR, heavily edited, cartoon, anime, illustration';

export const PERSONA_DETAILS: Record<string, PersonaDetail> = {
  mock_ana: {
    id: 'mock_ana',
    age: 23,
    gender: 'feminino',
    appearance: 'young brazilian woman, 23 years old, brown skin, long curly dark hair, slim, warm smile',
    style: 'casual oversized t-shirt, jeans, simple cross necklace',
    setting: 'messy bedroom with fairy lights on wall, mirror with stickers',
    personality: 'jovem apaixonada por louvor, posta selfies, biblia com cafe',
    profilePrompt: `close up portrait selfie of a young brazilian woman 23 years old, brown skin, long curly dark brown hair, warm genuine smile, casual oversized white t-shirt, simple cross necklace, messy bedroom background with fairy lights, mirror selfie style, ${PHONE_STYLE}`,
    postPrompts: [
      `overhead phone photo of open bible book next to a cup of coffee on a messy wooden desk, morning warm natural light from window, cozy bedroom with blankets visible, ${PHONE_STYLE}`,
      `candid photo of a young brazilian woman with curly hair sitting on bed with earbuds listening to music, eyes closed worshipping, natural window light, messy room with clothes on chair, ${PHONE_STYLE}`,
    ],
    storyPrompt: `phone screenshot style photo of worship playlist on phone screen on unmade bed, morning sunlight through curtains, coffee mug visible, cozy intimate moment, ${PHONE_STYLE}`,
  },
  mock_ricardo: {
    id: 'mock_ricardo',
    age: 52,
    gender: 'masculino',
    appearance: 'brazilian man 52 years old, gray hair, short beard, reading glasses, warm authoritative face',
    style: 'button up shirt, dress pants, sometimes suit jacket',
    setting: 'church office with bookshelves full of theology books, wooden desk',
    personality: 'pastor experiente, serio mas caloroso, fotos do escritorio e pulpito',
    profilePrompt: `portrait of a brazilian man 52 years old, gray hair, short gray beard, reading glasses on nose, kind authoritative smile, button up light blue shirt, church office with theology bookshelves behind him, warm overhead lighting, ${PHONE_STYLE}`,
    postPrompts: [
      `photo of a church pulpit with open bible on it, wooden church interior, warm yellow lighting, empty pews in background, peaceful atmosphere, ${PHONE_STYLE}`,
      `overhead photo of a messy wooden desk with open bible, sermon notes handwritten on paper, reading glasses, cup of tea, theology books stacked, warm lamp light, ${PHONE_STYLE}`,
    ],
    storyPrompt: `photo of theology books spread open on desk with handwritten sermon notes, reading glasses resting on page, warm desk lamp light, late evening study, ${PHONE_STYLE}`,
  },
  mock_maria: {
    id: 'mock_maria',
    age: 45,
    gender: 'feminino',
    appearance: 'brazilian black woman 45 years old, short natural hair, wide warm smile, expressive eyes',
    style: 'colorful blouse, long skirt, head wrap sometimes',
    setting: 'prayer room with candles, mission field, simple church',
    personality: 'missionaria intercessora, fotos de grupo de oracao, missao',
    profilePrompt: `portrait of a brazilian black woman 45 years old, short natural hair, wide genuine warm smile, colorful floral blouse, simple church background with wooden cross on wall, natural daylight, ${PHONE_STYLE}`,
    postPrompts: [
      `photo of hands joined in circle prayer group, diverse people holding hands praying together, simple room with plastic chairs, warm natural light from window, ${PHONE_STYLE}`,
      `candid photo of a group of women in a simple church room with bibles open, smiling and studying together, fluorescent lighting, folding chairs, ${PHONE_STYLE}`,
    ],
    storyPrompt: `phone photo of lit prayer candles on a simple wooden table with open bible, dark room with soft warm candlelight, intimate prayer moment, ${PHONE_STYLE}`,
  },
  mock_lucas: {
    id: 'mock_lucas',
    age: 21,
    gender: 'masculino',
    appearance: 'young brazilian white man 21 years old, thin, round glasses, messy brown hair, intellectual look',
    style: 'plain t-shirt, hoodie, casual student clothes',
    setting: 'desk covered in books and papers, university library, small bedroom',
    personality: 'nerd teologico, fotos de livros empilhados, anotacoes',
    profilePrompt: `selfie of a young brazilian man 21 years old, thin, round glasses, messy brown hair, plain gray t-shirt, small bedroom with books stacked on shelf behind him, slightly awkward smile, ${PHONE_STYLE}`,
    postPrompts: [
      `overhead photo of a messy desk with multiple theology books stacked, open notebook with handwritten notes and highlights, pen, empty energy drink can, laptop partially visible, ${PHONE_STYLE}`,
      `photo of a well-worn bible with many colored tabs and bookmarks sticking out, sitting on a stack of commentary books, desk lamp light, student bedroom, ${PHONE_STYLE}`,
    ],
    storyPrompt: `phone photo of a theology book page being highlighted with a yellow marker, coffee shop table with laptop and coffee, casual study session, ${PHONE_STYLE}`,
  },
  mock_julia: {
    id: 'mock_julia',
    age: 28,
    gender: 'feminino',
    appearance: 'brazilian woman 28 years old, light skin, blonde hair in ponytail, light eyes, fit and healthy look',
    style: 'athletic wear, simple jewelry, clean casual style',
    setting: 'outdoors nature, sunrise, garden, park bench',
    personality: 'superou ansiedade, fotos de natureza e nascer do sol, journaling',
    profilePrompt: `portrait of a brazilian woman 28 years old, light skin, blonde hair in ponytail, light green eyes, peaceful genuine smile, wearing athletic tank top, outdoors with trees and soft golden sunrise light behind her, ${PHONE_STYLE}`,
    postPrompts: [
      `phone photo of a sunrise over green hills with golden orange sky, silhouette of trees, taken from a balcony or window, slightly blurry, morning light, ${PHONE_STYLE}`,
      `overhead photo of an open journal notebook with handwritten gratitude list and prayers, pen, fresh flowers in small vase, morning light on wooden table, cozy atmosphere, ${PHONE_STYLE}`,
    ],
    storyPrompt: `phone photo of feet in running shoes on a dirt trail path, early morning golden light, dew on grass, peaceful nature walk, ${PHONE_STYLE}`,
  },
  mock_pedro: {
    id: 'mock_pedro',
    age: 19,
    gender: 'masculino',
    appearance: 'young brazilian mixed race man 19 years old, curly afro hair, athletic build, energetic bright smile',
    style: 'streetwear, graphic tee, sneakers, cap sometimes',
    setting: 'youth church with colored lights, group hangouts, energy',
    personality: 'lider de jovens, selfies com grupo, culto com luzes neon',
    profilePrompt: `selfie of a young brazilian man 19 years old, mixed race, curly afro hair, bright energetic smile, graphic t-shirt, youth church with purple and blue stage lights in background, group of friends partially visible, ${PHONE_STYLE}`,
    postPrompts: [
      `wide photo of a youth church worship service, young people with hands raised, colorful stage lights purple blue pink, band on stage, energetic atmosphere, taken from crowd, ${PHONE_STYLE}`,
      `group selfie of diverse young brazilian teens and twenties smiling together, casual clothes, church hallway or parking lot, nighttime, flash photo slightly overexposed, ${PHONE_STYLE}`,
      `phone photo of a youth group circle sitting on floor with bibles open, casual setting with bean bags and string lights, intimate bible study, ${PHONE_STYLE}`,
    ],
    storyPrompt: `shaky phone video screenshot of worship band playing on church stage with colored lights, crowd with raised hands, energetic youth service, ${PHONE_STYLE}`,
  },
  mock_beatriz: {
    id: 'mock_beatriz',
    age: 35,
    gender: 'feminino',
    appearance: 'brazilian woman 35 years old, red auburn hair, freckles, warm motherly face, gentle eyes',
    style: 'comfortable mom clothes, cardigan, simple dress',
    setting: 'home kitchen, living room, church nursery',
    personality: 'mae adoradora, fotos com filhos e vida domestica',
    profilePrompt: `portrait of a brazilian woman 35 years old, red auburn hair shoulder length, freckles, warm gentle smile, wearing cozy cardigan, home living room with toys on floor in background, natural afternoon light, ${PHONE_STYLE}`,
    postPrompts: [
      `phone photo of a messy kitchen table with open children bible, coloring crayons, juice box, small child hands visible coloring a bible scene, warm home atmosphere, ${PHONE_STYLE}`,
      `candid photo from behind of a woman and small child sitting together in a church pew, wooden church interior, sunday service, soft natural light through windows, ${PHONE_STYLE}`,
    ],
    storyPrompt: `phone photo of a praise song lyrics on a TV screen in a living room, worship music playing at home, cozy evening with blanket on couch, ${PHONE_STYLE}`,
  },
  mock_gabriel: {
    id: 'mock_gabriel',
    age: 26,
    gender: 'masculino',
    appearance: 'young brazilian black man 26 years old, short dreadlocks, confident artistic look, gentle eyes',
    style: 'band t-shirt, jeans, sometimes worship team polo',
    setting: 'home studio with guitar, bedroom with instruments, church stage',
    personality: 'musico cristao, fotos de violao e ensaio, estudio caseiro',
    profilePrompt: `portrait of a young brazilian black man 26 years old, short dreadlocks, gentle confident smile, band t-shirt, holding acoustic guitar, small messy bedroom with instruments and cables in background, ${PHONE_STYLE}`,
    postPrompts: [
      `phone photo of an acoustic guitar resting on a messy bed with music sheets and lyrics notebook, bedroom with posters on wall, warm lamp light, ${PHONE_STYLE}`,
      `candid photo of hands playing guitar close up, worship practice, simple church stage with microphone stand, afternoon rehearsal, ${PHONE_STYLE}`,
    ],
    storyPrompt: `phone photo of a small home recording setup with microphone, laptop with audio software, guitar on stand, messy bedroom studio, dim ambient light, ${PHONE_STYLE}`,
  },
  mock_camila: {
    id: 'mock_camila',
    age: 32,
    gender: 'feminino',
    appearance: 'brazilian woman 32 years old, brown skin, straight dark hair, friendly sympathetic face',
    style: 'casual mom style, jeans and blouse, comfortable',
    setting: 'dining table, park with kids, home living room',
    personality: 'mae de 2, devocional na mesa, familia, fotos com filhos',
    profilePrompt: `selfie of a brazilian woman 32 years old, brown skin, straight dark hair, friendly warm smile, casual blouse, at home with kitchen partially visible behind her, natural daylight, ${PHONE_STYLE}`,
    postPrompts: [
      `overhead phone photo of a family devotional scene, open bible on dining table with two small plates of snacks, children drawings with bible themes, warm home kitchen light, ${PHONE_STYLE}`,
      `candid photo of a woman and two small children at a park, sitting on grass under a tree, bible story book open, sunny day, natural setting, slightly overexposed, ${PHONE_STYLE}`,
    ],
    storyPrompt: `phone photo of two children praying with folded hands at dinner table, cute innocent moment, home dining room, warm evening light, ${PHONE_STYLE}`,
  },
  mock_daniel: {
    id: 'mock_daniel',
    age: 40,
    gender: 'masculino',
    appearance: 'brazilian man 40 years old, full dark beard, robust build, serious thoughtful face',
    style: 'polo shirt or collared shirt, jeans, leather bible cover',
    setting: 'outdoors countryside, open field, simple outdoor pulpit',
    personality: 'pregador serio, fotos ao ar livre com biblia, pregacao intensa',
    profilePrompt: `portrait of a brazilian man 40 years old, full dark beard, robust build, serious thoughtful expression, polo shirt, outdoors with green countryside field behind him, overcast natural light, ${PHONE_STYLE}`,
    postPrompts: [
      `phone photo of a leather covered bible open on a rustic wooden fence post, green countryside field background, cloudy sky, contemplative peaceful scene, ${PHONE_STYLE}`,
      `wide shot of a man standing and preaching outdoors to a small group sitting on plastic chairs, rural setting with trees, simple outdoor church gathering, ${PHONE_STYLE}`,
    ],
    storyPrompt: `phone photo of a sunrise over open countryside field, cross silhouette visible on hilltop, dramatic orange clouds, contemplative morning moment, ${PHONE_STYLE}`,
  },
};

export { NEG_PROMPT as PERSONA_NEG_PROMPT };

export interface CommunityPost {
  id: string;
  userName: string;
  avatar: string;
  type: 'testimony' | 'prayer' | 'question' | 'devotional' | 'verse';
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  verse?: string;
  isLiked?: boolean;
  userLevel: number;
  userTitle: string;
  userXP: number;
}

export const communityAvatars = [
  '🙏', '✝️', '⛪', '🕊️', '💒', '📖', '🌅', '🔥', '💛', '🌿',
  '⭐', '🌸', '🕯️', '🎵', '💎', '🌈', '🌻', '🦋', '🌙', '☀️',
];

export const postTypeLabels: Record<CommunityPost['type'], string> = {
  testimony: 'Testemunho',
  prayer: 'Pedido de Oração',
  question: 'Pergunta',
  devotional: 'Devocional',
  verse: 'Versículo',
};

export const postTypeColors: Record<CommunityPost['type'], string> = {
  testimony: '#10B981',
  prayer: '#EC4899',
  question: '#3B82F6',
  devotional: '#F59E0B',
  verse: '#C5943A',
};

// ─── Mock Users ─────────────────────────────
export const MOCK_USERS: CommunityProfile[] = [
  { id: 'mock_ana', name: 'Ana Clara', avatar: '🌸', photo: 'persona:mock_ana:profile', bio: 'Serva do Senhor. 23 anos. Amo louvor e adoração.', level: 8, title: 'Sacerdote', xp: 1900, postCount: 45, followerCount: 234, followingCount: 89 },
  { id: 'mock_ricardo', name: 'Pastor Ricardo', avatar: '⛪', photo: 'persona:mock_ricardo:profile', bio: 'Pastor há 15 anos. 52 anos. Pregador da Palavra.', level: 11, title: 'Guerreiro da Fé', xp: 5200, postCount: 120, followerCount: 1023, followingCount: 156 },
  { id: 'mock_maria', name: 'Maria Santos', avatar: '🕊️', photo: 'persona:mock_maria:profile', bio: 'Missionária e intercessora. 45 anos. Amada de Deus.', level: 7, title: 'Levita', xp: 1400, postCount: 32, followerCount: 178, followingCount: 67 },
  { id: 'mock_lucas', name: 'Lucas Oliveira', avatar: '📖', photo: 'persona:mock_lucas:profile', bio: 'Estudante de teologia, 21 anos. Apaixonado pela Palavra.', level: 6, title: 'Obreiro', xp: 950, postCount: 28, followerCount: 145, followingCount: 112 },
  { id: 'mock_julia', name: 'Julia Ferreira', avatar: '🌅', photo: 'persona:mock_julia:profile', bio: 'Deus me curou da ansiedade. 28 anos. Ele é meu refúgio.', level: 5, title: 'Servo', xp: 600, postCount: 18, followerCount: 89, followingCount: 45 },
  { id: 'mock_pedro', name: 'Pedro Souza', avatar: '🔥', photo: 'persona:mock_pedro:profile', bio: 'Líder de jovens, 19 anos. Fé inabalável.', level: 9, title: 'Profeta', xp: 2800, postCount: 67, followerCount: 456, followingCount: 198 },
  { id: 'mock_beatriz', name: 'Beatriz Lima', avatar: '💎', photo: 'persona:mock_beatriz:profile', bio: 'Adoradora e mãe. 35 anos. Cada dia mais perto de Deus.', level: 4, title: 'Discípulo', xp: 380, postCount: 12, followerCount: 67, followingCount: 34 },
  { id: 'mock_gabriel', name: 'Gabriel Costa', avatar: '⭐', photo: 'persona:mock_gabriel:profile', bio: 'Músico cristão, 26 anos. Louvor é minha vida.', level: 7, title: 'Levita', xp: 1500, postCount: 35, followerCount: 312, followingCount: 78 },
  { id: 'mock_camila', name: 'Camila Rocha', avatar: '🦋', photo: 'persona:mock_camila:profile', bio: 'Transformada pela graça. 32 anos. Mãe de 2.', level: 5, title: 'Servo', xp: 520, postCount: 15, followerCount: 92, followingCount: 56 },
  { id: 'mock_daniel', name: 'Daniel Alves', avatar: '✝️', photo: 'persona:mock_daniel:profile', bio: 'Pregador do evangelho. 40 anos. Sola Scriptura.', level: 10, title: 'Apóstolo', xp: 4100, postCount: 88, followerCount: 678, followingCount: 134 },
];

// ─── Mock Posts with Images ─────────────────
export const MOCK_FEED_POSTS: CommunityUserPost[] = [
  {
    id: 'mock_post_1',
    userId: 'mock_ana',
    content: 'Hoje Deus me mostrou algo incrível durante a leitura de Salmos. "O Senhor é meu pastor e nada me faltará." Que promessa maravilhosa! Deus cuida de cada detalhe da nossa vida.',
    type: 'devotional',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 47,
    images: ['persona:mock_ana:post:0', 'persona:mock_ana:post:1'],
    comments: [
      { id: 'c1', postId: 'mock_post_1', userId: 'mock_ricardo', userName: 'Pastor Ricardo', userAvatar: '⛪', content: 'Amém! Que lindo testemunho, Ana!', date: new Date(Date.now() - 1000 * 60 * 20).toISOString(), likes: 5 },
      { id: 'c2', postId: 'mock_post_1', userId: 'mock_maria', userName: 'Maria Santos', userAvatar: '🕊️', content: 'Deus é fiel! Salmo 23 é meu favorito.', date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), likes: 3 },
    ],
  },
  {
    id: 'mock_post_2',
    userId: 'mock_ricardo',
    content: 'Compartilho com vocês o versículo que Deus colocou no meu coração para a pregação de domingo: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna." - João 3:16',
    type: 'verse',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 123,
    images: ['persona:mock_ricardo:post:0'],
    comments: [
      { id: 'c3', postId: 'mock_post_2', userId: 'mock_pedro', userName: 'Pedro Souza', userAvatar: '🔥', content: 'Poderoso! João 3:16 nunca envelhece.', date: new Date(Date.now() - 1000 * 60 * 60).toISOString(), likes: 8 },
    ],
  },
  {
    id: 'mock_post_3',
    userId: 'mock_pedro',
    content: 'Ontem no culto de jovens, 15 pessoas aceitaram Jesus! Glória a Deus! O Espírito Santo se moveu de uma forma tão especial. Deus está trabalhando na juventude!',
    type: 'testimony',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 89,
    images: ['persona:mock_pedro:post:0', 'persona:mock_pedro:post:1', 'persona:mock_pedro:post:2'],
    comments: [
      { id: 'c4', postId: 'mock_post_3', userId: 'mock_ana', userName: 'Ana Clara', userAvatar: '🌸', content: 'GLÓRIA A DEUS! Que notícia maravilhosa!', date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), likes: 12 },
      { id: 'c5', postId: 'mock_post_3', userId: 'mock_julia', userName: 'Julia Ferreira', userAvatar: '🌅', content: 'Amém! Deus é poderoso!', date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), likes: 4 },
      { id: 'c6', postId: 'mock_post_3', userId: 'mock_gabriel', userName: 'Gabriel Costa', userAvatar: '⭐', content: 'Que lindo! O Senhor está agindo!', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), likes: 6 },
    ],
  },
  {
    id: 'mock_post_4',
    userId: 'mock_maria',
    content: 'Peço oração pela minha mãe que está doente. Cremos na cura em nome de Jesus. "Pela suas feridas fomos sarados." - Isaías 53:5',
    type: 'prayer',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    likes: 156,
    images: [],
    comments: [
      { id: 'c7', postId: 'mock_post_4', userId: 'mock_camila', userName: 'Camila Rocha', userAvatar: '🦋', content: 'Estamos orando, Maria! Deus vai curar!', date: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), likes: 15 },
    ],
  },
  {
    id: 'mock_post_5',
    userId: 'mock_gabriel',
    content: 'Compus um louvor novo! "Tu és minha rocha, meu refúgio, minha fortaleza." Que o Senhor use essa música para abençoar vidas.',
    type: 'devotional',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    likes: 67,
    images: ['persona:mock_gabriel:post:0'],
    comments: [],
  },
  {
    id: 'mock_post_6',
    userId: 'mock_lucas',
    content: 'Alguém tem indicação de comentário bíblico sobre Romanos? Estou estudando a carta de Paulo e quero aprofundar mais.',
    type: 'question',
    date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    likes: 23,
    images: [],
    comments: [
      { id: 'c8', postId: 'mock_post_6', userId: 'mock_daniel', userName: 'Daniel Alves', userAvatar: '✝️', content: 'Recomendo o comentário de John Stott! Excelente.', date: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(), likes: 7 },
      { id: 'c9', postId: 'mock_post_6', userId: 'mock_ricardo', userName: 'Pastor Ricardo', userAvatar: '⛪', content: 'Matthew Henry também é muito bom para Romanos.', date: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(), likes: 5 },
    ],
  },
  {
    id: 'mock_post_7',
    userId: 'mock_daniel',
    content: '"Tudo posso naquele que me fortalece." - Filipenses 4:13. Essa é a verdade que nos sustenta em cada batalha. Não é pela nossa força, mas pela dele!',
    type: 'verse',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes: 201,
    images: ['persona:mock_daniel:post:0', 'persona:mock_daniel:post:1'],
    comments: [],
  },
  {
    id: 'mock_post_8',
    userId: 'mock_julia',
    content: 'Depois de 2 anos lutando contra a ansiedade, hoje posso dizer: Deus me curou! Entreguei tudo nas mãos dele e ele me deu paz. Se você está passando por isso, não desista!',
    type: 'testimony',
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    likes: 312,
    images: ['persona:mock_julia:post:0'],
    comments: [
      { id: 'c10', postId: 'mock_post_8', userId: 'mock_beatriz', userName: 'Beatriz Lima', userAvatar: '💎', content: 'Que testemunho lindo! Deus é maravilhoso!', date: new Date(Date.now() - 1000 * 60 * 60 * 34).toISOString(), likes: 20 },
    ],
  },
];

// ─── Mock Stories ─────────────────────────────
export const MOCK_STORIES: CommunityStory[] = [
  { id: 'story_1', userId: 'mock_ana', userName: 'Ana Clara', userAvatar: '🌸', userPhoto: 'persona:mock_ana:profile', imageUri: 'persona:mock_ana:story', caption: 'Momento de oração matinal', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(), viewedBy: [] },
  { id: 'story_2', userId: 'mock_ricardo', userName: 'Pastor Ricardo', userAvatar: '⛪', userPhoto: 'persona:mock_ricardo:profile', imageUri: 'persona:mock_ricardo:story', caption: 'Preparando a pregação de domingo', date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(), viewedBy: [] },
  { id: 'story_3', userId: 'mock_pedro', userName: 'Pedro Souza', userAvatar: '🔥', userPhoto: 'persona:mock_pedro:profile', imageUri: 'persona:mock_pedro:story', caption: 'Culto de jovens foi abençoado!', date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), viewedBy: [] },
  { id: 'story_4', userId: 'mock_gabriel', userName: 'Gabriel Costa', userAvatar: '⭐', userPhoto: 'persona:mock_gabriel:profile', imageUri: 'persona:mock_gabriel:story', caption: 'Ensaiando louvor novo', date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 16).toISOString(), viewedBy: [] },
  { id: 'story_5', userId: 'mock_daniel', userName: 'Daniel Alves', userAvatar: '✝️', userPhoto: 'persona:mock_daniel:profile', imageUri: 'persona:mock_daniel:story', caption: 'Versículo do dia', date: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(), viewedBy: [] },
];

// ─── DM Auto-response templates ─────────────
export const DM_AUTO_RESPONSES: Record<string, string[]> = {
  mock_ana: ['Amém! Que Deus te abençoe!', 'Lindo versículo! Obrigada por compartilhar.', 'Estou orando por você!', 'Deus é fiel! Ele vai te ajudar.'],
  mock_ricardo: ['Paz do Senhor! Sempre bom conversar sobre a Palavra.', 'Que Deus te guie nessa caminhada.', 'A Bíblia nos ensina que devemos perseverar.', 'Amém! Conte comigo para orar.'],
  mock_maria: ['Deus te abençoe! Vamos orar juntos.', 'Que testemunho lindo! Glória a Deus.', 'Estou intercedendo por esse pedido.', 'O Senhor é nosso refúgio!'],
  mock_lucas: ['Interessante! Vou pesquisar mais sobre isso.', 'Qual tradução você usa? Gosto da NVI.', 'Romanos é incrível, né? Cada capítulo é profundo.', 'Obrigado pela recomendação!'],
  mock_pedro: ['Bora! Deus está no controle!', 'Amém, irmão! Vamos juntos!', 'Que Deus use você poderosamente!', 'Jovem com fé é jovem vencedor!'],
  mock_julia: ['Obrigada pelo carinho! Deus abençoe.', 'Sim! Ele me curou da ansiedade. Glória!', 'Vamos confiar no Senhor sempre.', 'Que lindo! Amém!'],
  mock_gabriel: ['Que Deus te abençoe com esse louvor!', 'Música é a linguagem do céu!', 'Amém! Vamos adorar juntos.', 'Obrigado! Que Deus use essa canção.'],
  mock_beatriz: ['Amém! Cada dia mais perto dele.', 'Que Deus te fortaleça!', 'Lindo! Deus é maravilhoso.', 'Obrigada por compartilhar!'],
  mock_camila: ['Deus é bom o tempo todo!', 'Amém! Que versículo especial.', 'Obrigada pela oração!', 'Deus cuida dos nossos filhos!'],
  mock_daniel: ['A Escritura é inerrante! Amém.', 'Sola Scriptura, sola fide!', 'Que Deus abra nossos olhos para Sua Palavra.', 'Excelente reflexão! Concordo plenamente.'],
};

export function getMockUser(userId: string): CommunityProfile | undefined {
  return MOCK_USERS.find(u => u.id === userId);
}

export function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}sem`;
}
