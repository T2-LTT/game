const fs = require('fs');

async function scrape() {
  try {
    const stories = [];
    const colors = ['#ff9a9e', '#a1c4fd', '#84fab0', '#ffcc00', '#ff99cc', '#66ccff', '#c2e59c', '#ffb347', '#ff758c', '#a8edea'];
    const emojis = ['📖', '🧚', '🌟', '🌙', '🦊', '🌺', '👑', '🕊️', '🦄', '🐰', '🐯', '🐢'];
    
    // Fetch 3 pages to get ~24 stories
    for (let page = 1; page <= 3; page++) {
      const url = page === 1 ? 'https://truyencotich.vn/truyen-co-tich/co-tich-viet-nam' : `https://truyencotich.vn/truyen-co-tich/co-tich-viet-nam/page/${page}`;
      console.log('Fetching', url);
      const res = await fetch(url);
      const html = await res.text();
      
      const links = [];
      const regex = /<h2 class="entry-title"><a href="([^"]+)" title="([^"]+)">/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        links.push({ href: match[1], title: match[2] });
      }
      
      for (const link of links) {
        if (stories.length >= 24) break;
        console.log('Fetching story:', link.title);
        const storyRes = await fetch(link.href);
        const storyHtml = await storyRes.text();
        
        let content = '';
        const pRegex = /<div class="entry-content[^>]*>([\s\S]*?)<\/div>/;
        const cMatch = storyHtml.match(pRegex);
        if (cMatch) {
          content = cMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        }
        
        if (!content) continue;
        
        // Split by punctuation
        const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
        const cleanSentences = sentences
          .map(s => s.trim().replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '-').replace(/&#8230;/g, '...').replace(/&quot;/g, '"'))
          .filter(s => s.length > 20);
          
        if (cleanSentences.length > 0) {
          stories.push({
            id: stories.length + 1,
            title: link.title.replace(/&#8211;/g, '-'),
            emoji: emojis[stories.length % emojis.length],
            color: colors[stories.length % colors.length],
            content: cleanSentences.slice(0, 30) // Limit to 30 sentences max
          });
        }
      }
    }
    
    fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/stories.json', JSON.stringify(stories, null, 2), 'utf8');
    console.log('Done! Saved', stories.length, 'stories.');
  } catch (err) {
    console.error(err);
  }
}

scrape();
