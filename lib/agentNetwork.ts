/**
 * Agent network generation for society simulations
 * Each agent is a unique personality variation within a community
 */

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface AgentNode {
  id: string;
  name: string;
  role: string; // Professional role/title
  archetype: string;
  personalityTraits: string[];
  comment: string; // Their actual comment on the ad
  sentiment: Sentiment;
  engagement: number; // 0-100 likelihood to engage
  status: 'idle' | 'thinking' | 'reacting' | 'sharing';
  position: { x: number; y: number };
  connections: string[]; // IDs of connected agents
  demographics: {
    location: string;
    ageGroup: string;
    profession: string;
  };
}

export interface AgentNetwork {
  societyId: string;
  societyName: string;
  agents: AgentNode[];
}

/**
 * Generate agent networks for each society
 */
export function generateAgentNetworks(societyIds: string[]): AgentNetwork[] {
  return societyIds.map(id => {
    if (id.includes('parents')) {
      return generateParentNetwork(id);
    } else if (id.includes('bio-opt') || id.includes('health')) {
      return generateHealthNetwork(id);
    } else if (id.includes('deal')) {
      return generateDealHunterNetwork(id);
    } else {
      return generateGenericNetwork(id);
    }
  });
}

function generateParentNetwork(societyId: string): AgentNetwork {
  const archetypes = [
    'Overwhelmed Working Mom', 'Single Dad Juggling Custody', 'Health-Conscious Parent',
    'Efficiency-Obsessed Planner', 'Picky Eater Parent', 'Coupon-Stacking Deal Hunter',
    'Cultural Food Advocate', 'Takeout-Replacement Seeker', 'Meal Prep Enthusiast',
    'Budget-Conscious Parent', 'Time-Starved Professional', 'Nutrition-Focused Mom',
    'Convenience-Seeking Dad', 'Organic-Only Parent', 'Quick-Fix Specialist'
  ];

  const names = [
    'Sarah Martinez', 'Mike Thompson', 'Jessica Liu', 'David Rodriguez', 'Amanda Kim',
    'Chris Parker', 'Priya Sharma', 'Tom Harris', 'Lisa Chen', 'James Wilson',
    'Maria Garcia', 'Robert Johnson', 'Jennifer Brown', 'Michael Davis', 'Ashley Miller',
    'Christopher Jones', 'Amanda Taylor', 'Matthew Anderson', 'Jessica Thomas', 'Daniel Jackson',
    'Michelle White', 'Andrew Harris', 'Stephanie Martin', 'Kevin Thompson', 'Nicole Garcia',
    'Ryan Martinez', 'Samantha Robinson', 'Brandon Clark', 'Rachel Rodriguez', 'Tyler Lewis',
    'Lauren Lee', 'Justin Walker', 'Megan Hall', 'Joshua Allen', 'Kayla Young',
    'Nathan King', 'Brittany Wright', 'Zachary Lopez', 'Victoria Hill', 'Caleb Scott',
    'Alexis Green', 'Ethan Adams', 'Hannah Baker', 'Noah Gonzalez', 'Olivia Nelson',
    'Liam Carter', 'Sophia Mitchell', 'Mason Perez', 'Isabella Roberts', 'Logan Turner',
    'Ava Phillips', 'Lucas Campbell', 'Mia Parker', 'Alexander Evans', 'Charlotte Edwards',
    'Sebastian Collins', 'Amelia Stewart', 'Henry Sanchez', 'Harper Morris', 'Jackson Rogers',
    'Evelyn Reed', 'Aiden Cook', 'Abigail Morgan', 'Carter Bell', 'Emily Murphy',
    'Owen Bailey', 'Elizabeth Rivera', 'Wyatt Cooper', 'Sofia Richardson', 'Grayson Cox',
    'Avery Howard', 'Leo Ward', 'Ella Torres', 'Mason Peterson', 'Scarlett Gray',
    'Lucas Ramirez', 'Grace James', 'Benjamin Watson', 'Chloe Brooks', 'Samuel Kelly',
    'Penelope Sanders', 'Gabriel Price', 'Layla Bennett', 'Isaac Wood', 'Nora Barnes',
    'Julian Ross', 'Zoey Henderson', 'Anthony Coleman', 'Lily Jenkins', 'Hudson Perry',
    'Natalie Powell', 'Eli Long', 'Hazel Patterson', 'Connor Hughes', 'Violet Flores',
    'Caleb Washington', 'Aurora Butler', 'Aaron Simmons', 'Savannah Foster', 'Ian Gonzales',
    'Brooklyn Bryant', 'Adrian Alexander', 'Leah Russell', 'Evan Griffin', 'Bella Diaz',
    'Jaxon Hayes', 'Stella Myers', 'Colton Ford', 'Ariana Hamilton', 'Dominic Graham',
    'Maya Sullivan', 'Jace Wallace', 'Paisley Woods', 'Brayden Cole', 'Skylar West',
    'Jaxon Jordan', 'Addison Owens', 'Carson Reynolds', 'Nevaeh Fisher', 'Easton Ellis'
  ];

  const locations = [
    'San Francisco, CA', 'Austin, TX', 'Portland, OR', 'Seattle, WA', 'Denver, CO',
    'Chicago, IL', 'New York, NY', 'Phoenix, AZ', 'Los Angeles, CA', 'Boston, MA',
    'Miami, FL', 'Atlanta, GA', 'Dallas, TX', 'Houston, TX', 'Philadelphia, PA',
    'San Diego, CA', 'Nashville, TN', 'Minneapolis, MN', 'Detroit, MI', 'Tampa, FL'
  ];

  const professions = [
    'Marketing Manager', 'Software Engineer', 'Physical Therapist', 'Product Manager', 'Teacher',
    'Sales Director', 'Consultant', 'Construction Manager', 'Nurse', 'Accountant',
    'Graphic Designer', 'Project Manager', 'HR Specialist', 'Financial Analyst', 'Operations Manager',
    'Business Analyst', 'Data Scientist', 'UX Designer', 'Content Manager', 'Social Worker',
    'Real Estate Agent', 'Insurance Agent', 'Event Planner', 'Photographer', 'Chef',
    'Personal Trainer', 'Librarian', 'Paralegal', 'Architect', 'Engineer'
  ];

  const personalityTraits = [
    ['time-starved', 'guilt-prone', 'deals-focused'],
    ['budget-conscious', 'weeknight-stressed', 'kid-pleaser'],
    ['organic-preferring', 'skeptical', 'research-heavy'],
    ['spreadsheet-lover', 'optimize-everything', 'meal-prepper'],
    ['texture-issues', 'limited-options', 'survival-mode'],
    ['price-tracker', 'referral-code-sharer', 'group-chat-active'],
    ['authenticity-seeker', 'spice-lover', 'community-connected'],
    ['convenience-first', 'quality-skeptic', 'converts-on-speed'],
    ['planning-obsessed', 'batch-cooker', 'efficiency-maximizer'],
    ['coupon-clipper', 'value-hunter', 'bulk-buyer'],
    ['schedule-packed', 'quick-decisions', 'multitasker'],
    ['health-focused', 'ingredient-reader', 'nutrition-tracker'],
    ['time-pressed', 'simple-solutions', 'practical-buyer'],
    ['eco-conscious', 'local-preferring', 'sustainability-focused'],
    ['instant-gratification', 'minimal-effort', 'ready-to-eat']
  ];

  const comments = [
    "50% off tonight? Sold. I need dinner figured out before 6pm or it's chaos.",
    "I'd try this if the recipes work with kids who hate vegetables. Price seems fair.",
    "Ingredients list looks generic. Are these actually organic? I need to see nutrition facts.",
    "This could optimize my Sunday meal prep. Let me calculate cost per meal vs. grocery runs.",
    "My kid only eats 5 things. Does this have plain pasta and chicken nuggets? Probably not for us.",
    "Already found a 60% off code on Reddit. Sharing in the parent group chat now 🔥",
    "Do they have Indian/South Asian options? The preview looks very American-generic.",
    "If this is actually 10 minutes and tastes better than Chipotle, I'll buy it tonight.",
    "Perfect for my Sunday meal prep routine. Can I customize the portions?",
    "Need to see if this fits my monthly grocery budget first.",
    "Quick decision needed - is this worth the subscription cost?",
    "Love the nutrition transparency. Are the macros calculated per serving?",
    "Just need something that works. No time for complicated recipes.",
    "Are the ingredients locally sourced? Sustainability matters to our family.",
    "Ready in 5 minutes? That's what I need on weeknights."
  ];

  const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
  const ageGroups = ['25-34', '30-39', '35-44', '40-49'];

  const agents: AgentNode[] = [];

  // Generate 120 agents for a rich network
  for (let i = 0; i < 120; i++) {
    const archetype = archetypes[i % archetypes.length];
    const name = names[i % names.length];
    const location = locations[i % locations.length];
    const profession = professions[i % professions.length];
    const traits = personalityTraits[i % personalityTraits.length];
    const comment = comments[i % comments.length];
    const sentiment = sentiments[i % sentiments.length];
    const ageGroup = ageGroups[i % ageGroups.length];
    const engagement = Math.floor(Math.random() * 60) + 20; // 20-80 engagement

    // Create connections to other agents (3-6 connections per agent)
    const numConnections = Math.floor(Math.random() * 4) + 3;
    const connections: string[] = [];
    for (let j = 0; j < numConnections; j++) {
      const targetId = `parent-${Math.floor(Math.random() * 120) + 1}`;
      if (targetId !== `parent-${i + 1}` && !connections.includes(targetId)) {
        connections.push(targetId);
      }
    }

    agents.push({
      id: `parent-${i + 1}`,
      name: `${name} ${i > 0 ? i : ''}`,
      role: profession,
      archetype,
      personalityTraits: traits,
      comment,
      sentiment,
      engagement,
      status: 'idle',
      position: { x: 0, y: 0 },
      connections,
      demographics: {
        location,
        ageGroup,
        profession
      }
    });
  }

  return {
    societyId,
    societyName: 'Time-Starved Working Parents In Survival Mode',
    agents: positionAgents(agents)
  };
}

function generateHealthNetwork(societyId: string): AgentNetwork {
  const archetypes = [
    'Biohacker on Budget', 'Privacy-First Fitness Tracker', 'College Athlete Trying to Optimize',
    'Longevity-Obsessed Professional', 'Status-Flex Health Influencer', 'Recovery-Focused Runner',
    'Sleep-Optimization Nerd', 'College Student Working Out on Budget', 'Data-Driven Athlete',
    'Wellness Enthusiast', 'Fitness Tech Early Adopter', 'Health Metrics Obsessed',
    'Biohacking Community Member', 'Performance Optimization Seeker', 'Health Data Analyst'
  ];

  const names = [
    'Alex Vega', 'Morgan Lee', 'Jordan Kim', 'Taylor Morrison', 'Casey Rhodes',
    'Sam Davis', 'Riley Turner', 'Avery Patel', 'Blake Chen', 'Skyler Johnson',
    'Quinn Williams', 'River Brown', 'Sage Miller', 'Phoenix Davis', 'Indigo Wilson',
    'Ocean Moore', 'Forest Taylor', 'Storm Anderson', 'Rain Thomas', 'Sunny Jackson',
    'Moon White', 'Star Harris', 'Sky Martin', 'Cloud Thompson', 'Wind Garcia',
    'Fire Martinez', 'Earth Robinson', 'Stone Clark', 'Crystal Rodriguez', 'Gem Lewis',
    'Diamond Lee', 'Ruby Walker', 'Emerald Hall', 'Sapphire Allen', 'Topaz Young',
    'Amber King', 'Pearl Wright', 'Coral Lopez', 'Jade Hill', 'Onyx Scott',
    'Quartz Green', 'Marble Adams', 'Granite Baker', 'Limestone Gonzalez', 'Sandstone Nelson',
    'Slate Carter', 'Shale Mitchell', 'Basalt Perez', 'Obsidian Roberts', 'Pumice Turner',
    'Lava Phillips', 'Magma Campbell', 'Ash Parker', 'Ember Evans', 'Flame Edwards',
    'Spark Collins', 'Glow Stewart', 'Beam Sanchez', 'Ray Morris', 'Light Rogers',
    'Bright Reed', 'Shine Cook', 'Gleam Morgan', 'Flash Bell', 'Bolt Murphy',
    'Thunder Bailey', 'Lightning Rivera', 'Storm Cooper', 'Tempest Richardson', 'Hurricane Cox',
    'Tornado Howard', 'Cyclone Ward', 'Whirlwind Torres', 'Vortex Peterson', 'Tornado Gray',
    'Gale Ramirez', 'Breeze James', 'Zephyr Watson', 'Mist Brooks', 'Fog Kelly',
    'Dew Sanders', 'Frost Price', 'Ice Bennett', 'Snow Wood', 'Blizzard Barnes',
    'Aurora Ross', 'Polar Henderson', 'Arctic Coleman', 'Tundra Jenkins', 'Glacier Perry',
    'Frozen Powell', 'Crystal Long', 'Diamond Patterson', 'Gem Hughes', 'Jewel Flores',
    'Treasure Washington', 'Gold Butler', 'Silver Simmons', 'Bronze Foster', 'Copper Gonzales',
    'Iron Bryant', 'Steel Alexander', 'Metal Russell', 'Alloy Griffin', 'Ore Diaz',
    'Mineral Hayes', 'Crystal Myers', 'Quartz Ford', 'Marble Hamilton', 'Granite Graham',
    'Limestone Sullivan', 'Sandstone Wallace', 'Slate Woods', 'Shale Cole', 'Basalt West',
    'Obsidian Jordan', 'Pumice Owens', 'Lava Reynolds', 'Magma Fisher', 'Ash Ellis'
  ];

  const locations = [
    'San Francisco, CA', 'Berlin, Germany', 'Los Angeles, CA', 'New York, NY', 'Miami, FL',
    'Boulder, CO', 'Seattle, WA', 'Stanford, CA', 'Austin, TX', 'Portland, OR',
    'Boston, MA', 'Denver, CO', 'Chicago, IL', 'Phoenix, AZ', 'San Diego, CA',
    'Nashville, TN', 'Minneapolis, MN', 'Detroit, MI', 'Tampa, FL', 'Atlanta, GA'
  ];

  const professions = [
    'Founder (YC W22)', 'Security Engineer', 'Student Athlete', 'Investment Banker', 'Fitness Influencer',
    'Marathon Runner', 'Data Scientist', 'College Student', 'Software Engineer', 'Product Manager',
    'UX Designer', 'Marketing Manager', 'Business Analyst', 'Operations Manager', 'Financial Analyst',
    'Project Manager', 'HR Specialist', 'Content Manager', 'Social Media Manager', 'Brand Manager',
    'Sales Manager', 'Account Manager', 'Customer Success', 'Growth Hacker', 'Data Analyst',
    'Research Scientist', 'Biotech Engineer', 'Health Coach', 'Personal Trainer', 'Nutritionist'
  ];

  const personalityTraits = [
    ['data-obsessed', 'self-tracking', 'early-adopter'],
    ['anti-surveillance', 'open-source-preferring', 'encryption-aware'],
    ['budget-conscious', 'performance-focused', 'social-sharer'],
    ['investment-mindset', 'protocol-follower', 'forum-active'],
    ['aesthetic-driven', 'premium-buyer', 'clout-seeker'],
    ['injury-prone', 'metric-driven', 'skeptical-of-claims'],
    ['HRV-tracker', 'protocol-experimenter', 'reddit-poster'],
    ['price-sensitive', 'social-proof-driven', 'gym-rat'],
    ['performance-optimizer', 'data-driven', 'competitive'],
    ['wellness-focused', 'holistic-approach', 'community-driven'],
    ['tech-savvy', 'early-adopter', 'trend-follower'],
    ['metrics-obsessed', 'quantified-self', 'optimization-focused'],
    ['community-active', 'knowledge-sharing', 'experimenter'],
    ['performance-seeking', 'protocol-follower', 'results-driven'],
    ['data-analyst', 'pattern-recognizer', 'insight-seeker']
  ];

  const comments = [
    "I think this is cool, I'll check it out. Love the data sovereignty angle.",
    "Is this open source? Need to audit the encryption before I trust any health device.",
    "This is too expensive for me. I'd rather go to LA Fitness for $10/month honestly.",
    "Premium health tracking is worth it. Already on the waitlist. This beats Whoop.",
    "The aesthetic is fire 🔥 Gonna post an unboxing when this ships. Early access link?",
    "Skeptical of another wearable. Does it actually track recovery better than Garmin?",
    "HRV tracking looks solid. Can I export raw data to analyze in Python? Need API docs.",
    "Can I afford this on a student budget? Looks cool but $300+ is steep for tracking.",
    "Love the performance metrics. How does this compare to my current training data?",
    "This aligns with my wellness journey. Are there meditation/breathing features?",
    "Early access to health tech? Count me in. When does the beta start?",
    "The data visualization looks incredible. Can I customize the dashboard?",
    "Perfect for our biohacking community. Sharing this in our Discord now.",
    "Performance optimization is my thing. What protocols does this support?",
    "As a data analyst, I need to see the raw metrics. Export capabilities?"
  ];

  const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
  const ageGroups = ['18-24', '25-34', '30-39', '40-49'];

  const agents: AgentNode[] = [];

  // Generate 100 agents for health network
  for (let i = 0; i < 100; i++) {
    const archetype = archetypes[i % archetypes.length];
    const name = names[i % names.length];
    const location = locations[i % locations.length];
    const profession = professions[i % professions.length];
    const traits = personalityTraits[i % personalityTraits.length];
    const comment = comments[i % comments.length];
    const sentiment = sentiments[i % sentiments.length];
    const ageGroup = ageGroups[i % ageGroups.length];
    const engagement = Math.floor(Math.random() * 60) + 30; // 30-90 engagement

    // Create connections to other agents (3-6 connections per agent)
    const numConnections = Math.floor(Math.random() * 4) + 3;
    const connections: string[] = [];
    for (let j = 0; j < numConnections; j++) {
      const targetId = `health-${Math.floor(Math.random() * 100) + 1}`;
      if (targetId !== `health-${i + 1}` && !connections.includes(targetId)) {
        connections.push(targetId);
      }
    }

    agents.push({
      id: `health-${i + 1}`,
      name: `${name} ${i > 0 ? i : ''}`,
      role: profession,
      archetype,
      personalityTraits: traits,
      comment,
      sentiment,
      engagement,
      status: 'idle',
      position: { x: 0, y: 0 },
      connections,
      demographics: {
        location,
        ageGroup,
        profession
      }
    });
  }

  return {
    societyId,
    societyName: 'Bio-Optimization Status Flex Health Nerds',
    agents: positionAgents(agents)
  };
}

function generateDealHunterNetwork(societyId: string): AgentNetwork {
  const archetypes = [
    'Extreme Couponer', 'Browser Extension Addict', 'Deal Forum Moderator',
    'Cashback Maximizer', 'Price Tracker', 'Bulk Buyer', 'Student Discount Hunter',
    'Senior Citizen Saver', 'Military Discount User', 'Employee Discount Finder',
    'Referral Code Collector', 'Group Buy Organizer', 'Flash Sale Watcher',
    'Clearance Rack Expert', 'Seasonal Sale Planner'
  ];

  const names = [
    'Bella C.', 'Max B.', 'Zoe F.', 'Alex D.', 'Sam G.', 'Taylor H.', 'Jordan K.',
    'Casey L.', 'Morgan M.', 'Riley N.', 'Avery O.', 'Quinn P.', 'Blake Q.',
    'Skyler R.', 'River S.', 'Sage T.', 'Phoenix U.', 'Indigo V.', 'Ocean W.',
    'Forest X.', 'Storm Y.', 'Rain Z.', 'Sunny A.', 'Moon B.', 'Star C.',
    'Sky D.', 'Cloud E.', 'Wind F.', 'Fire G.', 'Earth H.', 'Stone I.',
    'Crystal J.', 'Gem K.', 'Diamond L.', 'Ruby M.', 'Emerald N.', 'Sapphire O.',
    'Topaz P.', 'Amber Q.', 'Pearl R.', 'Coral S.', 'Jade T.', 'Onyx U.',
    'Quartz V.', 'Marble W.', 'Granite X.', 'Limestone Y.', 'Sandstone Z.',
    'Slate A.', 'Shale B.', 'Basalt C.', 'Obsidian D.', 'Pumice E.',
    'Lava F.', 'Magma G.', 'Ash H.', 'Ember I.', 'Flame J.',
    'Spark K.', 'Glow L.', 'Beam M.', 'Ray N.', 'Light O.',
    'Bright P.', 'Shine Q.', 'Gleam R.', 'Flash S.', 'Bolt T.',
    'Thunder U.', 'Lightning V.', 'Storm W.', 'Tempest X.', 'Hurricane Y.',
    'Tornado Z.', 'Cyclone A.', 'Whirlwind B.', 'Vortex C.', 'Gale D.',
    'Breeze E.', 'Zephyr F.', 'Mist G.', 'Fog H.', 'Dew I.',
    'Frost J.', 'Ice K.', 'Snow L.', 'Blizzard M.', 'Aurora N.',
    'Polar O.', 'Arctic P.', 'Tundra Q.', 'Glacier R.', 'Frozen S.',
    'Crystal T.', 'Diamond U.', 'Gem V.', 'Jewel W.', 'Treasure X.',
    'Gold Y.', 'Silver Z.', 'Bronze A.', 'Copper B.', 'Iron C.',
    'Steel D.', 'Metal E.', 'Alloy F.', 'Ore G.', 'Mineral H.',
    'Crystal I.', 'Quartz J.', 'Marble K.', 'Granite L.', 'Limestone M.',
    'Sandstone N.', 'Slate O.', 'Shale P.', 'Basalt Q.', 'Obsidian R.'
  ];

  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC'
  ];

  const professions = [
    'Retail Manager', 'Customer Service Rep', 'Cashier', 'Store Associate', 'Inventory Specialist',
    'Sales Associate', 'Department Manager', 'Assistant Manager', 'Store Manager', 'District Manager',
    'Regional Manager', 'Buyer', 'Merchandiser', 'Visual Merchandiser', 'Loss Prevention',
    'HR Coordinator', 'Training Specialist', 'Operations Manager', 'Supply Chain Coordinator', 'Logistics Manager',
    'Warehouse Supervisor', 'Forklift Operator', 'Picker', 'Packer', 'Shipping Clerk',
    'Receiving Clerk', 'Inventory Clerk', 'Stock Clerk', 'Price Checker', 'Returns Processor'
  ];

  const personalityTraits = [
    ['discount-only', 'stack-everything', 'shares-codes'],
    ['auto-apply', 'cashback-chaser', 'never-full-price'],
    ['community-leader', 'validates-deals', 'influencer'],
    ['maximizes-rewards', 'credit-card-optimizer', 'points-collector'],
    ['price-alert-setter', 'historical-price-tracker', 'deal-notifier'],
    ['bulk-purchaser', 'warehouse-club-member', 'family-size-buyer'],
    ['student-id-carrying', 'edu-email-using', 'campus-deal-hunter'],
    ['senior-discount-asking', 'aarp-member', 'retirement-saver'],
    ['military-id-showing', 'veteran-discount-seeking', 'service-member'],
    ['employee-perk-using', 'company-discount-accessing', 'staff-benefit-maximizer'],
    ['referral-link-sharing', 'invite-code-collecting', 'friend-rewarding'],
    ['group-buy-organizing', 'bulk-order-coordinating', 'community-purchasing'],
    ['flash-sale-monitoring', 'limited-time-watching', 'quick-decision-making'],
    ['clearance-rack-expert', 'end-of-season-hunter', 'discontinued-item-finder'],
    ['seasonal-planning', 'holiday-sale-timing', 'calendar-deal-tracking']
  ];

  const comments = [
    "Can I stack this with my 20% off coupon and get cashback?",
    "Let me check if Honey has any codes for this...",
    "Posted this deal in our Facebook group - already 50 people interested!",
    "Using my 5% cashback card and getting 2% from Rakuten. Sweet!",
    "Price dropped 30% from last week. Should I wait for it to go lower?",
    "Buying 6 months worth while it's on sale. Storage space is worth it.",
    "Student discount applied! Saved $25 on textbooks this semester.",
    "Senior discount + AARP membership = 15% off total. Not bad!",
    "Military discount stacks with the sale price. Thank you for your service!",
    "Employee discount makes this actually affordable. Perks of working here!",
    "Sharing my referral link - we both get $10 off next purchase!",
    "Organizing a group buy for our neighborhood. 20+ people = bulk discount!",
    "Flash sale alert! Only 2 hours left at this price. Quick decision time!",
    "Found this in the clearance section. 70% off original price!",
    "Black Friday is 3 months away, but this pre-sale is almost as good."
  ];

  const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

  const agents: AgentNode[] = [];

  // Generate 80 agents for deal hunter network
  for (let i = 0; i < 80; i++) {
    const archetype = archetypes[i % archetypes.length];
    const name = names[i % names.length];
    const location = locations[i % locations.length];
    const profession = professions[i % professions.length];
    const traits = personalityTraits[i % personalityTraits.length];
    const comment = comments[i % comments.length];
    const sentiment = sentiments[i % sentiments.length];
    const ageGroup = ageGroups[i % ageGroups.length];
    const engagement = Math.floor(Math.random() * 50) + 40; // 40-90 engagement

    // Create connections to other agents (3-6 connections per agent)
    const numConnections = Math.floor(Math.random() * 4) + 3;
    const connections: string[] = [];
    for (let j = 0; j < numConnections; j++) {
      const targetId = `deal-${Math.floor(Math.random() * 80) + 1}`;
      if (targetId !== `deal-${i + 1}` && !connections.includes(targetId)) {
        connections.push(targetId);
      }
    }

    agents.push({
      id: `deal-${i + 1}`,
      name: `${name} ${i > 0 ? i : ''}`,
      role: profession,
      archetype,
      personalityTraits: traits,
      comment,
      sentiment,
      engagement,
      status: 'idle',
      position: { x: 0, y: 0 },
      connections,
      demographics: {
        location,
        ageGroup,
        profession
      }
    });
  }

  return {
    societyId,
    societyName: 'Discount-Motivated Deal Hunters',
    agents: positionAgents(agents)
  };
}

function generateGenericNetwork(societyId: string): AgentNetwork {
  const agents: AgentNode[] = [
    {
      id: 'gen-1',
      name: 'Agent A',
      archetype: 'Early Adopter',
      personalityTraits: ['trend-seeker', 'shares-often'],
      currentThought: '',
      status: 'idle',
      position: { x: 0, y: 0 },
      connections: ['gen-2', 'gen-3']
    },
    {
      id: 'gen-2',
      name: 'Agent B',
      archetype: 'Skeptical Researcher',
      personalityTraits: ['needs-proof', 'detail-oriented'],
      currentThought: '',
      status: 'idle',
      position: { x: 0, y: 0 },
      connections: ['gen-1', 'gen-3']
    },
    {
      id: 'gen-3',
      name: 'Agent C',
      archetype: 'Social Influencer',
      personalityTraits: ['community-connector', 'opinion-leader'],
      currentThought: '',
      status: 'idle',
      position: { x: 0, y: 0 },
      connections: ['gen-1', 'gen-2']
    }
  ];

  return {
    societyId,
    societyName: 'General Community',
    agents: positionAgents(agents)
  };
}

/**
 * Position agents in a multi-layered network layout for better visualization
 */
function positionAgents(agents: AgentNode[]): AgentNode[] {
  const centerX = 400;
  const centerY = 300;
  const baseRadius = 150;
  const maxRadius = 250;
  
  // Create multiple layers for better distribution
  const layers = Math.ceil(Math.sqrt(agents.length / 20)); // More layers for more agents
  const agentsPerLayer = Math.ceil(agents.length / layers);
  
  return agents.map((agent, index) => {
    const layer = Math.floor(index / agentsPerLayer);
    const positionInLayer = index % agentsPerLayer;
    
    // Vary radius based on layer
    const radius = baseRadius + (layer * (maxRadius - baseRadius) / Math.max(1, layers - 1));
    
    // Add some randomness to prevent perfect circles
    const angle = (positionInLayer / agentsPerLayer) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
    const radiusVariation = radius + (Math.random() - 0.5) * 50;
    
    return {
      ...agent,
      position: {
        x: Math.max(50, Math.min(750, centerX + radiusVariation * Math.cos(angle))),
        y: Math.max(50, Math.min(550, centerY + radiusVariation * Math.sin(angle)))
      }
    };
  });
}

/**
 * Generate realistic agent thoughts/reactions based on personality
 */
export function generateAgentThought(agent: AgentNode, adContext: string): string {
  const thoughts: { [key: string]: string[] } = {
    'Overwhelmed Working Mom': [
      'This better actually save me time...',
      'Can I prep this during nap time?',
      'Will my kids actually eat this?',
      '50% off? Let me check reviews first'
    ],
    'Single Dad Juggling Custody': [
      'Is this weeknight-doable on short notice?',
      'Can I make this when I have the kids?',
      'Budget-friendly enough for weekly?'
    ],
    'College Student Working Out on Budget': [
      'Can I afford this on a student budget?',
      'Is this better value than my current routine?',
      'Anyone else in the gym use this?',
      'Is there a student discount code?'
    ],
    'Biohacker on Budget': [
      'What metrics can I actually track with this?',
      'Is the data exportable for analysis?',
      'How does this compare to my current stack?'
    ],
    'Privacy-First Fitness Tracker': [
      'Where does my data actually go?',
      'Is this open-source audited?',
      'Do they sell data to third parties?'
    ],
    'Extreme Couponer': [
      'Can I stack this with my cashback?',
      'Is there a better deal coming next week?',
      'Let me search for promo codes...'
    ]
  };

  const agentThoughts = thoughts[agent.archetype] || [
    'Hmm, interesting...',
    'Let me think about this...',
    'Not sure if this is for me'
  ];

  return agentThoughts[Math.floor(Math.random() * agentThoughts.length)];
}
