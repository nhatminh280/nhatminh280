// Static, hand-written content. Everything numeric about the account comes from the API instead.
export const config = {
  user: 'nhatminh280',

  hero: {
    meta: '@nhatminh280, PTIT, Vietnam',
    name: 'Nhat Minh',
    role: 'AI Engineer',
    status: 'Open to opportunities as an AI Engineer',
    focus: 'LLM & RAG, computer vision, ML on small devices',
  },

  stack: [
    { title: 'Languages', items: ['Python', 'C++'] },
    { title: 'Machine learning', items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'XGBoost', 'Pandas'] },
    { title: 'LLM and RAG', items: ['LangGraph', 'ChromaDB', 'Gemini', 'Prompt engineering', 'Semantic search'] },
    { title: 'Computer vision', items: ['OpenCV', 'Object detection', 'CLIP', 'ResNet'] },
    { title: 'Embedded', items: ['ESP32', 'MPU6050'] },
  ],

  // Order = card order (2x2 grid). `note` is shown as a pill; fork status is read from the API.
  featured: [
    { repo: 'e-shop', title: 'e-shop', note: 'Owned the AI layer', art: 'rerank',
      blurb: 'Agentic RAG chatbot on LangGraph and a hybrid content + collaborative recommender with CLIP embeddings.' },
    { repo: 'Intelligent-News-Assistant_RAG', title: 'Intelligent-News-Assistant', note: 'RAG with FastAPI', art: 'sources',
      blurb: 'Vietnamese tech-news assistant: RSS ingest, topic filter, ChromaDB retrieval, Gemini-written weekly report.' },
    { repo: 'detect_actions_using_MPU-ESP32', title: 'MPU6050 gesture recognition', note: 'ML on an ESP32', art: 'signal',
      // Per-class F1 from the repo README, first table (3,223 windows).
      gestures: [{ name: 'Clapping', f1: 0.89 }, { name: 'Fist Making', f1: 0.94 }, { name: 'Thumbs Up', f1: 0.88 }],
      blurb: 'Hand gestures recognised in real time by XGBoost on an ESP32 + MPU6050. F1 0.88 to 0.94 per gesture, accuracy 0.90.' },
    { repo: 'Heart-', title: 'Heartify', note: 'Just for fun', art: 'heart',
      blurb: 'A small Python script for confessing to your lover, imitating the character Ly Tuan. Made for fun in my free time.' },
  ],

  links: [
    { id: 'linkedin', label: 'LinkedIn', glyph: 'in', href: 'https://www.linkedin.com/in/l%C3%A2m-minh-08b975288/' },
    { id: 'codeforces', label: 'Codeforces', glyph: 'CF', href: 'https://codeforces.com/profile/m-giraffe' },
    { id: 'gmail', label: 'minh2508tv@gmail.com', glyph: '@', href: 'mailto:minh2508tv@gmail.com' },
    { id: 'github', label: 'GitHub', glyph: 'GH', href: 'https://github.com/nhatminh280' },
  ],
};
