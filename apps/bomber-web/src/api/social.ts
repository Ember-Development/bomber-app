export interface SocialPost {
  id: string;
  mediaUrl: string;
  permalink: string;
  platform: 'Instagram' | 'Facebook';
}

// Instagram Posts
export const fetchInstagramPosts = async (): Promise<SocialPost[]> => {
  // To implement Instagram:
  // 1. Get an Instagram Access Token (requires Instagram App setup)
  // 2. Call Instagram Basic Display API or Instagram Graph API
  // 3. Parse the response and return formatted posts

  // Example:
  // const response = await fetch(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink&access_token=YOUR_TOKEN`);
  // const data = await response.json();
  // return data.data.map(post => ({
  //   id: post.id,
  //   mediaUrl: post.media_url,
  //   permalink: post.permalink,
  //   platform: 'Instagram'
  // }));

  return [];
};

// Facebook Posts
export const fetchFacebookPosts = async (): Promise<SocialPost[]> => {
  // To implement Facebook:
  // 1. Create a Facebook App and get an Access Token
  // 2. Use Facebook Graph API to fetch page posts
  // 3. Parse the response and return formatted posts

  // Example:
  // const response = await fetch(`https://graph.facebook.com/v18.0/YOUR_PAGE_ID/posts?fields=id,message,created_time,full_picture,permalink_url&access_token=YOUR_TOKEN`);
  // const data = await response.json();
  // return data.data
  //   .filter(post => post.full_picture) // Only posts with images
  //   .map(post => ({
  //     id: post.id,
  //     mediaUrl: post.full_picture,
  //     permalink: post.permalink_url || `https://facebook.com/${post.id}`,
  //     platform: 'Facebook'
  //   }));

  return [];
};

// Fetch both Instagram and Facebook posts
export const fetchAllSocialPosts = async (): Promise<SocialPost[]> => {
  try {
    const [instagramPosts, facebookPosts] = await Promise.all([
      fetchInstagramPosts(),
      fetchFacebookPosts(),
    ]);

    // Combine and shuffle posts from both platforms
    const allPosts = [...instagramPosts, ...facebookPosts];

    // Optionally shuffle or sort by date
    return allPosts.slice(0, 10); // Return first 10 posts
  } catch (error) {
    console.error('Failed to fetch social posts:', error);
    return [];
  }
};
