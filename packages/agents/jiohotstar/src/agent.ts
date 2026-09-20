import type { Agent, MessageContext, AgentResponse } from '@pam/core';

export class JioHotstarAgent implements Agent {
  readonly id = 'jiohotstar';
  readonly name = 'JioHotstar';
  readonly icon = '📺';
  readonly description = 'Streaming, watchlist, and live sports';
  readonly keywords = ['watch', 'movie', 'movies', 'show', 'series', 'streaming', 'hotstar', 'jio', 'cricket', 'ipl', 'live'];

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();
    const cleanText = text.replace(/@jiohotstar\s*/i, '').replace(/^jiohotstar[:\s]+/i, '').trim();

    if (this.matchesIntent(cleanText, ['search', 'find', 'show me', 'looking for'])) {
      return this.handleSearch(cleanText);
    }

    if (this.matchesIntent(cleanText, ['watchlist', 'my list', 'saved'])) {
      return this.handleWatchlist();
    }

    if (this.matchesIntent(cleanText, ['live', 'cricket', 'sports', 'match'])) {
      return this.handleLive();
    }

    if (this.matchesIntent(cleanText, ['trending', 'popular', 'top', 'new'])) {
      return this.handleTrending();
    }

    if (this.matchesIntent(cleanText, ['continue', 'resume', 'watching'])) {
      return this.handleContinueWatching();
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `📺 *JioHotstar Agent*

I can help you find movies, shows, and live sports!

*Commands:*
• \`search [title]\` - Find movies/shows
• \`watchlist\` - View your saved content
• \`live\` - See live sports and TV
• \`trending\` - Popular content now
• \`continue\` - Resume watching

_Note: This is a demo. Links are simulated._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private handleSearch(text: string): AgentResponse {
    const searchTerm = text.replace(/search|find|show me|looking for/gi, '').trim() || 'content';

    return {
      text: `🔍 *Search Results for "${searchTerm}"*

🎬 *Movies*
1. *Jawan* (2023) - Action
   ⭐ 8.2 | 2h 49m | Hindi

2. *Animal* (2023) - Drama
   ⭐ 7.8 | 3h 21m | Hindi

📺 *Shows*
3. *Koffee with Karan S8*
   ⭐ 7.5 | Talk Show

_(Demo mode - tap to "watch")_`,
      list: {
        buttonText: 'View Results',
        sections: [
          {
            title: 'Movies',
            rows: [
              { id: 'watch_jawan', title: '🎬 Jawan', description: '⭐ 8.2 | Action | 2h 49m' },
              { id: 'watch_animal', title: '🎬 Animal', description: '⭐ 7.8 | Drama | 3h 21m' },
            ],
          },
          {
            title: 'Shows',
            rows: [
              { id: 'watch_kwk', title: '📺 Koffee with Karan', description: '⭐ 7.5 | Talk Show' },
            ],
          },
        ],
      },
    };
  }

  private handleWatchlist(): AgentResponse {
    return {
      text: `📋 *My Watchlist*

1. 🎬 *Oppenheimer* (2023)
   Drama | 3h | Added Sep 15

2. 📺 *The Bear S2*
   Comedy | 8 episodes | Added Sep 10

3. 🎬 *Pathaan* (2023)
   Action | 2h 26m | Added Sep 5

4. 📺 *Aspirants S2*
   Drama | 5 episodes | Added Aug 28

_(Demo mode - sample watchlist)_`,
      buttons: [
        { id: 'play_first', title: '▶️ Play First' },
        { id: 'edit_list', title: '✏️ Edit List' },
      ],
    };
  }

  private handleLive(): AgentResponse {
    return {
      text: `🔴 *Live Now*

🏏 *Cricket*
• IND vs AUS - T20 World Cup
  🔴 LIVE | IND: 156/4 (18.2 ov)

⚽ *Football*
• Premier League
  Arsenal vs Chelsea
  🔴 LIVE | 2-1

📺 *Live TV*
• Star Sports 1
• Star Sports Hindi
• HBO

_(Demo mode - simulated live)_`,
      buttons: [
        { id: 'watch_cricket', title: '🏏 Watch Cricket' },
        { id: 'watch_football', title: '⚽ Watch Football' },
        { id: 'browse_channels', title: '📺 All Channels' },
      ],
    };
  }

  private handleTrending(): AgentResponse {
    return {
      text: `🔥 *Trending Now*

📈 *Top 10 in India*

1. 🎬 *Jawan* - Action
2. 📺 *Koffee with Karan* - Talk Show
3. 🎬 *Animal* - Drama
4. 📺 *The Night Manager* - Thriller
5. 🎬 *Pathaan* - Action

*New Releases*
• 🆕 Citadel: Honey Bunny
• 🆕 Murder Mubarak

_(Demo mode - sample trends)_`,
      list: {
        buttonText: 'Browse Trending',
        sections: [{
          title: 'Top 10',
          rows: [
            { id: 'watch_1', title: '1. Jawan', description: 'Action | ⭐ 8.2' },
            { id: 'watch_2', title: '2. Koffee with Karan', description: 'Talk Show | ⭐ 7.5' },
            { id: 'watch_3', title: '3. Animal', description: 'Drama | ⭐ 7.8' },
          ],
        }],
      },
    };
  }

  private handleContinueWatching(): AgentResponse {
    return {
      text: `▶️ *Continue Watching*

1. 📺 *The Bear* - S2 E4
   32 min left | Last watched 2h ago

2. 🎬 *Oppenheimer*
   1h 45m left | Last watched yesterday

3. 📺 *Aspirants* - S2 E3
   18 min left | Last watched 3 days ago

_(Demo mode - sample progress)_`,
      buttons: [
        { id: 'resume_bear', title: '▶️ The Bear' },
        { id: 'resume_oppenheimer', title: '▶️ Oppenheimer' },
        { id: 'browse_more', title: '🔍 Browse' },
      ],
    };
  }

  private showOptions(): AgentResponse {
    return {
      text: `📺 *JioHotstar*

What would you like to watch?

• 🔍 *Search* - Find movies & shows
• 📋 *Watchlist* - Your saved content
• 🔴 *Live* - Sports & TV channels
• 🔥 *Trending* - What's popular
• ▶️ *Continue* - Resume watching

Tell me what you're in the mood for!`,
      buttons: [
        { id: 'browse_trending', title: '🔥 Trending' },
        { id: 'live_sports', title: '🔴 Live Sports' },
        { id: 'my_watchlist', title: '📋 Watchlist' },
      ],
    };
  }
}

export function createJioHotstarAgent(): Agent {
  return new JioHotstarAgent();
}
